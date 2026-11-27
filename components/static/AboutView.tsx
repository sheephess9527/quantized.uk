import Link from '@/components/i18n/LocalLink';
import { Heart } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';
import { staticPages } from '@/lib/i18n/static-pages';
import { dataLastUpdated } from '@/lib/data/meta';
import { MODEL_COUNT, FEEDBACK_EMAIL } from '@/lib/seo';
import EmailOffGuard from '@/components/ui/EmailOffGuard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function AboutView({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const a = staticPages[lang].about;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: a.title },
        ]}
      />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium mb-4">
          <Heart size={12} />
          {a.badge}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{a.title}</h1>
        <p className="text-slate-400 leading-relaxed">{a.subtitle}</p>
        <p className="text-xs text-slate-600 mt-3">
          {a.dataRefresh.replace('{date}', dataLastUpdated)}
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-8 border border-sky-500/10">
        <p className="text-sm font-medium text-slate-200 mb-2">{a.maintainerTitle}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{a.maintainerBody}</p>
        <p className="text-sm text-slate-400 leading-relaxed mt-3">
          {a.maintainerContact}{' '}
          <EmailOffGuard>
            <a
              href={`mailto:${FEEDBACK_EMAIL}?subject=quantized.uk`}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              {FEEDBACK_EMAIL}
            </a>
          </EmailOffGuard>
        </p>
      </div>

      <div className="space-y-8">
        {a.sections.map((section, i) => (
          <section key={i} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-sm text-slate-400 leading-relaxed">
                  {para.replace('{n}', String(MODEL_COUNT))}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 glass rounded-xl px-4 py-4 text-center">
        <p className="text-sm text-slate-400 mb-3">{a.cta}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="/" className="text-sky-400 hover:text-sky-300 transition-colors">
            {a.ctaChangelog}
          </Link>
          <Link href="/quant-hub/" className="text-sky-400 hover:text-sky-300 transition-colors">
            {a.ctaHub}
          </Link>
          <Link href="/legal/" className="text-slate-500 hover:text-slate-400 transition-colors">
            {t.legal.linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
