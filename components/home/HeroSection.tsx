import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Calculator, Sparkles } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';
import { quantFormats } from '@/lib/data/formats';
import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';

/**
 * These badges sit directly under "Explore Models" and read as "formats you
 * will find here", so they list only formats an indexed model actually ships.
 * formats.ts also documents HQQ, which no model uses — advertising it here
 * walked the reader into a Hub that has no HQQ filter and no HQQ results.
 * Colours come from the format data rather than a second hardcoded copy.
 */
const formatBadges = quantFormats
  .filter(f => SHIPPED_FORMATS.includes(f.name))
  .map(f => ({
    name: f.name,
    color: `${f.bgClass.replace('/10', '/15')} ${f.textClass} ${f.borderClass.replace('/20', '/25')}`,
  }));

export default function HeroSection({ latestDate, lang }: { latestDate?: string; lang: Lang }) {
  const t = translations[lang];

  return (
    // Deliberately not a 70vh hero any more: the panel directly below it is the
    // page's actual entry point (pick a card → get models that fit), and a
    // full-viewport hero pushed it off the first screen on every laptop.
    <section className="relative flex items-center justify-center overflow-hidden pt-[4.5rem] pb-4 sm:pt-20 sm:pb-8">
      <div className="absolute inset-0 pointer-events-none hero-glow-primary" />
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none hero-glow-secondary" />

      {/* min-w-0: this is a flex item, and the default min-width:auto refuses to
          shrink below its content's min-content width. The changelog pill below
          is capped at max-w-md (448px), which is wider than a phone — without
          this the whole hero block sized to 480px and the section's
          overflow-hidden silently clipped the CTAs off the right edge. */}
      <div className="relative z-10 w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/*
          One row, not two stacked pills (2026-11-27): the positioning badge and
          the latest-update link used to sit on separate lines and read as
          clutter above the headline. They now share one pill. On a phone the
          pill wraps to two lines inside the same rounded box instead of
          overflowing; the date stays a link to /changelog/, never the entry
          prose itself (that used to repeat the same paragraph three times).
        */}
        <div className="hero-rise flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-1 rounded-2xl sm:rounded-full bg-sky-500/10 border border-sky-500/25 text-xs font-medium">
            <span className="inline-flex items-center gap-2 text-sky-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
              {t.home.hero.badge}
            </span>
            {latestDate && (
              <>
                <span aria-hidden="true" className="hidden sm:inline text-sky-500/40">|</span>
                <Link
                  href="/changelog/"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-sky-300 transition-colors"
                >
                  <Sparkles size={12} className="shrink-0 text-sky-400" />
                  <span className="text-slate-500 font-mono">{latestDate}</span>
                  {t.home.hero.changelogLink}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* .hero-lift, not .hero-rise: this is the LCP element, so it animates
            transform only and is never rendered invisible. */}
        <h1 className="hero-lift text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-2 sm:mb-4">
          <span className="text-slate-100">{t.home.hero.title1}</span>
          <br />
          <span className="text-gradient">{t.home.hero.title2}</span>
        </h1>

        {/* The old headline, kept as a tagline rather than deleted: it is the
            site's name-adjacent line and still appears on the OG image. */}
        <p className="hero-rise text-xs font-mono uppercase tracking-[0.2em] text-slate-600 mb-2 sm:mb-4">
          {t.home.hero.tagline}
        </p>

        <p
          className="hero-rise [animation-delay:0.1s] text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-4 sm:mb-8 leading-relaxed"
        >
          {t.home.hero.subtitle}
        </p>

        <div className="hero-rise [animation-delay:0.15s] flex flex-wrap items-center justify-center gap-3">
          {/*
            The H1 promises a hardware-matched answer, so the primary CTA now
            delivers that — /gpu/ groups by card with an H2 per hardware class.
            It used to point at /quant-hub/, a 79-model unpaginated list with no
            hardware framing at all: the button did not answer the question the
            headline had just asked. /quant-hub/ is still one click away, from
            the trust bar and the nav.
          */}
          <Link
            href="/gpu/"
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all duration-150 hover:scale-[1.02] glow-purple"
          >
            {t.home.hero.ctaPrimary}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/tools/vram-calc/"
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl glass glass-hover text-slate-200 font-semibold text-sm transition-all duration-150 hover:scale-[1.02]"
          >
            <Calculator size={14} className="text-sky-400" />
            {t.home.hero.ctaSecondary}
          </Link>
        </div>

        <Link
          href="/cookbook/8gb-gpu-starter-guide/"
          className="hero-rise [animation-delay:0.18s] inline-flex items-center gap-1 mt-3 sm:mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {t.home.hero.ctaTertiary}
          <ArrowRight size={11} />
        </Link>

        <div className="mt-4 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {formatBadges.map(fmt => (
            <span key={fmt.name} className={`badge text-xs font-mono font-semibold ${fmt.color}`}>
              {fmt.name}
            </span>
          ))}
          <Link href="/formats/" className="text-xs text-slate-600 hover:text-slate-400 ml-1 transition-colors">
            {t.home.hero.andMore}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
