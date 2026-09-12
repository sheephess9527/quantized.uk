import { articles } from '@/lib/data/cookbook';
import ArticleView from '@/components/cookbook/ArticleView';
import { JsonLd } from '@/components/seo/JsonLd';
import { articlePageTitle, canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale } from '@/lib/seo';
import { articleEntities } from '@/lib/utils/article-entities';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(a => a.id === params.slug);
  if (!article) return { title: 'Article Not Found | quantized.uk' };
  const url = canonical(`/cookbook/${article.id}`);
  return {
    title: articlePageTitle(article),
    description: article.description,
    alternates: { canonical: url, languages: languageAlternates(`/cookbook/${article.id}`), ...feedAlternates(`/cookbook/${article.id}`) },
    robots: defaultRobots,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'quantized.uk' }],
      ...ogLocale(`/cookbook/${article.id}`),
    },
  };
}

/**
 * Shared by `/cookbook/[slug]` and its `/zh` mirror. See the note on
 * `ModelDetailPage` — the JSON-LD has to follow the reader's language, or the
 * Chinese guide advertises the English URL its canonical tag rejects.
 */
export default function CookbookArticlePage({
  params,
  lang = 'en',
}: {
  params: { slug: string };
  lang?: 'en' | 'zh';
}) {
  const article = articles.find(a => a.id === params.slug);
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300 mb-4">Article not found</h1>
        <a href={lang === 'zh' ? '/zh/cookbook/' : '/cookbook/'} className="text-violet-400 text-sm">
          ← Back to Cookbook
        </a>
      </div>
    );
  }
  const url = canonical(lang === 'zh' ? `/zh/cookbook/${article.id}` : `/cookbook/${article.id}`);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: lang === 'zh' ? article.titleZh : article.title,
          description: lang === 'zh' ? article.descriptionZh : article.description,
          url,
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          datePublished: article.publishedAt,
          // `updatedAt` is when the content changed; `verifiedAt` is when the
          // commands were last re-run. Either is a real modification date, and
          // the first is the more accurate one when both exist. Omitted
          // entirely when neither does — an invented date would be worse than
          // none, since this is the signal an AI engine weighs most heavily on
          // content that goes stale.
          ...(article.updatedAt || article.verifiedAt
            ? { dateModified: article.updatedAt ?? article.verifiedAt }
            : {}),
          // The models and hardware this guide is actually about, as entities
          // rather than prose a crawler has to infer them from. Both come from
          // fields the guide already carries for its own links, so they cannot
          // describe something the page does not mention.
          ...articleEntities(article, lang),
          // Deliberately an Organization. The About page says this is one
          // developer's side project, but no name is published anywhere on the
          // site, and inventing a Person for E-E-A-T would be inventing an
          // author.
          author: { '@type': 'Organization', name: 'quantized.uk' },
          publisher: { '@type': 'Organization', name: 'quantized.uk' },
        }}
      />
      {article.faqs && article.faqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            mainEntity: article.faqs.map(f => ({
              '@type': 'Question',
              name: lang === 'zh' ? f.qZh : f.q,
              acceptedAnswer: { '@type': 'Answer', text: lang === 'zh' ? f.aZh : f.a },
            })),
          }}
        />
      )}
      <ArticleView article={article} />
    </>
  );
}