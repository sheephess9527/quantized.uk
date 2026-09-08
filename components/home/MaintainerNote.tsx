'use client';

import Link from '@/components/i18n/LocalLink';
import { Mail, MessageSquareWarning } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

/** Same address as the Footer — the site's one contact point, kept in sync by hand. */
const CONTACT = 'hello@quantized.uk';

export default function MaintainerNote() {
  const { t } = useLanguage();
  const m = t.home.maintainer;

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="section-title text-lg flex items-center gap-2 mb-2">
        <MessageSquareWarning size={16} className="text-amber-400" />
        {m.title}
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">{m.body}</p>
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <a
          href={`mailto:${CONTACT}?subject=quantized.uk%20correction`}
          className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-medium text-amber-300 hover:text-amber-200"
        >
          <Mail size={12} /> {m.email}
        </a>
        <Link href="/about/" className="inline-flex items-center min-h-[44px] text-xs text-slate-400 hover:text-slate-200">
          {m.about}
        </Link>
        <Link href="/benchmarks/" className="inline-flex items-center min-h-[44px] text-xs text-slate-400 hover:text-slate-200">
          {m.bench}
        </Link>
      </div>
    </section>
  );
}
