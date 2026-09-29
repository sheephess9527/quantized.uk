import { models, todayFeed } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { quantBPW, quantGroups } from '@/lib/utils/vram';
import { quantLevelKey } from '@/lib/utils/recommend';
import { gpuSlug } from '@/lib/utils/gpu-page';

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
  for (const m of models) {
    if (m.status === 'superseded') {
      const next = models.find(x => x.id === m.supersededBy);
      if (!next) out.push(`${m.id}: supersededBy '${m.supersededBy}' is not a model id`);
      else if (next.id === m.id) out.push(`${m.id}: supersedes itself`);
      else if (next.status === 'superseded') out.push(`${m.id}: successor ${next.id} is itself superseded`);
    }
    if (!m.quants.length) out.push(`${m.id}: no quants`);
    for (const q of m.quants) {
      const key = quantLevelKey(q);
      if (!(key in quantBPW) || !selectable.has(key)) {
        out.push(`${m.id}: level '${key}' missing from quantBPW/quantGroups — the calculator cannot select it`);
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
