import { Clock } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';
import { Article } from '@/lib/data/cookbook';
import RelatedArticles from '@/components/cookbook/RelatedArticles';
import GuideNextSteps from '@/components/cookbook/GuideNextSteps';
import GuideReferences from '@/components/cookbook/GuideReferences';
import RunFeedback from '@/components/feedback/RunFeedback';
import ArticleToc from '@/components/cookbook/ArticleToc';
import CodeBlock from '@/components/cookbook/CodeBlock';
import ReadingProgress from '@/components/cookbook/ReadingProgress';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils/cn';
import { readingMinutes } from '@/lib/utils/reading-time';
import { articleModifiedAt } from '@/lib/utils/article-dates';

const difficultyColors = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  article: Article;
  lang?: Lang;
}

export default function ArticleView({ article, lang = 'en' }: Props) {
  const t = translations[lang];

  const title = lang === 'zh' ? article.titleZh : article.title;
  const modified = articleModifiedAt(article);
  const tocSections = article.content.map(s => ({ heading: s.heading, headingZh: s.headingZh }));

  return (
    <>
      <ReadingProgress targetId="article-content" />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.cookbook, href: '/cookbook/' },
          { label: title },
        ]}
      />

      <header className="mb-8 pb-6 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
            {t.cookbook.difficulty[article.difficulty]}
          </span>
          <span className="badge text-xs bg-white/[0.04] text-slate-400 border-white/[0.08]">
            {t.cookbook.categories[article.category]}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={11} /> {readingMinutes(article, lang)} {t.cookbook.readTime}
          </span>
          <span className="text-xs text-slate-500">
            {t.cookbook.publishedOn}{' '}
            <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            {modified !== article.publishedAt && (
              <>
                {' · '}{t.cookbook.updatedOn}{' '}
                <time dateTime={modified}>{modified}</time>
              </>
            )}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight mb-3">{title}</h1>
        <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
          {lang === 'zh' ? article.descriptionZh : article.description}
        </p>

        {article.verifiedStack && (
          <div
            className={cn(
              'mt-5 rounded-xl border px-4 py-3 text-xs text-slate-400 max-w-2xl',
              article.verifiedAt
                ? 'border-cyan-500/25 bg-cyan-500/[0.06]'
                : 'border-white/[0.08] bg-[#111218]',
            )}
          >
            <p className={cn('font-semibold mb-1', article.verifiedAt ? 'text-cyan-300' : 'text-slate-300')}>
              {article.verifiedAt ? t.cookbook.verified : t.cookbook.writtenAgainst}
            </p>
            <p className="font-mono text-slate-200 leading-relaxed">
              {lang === 'zh' ? article.verifiedStack.zh : article.verifiedStack.en}
            </p>
            <p className="text-slate-500 mt-1.5">
              {article.verifiedAt
                ? t.cookbook.verifiedOn.replace('{date}', article.verifiedAt)
                : t.cookbook.notVerified}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {article.tags.map(tag => (
            <span key={tag} className="badge text-xs bg-white/[0.04] text-slate-400 border-white/[0.08] font-mono">{tag}</span>
          ))}
        </div>
      </header>

      <div className="lg:hidden mb-6">
        <ArticleToc sections={tocSections} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
        <div className="hidden lg:block">
          <ArticleToc sections={tocSections} />
        </div>

        <div id="article-content" className="space-y-8 min-w-0">
          <article className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 sm:p-8 lg:p-10 divide-y divide-white/[0.06]">
            {article.content.map((section, i) => (
              <section key={i} id={`section-${i}`} className="py-7 first:pt-0 last:pb-0 scroll-mt-24">
                <div className="flex items-baseline gap-2.5 mb-3">
                  <span className="font-mono text-xs font-semibold text-cyan-400/80 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 leading-snug">
                    {lang === 'zh' ? section.headingZh : section.heading}
                  </h2>
                </div>
                <p className="text-[15px] text-slate-300 leading-7 whitespace-pre-line">
                  {lang === 'zh' ? section.bodyZh : section.body}
                </p>
                {section.code && (
                  <div className="mt-4 space-y-3">
                    {(Array.isArray(section.code) ? section.code : [section.code]).map(({ lang: codeLang, content }, index) => (
                      <CodeBlock key={index} lang={codeLang} content={content} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>

          {article.faqs && article.faqs.length > 0 && (
            <section className="rounded-2xl border border-white/[0.08] bg-[#111218] p-6 sm:p-8">
              {/* Same array the route emits as FAQPage, so the two cannot diverge. */}
              <h2 className="section-title text-lg mb-5">{t.cookbook.faqTitle}</h2>
              <div className="divide-y divide-white/[0.05]">
                {article.faqs.map((f, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-sm sm:text-[15px] font-semibold text-slate-100 mb-1.5">{lang === 'zh' ? f.qZh : f.q}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{lang === 'zh' ? f.aZh : f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <GuideReferences article={article} lang={lang} />
          <GuideNextSteps article={article} lang={lang} />

          <RunFeedback subject={`quantized.uk — ${article.id}`} context={title} />

          <RelatedArticles articleId={article.id} lang={lang} />

          <div className="glass rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
            {t.cookbook.licenseNote}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}