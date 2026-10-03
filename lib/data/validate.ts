import { models, todayFeed } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { calcVRAM, quantBPW, quantGroups } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { isMoE } from '@/lib/utils/model-meta';

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
        if (q.vramGB > rtx4090.vram) {
          out.push(`${m.id} ${key}: speedRTX4090 set on a ${q.vramGB} GB row — an RTX 4090 holds ${rtx4090.vram} GB`);
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
  out.push(...guideModelCountProblems());
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

export function assertDataConsistent(): void {
  const problems = dataProblems();
  if (problems.length) {
    throw new Error(`Data consistency check failed (lib/data/validate.ts):\n  - ${problems.join('\n  - ')}`);
  }
}
