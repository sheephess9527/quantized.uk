import { models, todayFeed } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { quantBPW, quantGroups } from '@/lib/utils/vram';
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
  return out;
}

export function assertDataConsistent(): void {
  const problems = dataProblems();
  if (problems.length) {
    throw new Error(`Data consistency check failed (lib/data/validate.ts):\n  - ${problems.join('\n  - ')}`);
  }
}
