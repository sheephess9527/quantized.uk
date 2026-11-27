'use client';

import Link from '@/components/i18n/LocalLink';
import { localGuides, localGuideSlugs } from '@/lib/data/local-guides';
import { Suspense } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import VRAMCalculator from '@/components/tools/VRAMCalculator';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolExplainer from '@/components/tools/ToolExplainer';
import VramQuickReference from '@/components/tools/VramQuickReference';
import { vramCalcContent } from '@/lib/data/tool-content';

export default function VRAMCalcPage() {
  const { t, lang } = useLanguage();
  const title = lang === 'en' ? 'LLM VRAM Calculator' : t.calc.title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.tools, href: '/tools/' },
          { label: t.nav.vramCalc },
        ]}
      />
      <div className="mb-5 sm:mb-8">
        <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium mb-4">
          ⚡ {t.nav.vramCalc}
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{title}</h1>
        <p className="text-slate-400 max-w-2xl">
          <span className="sm:hidden">{t.calc.mobileSubtitle}</span>
          <span className="hidden sm:inline">{t.calc.subtitle}</span>
        </p>
      </div>
      <Suspense fallback={<div className="glass rounded-2xl p-8 text-center text-slate-600 text-sm">Loading...</div>}>
        <VRAMCalculator />
      </Suspense>
      <nav aria-label={lang === 'en' ? 'Local LLM guides' : '本地大模型指南'} className="my-6 flex flex-wrap gap-4 text-sm">
        {localGuideSlugs.map(slug => <Link className="text-cyan-300 hover:underline" key={slug} href={`/${slug}/`}>{localGuides[slug][lang][0]}</Link>)}
      </nav>
      <VramQuickReference />
      <ToolExplainer content={vramCalcContent} toolName={title} path="/tools/vram-calc/" />
    </div>
  );
}
