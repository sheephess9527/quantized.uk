import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import GpuPage from '../../../gpu/[gpuId]/page';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';
import { fitsOnGpu, gpuBySlug } from '@/lib/utils/gpu-page';

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
  const description = `在 ${gpu.vram}GB、4K 上下文下，${models.length} 个量化模型中有 ${count} 个可从容运行，附各自最佳量化档位、预估显存与余量。`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}
