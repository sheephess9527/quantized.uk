import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import ModelDetail from '@/components/hub/ModelDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots } from '@/lib/seo';

export function generateStaticParams() {
  return models.map(m => ({ modelId: m.id }));
}

export function generateMetadata({ params }: { params: { modelId: string } }): Metadata {
  const model = models.find(m => m.id === params.modelId);
  if (!model) return { title: 'Model Not Found | quantized.uk' };
  const url = canonical(`/quant-hub/${model.id}`);
  return {
    title: `${model.name} — Quant Variants & VRAM | quantized.uk`,
    description: model.description.en,
    alternates: { canonical: url },
    robots: defaultRobots,
    openGraph: {
      title: `${model.name} | quantized.uk`,
      description: model.description.en,
      url,
      images: [{ url: '/og.svg', width: 1200, height: 630 }],
    },
  };
}

export default function ModelDetailPage({ params }: { params: { modelId: string } }) {
  const model = models.find(m => m.id === params.modelId);
  if (!model) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300 mb-4">Model not found</h1>
        <a href="/quant-hub/" className="text-violet-400 hover:text-violet-300 text-sm">
          ← Back to Quant Hub
        </a>
      </div>
    );
  }
  const url = canonical(`/quant-hub/${model.id}`);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: model.name,
          applicationCategory: 'LLM',
          description: model.description.en,
          url,
          operatingSystem: 'Cross-platform',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <ModelDetail model={model} />
    </>
  );
}