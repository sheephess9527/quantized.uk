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
import CopyButton from '@/components/ui/CopyButton';

const DEFAULT_LEFT = 'rtx4060ti16';
const DEFAULT_RIGHT = 'rtx4090';
const DEFAULT_MODEL = 'llama-3.1-8b';

const THINKING_BUDGETS = [0, 1024, 4096, 8192, 16384] as const;
type ThinkingBudget = (typeof THINKING_BUDGETS)[number];

interface DraftPreset {
  id: string;
  labelEn: string;
  labelZh: string;
  vramGB: number;
  speedup: number;
  flag: string;
}

const DRAFT_PRESETS: readonly DraftPreset[] = [
  { id: 'none', labelEn: 'Off (Standard decoding)', labelZh: '关闭（常规自回归解码）', vramGB: 0, speedup: 1.0, flag: '' },
  { id: 'mtp', labelEn: 'Built-in MTP / NextN head (~1.35×)', labelZh: '内置 MTP / NextN 草稿头 (~1.35×)', vramGB: 0.35, speedup: 1.35, flag: '--spec-type mtp --draft-max 4' },
  { id: 'dflash', labelEn: '0.6B–0.8B Q8_0 Draft / DFlash2 (~1.6×, +0.75 GB)', labelZh: '0.6B–0.8B Q8_0 独立草稿 / DFlash2 (~1.6×, +0.75 GB)', vramGB: 0.75, speedup: 1.6, flag: '-md ./draft-0.6b-Q8_0.gguf --draft-max 12' },
  { id: 'draft1b', labelEn: '1.5B–1.7B Q4_K_M Draft (~1.8×, +1.20 GB)', labelZh: '1.5B–1.7B Q4_K_M 独立草稿 (~1.8×, +1.20 GB)', vramGB: 1.2, speedup: 1.8, flag: '-md ./draft-1.5b-Q4_K_M.gguf --draft-max 16' },
];

function quantKey(q: QuantVariant) {
  return `${q.format}:${q.level}`;
}

function unitsOf(text: string): string[] {
  if (/[\u4e00-\u9fff]/.test(text)) return Array.from(text);
  return text.split(' ');
}

function formatWaitSeconds(sec: number, zh: boolean): string {
  if (sec < 60) return zh ? `${sec.toFixed(1)} 秒` : `${sec.toFixed(1)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return zh ? `${m} 分 ${s} 秒` : `${m}m ${s}s`;
}

function SpeedPane({
  gpu,
  model,
  quant,
  ctx,
  running,
  thinkTokens,
  draft,
}: {
  gpu: GPU;
  model: QuantModel;
  quant: QuantVariant;
  ctx: SpeedContext;
  running: boolean;
  thinkTokens: ThinkingBudget;
  draft: DraftPreset;
}) {
  const { t, lang } = useLanguage();
  const zh = lang === 'zh';
  const f = t.feel;
  const quote = useMemo(() => speedQuote(gpu, model, quant, ctx), [gpu, model, quant, ctx]);
  const baseRate = streamTokS(quote);
  const effectiveRate = baseRate ? Number((baseRate * draft.speedup).toFixed(1)) : undefined;
  const combinedTotalGB = quote.totalGB + draft.vramGB;
  const cap = usableCapacityGB(gpu);
  const fitsWithDraft = quote.fits && combinedTotalGB <= cap * 1.05;

  const thinkWaitSec = effectiveRate && thinkTokens > 0 ? thinkTokens / effectiveRate : 0;
  const totalTimeToAnswerSec = (quote.ttftSeconds ?? 0) + thinkWaitSec;

  const sample = f.sample;
  const units = useMemo(() => unitsOf(sample), [sample]);
  const [count, setCount] = useState(0);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setCount(0);
    setWaiting(false);
    if (!running || !effectiveRate) return;
    const start = performance.now();
    // Cap visual prefill wait animation at 4s so the reader doesn't stare at an inert box for 3 minutes,
    // while displaying the true calculated Time-to-Final-Answer prominently in the telemetry bar.
    const waitMs = Math.min(4000, totalTimeToAnswerSec * 1000);
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < waitMs) {
        setWaiting(true);
        setCount(0);
      } else {
        setWaiting(false);
        const n = Math.min(units.length, Math.floor(((elapsed - waitMs) / 1000) * effectiveRate));
        setCount(n);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, effectiveRate, totalTimeToAnswerSec, units]);

  const shown = /[\u4e00-\u9fff]/.test(sample) ? units.slice(0, count).join('') : units.slice(0, count).join(' ');

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3 min-h-[300px]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">{gpuDisplayName(gpu, lang)}</h2>
          <p className="text-xs text-slate-500 mt-1">{headline(quote, f, isMoE(model))}</p>
        </div>
        {draft.id !== 'none' && effectiveRate && fitsWithDraft && (
          <span className="rounded-lg bg-emerald-500/12 border border-emerald-500/25 px-2.5 py-1 text-xs font-mono text-emerald-300">
            ⚡ ~{effectiveRate} tok/s ({draft.speedup}×)
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{note(quote, f, isMoE(model))}</p>
      <p className="text-xs text-slate-500">
        {f.read.replace('{read}', quote.readGB.toFixed(2)).replace('{file}', quote.fileGB.toFixed(2))}
        {' '}
        {f.kv.replace('{kv}', quote.kvGB.toFixed(2))}
        {draft.vramGB > 0 && (
          <span className="text-sky-300">
            {' · '}
            {zh ? `+草稿 ${draft.vramGB.toFixed(2)} GB (总计 ${combinedTotalGB.toFixed(1)}/${cap.toFixed(0)} GB)` : `+Draft ${draft.vramGB.toFixed(2)} GB (Total ${combinedTotalGB.toFixed(1)}/${cap.toFixed(0)} GB)`}
          </span>
        )}
      </p>
      <div className="rounded-xl bg-ink/[0.03] border border-ink/[0.06] px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-400">
          {quote.ttftSeconds === undefined
            ? f.noPrefill
            : f.ttft.replace('{s}', quote.ttftSeconds.toFixed(2))}
        </span>
        {thinkTokens > 0 && effectiveRate && fitsWithDraft && (
          <span className="font-mono text-amber-300">
            {zh
              ? `思考 ${Math.round(thinkTokens / 1024)}K 耗时：${formatWaitSeconds(totalTimeToAnswerSec, true)}出结论`
              : `${Math.round(thinkTokens / 1024)}K thinking wait: ${formatWaitSeconds(totalTimeToAnswerSec, false)} to answer`}
          </span>
        )}
      </div>
      <div className="mt-auto rounded-xl bg-bg-recessed border border-ink/[0.06] p-4 min-h-[7.5rem] text-sm text-slate-200 leading-relaxed">
        {!fitsWithDraft && f.wontFit.replace('{total}', combinedTotalGB.toFixed(1)).replace('{cap}', cap.toFixed(1))}
        {fitsWithDraft && !effectiveRate && <span className="text-slate-500">{headline(quote, f, isMoE(model))}</span>}
        {fitsWithDraft && effectiveRate && waiting && (
          <span className="text-amber-300/90 font-mono text-xs">
            {thinkTokens > 0
              ? (zh ? `[正在隐式思考 ${thinkTokens} tokens… 预计需等待 ${formatWaitSeconds(totalTimeToAnswerSec, true)}]` : `[Thinking ${thinkTokens} tokens… estimated wait ${formatWaitSeconds(totalTimeToAnswerSec, false)}]`)
              : f.waiting}
          </span>
        )}
        {fitsWithDraft && effectiveRate && !waiting && (shown || <span className="text-slate-600">{running ? '' : f.run}</span>)}
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
  const zh = lang === 'zh';
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
  const [thinkTokens, setThinkTokens] = useState<ThinkingBudget>(0);
  const [draftId, setDraftId] = useState<string>('none');
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
  const draft = DRAFT_PRESETS.find(d => d.id === draftId) ?? DRAFT_PRESETS[0];

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

  const select = 'w-full bg-ink/[0.04] border border-ink/[0.08] rounded-lg px-3 py-2 text-sm text-slate-200';
  const gpuOptions = GPU_GROUPS.map(([type, key]) => {
    const rows = rowsInGpuGroup(type);
    return rows.length === 0 ? null : (
      <optgroup key={key} label={t.calc[key]}>
        {rows.map(g => <option key={g.id} value={g.id}>{gpuDisplayName(g, lang)} ({g.vram} GB)</option>)}
      </optgroup>
    );
  });

  const mainFile = quant.source?.file ?? `${model.id}-${quant.level}.gguf`;
  const specCmd = draft.id !== 'none'
    ? `llama-server -m ./${mainFile} ${draft.flag} -c ${Math.max(4096, ctx + thinkTokens)} -ngl 99`
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.left}
          <select className={select} value={left.id} onChange={e => { setRunning(false); setLeftId(e.target.value); }}>
            {gpuOptions}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.right}
          <select className={select} value={right.id} onChange={e => { setRunning(false); setRightId(e.target.value); }}>
            {gpuOptions}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.model}
          <select className={select} value={model.id} onChange={e => {
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
          <select className={select} value={quantKey(quant)} onChange={e => { setRunning(false); setQuantId(e.target.value); }}>
            {model.quants.map(q => <option key={quantKey(q)} value={quantKey(q)}>{q.format} {q.level}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500 flex flex-col gap-1">
          {f.context}
          <select className={select} value={ctx} onChange={e => { setRunning(false); setCtx(Number(e.target.value) as SpeedContext); }}>
            {SPEED_CONTEXTS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* 2026 Reasoning & Speculative Decoding Bar */}
      <div className="glass rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="block text-xs font-medium text-slate-300 mb-1.5">
            {zh ? '🧠 思考链 Token 预算（Time-to-Final-Answer 推演）' : '🧠 Reasoning / Thinking Token Budget (Time-to-Final-Answer)'}
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={zh ? '思考链 Token 预算' : 'Thinking token budget'}>
            {THINKING_BUDGETS.map(b => (
              <button
                key={b}
                type="button"
                aria-pressed={thinkTokens === b}
                onClick={() => { setRunning(false); setThinkTokens(b); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  thinkTokens === b
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                    : 'bg-ink/[0.03] text-slate-400 border-ink/[0.08] hover:text-slate-200'
                }`}
              >
                {b === 0 ? (zh ? '0（直出回答）' : '0 (Direct)') : `${Math.round(b / 1024)}K think`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="spec-decode-select" className="block text-xs font-medium text-slate-300 mb-1.5">
            {zh ? '⚡ 投机采样加速（Speculative Decoding / MTP 草稿模型）' : '⚡ Speculative Decoding (Draft Model / MTP Acceleration)'}
          </label>
          <select
            id="spec-decode-select"
            className={select}
            value={draft.id}
            onChange={e => { setRunning(false); setDraftId(e.target.value); }}
          >
            {DRAFT_PRESETS.map(d => (
              <option key={d.id} value={d.id}>
                {zh ? d.labelZh : d.labelEn}
              </option>
            ))}
          </select>
        </div>

        {specCmd && (
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg-recessed border border-ink/[0.08] px-3 py-2">
            <code className="text-xs font-mono text-sky-300 break-all">{specCmd}</code>
            <CopyButton
              text={specCmd}
              label={zh ? '复制投机采样命令' : 'Copy speculative CLI'}
              copiedLabel={zh ? '已复制' : 'Copied'}
              className="min-h-9 text-xs shrink-0"
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setRunning(v => !v)}
        className="mb-4 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
      >
        {running ? f.running : f.run}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpeedPane gpu={left} model={model} quant={quant} ctx={ctx} running={running} thinkTokens={thinkTokens} draft={draft} />
        <SpeedPane gpu={right} model={model} quant={quant} ctx={ctx} running={running} thinkTokens={thinkTokens} draft={draft} />
      </div>
    </div>
  );
}

