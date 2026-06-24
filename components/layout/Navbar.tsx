'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import HardwareProfileSelector from '@/components/layout/HardwareProfileSelector';

const navLinks = (t: ReturnType<typeof useLanguage>['t']) => [
  { href: '/',             label: t.nav.home },
  { href: '/quant-hub',    label: t.nav.quantHub },
  { href: '/benchmarks',   label: t.nav.benchmarks },
  { href: '/cookbook',     label: t.nav.cookbook },
];

const toolLinks = (t: ReturnType<typeof useLanguage>['t']) => [
  { href: '/tools/vram-calc',     label: t.nav.vramCalc },
  { href: '/tools/cli-gen',       label: t.nav.cliGen },
  { href: '/tools/format-wizard', label: t.nav.formatWizard },
  { href: '/tools/compare',     label: t.nav.modelCompare },
];

export default function Navbar() {
  const { t, toggleLang, lang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center glow-purple group-hover:scale-105 transition-transform">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">
            quantized<span className="text-violet-400">.uk</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks(t).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive(href)
                  ? 'text-violet-300 bg-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              {label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(v => !v)}
              onBlur={() => setTimeout(() => setToolsOpen(false), 150)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                pathname.startsWith('/tools')
                  ? 'text-violet-300 bg-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              {t.nav.tools}
              <ChevronDown size={12} className={cn('transition-transform duration-150', toolsOpen && 'rotate-180')} />
            </button>
            {toolsOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 glass rounded-xl shadow-xl overflow-hidden py-1">
                {toolLinks(t).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    onClick={() => setToolsOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <HardwareProfileSelector compact />
          </div>
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 border border-white/[0.06] hover:border-violet-500/20 transition-all duration-150"
            title={lang === 'en' ? 'Switch to Chinese' : '切换为英文'}
          >
            {t.nav.langToggle}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-200"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-white/[0.06] md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {[...navLinks(t), ...toolLinks(t)].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium',
                  isActive(href) ? 'text-violet-300 bg-violet-500/10' : 'text-slate-400'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
