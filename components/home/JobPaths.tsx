'use client';

import Link from '@/components/i18n/LocalLink';
import { MemoryStick, Terminal, Wand2, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { trackEvent } from '@/lib/analytics';

const paths = [
  {
    id: '8gb',
    href: '/cookbook/8gb-gpu-starter-guide/',
    icon: MemoryStick,
    color: 'text-emerald-400',
    border: 'hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]',
    titleKey: 'path8gb' as const,
    descKey: 'path8gbDesc' as const,
  },
  {
    id: 'cli',
    href: '/tools/cli-gen/',
    icon: Terminal,
    color: 'text-cyan-400',
    border: 'hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]',
    titleKey: 'pathCli' as const,
    descKey: 'pathCliDesc' as const,
  },
  {
    id: 'format',
    href: '/tools/format-wizard/',
    icon: Wand2,
    color: 'text-violet-400',
    border: 'hover:border-violet-500/30 hover:bg-violet-500/[0.04]',
    titleKey: 'pathFormat' as const,
    descKey: 'pathFormatDesc' as const,
  },
];

export default function JobPaths() {
  const { t } = useLanguage();
  const j = t.home.jobPaths;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 mb-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center sm:text-left">
        {j.title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paths.map(p => {
          const Icon = p.icon;
          return (
            <Link
              key={p.id}
              href={p.href}
              onClick={() => trackEvent('Job Path', { path: p.id })}
              className={`group glass rounded-xl p-4 border border-white/[0.06] transition-all ${p.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${p.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {j[p.titleKey]}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{j[p.descKey]}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
