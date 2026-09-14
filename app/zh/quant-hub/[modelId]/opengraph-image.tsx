import { models } from '@/lib/data/models';
import { bestQuant } from '@/lib/utils/quality';
import { quantLevelKey } from '@/lib/utils/recommend';
import { sizeAt, cardsFitting, REF_CONTEXT } from '@/lib/utils/model-explainer';
import { renderOgImage, OG_SIZE } from '@/lib/og/render';

export const alt = 'quantized.uk 模型页';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return models.map(m => ({ modelId: m.id }));
}

export default function Image({ params }: { params: { modelId: string } }) {
  const model = models.find(m => m.id === params.modelId);
  if (!model) {
    return renderOgImage({ eyebrow: '模型', title: '未找到', stats: [] });
  }
  const quant = bestQuant(model.quants);
  const { totalGB } = sizeAt(model, quant.bpw, REF_CONTEXT);
  const smallest = cardsFitting(totalGB)[0];
  return renderOgImage({
    eyebrow: '模型',
    title: model.name,
    stats: [
      `${model.paramLabel} · ${quantLevelKey(quant)} · ${totalGB.toFixed(1)} GB`,
      ...(quant.pplLossPercent === undefined ? [] : [`保留 ${(100 - quant.pplLossPercent).toFixed(1)}% 精度`]),
    ],
    footer: smallest ? `可运行：${smallest.name}` : undefined,
  });
}
