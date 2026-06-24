'use client';

import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const p = t.privacy;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
        <ArrowLeft size={14} />
        {p.backHome}
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-4">
          <Lock size={12} />
          {p.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{p.title}</h1>
        <p className="text-slate-400 leading-relaxed">{p.subtitle}</p>
        <p className="text-xs text-slate-600 mt-3">{p.lastUpdated}</p>
      </div>

      <div className="space-y-8">
        {p.sections.map((section, i) => (
          <section key={i} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm text-slate-400 leading-relaxed">{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-10 text-center">
        {p.footerNote}{' '}
        <a
          href="https://github.com/sheephess9527/quantized.uk/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300"
        >
          GitHub
        </a>
        {' · '}
        <Link href="/legal/" className="text-violet-400 hover:text-violet-300">{t.legal.linkLabel}</Link>
      </p>
    </div>
  );
}