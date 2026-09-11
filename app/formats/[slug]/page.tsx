import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import FormatCompareContent from '@/components/formats/FormatCompareContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { formatPairs, headToHead, modelsWithFormat, pairBySlug } from '@/lib/utils/format-compare';
import FormatSingleContent from '@/components/formats/FormatSingleContent';
import { FORMAT_PAGES, formatById, formatPage } from '@/lib/utils/format-page';

/*
 * This route serves two kinds of page, because Next allows only one dynamic
 * segment at a level and `/formats/gguf/` sits beside `/formats/gguf-vs-awq/`.
 * A slug is a pair if `pairBySlug` knows it and a single format otherwise;
 * format ids contain no "-vs-" so the two vocabularies cannot collide.
 */
export function generateStaticParams() {
  return [...formatPairs.map(p => ({ slug: p.slug })), ...FORMAT_PAGES.map(f => ({ slug: f.id }))];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const single = formatById(params.slug);
  if (single) {
    const path = `/formats/${params.slug}`;
    const url = canonical(path);
    const owning = modelsWithFormat(single.name).length;
    const title = `${single.name} explained — what it is, what reads it, what it costs | quantized.uk`;
    const description = `${single.name} runs on ${single.hardwareReq.toLowerCase()} via ${single.framework}. What the format is, which quant levels this index carries, what it costs in VRAM, and all ${owning} of the ${models.length} indexed models that ship in it.`;
    return {
      title,
      description,
      alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
      robots: defaultRobots,
      openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [OG_IMAGE], ...ogLocale(path) },
    };
  }
  const pair = pairBySlug(params.slug);
  if (!pair) return { title: 'Comparison not found | quantized.uk' };
  const path = `/formats/${params.slug}`;
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
export default function FormatComparePage({ params, lang = 'en' }: { params: { slug: string }; lang?: 'en' | 'zh' }) {
  const single = formatById(params.slug);
  if (single) {
    const path = lang === 'zh' ? `/zh/formats/${params.slug}` : `/formats/${params.slug}`;
    const { owning, faqs } = formatPage(single);
    return (
      <>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline:
              lang === 'zh'
                ? `${single.name} 量化格式说明`
                : `${single.name} explained: what it is, what reads it, and what it costs`,
            url: canonical(path),
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            description:
              lang === 'zh'
                ? `${single.description.zh} 本索引 ${models.length} 个模型中有 ${owning.length} 个提供该格式。`
                : `${single.description.en} ${owning.length} of the ${models.length} models in this index ship in it.`,
            author: { '@type': 'Organization', name: 'quantized.uk' },
            publisher: { '@type': 'Organization', name: 'quantized.uk' },
          }}
        />
        {/* Same call the view renders, so the questions cannot diverge. */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q[lang],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lang] },
            })),
          }}
        />
        <FormatSingleContent format={single} />
      </>
    );
  }

  const pair = pairBySlug(params.slug);
  if (!pair) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">Comparison not found</h1>
      </div>
    );
  }
  const path = lang === 'zh' ? `/zh/formats/${params.slug}` : `/formats/${params.slug}`;
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
