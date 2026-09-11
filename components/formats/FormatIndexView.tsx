'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { formatPairs, headToHead, modelsWithFormat } from '@/lib/utils/format-compare';
import { formatOverview } from '@/lib/utils/format-overview';
import { models } from '@/lib/data/models';
import FormatHeatmap from '@/components/home/FormatHeatmap';
import FormatRadar from '@/components/home/FormatRadarLazy';

const rows = formatOverview();
const count = (name: string) => rows.find(r => r.format.name === name)?.modelCount ?? 0;

export default function FormatIndexView() {
  const { t } = useLanguage();
  const c = t.formatCompare;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: c.allComparisons }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{c.indexTitle}</h1>
        <p className="text-slate-400 max-w-3xl leading-relaxed">{c.hubIntro}</p>
      </div>

      {/*
        This page was 65 words — the thinnest on a site called quantized.uk,
        and the only internal route to the six comparison pages. The table is
        counted from the index rather than written: a format nobody ships shows
        `0 of 81` and says so, which is the opposite of the HQQ mistake the
        homepage once made by badging a format the Hub had no results for.
      */}
      <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">{c.tableTitle}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                <th scope="col" className="font-medium py-2 pr-3">{c.colFormat}</th>
                <th scope="col" className="font-medium py-2 pr-3">{c.colRuns}</th>
                <th scope="col" className="font-medium py-2 pr-3">{c.colHardware}</th>
                <th scope="col" className="font-medium py-2 pr-3 text-right">{c.colModels}</th>
                <th scope="col" className="font-medium py-2 pr-3 text-right">{c.colLoss}</th>
                <th scope="col" className="font-medium py-2">{c.colLevels}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.format.id} className="border-b border-white/[0.04] align-top">
                  <td className="py-3 pr-3 font-semibold" style={{ color: r.format.textColor }}>{r.format.name}</td>
                  <td className="py-3 pr-3 text-slate-400 text-xs">{r.format.framework}</td>
                  <td className="py-3 pr-3 text-slate-400 text-xs">{r.format.hardwareReq}</td>
                  <td className="py-3 pr-3 text-right font-mono text-slate-300">
                    {r.modelCount}<span className="text-slate-500"> / {r.totalModels}</span>
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-xs">
                    {r.medianLoss === null ? (
                      <span className="text-slate-500">{c.lossUnknown}</span>
                    ) : (
                      <>
                        <span className="text-slate-300">{r.medianLoss.toFixed(1)}%</span>
                        <span className="block text-slate-500">{c.lossSample.replace('{n}', String(r.lossSample))}</span>
                      </>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-xs">
                    {r.levels.length ? r.levels.slice(0, 4).join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.some(r => r.modelCount === 0) && (
          <p className="text-xs text-slate-500 leading-relaxed mt-3">{c.noModels}</p>
        )}
      </section>

      <section className="glass rounded-2xl p-5 sm:p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{c.hubChooseTitle}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {c.hubChooseBody
            .replace('{total}', String(models.length))
            .replace('{gguf}', String(count('GGUF')))
            .replace('{awq}', String(count('AWQ')))
            .replace('{exl2}', String(count('EXL2')))
            .replace('{gptq}', String(count('GPTQ')))}
        </p>
      </section>

      <h2 className="text-lg font-bold text-slate-100 mb-3">{c.pairsTitle}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {formatPairs.map(pair => (
          <li key={pair.slug}>
            <Link
              href={`/formats/${pair.slug}/`}
              className="block glass glass-hover rounded-2xl p-5 h-full"
            >
              <span className="text-base font-semibold text-slate-100">
                <span style={{ color: pair.a.textColor }}>{pair.a.name}</span>
                <span className="text-slate-600 mx-1.5">vs</span>
                <span style={{ color: pair.b.textColor }}>{pair.b.name}</span>
              </span>
              <span className="block text-xs text-slate-500 font-mono mt-1.5">
                {modelsWithFormat(pair.a.name).length} · {modelsWithFormat(pair.b.name).length} · ⇄ {headToHead(pair).length}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/*
        Both of these used to sit on the homepage, where they answered a
        question nobody arrives with. They are editorial context about the
        formats themselves — an adoption estimate and a six-axis profile — so
        they belong on the page about formats, next to the pairwise
        comparisons that share their vocabulary.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1">
          <FormatHeatmap />
        </div>
        <div className="lg:col-span-2">
          <FormatRadar />
        </div>
      </div>
    </div>
  );
}
