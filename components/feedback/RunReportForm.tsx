'use client';

import { Fragment, useRef, useState, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { FEEDBACK_EMAIL } from '@/lib/site';
import { speedSubmissionFromReport, speedSubmissionKey, type SpeedConfiguration } from '@/lib/data/community-speed';
import { buildRunReport, measurementFields, type RunConfiguration, type RunMeasurements } from '@/lib/utils/run-report';

const numeric = new Set(['peak', 'decodeField', 'prefillField', 'prompt', 'output', 'runs']);
const inputClass = 'mt-1 block w-full rounded-lg bg-slate-900 border border-ink/10 p-2 text-slate-200';
type ReviewStatus = 'idle' | 'sending' | 'saved' | 'invalid' | 'limited' | 'unavailable';

export default function RunReportForm({ configuration, speedConfiguration, requiresProcessor, submittedReviewKeys }: {
  configuration: RunConfiguration;
  speedConfiguration?: SpeedConfiguration;
  requiresProcessor?: boolean;
  submittedReviewKeys: Set<string>;
}) {
  const { t } = useLanguage();
  const d = t.evidence;
  const review = t.communitySpeed;
  const [report, setReport] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = Object.fromEntries(measurementFields.map(k => [k, String(data.get(k) ?? '')])) as RunMeasurements;
    if (speedConfiguration) fields.engine = [fields.engine, String(data.get('version') ?? '')].map(value => value.trim()).filter(Boolean).join(' ');
    setReport(buildRunReport(configuration, fields, String(data.get('outcome')), d, d.unknown, window.location.href));
    setCopyState('idle');
  }
  function download() {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'quantized-test-report.md'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function currentReviewKey() {
    if (!speedConfiguration || !formRef.current) return;
    return speedSubmissionKey(speedSubmissionFromReport(speedConfiguration, new FormData(formRef.current)));
  }
  async function submitForReview() {
    if (!speedConfiguration || !formRef.current || submitting.current) return;
    const payload = speedSubmissionFromReport(speedConfiguration, new FormData(formRef.current));
    const key = speedSubmissionKey(payload);
    if (!key) {
      setReviewStatus('invalid');
      return;
    }
    if (submittedReviewKeys.has(key)) {
      setReviewStatus('saved');
      return;
    }
    submitting.current = true;
    setReviewStatus('sending');
    let status: ReviewStatus;
    try {
      const response = await fetch('/api/community-speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.status === 201) submittedReviewKeys.add(key);
      status = response.status === 201 ? 'saved'
        : response.status === 400 ? 'invalid'
        : response.status === 429 ? 'limited' : 'unavailable';
    } catch {
      status = 'unavailable';
    }
    submitting.current = false;
    const currentKey = currentReviewKey();
    setReviewStatus(currentKey && submittedReviewKeys.has(currentKey) ? 'saved' : currentKey === key ? status : 'idle');
  }
  return <details className="glass rounded-2xl p-5">
    <summary className="cursor-pointer text-sm font-semibold text-slate-200 py-1">{d.formTitle}</summary>
    <p className="text-xs text-slate-400 my-3">{d.formNote}</p>
    <form ref={formRef} onSubmit={generate} onChange={() => {
      setReport('');
      setCopyState('idle');
      if (speedConfiguration && !submitting.current) {
        const key = submittedReviewKeys.size ? currentReviewKey() : undefined;
        setReviewStatus(key && submittedReviewKeys.has(key) ? 'saved' : 'idle');
      }
    }} className="space-y-3">
      <label className="block text-xs text-slate-400">{d.outcome}
        <select name="outcome" required defaultValue="" className="mt-1 block w-full rounded-lg bg-slate-900 border border-ink/10 p-2 text-slate-200">
          <option value="" disabled>{d.chooseOutcome}</option>
          <option>{d.ok}</option><option>{d.oom}</option><option>{d.failed}</option>
        </select>
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        {measurementFields.map(field => <Fragment key={field}>
          <label className={`block text-xs text-slate-400 ${field === 'notes' ? 'sm:col-span-2' : ''}`}>
            {speedConfiguration && field === 'engine' ? review.runtime : d[field]}
            {field === 'notes' ? <textarea name={field} maxLength={8000} rows={3} className={inputClass} /> : <input name={field} type={numeric.has(field) ? 'number' : 'text'} min={field === 'runs' ? 1 : 0} step={['prompt', 'output', 'runs'].includes(field) ? 1 : 'any'} maxLength={speedConfiguration && field === 'engine' ? 80 : 500} className={inputClass} />}
            {field === 'scope' && <span className="block mt-1 text-slate-500">{d.scopeHint}</span>}
            {field === 'notes' && <span className="block mt-1 text-slate-500">{d.notesHint}</span>}
          </label>
          {speedConfiguration && field === 'engine' && <label className="block text-xs text-slate-400">{review.version}
            <input name="version" maxLength={80} className={inputClass} />
          </label>}
        </Fragment>)}
        {speedConfiguration && <>
          {requiresProcessor && <label className="block text-xs text-slate-400">{review.processor}
            <input name="processor" maxLength={80} className={inputClass} />
          </label>}
          <label className="block text-xs text-slate-400">{review.link}
            <input name="url" inputMode="url" maxLength={500} className={inputClass} />
          </label>
          <label hidden aria-hidden="true">Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </>}
      </div>
      <button className="rounded-lg border border-sky-400/30 px-3 py-2 text-xs text-sky-200" type="submit">{d.generate}</button>
    </form>
    {(report || speedConfiguration) && <div className="mt-4 space-y-3">
      {report && <>
        <h4 className="text-sm text-slate-200">{d.preview}</h4>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-bg-recessed p-3 text-xs text-slate-400">{report}</pre>
      </>}
      {speedConfiguration && <p className="text-xs text-slate-400">{review.instructions}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-cyan-300">
        {report && <>
          <button type="button" className="py-2" onClick={async () => { try { await navigator.clipboard.writeText(report); setCopyState('copied'); } catch { setCopyState('failed'); } }}>{copyState === 'copied' ? d.copied : d.copy}</button>
          <button type="button" className="py-2" onClick={download}>{d.download}</button>
          <a className="py-2" href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(d.emailSubject)}&body=${encodeURIComponent(d.emailBody)}`}>{d.email}</a>
        </>}
        {speedConfiguration && <button type="button" className="min-h-[44px] rounded-lg border border-sky-400/30 px-3 py-2 text-sky-200 disabled:opacity-60"
          onClick={submitForReview} disabled={reviewStatus === 'sending' || reviewStatus === 'saved'}>
          {reviewStatus === 'sending' ? review.sending : review.send}
        </button>}
      </div>
      {copyState === 'failed' && <p role="status" className="text-xs text-amber-300">{d.copyFailed}</p>}
      {report && <p className="text-xs text-slate-500">{d.emailNote} {d.reset}</p>}
      {speedConfiguration && reviewStatus === 'saved' && <p role="status" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{review.saved}</p>}
      {speedConfiguration && (reviewStatus === 'invalid' || reviewStatus === 'limited' || reviewStatus === 'unavailable') &&
        <p role="alert" className="text-sm text-amber-200">{review[reviewStatus]}</p>}
    </div>}
  </details>;
}
