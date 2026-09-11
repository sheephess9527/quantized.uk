import type { Metadata } from 'next';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import GpuPageContent from '@/components/gpu/GpuPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { fitsOnGpu, gpuBySlug, gpuSlug, gpuPageDescription } from '@/lib/utils/gpu-page';
import { gpuExplainer } from '@/lib/utils/gpu-explainer';

export function generateStaticParams() {
  return gpuDatabase.map(g => ({ gpuId: gpuSlug(g) }));
}

export function generateMetadata({ params }: { params: { gpuId: string } }): Metadata {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) return { title: 'GPU not found | quantized.uk' };
  const path = `/gpu/${params.gpuId}`;
  const url = canonical(path);
  const count = fitsOnGpu(gpu).length;
  const title = `${gpu.name} — what LLMs can it run? | quantized.uk`;
  const description = gpuPageDescription(gpu, 'en');
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

/** Shared with the `/zh` mirror; `lang` keeps the structured data on the right page. */
export default function GpuPage({ params, lang = 'en' }: { params: { gpuId: string }; lang?: 'en' | 'zh' }) {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300">GPU not found</h1>
      </div>
    );
  }
  const path = lang === 'zh' ? `/zh/gpu/${params.gpuId}` : `/gpu/${params.gpuId}`;
  const fits = fitsOnGpu(gpu);
  // Same call `GpuPageContent` renders, so every question in this schema is
  // visible on the page — which is the condition for emitting FAQPage at all.
  const { faqs } = gpuExplainer(gpu);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name:
            lang === 'zh'
              ? `${gpu.name} 可运行的量化模型`
              : `Quantized models that run on a ${gpu.name}`,
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          // The page renders every fit, grouped by parameter bucket, with no
          // truncation — so the list and its count have to agree. This said
          // `numberOfItems: 73` above 30 emitted items, which is structured
          // data describing a page that does not exist.
          numberOfItems: fits.length,
          itemListElement: fits.map((fit, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: fit.model.name,
            url: canonical(lang === 'zh' ? `/zh/quant-hub/${fit.model.id}` : `/quant-hub/${fit.model.id}`),
          })),
        }}
      />
      {faqs.length > 0 && (
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
      )}
      <GpuPageContent gpu={gpu} />
    </>
  );
}
