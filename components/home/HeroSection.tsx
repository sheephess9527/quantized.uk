'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

const formatBadges = [
  { name: 'GGUF',  color: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  { name: 'AWQ',   color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  { name: 'EXL2',  color: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  { name: 'GPTQ',  color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  { name: 'HQQ',   color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25' },
];

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      {/* Radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(109,40,217,0.22) 0%, transparent 70%)',
        }}
      />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Floating orb */}
      <div
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          {t.home.hero.badge}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-slate-100">{t.home.hero.title1}&nbsp;</span>
          <br />
          <span className="text-gradient">{t.home.hero.title2}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t.home.hero.subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/quant-hub"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-150 hover:scale-[1.02] glow-purple"
          >
            {t.home.hero.ctaPrimary}
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/tools/vram-calc"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass glass-hover text-slate-200 font-semibold text-sm transition-all duration-150 hover:scale-[1.02]"
          >
            <Calculator size={14} className="text-cyan-400" />
            {t.home.hero.ctaSecondary}
          </Link>
        </motion.div>

        {/* Format badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
        >
          {formatBadges.map((fmt, i) => (
            <motion.div
              key={fmt.name}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              className={`badge text-xs font-mono font-semibold ${fmt.color}`}
            >
              {fmt.name}
            </motion.div>
          ))}
          <span className="text-xs text-slate-600 ml-1">& more</span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
