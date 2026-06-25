'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calculator, Cpu, MemoryStick, Zap, ChevronDown, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { quantBPW, quantGroups, calcVRAM, getVerdict } from '@/lib/utils/vram';
import { getRecommendations, quantLevelKey, SortBy } from '@/lib/utils/recommend';
import { cn } from '@/lib/utils/cn';
import { useHardwareProfile } from '@/lib/hardware-profile/context';

type Mode = 'forward' | 'reverse';
type VerdictColor = 'green' | 'yellow' | 'red';

const verdictConfig: Record<VerdictColor, { bar: string; label: string; dot: string }> = {
  green:  { bar: 'bg-emerald-500', label: 'text-emerald-400',  dot: 'bg-emerald-400' },
  yellow: { bar: 'bg-yellow-500',  label: 'text-yellow-400',   dot: 'bg-yellow-400'  },
  red:    { bar: 'bg-red-500',     label: 'text-red-400',      dot: 'bg-red-400'      },
};

const CONTEXT_PRESETS = [512, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

function findFormatGroup(quant: string): keyof typeof quantGroups {
  for (const [group, levels] of Object.entries(quantGroups)) {
    if (levels.includes(quant)) return group as keyof typeof quantGroups;
  }
  return 'GGUF';
}

export default function VRAMCalculator() {
  const { t } = useLanguage();
  const { gpuId: profileGpuId } = useHardwareProfile();
  const searchParams = useSearchParams();
  const urlInitialized = useRef(false);

  const [mode, setMode] = useState<Mode>('forward');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedQuant, setSelectedQuant] = useState('Q4_K_M');
  const [contextLen, setContextLen] = useState(4096);
  const [batchSize, setBatchSize] = useState(1);
  const [formatGroup, setFormatGroup] = useState<keyof typeof quantGroups>('GGUF');
  const [customParams, setCustomParams] = useState('7');
  const [customLayers, setCustomLayers] = useState('32');
  const [customKvHeads, setCustomKvHeads] = useState('8');
  const [customHeadDim, setCustomHeadDim] = useState('128');
  const [selectedGpuId, setSelectedGpuId] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('quality');
  const [includeYellow, setIncludeYellow] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [invalidModelId, setInvalidModelId] = useState<string | null>(null);

  useEffect(() => {
    if (urlInitialized.current) return;
    const m = searchParams.get('mode') === 'reverse' ? 'reverse' : 'forward';
    setMode(m);
    const modelParam = searchParams.get('model');
    if (modelParam) {
      if (modelParam === 'custom' || models.some(md => md.id === modelParam)) {
        setSelectedModelId(modelParam);
        setInvalidModelId(null);
      } else {
        setSelectedModelId('');
        setInvalidModelId(modelParam);
      }
    }
    if (searchParams.get('quant')) {
      const q = searchParams.get('quant')!;
      setSelectedQuant(q);
      setFormatGroup(findFormatGroup(q));
    }
    if (searchParams.get('ctx')) setContextLen(Number(searchParams.get('ctx')) || 4096);
    if (searchParams.get('batch')) setBatchSize(Number(searchParams.get('batch')) || 1);
    const gpuParam = searchParams.get('gpu');
    if (gpuParam) setSelectedGpuId(gpuParam);
    else if (profileGpuId) setSelectedGpuId(profileGpuId);
    if (searchParams.get('sort') === 'speed' || searchParams.get('sort') === 'vram') {
      setSortBy(searchParams.get('sort') as SortBy);
    }
    if (searchParams.get('yellow') === '0') setIncludeYellow(false);
    urlInitialized.current = true;
  }, [searchParams, profileGpuId]);

  const syncUrl = useCallback(() => {
    if (!urlInitialized.current) return;
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('ctx', String(contextLen));
    params.set('batch', String(batchSize));
    if (mode === 'forward') {
      if (selectedModelId) params.set('model', selectedModelId);
      params.set('quant', selectedQuant);
    } else {
      if (selectedGpuId) params.set('gpu', selectedGpuId);
      params.set('sort', sortBy);
      if (!includeYellow) params.set('yellow', '0');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`);
  }, [mode, selectedModelId, selectedQuant, contextLen, batchSize, selectedGpuId, sortBy, includeYellow]);

  useEffect(() => { syncUrl(); }, [syncUrl]);

  const selectedModel = models.find(m => m.id === selectedModelId);
  const selectedGpu = gpuDatabase.find(g => g.id === selectedGpuId);

  const calcInput = useMemo(() => {
    const bpw = quantBPW[selectedQuant] ?? 4.85;
    if (selectedModel) {
      return {
        paramsB: selectedModel.params,
        layers: selectedModel.arch.layers,
        kvHeads: selectedModel.arch.kvHeads,
        headDim: selectedModel.arch.headDim,
        bpw,
        contextLength: contextLen,
        batchSize,
      };
    }
    return {
      paramsB: parseFloat(customParams) || 7,
      layers: parseInt(customLayers) || 32,
      kvHeads: parseInt(customKvHeads) || 8,
      headDim: parseInt(customHeadDim) || 128,
      bpw,
      contextLength: contextLen,
      batchSize,
    };
  }, [selectedModel, selectedQuant, contextLen, batchSize, customParams, customLayers, customKvHeads, customHeadDim]);

  const result = useMemo(() => calcVRAM(calcInput), [calcInput]);

  const recommendations = useMemo(() => {
    if (!selectedGpu) return [];
    return getRecommendations(selectedGpu.vram, contextLen, batchSize, sortBy, includeYellow);
  }, [selectedGpu, contextLen, batchSize, sortBy, includeYellow]);

  const modelLookupFailed = selectedModelId !== '' && selectedModelId !== 'custom' && !selectedModel;
  const showForwardResult = mode === 'forward' && !modelLookupFailed && !invalidModelId && (
    selectedModelId === 'custom' ||
    !!selectedModel ||
    selectedModelId === ''
  );
  const showReverseResult = mode === 'reverse' && selectedGpuId !== '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const formatColors: Record<string, string> = {
    GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle + share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['forward', 'reverse'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
                mode === m
                  ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                  : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10',
              )}
            >
              {m === 'forward' ? <Calculator size={14} /> : <ArrowRightLeft size={14} />}
              {m === 'forward' ? t.calc.modeForward : t.calc.modeReverse}
            </button>
          ))}
        </div>
        <button
          onClick={copyShareLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] hover:border-white/10 transition-colors"
        >
          {linkCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {linkCopied ? t.calc.shareCopied : t.calc.shareLink}
        </button>
      </div>

      <p className="text-sm text-slate-500 -mt-2">
        {mode === 'forward' ? t.calc.modeForwardDesc : t.calc.modeReverseDesc}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {mode === 'forward' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.model}</label>
                <div className="relative">
                  <select
                    value={selectedModelId}
                    onChange={e => { setSelectedModelId(e.target.value); setInvalidModelId(null); }}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">{t.calc.modelPlaceholder}</option>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.paramLabel})</option>
                    ))}
                    <option value="custom">{t.calc.customLabel}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {selectedModelId === 'custom' && (
                <div className="glass rounded-xl p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-400">{t.calc.customLabel}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t.calc.customParams,  value: customParams,  setter: setCustomParams },
                      { label: t.calc.customLayers,  value: customLayers,  setter: setCustomLayers },
                      { label: t.calc.customKvHeads, value: customKvHeads, setter: setCustomKvHeads },
                      { label: t.calc.customHeadDim, value: customHeadDim, setter: setCustomHeadDim },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="block text-xs text-slate-500 mb-1">{label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={e => setter(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.quant}</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(Object.keys(quantGroups) as Array<keyof typeof quantGroups>).map(g => (
                    <button
                      key={g}
                      onClick={() => { setFormatGroup(g); setSelectedQuant(quantGroups[g][0]); }}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150',
                        formatGroup === g
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                          : 'text-slate-500 border border-white/[0.06] hover:text-slate-300',
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quantGroups[formatGroup].map(q => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuant(q)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                        selectedQuant === q
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10',
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.selectGpu}</label>
                <div className="relative">
                  <select
                    value={selectedGpuId}
                    onChange={e => setSelectedGpuId(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">{t.calc.selectGpuPlaceholder}</option>
                    {gpuDatabase.map(g => (
                      <option key={g.id} value={g.id}>{g.icon} {g.name} ({g.vram} GB)</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.sortBy}</label>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { id: 'quality' as SortBy, label: t.calc.sortQuality },
                    { id: 'speed' as SortBy,   label: t.calc.sortSpeed },
                    { id: 'vram' as SortBy,    label: t.calc.sortVram },
                  ]).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        sortBy === s.id
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeYellow}
                  onChange={e => setIncludeYellow(e.target.checked)}
                  className="accent-violet-500"
                />
                <span className="text-xs text-slate-400">{t.calc.includeYellow}</span>
              </label>
            </>
          )}

          {/* Shared: context + batch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">{t.calc.context}</label>
              <span className="font-mono text-xs text-violet-300">
                {contextLen >= 1000 ? `${(contextLen / 1000).toFixed(0)}K` : contextLen}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setContextLen(p)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                    contextLen === p
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                      : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                  )}
                >
                  {p >= 1000 ? `${p / 1000}K` : p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">{t.calc.batch}</label>
              <span className="font-mono text-xs text-violet-300">{batchSize}</span>
            </div>
            <input
              type="range"
              min={1} max={16} step={1}
              value={batchSize}
              onChange={e => setBatchSize(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-slate-700 mt-1">
              <span>1</span><span>4</span><span>8</span><span>16</span>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {(invalidModelId || modelLookupFailed) && (
            <div className="glass rounded-2xl p-5 border border-amber-500/20 mb-4">
              <p className="text-sm text-amber-300">
                {t.calc.unknownModel.replace('{id}', invalidModelId ?? selectedModelId)}
              </p>
              <Link href="/quant-hub/" className="text-xs text-violet-400 hover:text-violet-300 mt-2 inline-block">
                {t.calc.browseModels}
              </Link>
            </div>
          )}
          {mode === 'forward' && showForwardResult && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.calc.resultsTitle}</h3>
                <div className="space-y-3">
                  {[
                    { icon: Cpu,         label: t.calc.modelWeights, value: result.modelWeightsGB, color: 'text-violet-400' },
                    { icon: MemoryStick, label: t.calc.kvCache,      value: result.kvCacheGB,      color: 'text-cyan-400'   },
                    { icon: Zap,         label: t.calc.activations,  value: result.activationsGB,  color: 'text-orange-400' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={13} className={color} />
                      <span className="text-xs text-slate-400 flex-1">{label}</span>
                      <span className="font-mono text-sm text-slate-200">
                        {value.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span>
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Calculator size={13} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300 flex-1">{t.calc.total}</span>
                      <span className="font-mono text-base font-bold text-gradient">
                        {result.totalGB.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3">{t.calc.overhead}</p>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">{t.calc.hwTitle}</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {gpuDatabase.map(gpu => {
                    const v = getVerdict(result.totalGB, gpu.vram);
                    const cfg = verdictConfig[v];
                    const pct = Math.min(100, (result.totalGB / gpu.vram) * 100);
                    return (
                      <div key={gpu.id} className="flex items-center gap-2 group">
                        <span className="text-sm w-4 shrink-0">{gpu.icon}</span>
                        <span className="text-xs text-slate-400 truncate w-36 shrink-0 group-hover:text-slate-200 transition-colors">
                          {gpu.name}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-500', cfg.bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-slate-600 w-12 text-right shrink-0">{gpu.vram}G</span>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{t.calc.green}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{t.calc.yellow}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{t.calc.red}</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'reverse' && showReverseResult && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">{t.calc.reverseTitle}</h3>
                <span className="text-xs text-slate-500">
                  {t.calc.reverseResults.replace('{count}', String(recommendations.length))}
                </span>
              </div>

              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-8">{t.calc.reverseEmpty}</p>
              ) : (
                <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
                  {recommendations.map(({ model, quant, totalGB, verdict }) => {
                    const level = quantLevelKey(quant);
                    const cfg = verdictConfig[verdict];
                    return (
                      <div
                        key={`${model.id}-${quant.format}-${quant.level}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-200 truncate">{model.name}</span>
                            <span className={cn('badge text-xs font-mono', formatColors[quant.format])}>
                              {quant.format} {quant.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            <span className="font-mono">{totalGB.toFixed(1)} GB</span>
                            <span>PPL −{quant.pplLossPercent.toFixed(1)}%</span>
                            {quant.speedRTX4090 && <span>{quant.speedRTX4090} tok/s</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/quant-hub/${model.id}/`}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {t.calc.viewModel}
                          </Link>
                          <Link
                            href={`/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(level)}&ctx=${contextLen}&batch=${batchSize}`}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            {t.hub.detail.calc}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {((mode === 'forward' && !showForwardResult) || (mode === 'reverse' && !showReverseResult)) && (
            <div className="glass rounded-2xl p-8 flex items-center justify-center h-full min-h-48">
              <div className="text-center">
                <Calculator size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600">
                  {mode === 'forward' ? t.calc.pickModel : t.calc.selectGpuPlaceholder}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}