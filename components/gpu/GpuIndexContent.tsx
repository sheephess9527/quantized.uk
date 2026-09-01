'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { fitsOnGpu, gpuSlug } from '@/lib/utils/gpu-page';

const TYPE_ORDER: GPU['type'][] = ['nvidia-consumer', 'nvidia-pro', 'amd', 'apple', 'cpu'];
const TYPE_LABEL: Record<GPU['type'], { en: string; zh: string }> = {
  'nvidia-consumer': { en: 'NVIDIA consumer', zh: 'NVIDIA 消费级' },
  'nvidia-pro': { en: 'NVIDIA data centre', zh: 'NVIDIA 数据中心' },
  amd: { en: 'AMD Radeon', zh: 'AMD Radeon' },
  apple: { en: 'Apple silicon', zh: '苹果芯片' },
  cpu: { en: 'CPU + system RAM', zh: 'CPU + 系统内存' },
};

export default function GpuIndexContent() {
  const { t, lang } = useLanguage();
  const g = t.gpuPage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: g.allGpus }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{g.indexTitle}</h1>
        <p className="text-slate-400 max-w-2xl">{g.indexSubtitle}</p>
      </div>

      <div className="space-y-6">
        {TYPE_ORDER.map(type => {
          const cards = gpuDatabase.filter(gpu => gpu.type === type);
          if (cards.length === 0) return null;
          return (
            <section key={type} className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">{TYPE_LABEL[type][lang]}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {cards.map(gpu => (
                  <li key={gpu.id}>
                    <Link
                      href={`/gpu/${gpuSlug(gpu)}/`}
                      className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
                    >
                      <span className="text-sm text-slate-200 font-medium">{gpu.name}</span>
                      <span className="block text-xs text-slate-600 font-mono mt-0.5">
                        {gpu.vram}GB · {fitsOnGpu(gpu).length}/{models.length}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
