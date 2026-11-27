import Link from '@/components/i18n/LocalLink';
import { ChevronRight, GitCompareArrows } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';
import { referenceQuant } from '@/lib/utils/quality';
import { sizeAt4K } from '@/lib/utils/quant-source';
import { getSimilarModels } from '@/lib/utils/related';
import { cn } from '@/lib/utils/cn';

const hwPillClass = 'bg-ink/[0.04] text-slate-400 border-ink/[0.10]';

interface Props {
  modelId: string;
  lang?: Lang;
}

export default function SimilarModels({ modelId, lang = 'en' }: Props) {
  const t = translations[lang];
  const similar = getSimilarModels(modelId);
  if (similar.length === 0) return null;

  const s = t.hub.similar;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">{s.title}</h2>
        {similar[0] && (
          <Link
            href={`/tools/compare/?a=${modelId}&b=${similar[0].id}`}
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <GitCompareArrows size={12} />
            {s.compareWith.replace('{name}', similar[0].name.split(' ').slice(0, 2).join(' '))}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {similar.map(model => {
          // One named build for both figures — the size and the perplexity rise used to come from
          // the smallest and the best quant respectively, a pairing no one can run.
          const ref = referenceQuant(model.quants);
          const loss = ref.pplLossPercent;
          return (
            <Link
              key={model.id}
              href={`/quant-hub/${model.id}/`}
              className="group glass glass-hover rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="badge bg-ink/[0.05] text-slate-400 border-ink/[0.10] font-mono text-xs">
                  {model.paramLabel}
                </span>
                <ChevronRight size={12} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-2 mb-1">
                {model.name}
              </h3>
              <p className="text-xs text-slate-600 mb-3">{model.family}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {model.hardwareTags.slice(0, 2).map(hw => (
                  <span key={hw} className={cn('badge text-[10px]', hwPillClass)}>
                    {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-slate-400">{ref.level}</span>
                <span className="font-mono font-semibold text-slate-200">{sizeAt4K(model, ref).toFixed(1)} GB</span>
                <span aria-hidden className="text-slate-700">·</span>
                <span className="font-mono text-slate-300">
                  {loss === undefined ? '—' : `+${loss.toFixed(1)}%`}
                </span>
                <span>{s.accuracy}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {model.description[lang]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}