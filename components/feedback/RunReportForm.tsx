'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { FEEDBACK_EMAIL } from '@/lib/site';
import { buildRunReport, measurementFields, type RunConfiguration, type RunMeasurements } from '@/lib/utils/run-report';

const numeric = new Set(['peak', 'decodeField', 'prefillField', 'prompt', 'output', 'runs']);

export default function RunReportForm({ configuration }: { configuration: RunConfiguration }) {
  const { t } = useLanguage();
  const d = t.evidence;
  const [report, setReport] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = Object.fromEntries(measurementFields.map(k => [k, String(data.get(k) ?? '')])) as RunMeasurements;
    setReport(buildRunReport(configuration, fields, String(data.get('outcome')), d, d.unknown, window.location.href));
    setCopyState('idle');
  }
  function download() {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'quantized-test-report.md'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <details className="glass rounded-2xl p-5">
    <summary className="cursor-pointer text-sm font-semibold text-slate-200 py-1">{d.formTitle}</summary>
    <p className="text-xs text-slate-400 my-3">{d.formNote}</p>
    <form onSubmit={generate} onChange={() => { setReport(''); setCopyState('idle'); }} className="space-y-3">
      <label className="block text-xs text-slate-400">{d.outcome}
        <select name="outcome" required defaultValue="" className="mt-1 block w-full rounded-lg bg-slate-900 border border-white/10 p-2 text-slate-200">
          <option value="" disabled>{d.chooseOutcome}</option>
          <option>{d.ok}</option><option>{d.oom}</option><option>{d.failed}</option>
        </select>
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        {measurementFields.map(field => <label key={field} className={`block text-xs text-slate-400 ${field === 'notes' ? 'sm:col-span-2' : ''}`}>
          {d[field]}
          {field === 'notes' ? <textarea name={field} maxLength={8000} rows={3} className="mt-1 block w-full rounded-lg bg-slate-900 border border-white/10 p-2 text-slate-200" /> : <input name={field} type={numeric.has(field) ? 'number' : 'text'} min={field === 'runs' ? 1 : 0} step={['prompt', 'output', 'runs'].includes(field) ? 1 : 'any'} maxLength={500} className="mt-1 block w-full rounded-lg bg-slate-900 border border-white/10 p-2 text-slate-200" />}
          {field === 'scope' && <span className="block mt-1 text-slate-500">{d.scopeHint}</span>}
          {field === 'notes' && <span className="block mt-1 text-slate-500">{d.notesHint}</span>}
        </label>)}
      </div>
      <button className="rounded-lg border border-violet-400/30 px-3 py-2 text-xs text-violet-200" type="submit">{d.generate}</button>
    </form>
    {report && <div className="mt-4 space-y-3">
      <h4 className="text-sm text-slate-200">{d.preview}</h4>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/20 p-3 text-xs text-slate-400">{report}</pre>
      <div className="flex flex-wrap gap-3 text-xs text-cyan-300">
        <button type="button" className="py-2" onClick={async () => { try { await navigator.clipboard.writeText(report); setCopyState('copied'); } catch { setCopyState('failed'); } }}>{copyState === 'copied' ? d.copied : d.copy}</button>
        <button type="button" className="py-2" onClick={download}>{d.download}</button>
        <a className="py-2" href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(d.emailSubject)}&body=${encodeURIComponent(d.emailBody)}`}>{d.email}</a>
      </div>
      {copyState === 'failed' && <p role="status" className="text-xs text-amber-300">{d.copyFailed}</p>}
      <p className="text-xs text-slate-500">{d.emailNote} {d.reset}</p>
    </div>}
  </details>;
}
