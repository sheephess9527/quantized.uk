'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { todayFeed, models } from '@/lib/data/models';
import { cn } from '@/lib/utils/cn';
import { sizeAt, cardsFitting, REF_CONTEXT } from '@/lib/utils/model-explainer';
import { quantLevelKey } from '@/lib/utils/recommend';

const typeConfig = {
  new:  { className: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  hot:  { className: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  upd:  { className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
};

/**
 * The newest few only. The feed is appended to on every model batch and had
 * grown past twenty rows — at that length it stops being a pick and becomes a
 * second copy of the Hub's recency filter, which the "view all" link covers.
 */
const PICKS_SHOWN = 6;
const addedAt = new Map(models.map(m => [m.id, m.addedAt ?? '']));
const picks = [...todayFeed].sort((a, b) =>
  (addedAt.get(b.modelId) ?? '').localeCompare(addedAt.get(a.modelId) ?? '') || b.id - a.id
).slice(0, PICKS_SHOWN);

export default function TodayBoard() {
  const { t, lang } = useLanguage();

  return (
    <div className="glass rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title text-lg">{t.home.todayBoard.title}</h2>
          <p className="section-subtitle text-xs mt-0.5">{t.home.todayBoard.subtitle}</p>
        </div>
        <Link href="/quant-hub/" className="card-action text-xs shrink-0">
          {t.common.viewAll} →
        </Link>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {picks.map((item) => {
          const cfg = typeConfig[item.type];
          const model = models.find(m => m.id === item.modelId);
          const quant = model?.quants.find(q => q.level === item.level);
          if (!model || !quant) return null;
          const size = sizeAt(model, quant.bpw, REF_CONTEXT).totalGB;
          const smallest = cardsFitting(size, quant.format)[0];
          const href = `/quant-hub/${item.modelId}/`;
          return (
            <li key={item.id}>
              <Link
                href={href}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <span className={cn('badge shrink-0 mt-0.5', cfg.className)}>
                  {t.home.todayBoard[item.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-200 truncate group-hover:text-violet-200 transition-colors">
                      {model.name}
                    </span>
                    <span className={cn('badge text-xs shrink-0', cfg.className)}>
                      {quant.format}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
                    <span className="font-mono text-xs text-slate-500">
                      {quantLevelKey(quant)} · {t.home.todayBoard.sizeAt4k.replace('{gb}', size.toFixed(1))} · {item.note[lang]}
                    </span>
                    <span aria-hidden className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600">{item.quantizer}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-slate-600">
                      {smallest
                        ? t.home.todayBoard.fitsFrom.replace('{gpu}', smallest.name).replace('{vram}', String(smallest.vram))
                        : t.home.todayBoard.noSingleCard}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={12} className="text-slate-700 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}