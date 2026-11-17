import { sizeAt4K } from '@/lib/utils/quant-source';
import { models, todayFeed } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { calcVRAM, getVerdict, quantBPW, quantGroups } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { gpuSlug, usableCapacityGB, tightCeiling } from '@/lib/utils/gpu-page';
import { isMoE, activeParamsB } from '@/lib/utils/model-meta';
import { dataLastUpdated, sizingChangedAt } from '@/lib/data/meta';
import { prefillData } from '@/lib/data/prefill';
import { sourceBpw } from '@/lib/utils/quant-source';
import { pendingModels } from '@/lib/data/pending';
import { runtimeErrors } from '@/lib/data/errors';
import { calibrationRows, CEILING_TOLERANCE } from '@/lib/utils/bench-calibration';
import { factTableProblems } from '@/lib/utils/model-facts';
import { performanceReportProblems } from '@/lib/data/performance-reports';

/**
 * Invariants between hand-typed data files. Each one is a fault that shipped
 * at least once and was found by reading pages, not by the build. Returns the
 * list of problems; `assertDataConsistent` fails the build on any.
 */
export function dataProblems(): string[] {
  const out: string[] = [];
  const modelIds = new Set(models.map(m => m.id));
  const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

  dupes(models.map(m => m.id)).forEach(id => out.push(`duplicate model id: ${id}`));
  // Prompt-processing rows are keyed by GPU id; a renamed card would silently lose its figure.
  const gpuIds = new Set(gpuDatabase.map(g => g.id));
  out.push(...performanceReportProblems(modelIds, gpuIds, dataLastUpdated));
  for (const id of Object.keys(prefillData)) if (!gpuIds.has(id)) out.push(`prefill row for unknown GPU id: ${id}`);
  // The calculator's MoE speed ceiling and offload estimate read the active
  // count; a MoE model without one would silently be treated as unknown.
  for (const m of models) {
    const active = activeParamsB(m);
    if (active === undefined) out.push(`${m.id}: MoE with no active-parameter count (set activeParams or an -A<n>B label)`);
    else if (active > m.params) out.push(`${m.id}: activeParams ${active} exceeds params ${m.params}`);
    if (m.activeParams !== undefined && !isMoE(m)) out.push(`${m.id}: activeParams set on a model the label does not mark as MoE`);
  }
  // Expert offload (`--n-cpu-moe N`) counts layers by index, so the layout must add up.
  for (const m of models) {
    const e = m.arch.moe;
    if (!e) continue;
    if (!isMoE(m)) out.push(`${m.id}: arch.moe on a model the label does not mark as MoE`);
    if (e.expertParams >= m.params) out.push(`${m.id}: arch.moe.expertParams ${e.expertParams} is not below params ${m.params}`);
    if (e.perToken >= e.experts) out.push(`${m.id}: arch.moe.perToken ${e.perToken} is not below experts ${e.experts}`);
    const lead = e.denseLead ?? 0;
    if (e.interleaved ? lead + e.moeLayers > m.arch.layers : lead + e.moeLayers !== m.arch.layers) {
      out.push(`${m.id}: arch.moe denseLead ${lead} + moeLayers ${e.moeLayers} does not match layers ${m.arch.layers}`);
    }
  }
  // A sitemap date in the future of the data ship would be announced to IndexNow as a change tomorrow.
  if (sizingChangedAt > dataLastUpdated) out.push(`sizingChangedAt ${sizingChangedAt} is later than dataLastUpdated ${dataLastUpdated}`);
  // Licence and image-input rows are keyed by model id; a typo would quietly shrink a filter.
  out.push(...factTableProblems(models.map(m => m.id)));
  dupes(gpuDatabase.map(g => g.id)).forEach(id => out.push(`duplicate GPU id: ${id}`));
  dupes(gpuDatabase.map(gpuSlug)).forEach(s => out.push(`duplicate GPU slug: ${s}`));
  gpuDatabase.forEach(g => {
    if (gpuSlug(g).includes('.')) out.push(`GPU slug contains a dot (next/link strips its slash): ${gpuSlug(g)}`);
  });

  const selectable = new Set(Object.values(quantGroups).flat());
  // `speedRTX4090` is one card's number. A row that card cannot hold, or a
  // dense row faster than its memory bandwidth allows, is not an RTX 4090
  // figure: 47 rows were one or the other (a 70B Q4 at "38 tok/s").
  const rtx4090 = gpuDatabase.find(g => g.id === 'rtx4090');
  if (!rtx4090?.bandwidth) out.push('rtx4090 row missing or has no bandwidth — speed checks cannot run');
  for (const m of models) {
    if (m.status === 'superseded') {
      const next = models.find(x => x.id === m.supersededBy);
      if (!next) out.push(`${m.id}: supersededBy '${m.supersededBy}' is not a model id`);
      else if (next.id === m.id) out.push(`${m.id}: supersedes itself`);
      else if (next.status === 'superseded') out.push(`${m.id}: successor ${next.id} is itself superseded`);
    }
    if (!m.quants.length) out.push(`${m.id}: no quants`);
    const att = m.arch.attention;
    if (att) {
      const full = att.fullLayers ?? m.arch.layers;
      const win = att.windowLayers ?? 0;
      if (full + win > m.arch.layers) out.push(`${m.id}: attention splits ${full} + ${win} layers but the model has ${m.arch.layers}`);
      if (win > 0 && !att.windowTokens) out.push(`${m.id}: windowLayers set with no windowTokens — the calculator would size those layers at full context`);
    }
    for (const q of m.quants) {
      const key = quantLevelKey(q);
      if (!(key in quantBPW) || !selectable.has(key)) {
        out.push(`${m.id}: level '${key}' missing from quantBPW/quantGroups — the calculator cannot select it`);
      }
      if (q.speedRTX4090 != null && rtx4090?.bandwidth) {
        const at4k = sizeAt4K(m, q);
        if (at4k > rtx4090.vram) {
          out.push(`${m.id} ${key}: speedRTX4090 set on a ${at4k.toFixed(1)} GB row (4K total) — an RTX 4090 holds ${rtx4090.vram} GB`);
        } else if (!isMoE(m)) {
          // Dense: every token reads every weight. 15% covers params×bpw vs the
          // real file (untouched input embeddings, mixed-precision heads).
          const ceiling = rtx4090.bandwidth / (m.params * (q.bpw ?? 4.85) / 8);
          if (q.speedRTX4090 > ceiling * 1.15) {
            out.push(`${m.id} ${key}: ${q.speedRTX4090} tok/s exceeds the RTX 4090 bandwidth ceiling (~${Math.round(ceiling)}) for a dense model`);
          }
        }
      }
    }
  }

  dupes(todayFeed.map(f => String(f.id))).forEach(id => out.push(`duplicate todayFeed id: ${id}`));
  for (const f of todayFeed) {
    const m = models.find(x => x.id === f.modelId);
    if (!m) out.push(`todayFeed: '${f.modelId}' is not a model id`);
    else if (!m.quants.some(q => q.level === f.level)) out.push(`todayFeed: ${f.modelId} does not ship '${f.level}' (the pick would silently disappear)`);
  }

  for (const a of articles) {
    if (a.gpuPreset && !gpuDatabase.some(g => g.id === a.gpuPreset!.gpuId)) {
      out.push(`guide ${a.id}: gpuPreset '${a.gpuPreset.gpuId}' is not a GPU id`);
    }
    for (const id of a.relatedModelIds ?? []) {
      if (!modelIds.has(id)) out.push(`guide ${a.id}: relatedModelIds '${id}' is not a model id`);
    }
  }

  for (const id of Object.keys(hfRepoMap)) {
    if (!modelIds.has(id)) out.push(`hfRepoMap: '${id}' is not a model id`);
  }
  out.push(...guideFigureProblems());
  out.push(...descriptionProblems());
  out.push(...sourceAndPendingProblems());
  out.push(...guideModelCountProblems());
  out.push(...errorEntryProblems());
  out.push(...benchRowProblems());
  return out;
}

/**
 * `/errors/` entries are hand-written and cross-reference guides and each
 * other; a renamed guide or a dropped entry would leave a link to a 404.
 */
/**
 * /benchmarks/ publishes the rule a measured run must pass; this is that rule.
 * Every matrix row must name a card in the GPU index, and a dense row that the
 * index can size must sit under the card's bandwidth ceiling × CEILING_TOLERANCE
 * — the check that removed three RTX 4060 Ti rows by hand on 2026-09-11.
 */
function benchRowProblems(): string[] {
  const out: string[] = [];
  for (const c of calibrationRows()) {
    const id = `${c.row.model} / ${c.row.hardware} / ${c.row.quant}`;
    if (!c.gpu) out.push(`benchmark row ${id}: hardware matches no card in gpuDatabase`);
    if (c.ceiling !== undefined && c.row.speedTokSec > c.ceiling * CEILING_TOLERANCE) {
      out.push(`benchmark row ${id}: ${c.row.speedTokSec} tok/s is over ${CEILING_TOLERANCE} × the card's ${c.ceiling} tok/s bandwidth ceiling`);
    }
  }
  return out;
}

function errorEntryProblems(): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  const guideIds = new Set(articles.map(a => a.id));
  for (const e of runtimeErrors) {
    if (ids.has(e.id)) out.push(`errors: duplicate id '${e.id}'`);
    ids.add(e.id);
    if (e.id.includes('.')) out.push(`errors: '${e.id}' contains a dot (next/link drops the trailing slash)`);
    if (!e.sources.length) out.push(`errors: '${e.id}' cites no source`);
    for (const g of e.guides ?? []) if (!guideIds.has(g)) out.push(`errors: '${e.id}' links missing guide '${g}'`);
    for (const t of [e.title, e.summary, ...e.causes, ...e.fixes]) {
      if (!t.en.trim() || !t.zh.trim()) out.push(`errors: '${e.id}' has an empty en/zh string`);
    }
  }
  for (const e of runtimeErrors) {
    for (const r of e.seeAlso ?? []) if (!ids.has(r)) out.push(`errors: '${e.id}' links missing entry '${r}'`);
  }
  return out;
}

/**
 * A size printed in a guide must still be what the calculator says. Guides
 * quote calcVRAM output as text, so an arch or bpw fix silently leaves them
 * behind — the 8GB guide drifted three figures and one verdict that way, and a
 * GPT-OSS bpw fix moved two more. Strict on purpose: only a single sentence
 * or table row naming a model, a quant level, a context ("8K") and a GB figure
 * is checked, which is what makes a false positive unlikely. It must match the
 * total or the weights within 0.3 GB.
 */
/**
 * Guides are hand-written, so a count like "71 of the 87 models" freezes the day it is typed and goes
 * stale with the next model batch (the Mac FAQ still said 81 two batches later). Any sentence that
 * names a total model count must name the current one. Fit counts themselves are not checked here —
 * they depend on the card and context the sentence describes — so re-run those when this fires.
 */
function guideModelCountProblems(): string[] {
  const out: string[] = [];
  const total = models.length;
  const patterns = [
    /\b(\d+) of the (\d+) models\b/g,
    /\bthe (\d+) models (?:in this index|here)\b/g,
    /(?:本索引|本站)\s?(\d+) 个模型/g,
  ];
  for (const a of articles) {
    const text = JSON.stringify(a);
    for (const re of patterns) {
      for (const m of Array.from(text.matchAll(re))) {
        const n = Number(m[m.length - 1]);
        if (n !== total) out.push(`guide ${a.id}: "${m[0]}" names ${n} models; the index has ${total}`);
      }
    }
  }
  return out;
}

/**
 * Model descriptions are hand-written prose carrying the same kind of numbers as the guides, and two
 * faults reached the live site through them (Qwen3.5 9B "32K comfortable on 8 GB" — 94%, tight;
 * Qwen3.8-Flash-Next "256K comfortable on a 128 GB Mac" — 91% of the usable 96 GB). Two rules:
 *  1. every "N GB at NK" (en) / "NK … 约需 N GB" (zh) next to a level must match calcVRAM — integers within
 *     0.5 (rounded prose), decimals within 0.3;
 *  2. a verdict word that directly follows such a figure — "7.5 GB at 32K, comfortable on an 8 GB card" —
 *     must be the verdict calcVRAM gives on a card of that size (a Mac when it says Mac). Only that adjacent
 *     phrasing is read: looser pairing guessed wrong on 7 of 8 sentences in the 2026-10-23 audit.
 */
function descriptionProblems(): string[] {
  const out: string[] = [];
  const LEVEL = /\b(IQ2_XXS|Q[2-8]_K_[MS]|Q[2-8]_K|Q8_0|Q4_0|MXFP4|INT4)\b/g;
  const sizeOf = (m: (typeof models)[number], level: string, ctxK: number) => {
    const bpw = m.quants.find(q => q.level === level)?.bpw ?? (quantBPW as Record<string, number>)[level];
    if (!bpw) return undefined;
    return calcVRAM({
      paramsB: m.params, layers: m.arch.layers, kvHeads: m.arch.kvHeads, headDim: m.arch.headDim,
      attention: m.arch.attention, bpw, contextLength: ctxK * 1024, batchSize: 1,
    });
  };
  const near = (stated: string, r: { totalGB: number; modelWeightsGB: number }) => {
    const n = Number(stated); const tol = stated.includes('.') ? 0.3 : 0.5;
    return Math.abs(n - r.totalGB) <= tol || Math.abs(n - r.modelWeightsGB) <= tol;
  };
  const cardFor = (gb: number, mac: boolean) => gpuDatabase.find(g => g.vram === gb && !g.isCPU &&
    (mac ? g.type === 'apple' : g.type === 'nvidia-consumer'))
    ?? (mac ? undefined : gpuDatabase.find(g => g.vram === gb && !g.isCPU && g.type !== 'apple'));
  for (const m of models) {
    for (const lang of ['en', 'zh'] as const) {
      for (const sent of m.description[lang].split(/(?<=[.;])\s+|(?<=[。；])/)) {
        const levels = Array.from(sent.matchAll(LEVEL));
        if (!levels.length) continue;
        const levelAt = (pos: number) => levels.filter(l => l.index! < pos).pop()?.[1] ?? levels[0][1];
        const figs = lang === 'en'
          ? Array.from(sent.matchAll(/(\d+(?:\.\d+)?) GB at (\d+)K\b/g)).map(x => ({ gb: x[1], k: Number(x[2]), at: x.index!, end: x.index! + x[0].length }))
          : Array.from(sent.matchAll(/(\d+)K\s*(?:上下文)?\s*下?\s*约(?:需)?\s*(\d+(?:\.\d+)?) GB/g)).map(x => ({ gb: x[2], k: Number(x[1]), at: x.index!, end: x.index! + x[0].length }));
        for (const f of figs) {
          const lv = levelAt(f.at); const r = sizeOf(m, lv, f.k);
          if (!r) continue;
          if (!near(f.gb, r)) out.push(`model ${m.id} [${lang}]: "${f.gb} GB at ${f.k}K" (${lv}) — calculator gives ${r.totalGB.toFixed(1)}`);
          if (lang !== 'en') continue;
          const v = /^,? (comfortable|tight) on (?:a|an) (\d+) GB (card|Mac|DGX Spark)\b/.exec(sent.slice(f.end));
          if (!v) continue;
          const g = cardFor(Number(v[2]), v[3] === 'Mac');
          if (!g) continue;
          const got = getVerdict(r.totalGB, usableCapacityGB(g), tightCeiling(g))[0];
          const want = v[1] === 'comfortable' ? 'g' : 'y';
          if (got !== want) out.push(`model ${m.id}: "${f.gb} GB at ${f.k}K, ${v[1]} on a ${v[2]} GB ${v[3]}" — on ${g.name} the calculator says ${got === 'g' ? 'comfortable' : got === 'y' ? 'tight' : 'does not fit'}`);
        }
      }
    }
  }
  return out;
}

function guideFigureProblems(): string[] {
  const out: string[] = [];
  const aliases: { re: RegExp; m: (typeof models)[number] }[] = [];
  for (const m of models) {
    const base = m.name.replace(/\b(Instruct|IT|Chat|Preview)\b/gi, '').replace(/\s+/g, ' ').trim();
    for (const a of Array.from(new Set([m.name, base]))) {
      const esc = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[ -]?');
      aliases.push({ re: new RegExp(`(^|[^A-Za-z0-9.])${esc}(?![0-9.])`, 'i'), m });
    }
  }
  aliases.sort((a, b) => b.re.source.length - a.re.source.length);
  const LEVEL = /\b(Q[2-8]_K_[MS]|Q[2-8]_K|Q8_0|Q4_0|MXFP4|INT4|[2-8]\.\d+bpw)\b/;
  for (const a of articles) {
    const texts: string[] = [];
    for (const sec of a.content ?? []) {
      texts.push(sec.body ?? '');
      if (sec.code?.content) texts.push(...sec.code.content.split('\n'));
    }
    for (const f of a.faqs ?? []) texts.push(f.a);
    for (const t of texts) for (const sent of t.split(/(?<=[.;:—])\s+|\n/)) {
      const gb = sent.match(/(\d+(?:\.\d+)?)\s*GB\b/);
      const lv = sent.match(LEVEL);
      const ctx = sent.match(/\b(\d+)K\b/);
      if (!gb || !lv || !ctx) continue;
      const hit = aliases.find(x => x.re.test(sent));
      if (!hit) continue;
      const m = hit.m;
      const bpw = m.quants.find(q => q.level === lv[1])?.bpw ?? (quantBPW as Record<string, number>)[lv[1]];
      if (!bpw) continue;
      const r = calcVRAM({
        paramsB: m.params, layers: m.arch.layers, kvHeads: m.arch.kvHeads, headDim: m.arch.headDim,
        attention: m.arch.attention, bpw, contextLength: Number(ctx[1]) * 1024, batchSize: 1,
      });
      const stated = Number(gb[1]);
      if (Math.abs(stated - r.totalGB) > 0.3 && Math.abs(stated - r.modelWeightsGB) > 0.3) {
        out.push(`guide ${a.id}: "${sent.trim().slice(0, 90)}" says ${stated} GB; calculator gives ${r.totalGB.toFixed(1)} (weights ${r.modelWeightsGB.toFixed(1)})`);
      }
    }
  }
  return out;
}

/** Recorded file sources must reconcile with their rows; pending entries must not already be indexed. */
function sourceAndPendingProblems(): string[] {
  const out: string[] = [];
  const modelIds = new Set(models.map(m => m.id));
  const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
  // A recorded file must be the file the row is sized from: bytes × 8 / params lands on the row's
  // bpw (rounded to two places), split builds say how many parts, and the date is a real date.
  for (const m of models) {
    for (const q of m.quants) {
      const src = q.source;
      if (!src) continue;
      const tag = `${m.id} ${q.format} ${q.level}`;
      if (src.mmprojBytes !== undefined && (!Number.isSafeInteger(src.mmprojBytes) || src.mmprojBytes <= 0)) {
        out.push(`${tag}: mmprojBytes must be a positive integer byte count`);
      }
      const implied = sourceBpw(m, src);
      if (Math.abs(implied - q.bpw) > 0.02) out.push(`${tag}: source bytes imply ${implied.toFixed(3)} bpw, row says ${q.bpw}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(src.checkedAt) || src.checkedAt > dataLastUpdated) out.push(`${tag}: source checkedAt ${src.checkedAt} is not a date on or before dataLastUpdated`);
      const split = src.file ? /-0+1-of-0*(\d+)\.(gguf|safetensors)$/.exec(src.file) : null;
      if (split && Number(split[1]) !== src.parts) out.push(`${tag}: ${src.file} is part 1 of ${split[1]} but parts is ${src.parts ?? 'unset'}`);
      if (!split && src.parts !== undefined && src.file) out.push(`${tag}: parts ${src.parts} but ${src.file} is not a split file name`);
      if (!/^[\w.-]+\/[\w.-]+$/.test(src.repo)) out.push(`${tag}: source repo "${src.repo}" is not owner/name`);
    }
  }
  // A pending entry graduates the day its model enters the index — never both.
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
  const indexedNames = new Set(models.map(m => norm(m.name)));
  dupes(pendingModels.map(p => p.id)).forEach(id => out.push(`duplicate pending id: ${id}`));
  for (const p of pendingModels) {
    if (modelIds.has(p.id) || indexedNames.has(norm(p.name))) out.push(`pending ${p.id}: "${p.name}" is already in the index — remove it from lib/data/pending.ts`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt) || p.checkedAt > dataLastUpdated) out.push(`pending ${p.id}: checkedAt ${p.checkedAt} is not a date on or before dataLastUpdated`);
    if (p.announced && !/^\d{4}-\d{2}-\d{2}$/.test(p.announced)) out.push(`pending ${p.id}: announced ${p.announced} is not YYYY-MM-DD`);
  }
  return out;
}

export function assertDataConsistent(): void {
  const problems = dataProblems();
  if (problems.length) {
    throw new Error(`Data consistency check failed (lib/data/validate.ts):\n  - ${problems.join('\n  - ')}`);
  }
}
