import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import FormatCompareContent from '@/components/formats/FormatCompareContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { formatPairs, headToHead, modelsWithFormat, pairBySlug } from '@/lib/utils/format-compare';

export function generateStaticParams() {
  return formatPairs.map(p => ({ pair: p.slug }));
}

export function generateMetadata({ params }: { params: { pair: string } }): Metadata {
  const pair = pairBySlug(params.pair);
  if (!pair) return { title: 'Comparison not found | quantized.uk' };
  const path = `/formats/${params.pair}`;
  const url = canonical(path);
  const title = `${pair.a.name} vs ${pair.b.name} — which quantization format? | quantized.uk`;
  const description = `${pair.a.name} runs on ${pair.a.hardwareReq.toLowerCase()}; ${pair.b.name} on ${pair.b.hardwareReq.toLowerCase()}. Compared on runtime, quality and the ${models.length}-model index, with the models that ship both.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

/** Shared with the `/zh` mirror; `lang` keeps the structured data on the right page. */
export default function FormatComparePage({ params, lang = 'en' }: { params: { pair: string }; lang?: 'en' | 'zh' }) {
  const pair = pairBySlug(params.pair);
  if (!pair) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Comparison not found</h1>
      </div>
    );
  }
  const path = lang === 'zh' ? `/zh/formats/${params.pair}` : `/formats/${params.pair}`;
  const both = headToHead(pair);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline:
            lang === 'zh'
              ? `${pair.a.name} 与 ${pair.b.name} 该选哪个量化格式？`
              : `${pair.a.name} vs ${pair.b.name}: which quantization format should you use?`,
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          description:
            lang === 'zh'
              ? `对比 ${pair.a.name}（索引中 ${modelsWithFormat(pair.a.name).length} 个模型）与 ${pair.b.name}（${modelsWithFormat(pair.b.name).length} 个），含 ${both.length} 个同时提供两种格式的模型。`
              : `${pair.a.name} (${modelsWithFormat(pair.a.name).length} indexed models) compared with ${pair.b.name} (${modelsWithFormat(pair.b.name).length}), including ${both.length} models that ship both.`,
          author: { '@type': 'Organization', name: 'quantized.uk' },
          publisher: { '@type': 'Organization', name: 'quantized.uk' },
        }}
      />
      <FormatCompareContent pair={pair} />
    </>
  );
}
