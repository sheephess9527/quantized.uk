'use client';

import { useLanguage } from '@/lib/i18n/context';
import { RERANKER_URL } from '@/lib/site';

export default function RerankerLink({ placement }: { placement: 'model' | 'vram' }) {
  const { t, lang } = useLanguage();
  const href = `${RERANKER_URL}${lang === 'zh' ? '/zh' : ''}/reranker-picker?utm_source=quantized.uk&utm_medium=referral&utm_campaign=rag_tools&utm_content=${placement}`;
  return <aside className="mb-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-3 text-sm">
    <span className="text-slate-400">{t.crossTools.rerankerBody}{' '}</span>
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-cyan-300 hover:underline">
      {t.crossTools.chooseReranker} ↗
    </a>
    <span className="ml-1 text-xs text-slate-500">reranker.uk</span>
  </aside>;
}
