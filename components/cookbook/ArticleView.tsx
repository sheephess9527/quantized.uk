'use client';

import { Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { Article } from '@/lib/data/cookbook';
import RelatedArticles from '@/components/cookbook/RelatedArticles';
import ArticleToc, { sectionId } from '@/components/cookbook/ArticleToc';
import ReadingProgress from '@/components/cookbook/ReadingProgress';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils/cn';

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
            <Clock size={10} /> {article.readTime} {t.cookbook.readTime}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-3">{title}</h1>
        <p className="text-slate-400 leading-relaxed">
          {lang === 'zh' ? article.descriptionZh : article.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {article.tags.map(tag => (
            <span key={tag} className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07] font-mono">{tag}</span>
          ))}
        </div>
      </header>

      <div className="lg:hidden mb-6">
        <ArticleToc article={article} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">
        <div className="hidden lg:block">
          <ArticleToc article={article} />
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
              <div className="code-block">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-1 text-xs text-slate-600">{section.code.lang}</span>
                </div>
                <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
                  <code>{section.code.content}</code>
                </pre>
              </div>
            )}
          </section>
        ))}

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