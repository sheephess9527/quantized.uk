'use client';

import Link from '@/components/i18n/LocalLink';
import { contextLabel } from '@/lib/utils/context-label';
import ConfidenceTag from '@/components/ui/ConfidenceTag';
import { ExternalLink, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { QuantModel, models } from '@/lib/data/models';
import { cn } from '@/lib/utils/cn';
import { formatLoss, referenceQuant } from '@/lib/utils/quality';
import { sizeAt4K } from '@/lib/utils/quant-source';
import { isRecentModel, isSuperseded } from '@/lib/utils/model-meta';
import { licenceOf } from '@/lib/utils/model-facts';

const formatColors: Record<string, string> = {
  GGUF: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  AWQ:  'bg-cyan-500/12 text-cyan-300 border-cyan-500/25',
  EXL2: 'bg-ink/[0.05] text-slate-300 border-ink/[0.12]',
  GPTQ: 'bg-teal-500/12 text-teal-300 border-teal-500/25',
  HQQ:  'bg-ink/[0.04] text-slate-400 border-ink/[0.10]',
};

const hwPillClass = 'bg-ink/[0.04] text-slate-400 border-ink/[0.10]';

interface Props {
  model: QuantModel;
  lang: 'en' | 'zh';
}

const MODEL_NAME_BY_ID = new Map(models.map(m => [m.id, m.name]));

export default function ModelCard({ model, lang }: Props) {
  const { t } = useLanguage();
  const uniqueFormats = Array.from(new Set(model.quants.map(q => q.format)));

  /**
   * One configuration, named on the card.
   *
   * The stats used to be `min(vramGB)` beside `max(speed)` beside the
   * lowest-perplexity level — three different quantizations presented as if a
   * reader could have all three at once (3.2 GB *and* 235 tok/s *and* Q8_0
   * quality). They now all come from a single variant, and the card says which.
   * `referenceQuant`: the native release when there is one (GPT-OSS ships as
   * MXFP4), else Q4_K_M — the same level the model page sizes against.
   */
  const refQuant = referenceQuant(model.quants);
  const bestQuant = refQuant;
  // Shown on the card, not only reachable through the filter: a licence is the one
  // fact a reader can act on before downloading, and the Hub's licence filter is
  // unreadable if the value it filters on is invisible.
  const licence = licenceOf(model.id);

  return (
    <Link
      href={`/quant-hub/${model.id}/`}
      className="cv-card glass glass-hover rounded-2xl p-5 flex flex-col gap-4 group transition-all duration-200 hover:scale-[1.01]"
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-sky-300 transition-colors">{model.name}</h3>
          <span className="badge shrink-0 bg-ink/[0.05] text-slate-400 border-ink/[0.10] font-mono text-xs">
            {model.paramLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {isRecentModel(model) && (
            <span title={t.hub.model.newBadgeHint} className="badge text-[10px] bg-sky-500/12 text-sky-300 border-sky-500/25">{t.hub.model.newBadge}</span>
          )}
          {isSuperseded(model) && (
            <span className="badge text-[10px] bg-amber-500/12 text-amber-300 border-amber-500/25">{t.hub.model.superseded}</span>
          )}
          {licence && (
            <span
              title={`${licence.name[lang]} — ${licence.url}`}
              className="badge text-[10px] bg-ink/[0.04] text-slate-400 border-ink/[0.10]"
            >
              {licence.short}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-2">{model.family}</p>
        {isSuperseded(model) && model.supersededBy && (
          <p className="text-[11px] text-amber-300 mb-1.5">
            {t.hub.model.prefer.replace(
              '{name}',
              MODEL_NAME_BY_ID.get(model.supersededBy) ?? model.supersededBy,
            )}
          </p>
        )}
        <p className="text-xs text-slate-500 leading-relaxed">
          {model.description[lang]}
        </p>
      </div>

      {/* Stats row — one configuration, named directly above it. */}
      <p className="text-[11px] text-slate-500 font-mono -mb-2">
        {t.hub.model.refConfig
          .replace('{level}', refQuant.format === 'GGUF' ? refQuant.level : `${refQuant.format} ${refQuant.level}`)}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-bg-recessed border border-ink/[0.06]">
          <p className="text-xs font-bold font-mono text-slate-100">{sizeAt4K(model, refQuant).toFixed(1)} GB</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.hub.model.vramAtRef}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-bg-recessed border border-ink/[0.06]">
          <p className="text-xs font-bold font-mono text-slate-100">
            {contextLabel(model.contextLength)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{t.hub.model.context}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-bg-recessed border border-ink/[0.06]">
          {refQuant.speedRTX4090 ? (
            <>
              <p className="text-xs font-bold font-mono text-slate-100">{refQuant.speedRTX4090}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.hub.model.speed}<ConfidenceTag modelId={model.id} quant={refQuant} /></p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold font-mono text-slate-500">—</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.hub.model.speed}</p>
            </>
          )}
        </div>
      </div>

      {/* Format badges */}
      <div>
        <p className="text-xs text-slate-600 mb-1.5">{t.hub.model.formats}</p>
        <div className="flex flex-wrap gap-1.5">
          {uniqueFormats.map(fmt => (
            <span key={fmt} className={cn('badge text-xs font-mono', formatColors[fmt] ?? hwPillClass)}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Hardware tags — near-identical on most cards, so hidden in the phone
          list where every card stacks; the Hub's hardware filter carries them. */}
      <div className="hidden sm:flex flex-wrap gap-1.5">
        {model.hardwareTags.map(hw => (
          <span key={hw} className={cn('badge text-xs', hwPillClass)}>
            {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-ink/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
          {bestQuant && (
            <>
              <Zap size={10} className="text-sky-400" />
              <span>{bestQuant.format} {bestQuant.level}</span>
            </>
          )}
        </div>
        <span
          role="link"
          tabIndex={0}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            window.open(model.quants[0]?.hfSearchUrl ?? '#', '_blank', 'noopener,noreferrer');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              window.open(model.quants[0]?.hfSearchUrl ?? '#', '_blank', 'noopener,noreferrer');
            }
          }}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
        >
          {t.hub.model.viewHF}
          <ExternalLink size={10} />
        </span>
      </div>
    </Link>
  );
}
