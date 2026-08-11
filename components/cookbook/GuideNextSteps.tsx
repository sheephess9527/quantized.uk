'use client';

import Link from 'next/link';
import { ArrowRight, Calculator, Boxes } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import type { Article } from '@/lib/data/cookbook';

/**
 * Closes the loop between a guide and the tools: a reader who just learned how
 * to run one model on their hardware is one click from "what else fits".
 */
export default function GuideNextSteps({ article }: { article: Article }) {
  const { t, lang } = useLanguage();
  const n = t.cookbook.nextSteps;

  const gpu = article.gpuPreset
    ? gpuDatabase.find(g => g.id === article.gpuPreset!.gpuId)
    : undefined;

  const related = (article.relatedModelIds ?? [])
    .map(id => models.find(m => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  if (!gpu && related.length === 0) return null;

  const ctx = article.gpuPreset?.ctx ?? 4096;
  const calcHref = gpu
    ? `/tools/vram-calc/?mode=reverse&gpu=${gpu.id}&ctx=${ctx}&sort=quality`
    : null;

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="section-title text-base mb-4">{n.title}</h2>

      {gpu && calcHref && (
        <Link
          href={calcHref}
          className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-3 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all group"
        >
          <Calculator size={16} className="text-violet-400 mt-0.5 shrink-0" />
          <span className="min-w-0">
            <span className="block text-sm text-slate-200 font-medium">
              {n.fitsMyCard.replace('{gpu}', `${gpu.icon} ${gpu.name}`)}
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              {n.fitsMyCardHint.replace('{vram}', String(gpu.vram)).replace('{ctx}', String(ctx))}
            </span>
          </span>
          <ArrowRight size={14} className="text-slate-600 group-hover:text-violet-400 ml-auto mt-1 shrink-0" />
        </Link>
      )}

      {related.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Boxes size={12} /> {n.modelsInGuide}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {related.map(m => (
              <li key={m.id}>
                <Link
                  href={`/quant-hub/${m.id}/`}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-cyan-500/25 hover:bg-cyan-500/[0.04] transition-all"
                >
                  <span className="block text-sm text-slate-200 font-medium truncate">{m.name}</span>
                  <span className="block text-xs text-slate-600 font-mono mt-0.5">
                    {m.paramLabel} · {lang === 'zh' ? '每档显存与速度' : 'per-quant VRAM & speed'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
