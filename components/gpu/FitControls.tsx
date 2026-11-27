'use client';

import { useLanguage } from '@/lib/i18n/context';
import { GPU_BATCH_PRESETS, GPU_CONTEXT_PRESETS } from '@/lib/utils/gpu-page';
import { contextLabel, exactLabel } from '@/lib/utils/context-label';
import { cn } from '@/lib/utils/cn';

export default function FitControls({ contextLength, batchSize, onContextChange, onBatchChange, compact = false }: {
  contextLength: number;
  batchSize: number;
  onContextChange: (value: number) => void;
  onBatchChange: (value: number) => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={cn('flex flex-wrap gap-4', compact ? 'my-0' : 'my-4')}>
      {[
        { label: t.gpuPage.contextControl, values: GPU_CONTEXT_PRESETS, value: contextLength, change: onContextChange, format: contextLabel, accessible: (value: number) => exactLabel(value, t.calc.tokens) },
        { label: t.gpuPage.batchControl, values: GPU_BATCH_PRESETS, value: batchSize, change: onBatchChange, format: String, accessible: String },
      ].map(control => (
        <fieldset key={control.label}>
          <legend className="text-xs font-medium text-slate-400 mb-1.5">{control.label}</legend>
          <div className="flex flex-wrap gap-1.5">
            {control.values.map(value => (
              <button key={value} type="button" onClick={() => control.change(value)} aria-pressed={control.value === value} aria-label={control.accessible(value)} title={control.accessible(value)}
                className={cn('min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 px-2 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                  control.value === value ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}>
                {control.format(value)}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
