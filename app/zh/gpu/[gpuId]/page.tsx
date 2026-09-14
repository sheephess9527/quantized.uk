import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import GpuPage from '../../../gpu/[gpuId]/page';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';
import { countModelsFitting, fitsOnGpu, gpuBySlug, gpuPageDescription } from '@/lib/utils/gpu-page';

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
  const comfortableCount = countModelsFitting(gpu, 'comfortable');
  const ogAlt = `${gpu.name}：${gpu.vram}GB 显存，${comfortableCount} 个模型可从容运行 | quantized.uk`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [pageOgImage(path, ogAlt)], ...ogLocale(path) },
  };
}
