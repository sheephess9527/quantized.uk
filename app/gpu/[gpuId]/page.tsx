import type { Metadata } from 'next';
import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import GpuPageContent from '@/components/gpu/GpuPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { fitsOnGpu, gpuBySlug, gpuSlug } from '@/lib/utils/gpu-page';

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
  const description = `${count} of ${models.length} quantized models fit comfortably in ${gpu.vram}GB at 4K context, each with its best quant level, estimated VRAM and headroom.`;
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
          numberOfItems: fits.length,
          itemListElement: fits.slice(0, 30).map((fit, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: fit.model.name,
            url: canonical(lang === 'zh' ? `/zh/quant-hub/${fit.model.id}` : `/quant-hub/${fit.model.id}`),
          })),
        }}
      />
      <GpuPageContent gpu={gpu} />
    </>
  );
}
