'use client';

import { useMemo, useState } from 'react';
import FitControls from './FitControls';
import { contextLabel } from '@/lib/utils/context-label';
import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { gpuDatabase, gpuDisplayName, type GPU } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { fitsOnGpu, gpuSlug, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';

const TYPE_ORDER: (GPU['type'] | 'laptop')[] = ['nvidia-consumer', 'laptop', 'nvidia-unified', 'nvidia-pro', 'amd', 'intel', 'apple', 'cpu'];
const TYPE_LABEL: Record<GPU['type'], { en: string; zh: string }> = {
  'nvidia-consumer': { en: 'NVIDIA consumer', zh: 'NVIDIA 消费级' },
  'nvidia-unified': { en: 'NVIDIA DGX Spark (unified memory)', zh: 'NVIDIA DGX Spark（统一内存）' },
  'nvidia-pro': { en: 'NVIDIA data centre', zh: 'NVIDIA 数据中心' },
  amd: { en: 'AMD Radeon', zh: 'AMD Radeon' },
  intel: { en: 'Intel Arc', zh: 'Intel Arc' },
  apple: { en: 'Apple silicon', zh: '苹果芯片' },
  cpu: { en: 'CPU + system RAM', zh: 'CPU + 系统内存' },
};

export default function GpuIndexContent() {
  const { t, lang } = useLanguage();
  const g = t.gpuPage;
  const [contextLength, setContextLength] = useState(GPU_PAGE_CONTEXT);
  const [batchSize, setBatchSize] = useState(1);
  const [query, setQuery] = useState('');

  const fitCounts = useMemo(
    () => new Map(gpuDatabase.map(gpu => [gpu.id, fitsOnGpu(gpu, contextLength, batchSize).length])),
    [contextLength, batchSize],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matchesGpu = (gpu: GPU) => {
    if (!normalizedQuery) return true;
    const haystack = `${gpu.name} ${gpu.nameZh ?? ''} ${gpu.vram}gb ${gpu.vram}g ${gpu.memType ?? ''} ${gpu.id}`.toLowerCase();
    return normalizedQuery.split(/\s+/).every(token => haystack.includes(token));
  };

  const visibleSections = TYPE_ORDER
    .map(type => ({
      type,
      cards: gpuDatabase.filter(gpu => (gpu.isLaptop ? 'laptop' : gpu.type) === type && matchesGpu(gpu)),
    }))
    .filter(section => section.cards.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: g.allGpus }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{g.indexTitle}</h1>
        <p className="text-slate-400 max-w-2xl">{g.indexSubtitle.replace('4K', contextLabel(contextLength))}</p>
        {/* A card page answers "what fits"; /best/ answers "what should I run". */}
        <Link
          href="/best/"
          className="inline-flex items-center gap-1.5 min-h-[44px] mt-2 text-sm text-violet-400 hover:text-violet-300"
        >
          {t.best.hubTitle} <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mb-4 max-w-md relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={g.gpuSearchPlaceholder.replace('{n}', String(gpuDatabase.length))}
          aria-label={g.gpuSearchPlaceholder.replace('{n}', String(gpuDatabase.length))}
          className="w-full min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.12] pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500/40"
        />
      </div>

      <FitControls contextLength={contextLength} batchSize={batchSize} onContextChange={setContextLength} onBatchChange={setBatchSize} />

      {visibleSections.length === 0 ? (
        <p className="text-sm text-slate-400 glass rounded-2xl p-6">
          {g.gpuSearchEmpty.replace('{q}', query.trim())}
        </p>
      ) : (
        <div className="space-y-6">
          {visibleSections.map(({ type, cards }) => (
            <section key={type} className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">{type === 'laptop' ? t.calc.gpuGroupLaptop : TYPE_LABEL[type][lang]}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cards.map(gpu => (
                  <li key={gpu.id}>
                    <Link
                      href={`/gpu/${gpuSlug(gpu)}/`}
                      className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
                    >
                      <span className="text-sm text-slate-200 font-medium">{gpuDisplayName(gpu, lang)}</span>
                      <span className="block text-xs text-slate-600 font-mono mt-0.5">
                        {gpu.vram}GB · {t.gpuPage.indexFitCount.replace('{n}', String(fitCounts.get(gpu.id) ?? 0)).replace('{total}', String(models.length))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
