'use client';

import { useLanguage } from '@/lib/i18n/context';
import type { QuantVariant } from '@/lib/data/types';
import { quantFileUrl, type HubQuantFile } from '@/lib/utils/hf-quant-file';
import QuantFileLine from '@/components/hub/QuantFileLine';

export default function CalculatorEvidence({ quant, file, context, batch, kv, encoder, calibrated }: {
  quant?: QuantVariant; file?: HubQuantFile; context: number; batch: number; kv: string; encoder: number; calibrated: boolean;
}) {
  const { t } = useLanguage();
  const d = t.evidence;
  return <section className="glass rounded-2xl p-5 space-y-3" aria-label={d.title}>
    <h3 className="text-sm font-semibold text-slate-200">{d.title}</h3>
    <p className="text-xs text-slate-400"><strong className="text-violet-300">{d.memory}</strong> · {file ? d.fileMemoryNote : d.memoryNote}</p>
    <div className="text-xs break-words">{file
      ? <a href={quantFileUrl(file)} target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:underline">
          {file.repo} / {file.path} · {t.calc.hfFileSize.replace('{gb}', (file.bytes / 1024 ** 3).toFixed(2))}
        </a>
      : quant ? <QuantFileLine quant={quant} /> : <span className="text-slate-400">{d.custom}</span>}</div>
    <p className="text-xs text-slate-400">{d.settings}: {context.toLocaleString('en-US')} · KV {kv} · {d.sequences} {batch} · mmproj {encoder.toFixed(2)} GiB</p>
    <p className="text-xs text-slate-400"><strong className="text-cyan-300">{d.speed}</strong> · {calibrated ? d.calibrated : d.ceiling}</p>
    <p className="text-xs text-amber-200/80">{d.noExact}</p>
  </section>;
}
