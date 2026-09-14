import { gpuDatabase } from '@/lib/data/gpus';
import { gpuBySlug, gpuSlug, countModelsFitting } from '@/lib/utils/gpu-page';
import { homePicks } from '@/lib/utils/home-picks';
import { quantLevelKey } from '@/lib/utils/recommend';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk 显卡页';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return gpuDatabase.map(g => ({ gpuId: gpuSlug(g) }));
}

export default function Image({ params }: { params: { gpuId: string } }) {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) {
    return renderOgImage({ eyebrow: '显卡', title: '未找到', stats: [] });
  }
  const fitCount = countModelsFitting(gpu, 'comfortable');
  const [top] = homePicks(gpu, 'chat');
  return renderOgImage({
    eyebrow: '显卡',
    title: gpu.name,
    stats: [
      `${gpu.vram} GB 显存`,
      `${fitCount} 个模型可从容运行`,
    ],
    footer: top ? `推荐：${top.model.name} · ${quantLevelKey(top.quant)}` : undefined,
  });
}
