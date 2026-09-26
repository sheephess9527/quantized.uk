'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { sizeClassReference } from '@/lib/utils/vram-reference';

const rows = sizeClassReference();
const range = ([lo, hi]: [number, number]) =>
  lo === hi ? `${lo.toFixed(1)} GB` : `${lo.toFixed(1)}–${hi.toFixed(1)} GB`;

export default function VramQuickReference() {
  const { t } = useLanguage();
  const r = t.calc.refTable;
  return (
    <section className="glass rounded-2xl p-5 sm:p-6 mt-6">
      <h2 className="text-lg font-bold text-slate-100 mb-2">{r.title}</h2>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{r.intro}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-slate-500 text-left">
              <th scope="col" className="py-2 pr-3 font-medium">{r.colClass}</th>
              <th scope="col" className="py-2 pr-3 font-medium text-right">{r.colModels}</th>
              <th scope="col" className="py-2 pr-3 font-medium text-right">{r.col4k}</th>
              <th scope="col" className="py-2 pr-3 font-medium text-right">{r.col32k}</th>
              <th scope="col" className="py-2 font-medium">{r.colCard}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.bucket} className="border-b border-white/[0.04] last:border-0">
                <th scope="row" className="py-2.5 pr-3 text-left font-mono text-slate-200">{row.bucket}</th>
                <td className="py-2.5 pr-3 text-right font-mono text-slate-400">{row.count}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-slate-300">{range(row.at4k)}</td>
                <td className="py-2.5 pr-3 text-right font-mono text-slate-300">{row.at32k ? range(row.at32k) : '—'}</td>
                <td className="py-2.5 text-slate-400">
                  {row.wholeClass ? (
                    <Link href={`/gpu/${gpuSlug(row.wholeClass)}/`} className="hover:text-violet-300">
                      {row.wholeClass.name}
                      {!new RegExp(`\\b${row.wholeClass.vram}\\s?GB?\\b`, 'i').test(row.wholeClass.name) && ` (${row.wholeClass.vram} GB)`}
                    </Link>
                  ) : (
                    r.noCard
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
