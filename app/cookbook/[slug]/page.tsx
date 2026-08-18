import { articles } from '@/lib/data/cookbook';
import ArticleView from '@/components/cookbook/ArticleView';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, languageAlternates, ogLocale } from '@/lib/seo';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(a => a.id === params.slug);
  if (!article) return { title: 'Article Not Found | quantized.uk' };
  const url = canonical(`/cookbook/${article.id}`);
  return {
    title: `${article.title} | quantized.uk Cookbook`,
    description: article.description,
    alternates: { canonical: url, languages: languageAlternates(`/cookbook/${article.id}`) },
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
          // verifiedAt means "commands re-checked on this date" — the closest
          // honest mapping to dateModified. Omitted when the guide has none.
          ...(article.verifiedAt ? { dateModified: article.verifiedAt } : {}),
          author: { '@type': 'Organization', name: 'quantized.uk' },
          publisher: { '@type': 'Organization', name: 'quantized.uk' },
        }}
      />
      <ArticleView article={article} />
    </>
  );
}