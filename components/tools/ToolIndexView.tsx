'use client';

import Link from '@/components/i18n/LocalLink';
import { Calculator, Terminal, Wand2, GitCompareArrows, Cpu, Layers } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { vramCalcContent, cliGenContent, formatWizardContent, compareContent } from '@/lib/data/tool-content';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { formatPairs } from '@/lib/utils/format-compare';

/**
 * `/tools/` was a 404 while four tool pages lived under it — the one path a
 * reader is most likely to type after seeing `/tools/vram-calc/` in the address
 * bar, and the natural parent for the breadcrumb those pages already render.
 *
 * Every word here is reused from `lib/data/tool-content.ts`, the same source the
 * tool pages themselves render, so this index cannot drift into describing a
 * tool that no longer behaves that way.
 */
const tools = [
  { href: '/tools/vram-calc/',     icon: Calculator,        accent: 'text-violet-300',  content: vramCalcContent,     key: 'vramCalc' as const },
  { href: '/tools/cli-gen/',       icon: Terminal,          accent: 'text-cyan-300',    content: cliGenContent,       key: 'cliGen' as const },
  { href: '/tools/format-wizard/', icon: Wand2,             accent: 'text-orange-300',  content: formatWizardContent, key: 'formatWizard' as const },
  { href: '/tools/compare/',       icon: GitCompareArrows,  accent: 'text-emerald-300', content: compareContent,      key: 'modelCompare' as const },
];

export default function ToolIndexView() {
  const { t, lang } = useLanguage();
  const i = t.toolsIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.tools }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{i.title}</h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed">{i.subtitle}</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <li key={tool.href}>
              <Link href={tool.href} className="block glass glass-hover rounded-2xl p-5 h-full">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${tool.accent}`}>
                  <Icon size={15} /> {t.nav[tool.key]}
                </span>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">{tool.content.summary[lang]}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* The two indexes the main nav never linked, which is most of the site. */}
      <h2 className="text-lg font-bold text-slate-100 mt-10 mb-3">{i.browseTitle}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <li>
          <Link href="/gpu/" className="block glass glass-hover rounded-2xl p-5 h-full">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300">
              <Cpu size={15} /> {i.gpuTitle}
            </span>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              {i.gpuBody.replace('{gpus}', String(gpuDatabase.length)).replace('{models}', String(models.length))}
            </p>
          </Link>
        </li>
        <li>
          <Link href="/formats/" className="block glass glass-hover rounded-2xl p-5 h-full">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Layers size={15} /> {i.formatsTitle}
            </span>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              {i.formatsBody.replace('{pairs}', String(formatPairs.length))}
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
