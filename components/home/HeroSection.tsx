'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Calculator, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { changelog } from '@/lib/data/meta';
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

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const latest = changelog[0];

  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 min-h-[min(70vh,640px)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(109,40,217,0.22) 0%, transparent 70%)',
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* min-w-0: this is a flex item, and the default min-width:auto refuses to
          shrink below its content's min-content width. The changelog pill below
          is capped at max-w-md (448px), which is wider than a phone — without
          this the whole hero block sized to 480px and the section's
          overflow-hidden silently clipped the CTAs off the right edge. */}
      <div className="relative z-10 w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="hero-rise flex flex-col items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            {t.home.hero.badge}
          </div>
          {latest && (
            <a
              href="#changelog"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/15 transition-colors max-w-full sm:max-w-md"
            >
              <Sparkles size={12} className="shrink-0" />
              <span className="truncate">
                <span className="text-cyan-500/70 font-mono mr-1.5">{latest.date}</span>
                {latest[lang]}
              </span>
            </a>
          )}
        </div>

        {/* .hero-lift, not .hero-rise: this is the LCP element, so it animates
            transform only and is never rendered invisible. */}
        <h1 className="hero-lift text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-5">
          <span className="text-slate-100">{t.home.hero.title1}&nbsp;</span>
          <br />
          <span className="text-gradient">{t.home.hero.title2}</span>
        </h1>

        <p
          className="hero-rise [animation-delay:0.1s] text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {t.home.hero.subtitle}
        </p>

        <div className="hero-rise [animation-delay:0.15s] flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/quant-hub/"
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-150 hover:scale-[1.02] glow-purple"
          >
            {t.home.hero.ctaPrimary}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/tools/vram-calc/"
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl glass glass-hover text-slate-200 font-semibold text-sm transition-all duration-150 hover:scale-[1.02]"
          >
            <Calculator size={14} className="text-cyan-400" />
            {t.home.hero.ctaSecondary}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {formatBadges.map(fmt => (
            <span key={fmt.name} className={`badge text-xs font-mono font-semibold ${fmt.color}`}>
              {fmt.name}
            </span>
          ))}
          <span className="text-xs text-slate-600 ml-1">{t.home.hero.andMore}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
