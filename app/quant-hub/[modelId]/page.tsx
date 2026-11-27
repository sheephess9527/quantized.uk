import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import ModelDetail from '@/components/hub/ModelDetail';
import { modelExplainer } from '@/lib/utils/model-explainer';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical, defaultRobots, feedAlternates, languageAlternates, modelPageTitle, ogLocale, pageOgImage } from '@/lib/seo';
import { isSuperseded } from '@/lib/utils/model-meta';
import { bestQuant, referenceQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { sizeAt, REF_CONTEXT } from '@/lib/utils/model-explainer';
import { modelMetaDescription } from '@/lib/utils/meta-description';
import { translations } from '@/lib/i18n/translations';
import { gpuDisplayName } from '@/lib/data/gpus';

export function generateStaticParams() {
  return models.map(m => ({ modelId: m.id }));
}

export function generateMetadata({ params }: { params: { modelId: string } }): Metadata {
  const model = models.find(m => m.id === params.modelId);
  if (!model) return { title: 'Model Not Found | quantized.uk' };
  const url = canonical(`/quant-hub/${model.id}`);
  const path = `/quant-hub/${model.id}`;
  const description = modelMetaDescription(model, 'en');
  const quant = bestQuant(model.quants);
  const { totalGB } = sizeAt(model, quant, REF_CONTEXT);
  const ref = referenceQuant(model.quants);
  const refGB = sizeAt(model, ref, REF_CONTEXT).totalGB;
  const retainedPart = quant.pplLossPercent === undefined ? '' : `, ${(100 - quant.pplLossPercent).toFixed(1)}% retained`;
  const ogAlt = `${model.name}: ${model.paramLabel}, ${quantLevelKey(quant)}, ${totalGB.toFixed(1)} GB${retainedPart} | quantized.uk`;
  return {
    title: modelPageTitle(model.name, quantLevelKey(ref), refGB),
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: {
      title: `${model.name} | quantized.uk`,
      description,
      url,
      images: [pageOgImage(path, ogAlt)],
      ...ogLocale(path),
    },
  };
}

/**
 * Shared by `/quant-hub/[modelId]` and its `/zh` mirror, which re-exports this
 * component. `lang` is what keeps the structured data honest: JSON-LD emitted
 * on a Chinese page must describe the Chinese page, not point back at the
 * English URL its own canonical tag disowns.
 */
export default function ModelDetailPage({
  params,
  lang = 'en',
}: {
  params: { modelId: string };
  lang?: 'en' | 'zh';
}) {
  const model = models.find(m => m.id === params.modelId);
  if (!model) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-slate-300 mb-4">Model not found</h1>
        <a
          href={lang === 'zh' ? '/zh/quant-hub/' : '/quant-hub/'}
          className="text-sky-400 hover:text-sky-300 text-sm"
        >
          ← Back to Quant Hub
        </a>
      </div>
    );
  }
  const path = lang === 'zh' ? `/zh/quant-hub/${model.id}` : `/quant-hub/${model.id}`;
  const url = canonical(path);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: model.name,
          applicationCategory: 'LLM',
          description: lang === 'zh' ? model.description.zh : model.description.en,
          url,
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          operatingSystem: 'Cross-platform',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      {/*
        The FAQ a crawler is shown is the one the reader is shown — same
        `modelExplainer(model)` call on both sides, so the schema cannot
        describe questions the page does not answer.
      */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          mainEntity: modelExplainer(model).faqs.map(f => ({
            '@type': 'Question',
            name: f.q[lang],
            acceptedAnswer: { '@type': 'Answer', text: f.a[lang] },
          })),
        }}
      />
      <ModelDetail model={model} lang={lang} />
    </>
  );
}