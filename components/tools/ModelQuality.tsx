'use client';

import { useLanguage } from '@/lib/i18n/context';
import { LIVEBENCH_RELEASE_URL, liveBenchScores } from '@/lib/data/model-quality';

export function ModelQualityScore({ modelId }: { modelId: string }) {
  const { t } = useLanguage();
  const result = liveBenchScores.get(modelId);
  if (!result) return null;

  const [score, release] = result;
  return (
    <a href={LIVEBENCH_RELEASE_URL + release} className="rounded-md bg-sky-400/10 px-1.5 py-0.5 text-xs text-sky-200 hover:underline underline-offset-2">
      {t.calc.modelQualityScore.replace('{score}', score.toFixed(1)).replace('{release}', release)}
    </a>
  );
}

export function ModelQualityNote() {
  const { t } = useLanguage();
  return <p className="text-xs leading-relaxed text-slate-400">{t.calc.modelQualityNote}</p>;
}
