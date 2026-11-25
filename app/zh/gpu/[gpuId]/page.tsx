import type { Metadata } from 'next';
import { gpuDisplayName } from '@/lib/data/gpus';
import GpuPage from '../../../gpu/[gpuId]/page';
import { gpuMetaDescription } from '@/lib/utils/meta-description';
import { canonical, defaultRobots, feedAlternates, fitTitle, languageAlternates, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';
import { countModelsFitting, gpuBySlug } from '@/lib/utils/gpu-page';

export { generateStaticParams } from '../../../gpu/[gpuId]/page';

export default function ZhGpuPage({ params }: { params: { gpuId: string } }) {
  return <GpuPage params={params} lang="zh" />;
}

export function generateMetadata({ params }: { params: { gpuId: string } }): Metadata {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) return { title: '未找到该显卡 | quantized.uk' };
  const path = `/zh/gpu/${params.gpuId}`;
  const url = canonical(path);
  const label = gpuDisplayName(gpu, 'zh');
  const title = fitTitle(`${label} 能跑哪些大模型？`);
  const description = gpuMetaDescription(gpu, 'zh');
  const comfortableCount = countModelsFitting(gpu, 'comfortable');
  const ogAlt = `${label}：${gpu.vram}GB 显存，${comfortableCount} 个模型可从容运行 | quantized.uk`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [pageOgImage(path, ogAlt)], ...ogLocale(path) },
  };
}
