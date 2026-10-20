'use client';

import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type { QuantVariant } from '@/lib/data/types';
import { fileGB, groupedBytes, repoUrl, sizingBasis } from '@/lib/utils/quant-source';

/**
 * One line saying which published file a quant row is sized from — repo, file name, exact bytes,
 * parts, the separate mmproj, and when the listing was read — or, with no recorded file, which of
 * the two other bases the size rests on. Shared by the model page, the calculator and the GPU
 * pages so the three cannot describe the same row differently.
 */
export default function QuantFileLine({ quant, compact = false }: { quant: QuantVariant; compact?: boolean }) {
  const { t } = useLanguage();
  const d = t.hub.detail;
  const src = quant.source;
  if (!src) {
    return (
      <span className="text-slate-500">
        {sizingBasis(quant) === 'generic' ? d.basisGeneric : d.basisPublished}
      </span>
    );
  }
  return (
    <span className="text-slate-400 break-words">
      <a
        href={repoUrl(src)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-0.5 font-mono"
      >
        {src.repo}
        <ExternalLink size={9} />
      </a>
      {' · '}
      {src.file
        ? <span className="font-mono text-slate-300">{src.file}</span>
        : <span className="text-slate-500">{d.fileUnnamed}</span>}
      {' · '}
      <span className="font-mono text-slate-300">{fileGB(src.bytes)} GB</span>
      {!compact && <span className="text-slate-500"> ({groupedBytes(src.bytes)} {d.fileBytes})</span>}
      {src.parts ? <>{' · '}{d.fileParts.replace('{n}', String(src.parts))}</> : null}
      {src.mmprojBytes ? <>{' · '}{d.fileMmproj.replace('{gb}', fileGB(src.mmprojBytes))}</> : null}
      {' · '}
      <span className="text-slate-500">{d.fileChecked.replace('{date}', src.checkedAt)}</span>
    </span>
  );
}
