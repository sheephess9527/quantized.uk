'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { parseEmbedFit, buildEmbedSnippets } from '@/lib/utils/embed-fit';

export default function EmbedSnippets({ query }: { query: string }) {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState('');
  const fit = parseEmbedFit(new URLSearchParams(query));
  const snippets = fit ? buildEmbedSnippets(fit, lang) : null;
  return <details className="mt-3 rounded-lg border border-ink/10 p-3 text-xs">
    <summary className="cursor-pointer font-medium text-slate-200">{t.embed.disclosure}</summary>
    {snippets ? <div className="mt-3 space-y-3">{(['html', 'markdown'] as const).map(key => <div key={key}>
      <div className="mb-1 flex items-center justify-between"><label htmlFor={`embed-${key}`}>{key === 'html' ? 'HTML' : 'Markdown'}</label>
        <button type="button" className="rounded border border-ink/20 px-3 py-2" onClick={async () => {
          try { await navigator.clipboard.writeText(snippets[key]); setStatus(t.embed.copied); }
          catch { setStatus(t.embed.failed); }
        }}>{t.embed.copy}</button></div>
      <textarea id={`embed-${key}`} readOnly value={snippets[key]} rows={3} className="w-full rounded bg-slate-950 p-2 font-mono text-slate-300" onFocus={e => e.target.select()} />
    </div>)}<p role="status">{status}</p></div> : <p className="mt-2 text-slate-400">{t.embed.unavailable}</p>}
  </details>;
}
