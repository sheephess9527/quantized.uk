'use client';

import Link from '@/components/i18n/LocalLink';
import LanguageSwitchLink from '@/components/i18n/LanguageSwitchLink';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, Zap, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { toEnPath } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';
import HardwareProfileSelector from '@/components/layout/HardwareProfileSelector';

const CommandPaletteModal = dynamic(
  () => import('@/components/layout/CommandPaletteModal'),
  { ssr: false },
);

// `/gpu/` and `/formats/` are 43 and 7 pages respectively — between them most
// of the site — and neither had a link in the main nav. A reader could only
// reach a GPU page from a homepage card, and a format page from nowhere at all.
const navLinks = (t: ReturnType<typeof useLanguage>['t']) => [
  { href: '/',             label: t.nav.home },
  { href: '/quant-hub/',    label: t.nav.quantHub },
  { href: '/gpu/',          label: t.nav.gpus },
  { href: '/benchmarks/',   label: t.nav.benchmarks },
  { href: '/cookbook/',     label: t.nav.cookbook },
];

const toolLinks = (t: ReturnType<typeof useLanguage>['t']) => [
  { href: '/tools/',               label: t.nav.allTools },
  { href: '/tools/vram-calc/',     label: t.nav.vramCalc },
  { href: '/tools/cli-gen/',       label: t.nav.cliGen },
  { href: '/tools/format-wizard/', label: t.nav.formatWizard },
  { href: '/tools/compare/',       label: t.nav.modelCompare },
  { href: '/tools/feel/',          label: t.nav.feelSpeed },
  { href: '/errors/',              label: t.nav.errors },
  { href: '/formats/',             label: t.nav.formats },
];

export default function Navbar() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toolsTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Nav hrefs are written in the English (canonical) form and localized by
  // LocalLink, so the active test has to compare against the de-prefixed path —
  // otherwise nothing is ever highlighted anywhere in the /zh tree.
  const basePath = toEnPath(pathname ?? '/');
  const isActive = (href: string) =>
    href === '/' ? basePath === '/' : basePath.startsWith(href);

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="absolute inset-0 bg-bg/85 backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group min-h-[44px] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center glow-purple group-hover:scale-105 transition-transform">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">
            quantized<span className="text-violet-400">.uk</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks(t).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                isActive(href)
                  ? 'text-violet-300 bg-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              {label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative" onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false);
          }} onKeyDown={event => {
            if (event.key === 'Escape') {
              setToolsOpen(false);
              toolsTrigger.current?.focus();
            }
          }}>
            <button
              ref={toolsTrigger}
              aria-expanded={toolsOpen}
              aria-controls="navbar-tools"
              onClick={() => setToolsOpen(v => !v)}
              className={cn(
                'flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                basePath.startsWith('/tools') || basePath.startsWith('/errors')
                  ? 'text-violet-300 bg-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              {t.nav.tools}
              <ChevronDown size={12} className={cn('transition-transform duration-150', toolsOpen && 'rotate-180')} />
            </button>
            {toolsOpen && (
              <div id="navbar-tools" className="absolute top-full right-0 mt-1 w-48 bg-[#111218]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden py-1">
                {toolLinks(t).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label={t.nav.searchPlaceholder}
            className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] transition-all"
          >
            <Search size={13} className="text-slate-400" aria-hidden />
            <span className="hidden lg:inline">{t.nav.searchButton}</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.04] rounded border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>

          <div className="hidden sm:block max-w-[9.5rem] lg:max-w-[12.5rem]">
            <HardwareProfileSelector compact />
          </div>

          <LanguageSwitchLink
            hrefLang={lang === 'en' ? 'zh-Hans' : 'en'}
            lang={lang === 'en' ? 'zh-Hans' : 'en'}
            rel="alternate"
            className="px-2.5 min-h-[44px] sm:min-h-[30px] inline-flex items-center rounded-lg text-xs font-semibold whitespace-nowrap text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 border border-white/[0.08] hover:border-violet-500/20 transition-all duration-150"
            title={lang === 'en' ? 'Switch to Chinese' : '切换为英文'}
            aria-label={lang === 'en' ? '切换到中文版 / Switch to Chinese' : 'Switch to English'}
          >
            {t.nav.langToggle}
          </LanguageSwitchLink>

          <button
            className="md:hidden p-1.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-400 hover:text-slate-200"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-white/[0.06] md:hidden max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            <div className="sm:hidden px-1 pb-2 mb-1 border-b border-white/[0.06]">
              <HardwareProfileSelector />
            </div>
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
    {paletteOpen && <CommandPaletteModal onClose={() => setPaletteOpen(false)} />}
    </>
  );
}
