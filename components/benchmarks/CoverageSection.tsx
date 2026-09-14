'use client';

import Link from '@/components/i18n/LocalLink';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase } from '@/lib/data/gpus';
import { measuredCards, measuredCardHref } from '@/lib/utils/bench-coverage';

/**
 * QTZ-031: the most useful section this page can add. Not "what the numbers
 * are" but "which numbers are real" — the two-line intro above already says
 * the count, this spells out exactly which cards and what the other 57 are
 * doing instead (the same formula the calculator uses, not a second hidden
 * measurement).
 */
export default function CoverageSection() {
  const { t } = useLanguage();
  const c = t.bench.coverage;
  const measured = measuredCards();
  const estimatedCount = gpuDatabase.length - measured.length;

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">{c.title}</h2>

      <div className="space-y-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300 mb-2">
            <CheckCircle2 size={14} />
            {c.measuredHere}
          </p>
          <ul className="flex flex-wrap gap-2">
            {measured.map(({ gpu, runs }) => (
              <li key={gpu.id}>
                <Link
                  href={measuredCardHref(gpu)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs text-emerald-200/90 hover:border-emerald-500/40 transition-colors"
                >
                  {gpu.name}
                  <span className="text-emerald-400/60 font-mono">
                    {(runs === 1 ? c.runsLabel : c.runsLabelPlural).replace('{n}', String(runs))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 mb-2">
            <Circle size={14} />
            {c.estimatedOnly}
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            {c.estimatedBody.replace('{n}', String(estimatedCount))}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mb-2">
            <XCircle size={14} />
            {c.notCovered}
          </p>
          <ul className="text-sm text-slate-500 leading-relaxed list-disc list-inside space-y-0.5">
            {c.notCoveredItems.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
