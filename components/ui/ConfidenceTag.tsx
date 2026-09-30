'use client';

import type { QuantVariant } from '@/lib/data/types';
import { useLanguage } from '@/lib/i18n/context';
import { quantConfidence } from '@/lib/utils/model-meta';

/**
 * A small "Estimated" / "Community" marker beside a speed. Only the model
 * detail table said where a figure came from; the Hub card, the homepage
 * picks, the calculator list and every GPU page printed 73 models' unrun
 * speeds exactly like the 10 this site measured. Renders nothing for a
 * measured row — the absence of a tag is the claim.
 */
export default function ConfidenceTag({ modelId, quant }: { modelId: string; quant: QuantVariant }) {
  const { t } = useLanguage();
  const conf = quantConfidence(modelId, quant);
  if (conf === 'measured') return null;
  return (
    <span
      title={t.hub.confidence.hint}
      className="ml-1 align-middle text-[10px] font-sans font-medium px-1 py-px rounded bg-white/[0.05] text-slate-500"
    >
      {t.hub.confidence[conf]}
    </span>
  );
}
