import Link from '@/components/i18n/LocalLink';
import { Calculator, Terminal, Wand2, GitCompareArrows, Gauge } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';

export default function QuickAccess({ lang }: { lang: Lang }) {
  const t = translations[lang];

  const tools = [
    {
      href: '/tools/vram-calc/',
      icon: Calculator,
      iconColor: 'text-sky-400',
      chipBg: 'bg-sky-500/12 border-sky-500/25',
      title: t.home.quickAccess.vramTitle,
      desc: t.home.quickAccess.vramDesc,
    },
    {
      href: '/tools/cli-gen/',
      icon: Terminal,
      iconColor: 'text-cyan-400',
      chipBg: 'bg-cyan-500/12 border-cyan-500/25',
      title: t.home.quickAccess.cliTitle,
      desc: t.home.quickAccess.cliDesc,
    },
    {
      href: '/tools/format-wizard/',
      icon: Wand2,
      iconColor: 'text-teal-400',
      chipBg: 'bg-teal-500/12 border-teal-500/25',
      title: t.home.quickAccess.wizardTitle,
      desc: t.home.quickAccess.wizardDesc,
    },
    {
      href: '/tools/compare/',
      icon: GitCompareArrows,
      iconColor: 'text-sky-400',
      chipBg: 'bg-sky-500/12 border-sky-500/25',
      title: t.home.quickAccess.compareTitle,
      desc: t.home.quickAccess.compareDesc,
    },
    {
      href: '/tools/feel/',
      icon: Gauge,
      iconColor: 'text-cyan-400',
      chipBg: 'bg-cyan-500/12 border-cyan-500/25',
      title: t.home.quickAccess.feelTitle,
      desc: t.home.quickAccess.feelDesc,
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
            className="group glass glass-hover rounded-2xl p-5 flex flex-col gap-3 flex-1 transition-all duration-200 hover:border-sky-500/35"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 ${tool.chipBg}`}
              >
                <Icon size={16} className={tool.iconColor} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors mb-1">{tool.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-sky-400 group-hover:text-sky-300 transition-colors">
              {t.home.quickAccess.openTool}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
