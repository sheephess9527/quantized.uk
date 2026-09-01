'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import { headToHead, modelsWithFormat, type FormatPair } from '@/lib/utils/format-compare';
import { quantLevelKey } from '@/lib/utils/recommend';

export default function FormatCompareContent({ pair }: { pair: FormatPair }) {
  const { t, lang } = useLanguage();
  const c = t.formatCompare;
  const { a, b } = pair;

  const both = headToHead(pair);
  const countA = modelsWithFormat(a.name).length;
  const countB = modelsWithFormat(b.name).length;
  const fill = (s: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s);

  const rows: { label: string; a: string; b: string }[] = [
    { label: c.rowHardware, a: a.hardwareReq, b: b.hardwareReq },
    { label: c.rowFramework, a: a.framework, b: b.framework },
    { label: c.rowBestFor, a: a.bestFor[lang], b: b.bestFor[lang] },
    { label: c.rowAdoption, a: `${a.heatPercent}%`, b: `${b.heatPercent}%` },
    { label: c.rowIndexed, a: `${countA} / ${models.length}`, b: `${countB} / ${models.length}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: c.allComparisons, href: '/formats/' },
          { label: `${a.name} vs ${b.name}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{fill(c.title, { a: a.name, b: b.name })}</h1>
        <p className="text-slate-400 max-w-3xl">{fill(c.subtitle, { total: models.length })}</p>
      </div>

      <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">{c.atAGlance}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{fill(c.title, { a: a.name, b: b.name })}</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider">
                <th className="text-left py-2 px-3 font-semibold text-slate-500"> </th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: a.color }}>{a.name}</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: b.color }}>{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-b border-white/[0.04] last:border-0">
                  <td className="py-2.5 px-3 text-xs text-slate-500">{row.label}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.a}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[a, b].map(fmt => (
          <section key={fmt.id} className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: fmt.color }}>{fmt.name}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{fmt.description[lang]}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{c.strengths}</p>
            <ul className="space-y-1.5 mb-4">
              {fmt.strengths[lang].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{c.weaknesses}</p>
            <ul className="space-y-1.5">
              {fmt.weaknesses[lang].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                  <Minus size={14} className="text-amber-400 shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{c.headToHeadTitle}</h2>
        {both.length === 0 ? (
          <p className="text-sm text-slate-400 leading-relaxed">{c.headToHeadNone}</p>
        ) : (
          <>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {fill(c.headToHeadBody, { count: both.length })}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{c.headToHeadTitle}</caption>
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left py-2 px-3 font-semibold">{c.thModel}</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: a.color }}>{a.name} {c.thLevel}</th>
                    <th className="text-right py-2 px-3 font-semibold">{c.thLoss}</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: b.color }}>{b.name} {c.thLevel}</th>
                    <th className="text-right py-2 px-3 font-semibold">{c.thLoss}</th>
                  </tr>
                </thead>
                <tbody>
                  {both.slice(0, 20).map(row => (
                    <tr key={row.model.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-2.5 px-3">
                        <Link href={`/quant-hub/${row.model.id}/`} className="text-slate-200 hover:text-violet-300">
                          {row.model.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{quantLevelKey(row.a)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-300">{row.a.pplLossPercent}%</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{quantLevelKey(row.b)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-300">{row.b.pplLossPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 mt-3">{c.lossNote}</p>
          </>
        )}
      </section>

      <section className="glass rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-3">{c.chooseTitle}</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/tools/format-wizard/"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300"
          >
            {c.wizardCta} <ArrowRight size={14} />
          </Link>
          <Link
            href={`/quant-hub/?fmt=${a.name}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-500 hover:text-slate-300"
          >
            {fill(c.browseA, { format: a.name })}
          </Link>
          <Link
            href={`/quant-hub/?fmt=${b.name}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-500 hover:text-slate-300"
          >
            {fill(c.browseA, { format: b.name })}
          </Link>
        </div>
      </section>
    </div>
  );
}
