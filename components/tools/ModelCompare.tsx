'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GitCompare, Copy, Check, Trophy } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { models } from '@/lib/data/models';
import { compareModels } from '@/lib/utils/compare';
import { cn } from '@/lib/utils/cn';

export default function ModelCompare() {
  const { t, lang } = useLanguage();
  const { gpu } = useHardwareProfile();
  const searchParams = useSearchParams();
  const c = t.compare;

  const [modelAId, setModelAId] = useState('');
  const [modelBId, setModelBId] = useState('');
  const [contextLen, setContextLen] = useState(4096);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get('a')) setModelAId(searchParams.get('a')!);
    if (searchParams.get('b')) setModelBId(searchParams.get('b')!);
    if (searchParams.get('ctx')) setContextLen(Number(searchParams.get('ctx')) || 4096);
  }, [searchParams]);

  const syncUrl = useCallback(() => {
    if (!modelAId && !modelBId) return;
    const params = new URLSearchParams();
    if (modelAId) params.set('a', modelAId);
    if (modelBId) params.set('b', modelBId);
    params.set('ctx', String(contextLen));
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [modelAId, modelBId, contextLen]);

  useEffect(() => { syncUrl(); }, [syncUrl]);

  const modelA = models.find(m => m.id === modelAId);
  const modelB = models.find(m => m.id === modelBId);

  const result = useMemo(() => {
    if (!modelA || !modelB || modelAId === modelBId) return null;
    return compareModels(modelA, modelB, gpu?.vram, contextLen);
  }, [modelA, modelB, modelAId, modelBId, gpu, contextLen]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const selectCls = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50';

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] transition-colors">
          {linkCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {linkCopied ? c.shareCopied : c.shareLink}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['a', 'b'] as const).map(side => (
          <div key={side} className="glass rounded-xl p-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              {side === 'a' ? c.modelA : c.modelB}
            </label>
            <select
              value={side === 'a' ? modelAId : modelBId}
              onChange={e => side === 'a' ? setModelAId(e.target.value) : setModelBId(e.target.value)}
              className={selectCls}
            >
              <option value="">{c.selectModel}</option>
              {models.map(m => (
                <option key={m.id} value={m.id} disabled={side === 'a' ? m.id === modelBId : m.id === modelAId}>
                  {m.name} ({m.paramLabel})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <label className="text-xs text-slate-500">{c.context}</label>
        <div className="flex gap-1.5">
          {[2048, 4096, 8192, 16384].map(p => (
            <button key={p} onClick={() => setContextLen(p)}
              className={cn('px-2 py-1 rounded-lg text-xs font-mono border transition-all',
                contextLen === p ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' : 'text-slate-500 border-white/[0.06]')}>
              {p >= 1000 ? `${p / 1000}K` : p}
            </button>
          ))}
        </div>
        {gpu && <span className="text-xs text-slate-600 ml-auto">{c.usingGpu.replace('{gpu}', gpu.name)}</span>}
      </div>

      {modelAId === modelBId && modelAId && (
        <p className="text-sm text-red-400 text-center">{c.sameModel}</p>
      )}

      {result ? (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 flex items-center justify-center gap-6">
            <div className={cn('text-center', result.overallWinner === 'a' && 'text-violet-300')}>
              <p className="text-sm font-semibold">{modelA!.name}</p>
              <p className="text-2xl font-bold mt-1">{result.scoreA}</p>
            </div>
            <div className="text-slate-600 text-sm font-medium">vs</div>
            <div className={cn('text-center', result.overallWinner === 'b' && 'text-violet-300')}>
              <p className="text-sm font-semibold">{modelB!.name}</p>
              <p className="text-2xl font-bold mt-1">{result.scoreB}</p>
            </div>
            {result.overallWinner !== 'tie' && (
              <div className="flex items-center gap-1.5 text-sm text-yellow-400 ml-4">
                <Trophy size={14} />
                {result.overallWinner === 'a' ? modelA!.paramLabel : modelB!.paramLabel} {c.wins}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="text-left px-5 py-3">{c.metric}</th>
                  <th className="text-right px-3 py-3">{modelA!.paramLabel}</th>
                  <th className="text-right px-5 py-3">{modelB!.paramLabel}</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map(row => {
                  const label = lang === 'zh' ? row.labelZh : row.labelEn;
                  return (
                    <tr key={row.key} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-slate-400 text-xs">{label}</td>
                      <td className={cn('px-3 py-3 text-right font-mono text-xs', row.winner === 'a' && 'text-emerald-400 font-semibold')}>
                        {row.valueA}
                      </td>
                      <td className={cn('px-5 py-3 text-right font-mono text-xs', row.winner === 'b' && 'text-emerald-400 font-semibold')}>
                        {row.valueB}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/quant-hub/${modelA!.id}/`} className="text-xs text-violet-400 hover:text-violet-300">{modelA!.name} →</Link>
            <Link href={`/quant-hub/${modelB!.id}/`} className="text-xs text-violet-400 hover:text-violet-300">{modelB!.name} →</Link>
            <Link href={`/tools/vram-calc/?mode=forward&model=${modelA!.id}&quant=Q4_K_M&ctx=${contextLen}`} className="text-xs text-slate-500 hover:text-slate-300">{c.calcA}</Link>
            <Link href={`/tools/vram-calc/?mode=forward&model=${modelB!.id}&quant=Q4_K_M&ctx=${contextLen}`} className="text-xs text-slate-500 hover:text-slate-300">{c.calcB}</Link>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 flex items-center justify-center">
          <div className="text-center">
            <GitCompare size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">{c.pickTwo}</p>
          </div>
        </div>
      )}
    </div>
  );
}