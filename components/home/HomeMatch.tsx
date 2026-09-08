'use client';

import { useMemo, useState } from 'react';
import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { gpuDatabase, type GPU } from '@/lib/data/gpus';
import { gpuSlug, GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import { homePicks, type HomePick, type HomeUseCase } from '@/lib/utils/home-picks';
import { quantLevelKey } from '@/lib/utils/recommend';
import { trackEvent } from '@/lib/analytics';

/**
 * The homepage's first question, and the reason the page exists: *this* card,
 * *this* job, three models that actually fit.
 *
 * Two deliberate constraints:
 *
 *  - Nothing is invented. Every figure on a card comes from the model index or
 *    from `calcVRAM`, and a slot with no evidence behind it is dropped rather
 *    than filled (see `homePicks`).
 *  - With no hardware chosen the panel does not go blank and does not pretend
 *    to know the reader's card: it shows a card labelled **Example**, so the
 *    shape of the answer is visible before the reader commits to an input.
 */

/** A mid-range consumer card, wide enough that the example is not degenerate. */
const EXAMPLE_GPU_ID = 'rtx4060ti16';

const GROUPS: { type: GPU['type']; label: string }[] = [
  { type: 'nvidia-consumer', label: 'NVIDIA GeForce' },
  { type: 'amd', label: 'AMD Radeon' },
  { type: 'apple', label: 'Apple Silicon' },
  { type: 'nvidia-pro', label: 'NVIDIA data centre' },
  { type: 'cpu', label: 'CPU / system RAM' },
];

const KIND_STYLE: Record<HomePick['kind'], { icon: typeof ShieldCheck; color: string; ring: string }> = {
  capable: { icon: Sparkles, color: 'text-violet-300', ring: 'border-violet-500/25' },
  headroom: { icon: ShieldCheck, color: 'text-emerald-300', ring: 'border-emerald-500/25' },
  fastest: { icon: Gauge, color: 'text-cyan-300', ring: 'border-cyan-500/25' },
};

const round = (n: number) => (n >= 10 ? n.toFixed(0) : n.toFixed(1));

export default function HomeMatch() {
  const { t } = useLanguage();
  const m = t.home.match;
  const { config, hydrated, updateConfig } = useHardwareProfile();
  const [useCase, setUseCase] = useState<HomeUseCase>('chat');

  const chosen = hydrated ? gpuDatabase.find(g => g.id === config.gpuId) ?? null : null;
  const gpu = chosen ?? gpuDatabase.find(g => g.id === EXAMPLE_GPU_ID)!;
  const isExample = chosen === null;

  const picks = useMemo(() => homePicks(gpu, useCase), [gpu, useCase]);

  const kindLabel: Record<HomePick['kind'], { title: string; why: string }> = {
    capable: { title: m.kindCapable, why: m.kindCapableWhy },
    headroom: { title: m.kindHeadroom, why: m.kindHeadroomWhy },
    fastest: { title: m.kindFastest, why: m.kindFastestWhy },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="section-title text-lg">{m.title}</h2>
          <p className="section-subtitle text-xs mt-0.5">{m.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">{m.gpuLabel}</span>
            <select
              value={config.gpuId}
              onChange={e => {
                updateConfig({ gpuId: e.target.value });
                if (e.target.value) trackEvent('Home Match', { gpu: e.target.value });
              }}
              className="w-full min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-slate-200 focus:border-violet-500/40 focus:outline-none"
            >
              <option value="">{m.gpuPlaceholder}</option>
              {GROUPS.map(g => (
                <optgroup key={g.type} label={g.label}>
                  {gpuDatabase
                    .filter(x => x.type === g.type)
                    .map(x => (
                      <option key={x.id} value={x.id}>
                        {x.name} — {x.vram} GB
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">{m.useCaseLabel}</span>
            <select
              value={useCase}
              onChange={e => setUseCase(e.target.value as HomeUseCase)}
              className="w-full min-h-[44px] rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-slate-200 focus:border-violet-500/40 focus:outline-none"
            >
              <option value="chat">{m.useChat}</option>
              <option value="code">{m.useCode}</option>
              <option value="multimodal">{m.useMultimodal}</option>
            </select>
          </label>
        </div>

        <p className="text-xs text-slate-500 mb-3 flex flex-wrap items-center gap-2">
          {isExample && (
            <span className="badge bg-amber-500/12 text-amber-300 border-amber-500/25 text-[10px] font-semibold uppercase tracking-wider">
              {m.exampleBadge}
            </span>
          )}
          <span>
            {isExample
              ? m.exampleNote.replace('{gpu}', gpu.name)
              : m.yoursNote.replace('{gpu}', gpu.name).replace('{vram}', String(gpu.vram))}
          </span>
        </p>

        {picks.length === 0 ? (
          <p className="text-sm text-slate-400 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            {m.none.replace('{gpu}', gpu.name)}
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {picks.map(pick => {
              const style = KIND_STYLE[pick.kind];
              const Icon = style.icon;
              // `quantLevelKey`, not `quant.level`: the index stores AWQ's level
              // as bare `INT4`, while the calculator's tables key it as
              // `AWQ INT4`. Passing the raw level made the calculator fail to
              // find the model's own bpw, fall back to the generic 4.85, and
              // call "fits comfortably" here "marginal" one click later.
              const calcHref =
                `/tools/vram-calc/?model=${encodeURIComponent(pick.model.id)}` +
                `&quant=${encodeURIComponent(quantLevelKey(pick.quant))}` +
                `&gpu=${encodeURIComponent(gpu.id)}&ctx=${GPU_PAGE_CONTEXT}`;
              return (
                <li key={pick.kind} className={`rounded-xl border bg-white/[0.02] p-4 flex flex-col ${style.ring}`}>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${style.color}`}>
                    <Icon size={13} />
                    {kindLabel[pick.kind].title}
                  </div>
                  <Link
                    href={`/quant-hub/${pick.model.id}/`}
                    className="mt-2 text-base font-semibold text-slate-100 hover:text-violet-200 transition-colors"
                  >
                    {pick.model.name}
                  </Link>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    {pick.quant.format} · {pick.quant.level}
                  </p>

                  <dl className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">{m.usesGB.replace('{total}', round(pick.totalGB)).replace('{vram}', String(gpu.vram))}</dt>
                      <dd className="text-slate-400 font-mono">{m.headroom.replace('{n}', round(pick.headroomGB))}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-600">{m.pplLoss.replace('{n}', pick.quant.pplLossPercent.toFixed(1))}</dt>
                      {pick.quant.speedRTX4090 != null && (
                        <dd className="text-slate-400 font-mono">
                          {m.speedOn4090.replace('{n}', String(pick.quant.speedRTX4090))}
                        </dd>
                      )}
                    </div>
                  </dl>

                  <p className="text-xs text-slate-600 leading-relaxed mt-3 flex-1">{kindLabel[pick.kind].why}</p>

                  <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/[0.05]">
                    <Link href={`/quant-hub/${pick.model.id}/`} className="card-action text-xs">
                      {m.openModel}
                    </Link>
                    <Link href={calcHref} className="card-action text-xs">
                      {m.openCalc}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href={`/gpu/${gpuSlug(gpu)}/`}
          className="inline-flex items-center gap-1 mt-4 min-h-[44px] text-xs text-violet-400 hover:text-violet-300"
        >
          {m.allFits.replace('{gpu}', gpu.name)} <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
