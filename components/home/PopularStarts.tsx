'use client';

import Link from '@/components/i18n/LocalLink';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase } from '@/lib/data/gpus';
import { countModelsFitting, gpuSlug } from '@/lib/utils/gpu-page';

/**
 * The two ways a reader who does not want to touch a dropdown still gets to an
 * answer: their card, or their task.
 *
 * The hardware row is weighted towards constrained and non-NVIDIA setups —
 * that is who the traffic snapshot actually showed up as (see CLAUDE.md
 * § Content cadence), not the 24 GB flagship crowd. Counts are the
 * `comfortable` rule, the same one the GPU landing pages print, so the number
 * here and the number there cannot disagree.
 */
const POPULAR_GPU_IDS = ['rtx4060ti', 'rtx4060ti16', 'rtx4070', 'rtx3090', 'rtx4090', 'rx7900xtx', 'm3-pro-18', 'cpu-32'];

const popular = POPULAR_GPU_IDS.map(id => {
  const gpu = gpuDatabase.find(g => g.id === id)!;
  return { gpu, slug: gpuSlug(gpu), fits: countModelsFitting(gpu, 'comfortable') };
});

export default function PopularStarts() {
  const { t } = useLanguage();
  const p = t.home.popular;

  const tasks = [
    { href: '/quant-hub/?cat=general', label: p.useChat },
    { href: '/quant-hub/?cat=code', label: p.useCode },
    { href: '/quant-hub/?cat=multimodal', label: p.useMultimodal },
    { href: '/quant-hub/?size=%E2%89%A43B', label: p.useSmall },
  ];

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="section-title text-lg mb-5">{p.title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{p.hardwareTitle}</p>
          <p className="text-xs text-slate-600 mt-1 mb-3 leading-relaxed">{p.hardwareSub}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popular.map(({ gpu, slug, fits }) => (
              <li key={gpu.id}>
                <Link
                  href={`/gpu/${slug}/`}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 min-h-[44px] hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
                >
                  <span aria-hidden className="text-sm">{gpu.icon}</span>
                  <span className="text-sm text-slate-200 font-medium flex-1 min-w-0 truncate">{gpu.name}</span>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    {p.fitCount.replace('{n}', String(fits))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/gpu/" className="inline-flex items-center min-h-[44px] mt-2 text-xs text-violet-400 hover:text-violet-300">
            {p.allGpus.replace('{n}', String(gpuDatabase.length))}
          </Link>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{p.useTitle}</p>
          <p className="text-xs text-slate-600 mt-1 mb-3 leading-relaxed">{p.useSub}</p>
          <ul className="flex flex-col gap-2">
            {tasks.map(task => (
              <li key={task.href}>
                <Link
                  href={task.href}
                  className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 min-h-[44px] hover:border-cyan-500/25 hover:bg-cyan-500/[0.04] transition-all"
                >
                  <span className="text-sm text-slate-300 flex-1">{task.label}</span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
