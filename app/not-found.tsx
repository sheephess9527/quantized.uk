'use client';

import Link from 'next/link';
import { Home, Search, BookOpen, Calculator } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function NotFound() {
  const { t } = useLanguage();
  const n = t.notFound;

  const links = [
    { href: '/', icon: Home, label: n.home },
    { href: '/quant-hub/', icon: Search, label: n.hub },
    { href: '/cookbook/', icon: BookOpen, label: n.cookbook },
    { href: '/tools/vram-calc/', icon: Calculator, label: n.vramCalc },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 pt-24 pb-16">
      <div className="text-center max-w-lg">
        <p className="text-6xl font-extrabold text-gradient mb-2">404</p>
        <h1 className="text-xl font-bold text-slate-200 mb-2">{n.title}</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">{n.subtitle}</p>
        <div className="grid grid-cols-2 gap-3">
          {links.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="glass glass-hover rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}