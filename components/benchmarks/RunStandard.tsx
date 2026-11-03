'use client';

import { ShieldCheck, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { benchmarkMethodology } from '@/lib/data/meta';
import { calibrationRows, CEILING_TOLERANCE } from '@/lib/utils/bench-calibration';
import { measuredCards } from '@/lib/utils/bench-coverage';
import { FEEDBACK_EMAIL } from '@/lib/seo';
import CopyButton from '@/components/ui/CopyButton';

/** The one command a reader run must come from: llama-bench's own pp512 / tg128 table. */
const BENCH_COMMAND = 'llama-bench -m <model-file>.gguf -p 512 -n 128 -ngl 99';

const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), s);

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * What the measured rows on /benchmarks/ have to satisfy, how close the
 * calculator comes to them, and how a reader can add one.
 *
 * Everything printed here is derived: the run conditions come from
 * `benchmarkMethodology`, the ceiling rule from `CEILING_TOLERANCE` (the same
 * constant the build gate uses), and the calibration rows from the matrix
 * joined to the index. Rendered open, never behind a toggle — this text is
 * the point of the section and has to be in the exported HTML.
 */
export default function RunStandard() {
  const { t, lang } = useLanguage();
  const s = t.bench.standard;
  const m = benchmarkMethodology;
  const tolPct = Math.round((CEILING_TOLERANCE - 1) * 100);

  const rows = calibrationRows();
  const sized = rows.filter(r => r.estimateGB !== undefined);
  const gaps = sized.map(r => Math.abs(r.estimateGB! - r.row.vramUsedGB));
  const worst = sized.reduce((a, b) =>
    Math.abs(b.estimateGB! - b.row.vramUsedGB) > Math.abs(a.estimateGB! - a.row.vramUsedGB) ? b : a);

  const mailHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(s.mailSubject)}&body=${encodeURIComponent(s.mailBody)}`;

  return (
    <>
      <section className="glass rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <ShieldCheck size={18} className="text-emerald-400" />
          {s.rulesTitle}
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">{s.rulesSubtitle}</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300 leading-relaxed">
          {s.rules.map(rule => (
            <li key={rule}>
              {fill(rule, { batch: m.batch, prompt: m.promptLen, gen: m.genLen, ctx: m.context, tol: tolPct })}
            </li>
          ))}
        </ol>
        <p className="text-sm text-slate-500 mt-4 leading-relaxed">{s.rulesLimit}</p>
      </section>

      <section className="glass rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-100">{s.calTitle}</h2>
        <p className="text-sm text-slate-500 mt-1">{fill(s.calSubtitle, { ctx: m.context })}</p>
        <p className="text-sm text-slate-300 mt-3 mb-4 leading-relaxed">
          {fill(s.calSummary, {
            n: sized.length,
            median: median(gaps).toFixed(1),
            model: worst.row.model,
            est: worst.estimateGB!.toFixed(1),
            rec: worst.row.vramUsedGB.toFixed(1),
          })}
        </p>
        <table className="w-full text-sm">
          <caption className="sr-only">{s.calTitle}</caption>
          <thead>
            <tr className="border-b border-white/[0.06]">
              {Object.values(s.calCols).map(col => (
                <th key={col} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const diff = r.estimateGB !== undefined ? r.estimateGB - r.row.vramUsedGB : undefined;
              return (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-3 text-xs text-slate-200">{r.row.model}</td>
                  <td className="py-2 px-3 text-xs text-slate-300 whitespace-nowrap">{r.gpu?.name ?? r.row.hardware}</td>
                  <td className="py-2 px-3 text-xs font-mono text-slate-400 whitespace-nowrap">{r.row.quant} · {r.row.framework}</td>
                  <td className="py-2 px-3 text-xs font-mono text-cyan-400">{r.row.vramUsedGB.toFixed(1)} GB</td>
                  <td className="py-2 px-3 text-xs font-mono text-slate-300">
                    {r.estimateGB !== undefined ? `${r.estimateGB.toFixed(1)} GB` : <span className="text-slate-500 font-sans">{s.calNotInIndex}</span>}
                  </td>
                  <td className="py-2 px-3 text-xs font-mono text-slate-400">
                    {diff === undefined ? '—' : Math.abs(diff) < 0.05 ? '0.0' : `${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)}`}
                  </td>
                  <td className="py-2 px-3 text-xs font-mono text-emerald-400">{r.row.speedTokSec}</td>
                  <td className="py-2 px-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                    {r.ceiling !== undefined ? `${r.ceiling} (${Math.round((r.row.speedTokSec / r.ceiling) * 100)}%)` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">{s.calCeilingNote}</p>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <Mail size={18} className="text-violet-300" />
          {s.submitTitle}
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          {fill(s.submitBody, { c: measuredCards().length })}
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/30 border border-white/[0.06] px-4 py-3 overflow-x-auto">
          <code lang="en" className="font-mono text-xs text-slate-200 whitespace-nowrap">{BENCH_COMMAND}</code>
          <CopyButton text={BENCH_COMMAND} label={t.cookbook.code.copy} copiedLabel={t.cookbook.code.copied} size="sm" className="ml-auto shrink-0" />
        </div>
        <ul className="list-disc pl-5 mt-4 space-y-1.5 text-sm text-slate-300">
          {s.submitNeeds.map(n => <li key={n}>{n}</li>)}
        </ul>
        <p className="text-sm text-slate-500 mt-4 leading-relaxed">{s.submitCheck}</p>
        <p className="text-xs text-slate-500 mt-4 mb-1.5">{s.submitPreview}</p>
        <pre className="rounded-xl bg-black/30 border border-white/[0.06] px-4 py-3 text-xs text-slate-300 whitespace-pre-wrap">
          {`${lang === 'zh' ? '主题' : 'Subject'}: ${s.mailSubject}\n\n${s.mailBody}`}
        </pre>
        <a
          href={mailHref}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-200 hover:bg-violet-500/20 transition-colors min-h-[44px]"
        >
          <Mail size={14} />
          {s.submitButton}
        </a>
      </section>
    </>
  );
}
