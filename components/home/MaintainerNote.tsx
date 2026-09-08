'use client';

import { useState } from 'react';
import Link from '@/components/i18n/LocalLink';
import { Mail, MessageSquareWarning } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

/** Same address as the Footer — the site's one contact point, kept in sync by hand. */
const CONTACT = 'hello@quantized.uk';

export default function MaintainerNote() {
  const { t } = useLanguage();
  const m = t.home.maintainer;
  const f = t.feedback;
  const [showDraft, setShowDraft] = useState(false);

  /**
   * The draft is shown before it is sent, not after the mail client opens it.
   * A prefilled `mailto:` is convenient and also invisible — the reader finds
   * out what it says once it is already in their compose window. This one
   * carries only the page it was opened from, and says so.
   */
  const body = `${f.bodyPage}: ${typeof window === 'undefined' ? '' : window.location.href}\n\n${f.bodyPrompt}\n`;
  const href = `mailto:${CONTACT}?subject=${encodeURIComponent('quantized.uk correction')}&body=${encodeURIComponent(body)}`;

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="section-title text-lg flex items-center gap-2 mb-2">
        <MessageSquareWarning size={16} className="text-amber-400" />
        {m.title}
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">{m.body}</p>
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <button
          type="button"
          onClick={() => setShowDraft(v => !v)}
          aria-expanded={showDraft}
          className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-medium text-amber-300 hover:text-amber-200"
        >
          <Mail size={12} /> {m.email}
        </button>
        <Link href="/about/" className="inline-flex items-center min-h-[44px] text-xs text-slate-400 hover:text-slate-200">
          {m.about}
        </Link>
        <Link href="/benchmarks/" className="inline-flex items-center min-h-[44px] text-xs text-slate-400 hover:text-slate-200">
          {m.bench}
        </Link>
      </div>

      {showDraft && (
        <div className="mt-4 max-w-2xl">
          <p className="text-xs text-slate-400 leading-relaxed">{f.willSend}</p>
          <pre className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[11px] font-mono text-slate-400 whitespace-pre-wrap break-words">
{body.trim()}
          </pre>
          <a
            href={href}
            className="inline-flex items-center gap-1.5 min-h-[44px] mt-2 text-xs font-medium text-amber-300 hover:text-amber-200"
          >
            <Mail size={12} /> {f.openMail}
          </a>
          <p className="text-xs text-slate-500 mt-1">{f.mailNote}</p>
        </div>
      )}
    </section>
  );
}
