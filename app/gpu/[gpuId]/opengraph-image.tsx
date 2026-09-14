import { gpuDatabase } from '@/lib/data/gpus';
import { gpuBySlug, gpuSlug, countModelsFitting } from '@/lib/utils/gpu-page';
import { homePicks } from '@/lib/utils/home-picks';
import { quantLevelKey } from '@/lib/utils/recommend';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk GPU page';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return gpuDatabase.map(g => ({ gpuId: gpuSlug(g) }));
}

export default function Image({ params }: { params: { gpuId: string } }) {
  const gpu = gpuBySlug(params.gpuId);
  if (!gpu) {
    return renderOgImage({ eyebrow: 'GPU', title: 'Not found', stats: [] });
  }
  const fitCount = countModelsFitting(gpu, 'comfortable');
  const [top] = homePicks(gpu, 'chat');
  return renderOgImage({
    eyebrow: 'GPU',
    title: gpu.name,
    stats: [
      `${gpu.vram} GB VRAM`,
      `${fitCount} models fit comfortably`,
    ],
    footer: top ? `Top pick: ${top.model.name} at ${quantLevelKey(top.quant)}` : undefined,
  });
}
