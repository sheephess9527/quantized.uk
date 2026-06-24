import { articles } from '@/lib/data/cookbook';
import ArticleView from '@/components/cookbook/ArticleView';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots } from '@/lib/seo';
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
    alternates: { canonical: url },
    robots: defaultRobots,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      images: [{ url: '/og.svg', width: 1200, height: 630 }],
    },
  };
}

export default function CookbookArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.id === params.slug);
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300 mb-4">Article not found</h1>
        <a href="/cookbook/" className="text-violet-400 text-sm">← Back to Cookbook</a>
      </div>
    );
  }
  const url = canonical(`/cookbook/${article.id}`);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          url,
          datePublished: article.publishedAt,
          author: { '@type': 'Organization', name: 'quantized.uk' },
          publisher: { '@type': 'Organization', name: 'quantized.uk' },
        }}
      />
      <ArticleView article={article} />
    </>
  );
}