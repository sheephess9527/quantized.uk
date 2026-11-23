import type { Metadata } from 'next';
import { models } from '@/lib/data/models';
import GpuPage from '../../../gpu/[gpuId]/page';
import { gpuMetaDescription } from '@/lib/utils/meta-description';
import { canonical, defaultRobots, feedAlternates, displayWidth, fitTitle, languageAlternates, TITLE_LIMIT, ogLocale, pageOgImage, SITE_NAME } from '@/lib/seo';
import { countModelsFitting, fitsOnGpu, largestAtQ4, gpuBySlug, gpuPageDescription } from '@/lib/utils/gpu-page';

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
  const q4 = largestAtQ4(gpu);
  // Bing queries ask how big ("能跑多大的模型", "多少b"); a title too wide for the size keeps the plain question.
  const sized = q4 ? fitTitle(`${gpu.name} 能跑什么模型？Q4 最大约 ${q4.model.paramLabel}`) : undefined;
  const title = sized && displayWidth(sized) <= TITLE_LIMIT ? sized : fitTitle(`${gpu.name} 能跑哪些大模型？`);
  const description = gpuMetaDescription(gpu, 'zh');
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
