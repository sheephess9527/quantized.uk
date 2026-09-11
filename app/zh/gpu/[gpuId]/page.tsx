import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import GpuPage from '../../../gpu/[gpuId]/page';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { fitsOnGpu, gpuBySlug, gpuPageDescription } from '@/lib/utils/gpu-page';

export { generateStaticParams } from '../../../gpu/[gpuId]/page';

export default function ZhGpuPage({ params }: { params: { gpuId: string } }) {
  return <GpuPage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { gpuId: string } }): Metadata {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) return { title: '未找到该显卡 | quantized.uk' };
  const path = `/zh/gpu/${params.gpuId}`;
  const url = canonical(path);
  const count = fitsOnGpu(gpu).length;
  const title = `${gpu.name} 能跑哪些大模型？| quantized.uk`;
  const description = gpuPageDescription(gpu, 'zh');
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}
