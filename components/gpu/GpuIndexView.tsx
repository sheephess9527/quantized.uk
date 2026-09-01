import GpuIndexContent from '@/components/gpu/GpuIndexContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical } from '@/lib/seo';
import { gpuDatabase } from '@/lib/data/gpus';
import { gpuSlug } from '@/lib/utils/gpu-page';

/**
 * Lives outside `app/` on purpose: Next validates the prop type of a route's
 * default export, and a non-dynamic page may only take `params`/`searchParams`.
 * The shared body therefore sits here, and both route files render it.
 */
export default function GpuIndexView({ lang }: { lang: 'en' | 'zh' }) {
  const path = lang === 'zh' ? '/zh/gpu/' : '/gpu/';
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: lang === 'zh' ? '按显卡查看可运行的模型' : 'What each GPU can run',
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          numberOfItems: gpuDatabase.length,
          itemListElement: gpuDatabase.map((gpu, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: gpu.name,
            url: canonical(`${lang === 'zh' ? '/zh' : ''}/gpu/${gpuSlug(gpu)}`),
          })),
        }}
      />
      <GpuIndexContent />
    </>
  );
}
