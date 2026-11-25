'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { pathForLang } from '@/lib/i18n/routing';
import { canonical, SITE_URL } from '@/lib/site';

const badgePath = '/model-card-badge.svg';
const badgeQuery = 'utm_source=huggingface&utm_medium=referral&utm_campaign=hf_model_card_badge';

export default function ModelCardBadge({ modelId }: { modelId: string }) {
  const { lang, t } = useLanguage();
  const d = t.hub.detail.modelCardBadge;
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const url = canonical(pathForLang(`/quant-hub/${modelId}/`, lang));
  const markdown = `[![${d.alt}](${SITE_URL}${badgePath})](${url}?${badgeQuery})`;

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('copied');
    } catch {
      setStatus('manual');
    }
  }

  return (
    <section aria-labelledby="model-card-badge-title" className="glass rounded-2xl p-4 sm:px-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <h2 id="model-card-badge-title" className="text-sm font-semibold text-slate-200">{d.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{d.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Image src={badgePath} alt={d.alt} width={130} height={26} />
          <button
            type="button"
            onClick={copyMarkdown}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 glass glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            {status === 'copied' ? <Check size={16} className="text-emerald-400" aria-hidden /> : <Copy size={16} aria-hidden />}
            {status === 'copied' ? d.copied : d.copy}
          </button>
        </div>
      </div>
      <p role="status" className={status === 'manual' ? 'mt-3 text-sm text-slate-300' : 'sr-only'}>
        {status === 'copied' ? d.copied : status === 'manual' ? d.manual : ''}
      </p>
      {status === 'manual' && (
        <textarea
          aria-label={d.markdown}
          className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-2 font-mono text-base text-slate-200"
          dir="ltr"
          rows={3}
          readOnly
          value={markdown}
          onFocus={event => event.currentTarget.select()}
        />
      )}
    </section>
  );
}
