'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import type { QuantFormat } from '@/lib/data/formats';
import { formatPage } from '@/lib/utils/format-page';
import { formatPairs } from '@/lib/utils/format-compare';
import { formatLoss } from '@/lib/utils/quality';

/**
 * "What is AWQ" had no page. `/formats/` compared formats against each other
 * and the six pair pages compared two at a time, but nothing simply explained
 * one — and the 53 models shipping AWQ had no shared parent to link from.
 *
 * Everything here is derived (see `format-page.ts`); the model list at the
 * bottom is the point as much as the prose, because it is real internal linking
 * between a format and every model that ships it.
 */
export default function FormatSingleContent({ format }: { format: QuantFormat }) {
  const { t, lang } = useLanguage();
  const c = t.formatCompare;
  const s = t.formatSingle;
  const { owning, levels, sections, faqs } = formatPage(format);
  const pairs = formatPairs.filter(p => p.a.id === format.id || p.b.id === format.id);

  const fill = (str: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), str);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: c.allComparisons, href: '/formats/' },
          { label: format.name },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: format.textColor }}>
          {fill(s.title, { format: format.name })}
        </h1>
        <p className="text-slate-400 max-w-3xl leading-relaxed">
          {fill(s.subtitle, { format: format.name, count: owning.length, total: models.length })}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec, i) => (
          <section key={i} className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-2">{sec.heading[lang]}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{sec.body[lang]}</p>
          </section>
        ))}

        {levels.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">{fill(s.levelsTitle, { format: format.name })}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                    <th scope="col" className="font-medium py-2 pr-3">{s.colLevel}</th>
                    <th scope="col" className="font-medium py-2 pr-3 text-right">{s.colBpw}</th>
                    <th scope="col" className="font-medium py-2 pr-3 text-right">{s.colModels}</th>
                    <th scope="col" className="font-medium py-2 text-right">{s.colLoss}</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map(l => (
                    <tr key={l.level} className="border-b border-white/[0.04]">
                      <td className="py-2.5 pr-3 font-mono text-slate-300">{l.level}</td>
                      <td className="py-2.5 pr-3 text-right font-mono text-slate-400">
                        {l.bpwLow === l.bpwHigh ? l.bpwLow : `${l.bpwLow}–${l.bpwHigh}`}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono text-slate-400">{l.count}</td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        {l.medianLoss === null ? (
                          <span className="text-slate-500">{c.lossUnknown}</span>
                        ) : (
                          <>
                            <span className="text-slate-300">{l.medianLoss.toFixed(1)}%</span>
                            <span className="block text-slate-500">{c.lossSample.replace('{n}', String(l.lossSample))}</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{s.levelsNote}</p>
          </section>
        )}

        {/*
          The list is the internal linking. Before these pages existed a model
          page linked to its guides and its hub filters but nothing linked a
          format to the models that carry it.
        */}
        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-1">
            {fill(s.modelsTitle, { format: format.name })}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {fill(s.modelsBody, { count: owning.length, total: models.length, format: format.name })}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {owning.map(m => {
              const q = m.quants
                .filter(x => x.format === format.name)
                .sort((a, b) => a.bpw - b.bpw)[0];
              return (
                <li key={m.id}>
                  <Link
                    href={`/quant-hub/${m.id}/`}
                    className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-violet-500/25 hover:bg-violet-500/[0.04] transition-all"
                  >
                    <span className="block text-sm text-slate-200 font-medium">{m.name}</span>
                    <span className="block text-xs text-slate-500 font-mono mt-0.5">
                      {m.paramLabel} · {q.level} · {formatLoss(q)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={`/quant-hub/?fmt=${format.name}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] mt-3 text-sm text-violet-400 hover:text-violet-300"
          >
            {fill(c.browseA, { format: format.name })} <ArrowRight size={14} />
          </Link>
        </section>

        {faqs.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">{s.faqTitle}</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{f.q[lang]}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.a[lang]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {pairs.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-3">{fill(s.comparedTitle, { format: format.name })}</h2>
            <ul className="flex flex-wrap gap-3">
              {pairs.map(p => (
                <li key={p.slug}>
                  <Link
                    href={`/formats/${p.slug}/`}
                    className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300"
                  >
                    {p.a.name} vs {p.b.name} <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
