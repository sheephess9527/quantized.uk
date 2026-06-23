'use client';

import { useState, useMemo } from 'react';
import { Calculator, Cpu, MemoryStick, Zap, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { quantBPW, quantGroups, calcVRAM, getVerdict } from '@/lib/utils/vram';
import { cn } from '@/lib/utils/cn';

type VerdictColor = 'green' | 'yellow' | 'red';

const verdictConfig: Record<VerdictColor, { bar: string; label: string; dot: string }> = {
  green:  { bar: 'bg-emerald-500', label: 'text-emerald-400',  dot: 'bg-emerald-400' },
  yellow: { bar: 'bg-yellow-500',  label: 'text-yellow-400',   dot: 'bg-yellow-400'  },
  red:    { bar: 'bg-red-500',     label: 'text-red-400',      dot: 'bg-red-400'      },
};

const CONTEXT_PRESETS = [512, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

export default function VRAMCalculator() {
  const { t } = useLanguage();
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedQuant, setSelectedQuant] = useState('Q4_K_M');
  const [contextLen, setContextLen] = useState(4096);
  const [batchSize, setBatchSize] = useState(1);
  const [formatGroup, setFormatGroup] = useState<keyof typeof quantGroups>('GGUF');
  const [customParams, setCustomParams] = useState('7');
  const [customLayers, setCustomLayers] = useState('32');
  const [customKvHeads, setCustomKvHeads] = useState('8');
  const [customHeadDim, setCustomHeadDim] = useState('128');

  const selectedModel = models.find(m => m.id === selectedModelId);

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

  const showResult = selectedModelId !== '' || (parseFloat(customParams) > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* — Left: Inputs — */}
      <div className="space-y-4">
        {/* Model selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.model}</label>
          <div className="relative">
            <select
              value={selectedModelId}
              onChange={e => setSelectedModelId(e.target.value)}
              className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="">{t.calc.modelPlaceholder}</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.paramLabel})
                </option>
              ))}
              <option value="custom">{t.calc.customLabel}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Custom arch fields */}
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

        {/* Quantization format */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.quant}</label>
          {/* Format group tabs */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(Object.keys(quantGroups) as Array<keyof typeof quantGroups>).map(g => (
              <button
                key={g}
                onClick={() => { setFormatGroup(g); setSelectedQuant(quantGroups[g][0]); }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150',
                  formatGroup === g
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                    : 'text-slate-500 border border-white/[0.06] hover:text-slate-300'
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
                    : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10'
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Context length */}
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
                    : 'text-slate-500 border-white/[0.06] hover:text-slate-300'
                )}
              >
                {p >= 1000 ? `${p / 1000}K` : p}
              </button>
            ))}
          </div>
        </div>

        {/* Batch size */}
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

      {/* — Right: Results — */}
      <div>
        {showResult ? (
          <div className="space-y-4">
            {/* Memory breakdown */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.calc.resultsTitle}</h3>
              <div className="space-y-3">
                {[
                  { icon: Cpu,          label: t.calc.modelWeights, value: result.modelWeightsGB, color: 'text-violet-400' },
                  { icon: MemoryStick,  label: t.calc.kvCache,      value: result.kvCacheGB,      color: 'text-cyan-400'   },
                  { icon: Zap,          label: t.calc.activations,  value: result.activationsGB,  color: 'text-orange-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={13} className={color} />
                    <span className="text-xs text-slate-400 flex-1">{label}</span>
                    <span className="font-mono text-sm text-slate-200">{value.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span></span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <Calculator size={13} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300 flex-1">{t.calc.total}</span>
                    <span className="font-mono text-base font-bold text-gradient">{result.totalGB.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span></span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3">{t.calc.overhead}</p>
            </div>

            {/* Hardware verdict */}
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
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', cfg.bar)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-600 w-12 text-right shrink-0">
                        {gpu.vram}G
                      </span>
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
        ) : (
          <div className="glass rounded-2xl p-8 flex items-center justify-center h-full min-h-48">
            <div className="text-center">
              <Calculator size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">{t.calc.pickModel}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
