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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="mac-model-setup" className="text-lg font-semibold text-slate-200">{d.title}</h2>
        {options.weightGiB !== undefined && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-xs font-mono text-sky-300">
            {lang === 'zh'
              ? `MLX 4-bit (g${options.groupSize ?? 64}) · ${options.weightGiB} GiB · ${options.shards} 个分片`
              : `MLX 4-bit (g${options.groupSize ?? 64}) · ${options.weightGiB} GiB · ${options.shards} shard${options.shards === 1 ? '' : 's'}`}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-400">{d.summary}</p>
      <a
        href={options.repoUrl}
        className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 text-sm text-sky-300 hover:text-slate-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="break-all font-mono">{options.repo}</span>
        <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-bg-recessed p-3">
        <code className="min-w-0 flex-1 basis-[min(100%,26rem)] break-words text-sm text-slate-200">{options.command}</code>
        <CopyButton
          text={options.command}
          label={d.copyCommand}
          copiedLabel={t.hub.detail.hfCopied}
          failedLabel={d.copyFailed}
          className="min-h-11 shrink-0"
        />
      </div>
      {options.serverCommand && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-bg-recessed p-3">
          <code className="min-w-0 flex-1 basis-[min(100%,26rem)] break-words text-sm text-slate-200">{options.serverCommand}</code>
          <CopyButton
            text={options.serverCommand}
            label={lang === 'zh' ? '复制 API 服务命令' : 'Copy API server'}
            copiedLabel={t.hub.detail.hfCopied}
            failedLabel={d.copyFailed}
            className="min-h-11 shrink-0"
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={options.studioUrl} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold glass glass-hover text-sky-300 hover:text-slate-100">
          {d.openStudio}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <p className="text-sm text-slate-400">{d.studioFallback}</p>
      </div>
    </section>
  );
}

