import { ExternalLink } from 'lucide-react';
import CopyButton from '@/components/ui/CopyButton';
import { macModelOptions } from '@/lib/data/mac-models';
import { translations, type Lang } from '@/lib/i18n/translations';

export default function MacModelSetup({ modelId, lang = 'en' }: { modelId: string; lang?: Lang }) {
  const t = translations[lang];
  const options = macModelOptions(modelId);
  if (!options) return null;

  const d = t.hub.detail.mac;
  return (
    <section className="glass mb-8 rounded-2xl p-4 sm:p-5" aria-labelledby="mac-model-setup">
      <h2 id="mac-model-setup" className="text-lg font-semibold text-slate-200">{d.title}</h2>
      <p className="mt-1 text-sm text-slate-400">{d.summary}</p>
      <a
        href={options.repoUrl}
        className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 text-sm text-violet-300 hover:text-white"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="break-all font-mono">{options.repo}</span>
        <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-black/20 p-3">
        <code className="min-w-0 flex-1 basis-[min(100%,26rem)] break-words text-sm text-slate-200">{options.command}</code>
        <CopyButton
          text={options.command}
          label={d.copyCommand}
          copiedLabel={t.hub.detail.hfCopied}
          failedLabel={d.copyFailed}
          className="min-h-11 shrink-0"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={options.studioUrl} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold glass glass-hover text-violet-300 hover:text-white">
          {d.openStudio}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <p className="text-sm text-slate-400">{d.studioFallback}</p>
      </div>
    </section>
  );
}
