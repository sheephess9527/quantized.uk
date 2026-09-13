'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/i18n/LocalLink';
import { Home, Search, BookOpen, Cpu, Wrench, HelpCircle, Sliders, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/routing';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { notFoundSuggestions } from '@/lib/utils/not-found';
import { FEEDBACK_EMAIL } from '@/lib/seo';
import { trackEvent } from '@/lib/analytics';

/**
 * QTZ-030: the old page was ~20 words and four static links. With 393 pages
 * whose URLs follow a guessable pattern (`/quant-hub/{model}/`, `/gpu/{card}/`),
 * a reader or an AI engine landing here typically had a *specific* page in
 * mind, not a request to start over — so this shows the path that misfired,
 * a fuzzy match against every real slug, a real search, and the six section
 * entry points with live counts.
 */
export default function NotFoundContent() {
  const { t, lang } = useLanguage();
  const n = t.notFound;

  // Static export means there is no server-side request context for a 404 —
  // `window.location.pathname` is the only source of the path that actually
  // 404'd. Starts empty so the pre-hydration HTML matches on both renders;
  // the path (and anything derived from it) fills in a moment after mount.
  const [requestedPath, setRequestedPath] = useState('');
  useEffect(() => {
    setRequestedPath(window.location.pathname);
  }, []);

  const suggestions = requestedPath ? notFoundSuggestions(requestedPath, lang) : [];

  const sections = [
    { href: '/quant-hub/', icon: Search, label: n.models.replace('{n}', String(models.length)) },
    { href: '/gpu/', icon: Cpu, label: n.gpus.replace('{n}', String(gpuDatabase.length)) },
    { href: '/best/', icon: Sliders, label: n.bestByVram },
    { href: '/tools/', icon: Wrench, label: n.tools },
    { href: '/cookbook/', icon: BookOpen, label: n.guides.replace('{n}', String(articles.length)) },
    { href: '/faq/', icon: HelpCircle, label: n.faq },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="text-center mb-8">
        <p className="text-6xl font-extrabold text-gradient mb-2">404</p>
        <h1 className="text-xl font-bold text-slate-200 mb-2">{n.title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {requestedPath && (
            <>
              {n.nothingAt.replace('{path}', requestedPath)}{' '}
            </>
          )}
          {n.patternHint}
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">{n.didYouMean}</h2>
          <ul className="space-y-1.5">
            {suggestions.map(s => (
              <li key={s.href}>
                <Link href={s.href} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">{n.searchTitle}</h2>
        <form role="search" action={localizeHref('/quant-hub/', lang)} method="get" className="relative">
          <label htmlFor="notfound-search" className="sr-only">{n.searchTitle}</label>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true" />
          <input
            type="search"
            id="notfound-search"
            name="q"
            aria-label={n.searchTitle}
            placeholder={n.searchPlaceholder}
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/40"
          />
        </form>
      </div>

      <div className="glass rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">{n.startHere}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {sections.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="glass glass-hover rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors min-h-[44px]"
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-600">
        {n.brokenLinkIntro}{' '}
        <a
          href={`mailto:${FEEDBACK_EMAIL}?subject=Broken%20link%20on%20quantized.uk`}
          onClick={() => trackEvent('Feedback Click')}
          className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Mail size={11} />
          {FEEDBACK_EMAIL}
        </a>
      </p>

      <Link
        href="/"
        className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors min-h-[44px]"
      >
        <Home size={12} />
        {n.home}
      </Link>
    </div>
  );
}
