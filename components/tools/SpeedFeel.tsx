'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUrlQuery } from '@/lib/hooks/useUrlQuery';
import { useLanguage } from '@/lib/i18n/context';
import { gpuDatabase, gpuDisplayName, GPU_GROUPS, rowsInGpuGroup, type GPU } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import { isMoE } from '@/lib/utils/model-meta';
import { usableCapacityGB } from '@/lib/utils/gpu-page';
import { SPEED_CONTEXTS, speedQuote, streamTokS, type SpeedContext, type SpeedQuote } from '@/lib/utils/speed-label';

const DEFAULT_LEFT = 'rtx4060ti16';
const DEFAULT_RIGHT = 'rtx4090';
const DEFAULT_MODEL = 'llama-3.1-8b';

function quantKey(q: QuantVariant) {
  return `${q.format}:${q.level}`;
}

function unitsOf(text: string): string[] {
  if (/[\u4e00-\u9fff]/.test(text)) return Array.from(text);
  return text.split(' ');
}

function SpeedPane({
  gpu,
  model,
  quant,
  ctx,
  running,
}: {
  gpu: GPU;
  model: QuantModel;
  quant: QuantVariant;
  ctx: SpeedContext;
  running: boolean;
}) {
  const { t, lang } = useLanguage();
  const f = t.feel;
  const quote = useMemo(() => speedQuote(gpu, model, quant, ctx), [gpu, model, quant, ctx]);
  const rate = streamTokS(quote);
  const sample = f.sample;
  const units = useMemo(() => unitsOf(sample), [sample]);
  const [count, setCount] = useState(0);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setCount(0);
    setWaiting(false);
    if (!running || !rate) return;
    const start = performance.now();
    const waitMs = (quote.ttftSeconds ?? 0) * 1000;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < waitMs) {
        setWaiting(true);
        setCount(0);
      } else {
        setWaiting(false);
        const n = Math.min(units.length, Math.floor(((elapsed - waitMs) / 1000) * rate));
        setCount(n);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, rate, quote.ttftSeconds, units]);

  const shown = /[\u4e00-\u9fff]/.test(sample) ? units.slice(0, count).join('') : units.slice(0, count).join(' ');
  const cap = usableCapacityGB(gpu);

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3 min-h-[280px]">
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{gpuDisplayName(gpu, lang)}</h2>
        <p className="text-xs text-slate-500 mt-1">{headline(quote, f, isMoE(model))}</p>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{note(quote, f, isMoE(model))}</p>
      <p className="text-xs text-slate-500">
        {f.read.replace('{read}', quote.readGB.toFixed(2)).replace('{file}', quote.fileGB.toFixed(2))}
        {' '}
        {f.kv.replace('{kv}', quote.kvGB.toFixed(2))}
      </p>
      <p className="text-xs text-slate-500">
        {quote.ttftSeconds === undefined
          ? f.noPrefill
          : f.ttft.replace('{s}', quote.ttftSeconds.toFixed(2))}
      </p>
      <div className="mt-auto rounded-xl bg-black/30 border border-white/[0.06] p-4 min-h-[7.5rem] text-sm text-slate-200 leading-relaxed">
        {!quote.fits && f.wontFit.replace('{total}', quote.totalGB.toFixed(1)).replace('{cap}', cap.toFixed(1))}
        {quote.fits && !rate && <span className="text-slate-500">{headline(quote, f, isMoE(model))}</span>}
        {quote.fits && rate && waiting && <span className="text-slate-500">{f.waiting}</span>}
        {quote.fits && rate && !waiting && (shown || <span className="text-slate-600">{running ? '' : f.run}</span>)}
      </div>
    </div>
  );
}

function headline(quote: SpeedQuote, f: ReturnType<typeof useLanguage>['t']['feel'], moe: boolean): string {
  if (!quote.fits) return '';
  if (quote.source === 'measured' && quote.point) return f.tokPoint.replace('{n}', String(quote.point));
  if (quote.source === 'derived' && quote.low && quote.high) {
    return f.tokRange.replace('{low}', String(quote.low)).replace('{high}', String(quote.high));
  }
  if (quote.source === 'ceiling' && quote.point) {
    return (moe ? f.moeCeiling : f.ceilingPoint).replace('{n}', String(quote.point));
  }
  if (quote.source === 'other-card' && quote.point) {
    return f.otherCard.replace('{n}', String(quote.point)).replace('{card}', quote.referenceCard ?? 'RTX 4090');
  }
  return f.noNumber;
}

function note(quote: SpeedQuote, f: ReturnType<typeof useLanguage>['t']['feel'], moe: boolean): string {
  if (quote.source === 'measured') return f.measuredNote;
  if (quote.source === 'derived') return f.derivedNote;
  if (quote.source === 'ceiling' && quote.point) return moe ? f.moeCeiling.replace('{n}', String(quote.point)) : f.ceilingPoint.replace('{n}', String(quote.point));
  if (quote.source === 'other-card' && quote.point) {
    return f.otherCard.replace('{n}', String(quote.point)).replace('{card}', quote.referenceCard ?? 'RTX 4090');
  }
  return f.noNumber;
}

export default function SpeedFeel() {
  const { t, lang } = useLanguage();
  const f = t.feel;
  // `useSearchParams()` would ship this whole tool as its Suspense fallback in the static export;
  // the query is read after mount instead, so the page prerenders on the defaults (CLAUDE.md).
  const params = useUrlQuery();

  const defaultModel = models.find(m => m.id === DEFAULT_MODEL) ?? models[0];
  const defaultQuant = (m: QuantModel) => m.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M') ?? m.quants[0];

  const [leftId, setLeftId] = useState(DEFAULT_LEFT);
  const [rightId, setRightId] = useState(DEFAULT_RIGHT);
  const [modelId, setModelId] = useState(defaultModel.id);
  const [quantId, setQuantId] = useState(quantKey(defaultQuant(defaultModel)));
  const [ctx, setCtx] = useState<SpeedContext>(128);
  const [running, setRunning] = useState(false);

  // Apply the query once it is readable. Ids the data does not know are ignored, never kept.
  useEffect(() => {
    if (!params) return;
    const l = params.get('left');
    const r = params.get('right');
    if (l && gpuDatabase.some(g => g.id === l)) setLeftId(l);
    if (r && gpuDatabase.some(g => g.id === r)) setRightId(r);
    const m = models.find(x => x.id === params.get('model'));
    if (m) {
      setModelId(m.id);
      const q = m.quants.find(x => quantKey(x) === params.get('quant')) ?? defaultQuant(m);
      setQuantId(quantKey(q));
    }
    const c = Number(params.get('ctx'));
    if ((SPEED_CONTEXTS as readonly number[]).includes(c)) setCtx(c as SpeedContext);
  }, [params]);

  const model = models.find(m => m.id === modelId) ?? defaultModel;
  const quant = model.quants.find(q => quantKey(q) === quantId) ?? model.quants[0];
  const left = gpuDatabase.find(g => g.id === leftId) ?? gpuDatabase[0];
  const right = gpuDatabase.find(g => g.id === rightId) ?? gpuDatabase[0];

  // Keep the address bar shareable — but only after the arriving query has been read, or the
  // defaults would overwrite the link the reader came in on.
  useEffect(() => {
    if (!params) return;
    const next = new URLSearchParams({
      left: left.id,
      right: right.id,
      model: model.id,
      quant: quantKey(quant),
      ctx: String(ctx),
    }).toString();
    if (window.location.search.slice(1) === next) return;
    window.history.replaceState(null, '', `${window.location.pathname}?${next}`);
  }, [left.id, right.id, model.id, quant, ctx, params]);

  const select = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-200';
  const gpuOptions = GPU_GROUPS.map(([type, key]) => {
    const rows = rowsInGpuGroup(type);
    return rows.length === 0 ? null : (
      <optgroup key={key} label={t.calc[key]}>
        {rows.map(g => <option key={g.id} value={g.id}>{gpuDisplayName(g, lang)} ({g.vram} GB)</option>)}
      </optgroup>
    );
  });

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.left}
          <select className={select} style={{ colorScheme: 'dark' }} value={left.id} onChange={e => { setRunning(false); setLeftId(e.target.value); }}>
            {gpuOptions}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.right}
          <select className={select} style={{ colorScheme: 'dark' }} value={right.id} onChange={e => { setRunning(false); setRightId(e.target.value); }}>
            {gpuOptions}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.model}
          <select className={select} style={{ colorScheme: 'dark' }} value={model.id} onChange={e => {
            setRunning(false);
            const next = models.find(m => m.id === e.target.value)!;
            setModelId(next.id);
            const keep = next.quants.find(q => quantKey(q) === quantId);
            setQuantId(quantKey(keep ?? next.quants.find(q => q.level === 'Q4_K_M') ?? next.quants[0]));
          }}>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.quant}
          <select className={select} style={{ colorScheme: 'dark' }} value={quantKey(quant)} onChange={e => { setRunning(false); setQuantId(e.target.value); }}>
            {model.quants.map(q => <option key={quantKey(q)} value={quantKey(q)}>{q.format} {q.level}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.context}
          <select className={select} style={{ colorScheme: 'dark' }} value={ctx} onChange={e => { setRunning(false); setCtx(Number(e.target.value) as SpeedContext); }}>
            {SPEED_CONTEXTS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => setRunning(v => !v)}
        className="mb-4 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white"
      >
        {running ? f.running : f.run}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpeedPane gpu={left} model={model} quant={quant} ctx={ctx} running={running} />
        <SpeedPane gpu={right} model={model} quant={quant} ctx={ctx} running={running} />
      </div>
    </div>
  );
}
