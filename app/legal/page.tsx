'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function LegalPage() {
  const { t } = useLanguage();
  const l = t.legal;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        {l.backHome}
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-medium mb-4">
          <Shield size={12} />
          {l.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{l.title}</h1>
        <p className="text-slate-400 leading-relaxed">{l.subtitle}</p>
        <p className="text-xs text-slate-600 mt-3">{l.lastUpdated}</p>
      </div>

      <div className="space-y-8">
        {l.sections.map((section, i) => (
          <section key={i} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm text-slate-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-10 text-center leading-relaxed">
        {l.footerNote}
      </p>
    </div>
  );
}