'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { matchingCommunitySpeeds, SPEED_BOUNDS, type SpeedConfiguration } from '@/lib/data/community-speed';

const inputClass = 'mt-1 block w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-slate-200';
type Status = 'idle' | 'sending' | 'saved' | 'invalid' | 'limited' | 'unavailable';

export default function CommunitySpeedForm({ configuration, modelName, rig, requiresProcessor }: {
  configuration: SpeedConfiguration;
  modelName: string;
  rig: string;
  requiresProcessor: boolean;
}) {
  const { t } = useLanguage();
  const d = t.communitySpeed;
  const [status, setStatus] = useState<Status>('idle');
  const submitting = useRef(false);
  const rows = matchingCommunitySpeeds(configuration);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || status === 'saved') return;
    const fields = new FormData(event.currentTarget);
    submitting.current = true;
    setStatus('sending');
    try {
      const response = await fetch('/api/community-speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...configuration,
          ...Object.fromEntries(fields),
          prefill: Number(fields.get('prefill')),
          decode: Number(fields.get('decode')),
        }),
      });
      setStatus(response.status === 201 ? 'saved'
        : response.status === 400 ? 'invalid'
        : response.status === 429 ? 'limited' : 'unavailable');
    } catch {
      setStatus('unavailable');
    } finally {
      submitting.current = false;
    }
  }

  return <>
    {rows.length > 0 && <section className="glass rounded-2xl p-5 space-y-3" aria-label={d.label}>
      <h3 className="text-sm font-semibold text-cyan-300">{d.label}</h3>
      <p className="text-xs text-slate-400">{d.reviewedNote}</p>
      {rows.map(row => <article key={row.id} className="rounded-xl border border-white/10 p-3 space-y-2 text-xs">
        <p className="font-semibold text-slate-200">{row.runtime} {row.version}</p>
        {row.processor && <p className="text-slate-300">{d.processor}: {row.processor}</p>}
        <p className="text-slate-300">{t.evidence.prefill}: {row.prefill} tok/s · {t.evidence.decode}: {row.decode} tok/s</p>
        {row.url && <a className="inline-block py-2 text-cyan-300 hover:underline" href={row.url} target="_blank" rel="noopener noreferrer nofollow ugc">{d.source} ↗</a>}
      </article>)}
    </section>}
    <details className="glass rounded-2xl p-5">
      <summary className="cursor-pointer py-1 text-sm font-semibold text-slate-200">{d.title}</summary>
      <p className="mt-3 rounded-lg border border-white/10 p-3 text-xs text-slate-300">
        {modelName} · {configuration.quant} · {rig} · {d.context.replace('{n}', String(configuration.context))}
        {' · '}{d.batch.replace('{n}', String(configuration.batch))} · KV {configuration.kv}
        {configuration.vision && ` · ${d.vision}`}
      </p>
      <p className="my-3 text-xs text-slate-400">{d.instructions}</p>
      {status !== 'saved' && <form method="post" action="/api/community-speed" onSubmit={submit}>
        <fieldset disabled={status === 'sending'} className="grid gap-3 sm:grid-cols-2">
          {requiresProcessor && <label className="block text-xs text-slate-300 sm:col-span-2">{d.processor}
            <input className={inputClass} name="processor" required maxLength={80} />
          </label>}
          <label className="block text-xs text-slate-300">{d.runtime}
            <input className={inputClass} name="runtime" required maxLength={80} placeholder="llama.cpp" />
          </label>
          <label className="block text-xs text-slate-300">{d.version}
            <input className={inputClass} name="version" required maxLength={80} placeholder="b12409" />
          </label>
          <label className="block text-xs text-slate-300">{t.evidence.prefillField}
            <input className={inputClass} name="prefill" required type="number" step="any" min={SPEED_BOUNDS.min} max={SPEED_BOUNDS.prefillMax} />
          </label>
          <label className="block text-xs text-slate-300">{t.evidence.decodeField}
            <input className={inputClass} name="decode" required type="number" step="any" min={SPEED_BOUNDS.min} max={SPEED_BOUNDS.decodeMax} />
          </label>
          <label className="block text-xs text-slate-300 sm:col-span-2">{d.link}
            <input className={inputClass} name="url" type="url" maxLength={500} placeholder="https://" />
          </label>
          <label className="block text-xs text-slate-300 sm:col-span-2">{d.note}
            <textarea className={inputClass} name="note" rows={2} maxLength={1000} />
          </label>
          <label hidden aria-hidden="true">Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" className="min-h-[44px] w-fit rounded-lg border border-violet-400/30 px-4 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/10 disabled:opacity-60">
            {status === 'sending' ? d.sending : d.send}
          </button>
        </fieldset>
      </form>}
      {status === 'saved' && <p role="status" className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{d.saved}</p>}
      {(status === 'invalid' || status === 'limited' || status === 'unavailable') &&
        <p role="alert" className="mt-3 text-sm text-amber-200">{d[status]}</p>}
    </details>
  </>;
}
