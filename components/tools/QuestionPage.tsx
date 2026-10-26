'use client';

import Link from '@/components/i18n/LocalLink';
import { Calculator } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolExplainer from '@/components/tools/ToolExplainer';
import { speedQContent, quantQContent, contextQContent } from '@/lib/data/tool-content';
import type { GPU } from '@/lib/data/gpus';
import { GPU_COUNT } from '@/lib/seo';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { formatLoss } from '@/lib/utils/quality';
import { cn } from '@/lib/utils/cn';
import {
  questionCards, questionRows, groupedCards, levelSignature, reachSignature,
  type QuestionRow,
} from '@/lib/utils/question-pages';
import type { ContextReach } from '@/lib/utils/calc-insights';

/**
 * `/tools/speed/`, `/tools/which-quant/`, `/tools/context-length/`: the
 * calculator's follow-up answers as static tables. All figures come from
 * `question-pages.ts`, which only calls the calculator's own functions.
 */
export type QuestionKind = 'speed' | 'quant' | 'context';

const META = {
  speed: { path: '/tools/speed/', content: speedQContent, nav: 'speedQ' },
  quant: { path: '/tools/which-quant/', content: quantQContent, nav: 'quantQ' },
  context: { path: '/tools/context-length/', content: contextQContent, nav: 'contextQ' },
} as const;

const kTokens = (n: number) => `${Math.round(n / 1024)}K`;

export default function QuestionPage({ kind }: { kind: QuestionKind }) {
  const { t, lang } = useLanguage();
  const q = t.questions;
  const meta = META[kind];
  const page = q[kind];

  const sections: { cards: GPU[]; rows: QuestionRow[] }[] =
    kind === 'speed'
      ? questionCards().map(g => ({ cards: [g], rows: questionRows(g) }))
      : groupedCards(kind === 'quant' ? levelSignature : reachSignature);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.tools, href: '/tools/' },
          { label: t.nav[meta.nav] },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{page.title}</h1>
        <p className="text-slate-400 max-w-3xl leading-relaxed">{page.subtitle}</p>
      </div>

      <div className="glass rounded-2xl p-4 sm:p-5 mb-6 text-sm text-slate-400 leading-relaxed space-y-2">
        <p>{q.basis}</p>
        {kind === 'speed' && (
          <>
            <p><Rich text={q.speed.legendEstimate} /></p>
            <p><Rich text={q.speed.legendCeiling} /></p>
          </>
        )}
        {kind === 'quant' && (
          <>
            <p>{q.quant.legend}</p>
            <p>{q.quant.noPpl}</p>
          </>
        )}
        {kind === 'context' && <p>{q.context.legend}</p>}
      </div>

      <div className="space-y-6">
        {sections.map(sec => (
          <section key={sec.cards.map(c => c.id).join('+')} className="glass rounded-2xl p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-100">
              {sec.cards.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && <span className="text-slate-600"> · </span>}
                  <Link href={`/gpu/${gpuSlug(c)}/`} className="hover:text-violet-300 transition-colors">{c.name}</Link>
                </span>
              ))}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              {sec.cards.map(c => `${c.vram} GB${kind === 'speed' && c.bandwidth ? ` · ${c.bandwidth} GB/s` : ''}`).filter((v, i, a) => a.indexOf(v) === i).join(' / ')}
            </p>
            {sec.rows.length === 0 ? (
              <p className="text-sm text-slate-400">{q.none}</p>
            ) : (
              <div className="overflow-x-auto">
                {kind === 'speed' && <SpeedTable rows={sec.rows} card={sec.cards[0]} />}
                {kind === 'quant' && <QuantTable rows={sec.rows} card={sec.cards[0]} />}
                {kind === 'context' && <ContextTable rows={sec.rows} card={sec.cards[0]} />}
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="text-sm text-slate-400 mt-6">
        {q.otherCards.replace('{n}', String(GPU_COUNT))}{' '}
        <Link href="/gpu/" className="text-violet-300 hover:text-violet-200">{q.allGpus}</Link>
      </p>

      <ToolExplainer content={meta.content} toolName={page.title} path={meta.path} app={false} />
    </div>
  );

  function ModelCell({ row }: { row: QuestionRow }) {
    return (
      <td className="py-2 pr-3">
        <Link href={`/quant-hub/${row.model.id}/`} className="text-slate-200 hover:text-violet-300 transition-colors">
          {row.model.name}
        </Link>
      </td>
    );
  }

  function CalcCell({ row, card }: { row: QuestionRow; card: GPU }) {
    return (
      <td className="py-2 pl-2 text-right">
        <Link
          href={row.calcHref}
          aria-label={q.openAria.replace('{model}', row.model.name).replace('{card}', card.name)}
          className="inline-flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 whitespace-nowrap"
        >
          <Calculator size={12} /> {q.open}
        </Link>
      </td>
    );
  }

  function SpeedTable({ rows, card }: { rows: QuestionRow[]; card: GPU }) {
    const s = q.speed;
    return (
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
            <th className="py-2 pr-3 font-medium">{q.model}</th>
            <th className="py-2 pr-3 font-medium">{q.level}</th>
            <th className="py-2 pr-3 font-medium">{q.at4k}</th>
            <th className="py-2 pr-3 font-medium">{s.estimate} ({s.unit})</th>
            <th className="py-2 pr-3 font-medium">{s.ceiling} ({s.unit})</th>
            <th className="py-2 pl-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.model.id} className="border-b border-white/[0.04] last:border-0">
              <ModelCell row={r} />
              <td className="py-2 pr-3 font-mono text-xs text-slate-300">{r.pick.key}</td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">{r.pick.totalGB.toFixed(1)} GB</td>
              <td className="py-2 pr-3 font-mono text-xs">
                {r.measured
                  ? <span className="text-emerald-300">~{r.measured.tokS} <span className="text-slate-500">({r.measured.low}–{r.measured.high})</span></span>
                  : <span className="text-slate-500">—</span>}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-300">
                {r.ceiling
                  ? <>≤ {r.ceiling.tokS}{r.ceiling.basis === 'moe' && <span className="text-amber-300"> · {s.moe}</span>}</>
                  : <span className="text-slate-500 font-sans">{card.bandwidth ? '—' : s.noBandwidth}</span>}
              </td>
              <CalcCell row={r} card={card} />
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function QuantTable({ rows, card }: { rows: QuestionRow[]; card: GPU }) {
    const s = q.quant;
    const word = { green: s.comfortable, yellow: s.tight, red: s.tooBig } as const;
    const tone = {
      green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      yellow: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      red: 'border-red-500/25 bg-red-500/5 text-red-300',
    } as const;
    return (
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
            <th className="py-2 pr-3 font-medium">{q.model}</th>
            <th className="py-2 pr-3 font-medium">{s.pick}</th>
            <th className="py-2 pr-3 font-medium">{s.ppl}</th>
            <th className="py-2 pr-3 font-medium">{s.levels}</th>
            <th className="py-2 pl-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.model.id} className="border-b border-white/[0.04] last:border-0 align-top">
              <ModelCell row={r} />
              <td className="py-2 pr-3 font-mono text-xs text-emerald-300 whitespace-nowrap">
                {r.pick.key} · {r.pick.totalGB.toFixed(1)} GB
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {r.pick.quant.pplLossPercent === undefined ? '—' : `+${formatLoss(r.pick.quant)}`}
              </td>
              <td className="py-2 pr-3">
                <ul className="flex flex-wrap gap-1.5">
                  {r.levels.map(l => {
                    const v = l.verdict ?? 'red';
                    return (
                      <li
                        key={l.key}
                        className={cn('rounded-md border px-1.5 py-0.5 text-[11px] font-mono', tone[v], !l.formatOk && 'opacity-60')}
                      >
                        {l.key} {l.totalGB.toFixed(1)} GB
                        <span className="font-sans"> · {l.formatOk ? word[v] : s.format}</span>
                      </li>
                    );
                  })}
                </ul>
              </td>
              <CalcCell row={r} card={card} />
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function ContextTable({ rows, card }: { rows: QuestionRow[]; card: GPU }) {
    const s = q.context;
    const cell = (c: ContextReach) => {
      if (c.comfortable === 0) {
        return c.tight > 0
          ? <span className="text-amber-300">{s.tightTo.replace('{n}', kTokens(c.tight))}</span>
          : <span className="text-slate-500">—</span>;
      }
      return (
        <>
          <span className="text-emerald-300 font-semibold">{kTokens(c.comfortable)}</span>
          {c.comfortable >= c.limit
            ? <span className="text-slate-500 font-sans"> · {s.max}</span>
            : c.tight > c.comfortable && (
              <span className="block text-[11px] text-amber-300/90 font-sans">{s.tightTo.replace('{n}', kTokens(c.tight))}</span>
            )}
        </>
      );
    };
    return (
      <table className="w-full text-sm min-w-[620px]">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
            <th className="py-2 pr-3 font-medium">{q.model}</th>
            <th className="py-2 pr-3 font-medium">{q.level}</th>
            <th className="py-2 pr-3 font-medium">{s.f16}</th>
            <th className="py-2 pr-3 font-medium">{s.q8}</th>
            <th className="py-2 pr-3 font-medium">{s.q4}</th>
            <th className="py-2 pl-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.model.id} className="border-b border-white/[0.04] last:border-0 align-top">
              <td className="py-2 pr-3">
                <Link href={`/quant-hub/${r.model.id}/`} className="text-slate-200 hover:text-violet-300 transition-colors">
                  {r.model.name}
                </Link>
                <span className="block text-[11px] text-slate-500">{s.window.replace('{n}', kTokens(r.model.contextLength))}</span>
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-300">{r.pick.key}</td>
              <td className="py-2 pr-3 font-mono text-xs">{cell(r.reach.f16)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{cell(r.reach.q8_0)}</td>
              <td className="py-2 pr-3 font-mono text-xs">{cell(r.reach.q4_0)}</td>
              <CalcCell row={r} card={card} />
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

/** `**bold**` only — the legends use it for their lead word. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}
