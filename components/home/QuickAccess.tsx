'use client';

import Link from 'next/link';
import { Calculator, Terminal, Wand2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function QuickAccess() {
  const { t } = useLanguage();

  const tools = [
    {
      href: '/tools/vram-calc',
      icon: Calculator,
      iconColor: 'text-violet-400',
      glowClass: 'group-hover:glow-purple',
      borderHover: 'group-hover:border-violet-500/30',
      title: t.home.quickAccess.vramTitle,
      desc: t.home.quickAccess.vramDesc,
      accent: '#7c3aed',
    },
    {
      href: '/tools/cli-gen',
      icon: Terminal,
      iconColor: 'text-cyan-400',
      glowClass: 'group-hover:glow-cyan',
      borderHover: 'group-hover:border-cyan-500/30',
      title: t.home.quickAccess.cliTitle,
      desc: t.home.quickAccess.cliDesc,
      accent: '#06b6d4',
    },
    {
      href: '/tools/format-wizard',
      icon: Wand2,
      iconColor: 'text-orange-400',
      glowClass: 'group-hover:glow-cyan',
      borderHover: 'group-hover:border-orange-500/30',
      title: t.home.quickAccess.wizardTitle,
      desc: t.home.quickAccess.wizardDesc,
      accent: '#f97316',
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="section-title text-lg">{t.home.quickAccess.title}</h2>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group glass rounded-2xl p-5 flex flex-col gap-3 flex-1 transition-all duration-200 ${tool.borderHover} hover:bg-white/[0.045]`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tool.glowClass} transition-all duration-200`}
                style={{ background: `${tool.accent}18`, border: `1px solid ${tool.accent}25` }}
              >
                <Icon size={16} className={tool.iconColor} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">{tool.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
            <span className="text-xs font-medium" style={{ color: tool.accent }}>
              {t.home.quickAccess.openTool}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
