'use client';

import { Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { Article } from '@/lib/data/cookbook';
import RelatedArticles from '@/components/cookbook/RelatedArticles';
import GuideNextSteps from '@/components/cookbook/GuideNextSteps';
import GuideReferences from '@/components/cookbook/GuideReferences';
import RunFeedback from '@/components/feedback/RunFeedback';
import ArticleToc, { sectionId } from '@/components/cookbook/ArticleToc';
import CodeBlock from '@/components/cookbook/CodeBlock';
import ReadingProgress from '@/components/cookbook/ReadingProgress';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useActiveSection } from '@/lib/hooks/useActiveSection';
import { cn } from '@/lib/utils/cn';
import { readingMinutes } from '@/lib/utils/reading-time';

const difficultyColors = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  article: Article;
}

export default function ArticleView({ article }: Props) {
  const { t, lang } = useLanguage();

  const title = lang === 'zh' ? article.titleZh : article.title;
  const activeSection = useActiveSection(article.content.length, 'section-');

  return (
    <>
      <ReadingProgress targetId="article-content" />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.cookbook, href: '/cookbook/' },
          { label: title },
        ]}
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
            {t.cookbook.difficulty[article.difficulty]}
          </span>
          <span className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07]">
            {t.cookbook.categories[article.category]}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={10} /> {readingMinutes(article, lang)} {t.cookbook.readTime}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-3">{title}</h1>
        <p className="text-slate-400 leading-relaxed">
          {lang === 'zh' ? article.descriptionZh : article.description}
        </p>
        {/*
          Two different claims, and they used to be one badge. The stack line
          says what the guide is *written against*; `verifiedAt` says the
          commands were re-run on that date. A guide rewritten since its last
          run keeps the first and must lose the second — so the panel renders
          from `verifiedStack` alone and only adds the date, and the cyan
          "verified" styling, when there is a date to stand behind.
        */}
        {article.verifiedStack && (
          <div
            className={cn(
              'mt-4 rounded-xl border px-4 py-3 text-xs text-slate-400 max-w-2xl',
              article.verifiedAt
                ? 'border-cyan-500/20 bg-cyan-500/[0.06]'
                : 'border-white/[0.08] bg-white/[0.02]',
            )}
          >
            <p className={cn('font-semibold mb-1', article.verifiedAt ? 'text-cyan-300/90' : 'text-slate-400')}>
              {article.verifiedAt ? t.cookbook.verified : t.cookbook.writtenAgainst}
            </p>
            <p className="font-mono text-slate-300 leading-relaxed">
              {lang === 'zh' ? article.verifiedStack.zh : article.verifiedStack.en}
            </p>
            <p className="text-slate-600 mt-1.5">
              {article.verifiedAt
                ? t.cookbook.verifiedOn.replace('{date}', article.verifiedAt)
                : t.cookbook.notVerified}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {article.tags.map(tag => (
            <span key={tag} className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07] font-mono">{tag}</span>
          ))}
        </div>
      </header>

      <div className="lg:hidden mb-6">
        <ArticleToc article={article} activeIndex={activeSection} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">
        <div className="hidden lg:block">
          <ArticleToc article={article} activeIndex={activeSection} />
        </div>

        <div id="article-content" className="space-y-8 min-w-0">
        {article.content.map((section, i) => (
          <section key={i} id={sectionId(i)} className="glass rounded-2xl p-6 scroll-mt-28">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">
              {lang === 'zh' ? section.headingZh : section.heading}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {lang === 'zh' ? section.bodyZh : section.body}
            </p>
            {section.code && (
              <CodeBlock lang={section.code.lang} content={section.code.content} />
            )}
          </section>
        ))}

        {article.faqs && article.faqs.length > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6">
            {/* Same array the route emits as FAQPage, so the two cannot diverge. */}
            <h2 className="section-title text-base mb-4">{t.cookbook.faqTitle}</h2>
            <div className="space-y-4">
              {article.faqs.map((f, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{lang === 'zh' ? f.qZh : f.q}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{lang === 'zh' ? f.aZh : f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <GuideReferences article={article} />
        <GuideNextSteps article={article} />

        <RunFeedback subject={`quantized.uk — ${article.id}`} context={title} />

        <RelatedArticles articleId={article.id} />

        <div className="glass rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
          {t.cookbook.licenseNote}
        </div>
        </div>
      </div>
    </div>
    </>
  );
}