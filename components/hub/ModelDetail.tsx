import Link from '@/components/i18n/LocalLink';
import { Calculator, ExternalLink, Zap } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { translations, type Lang } from '@/lib/i18n/translations';
import { QuantModel, models } from '@/lib/data/models';
import { gpuDisplayName } from '@/lib/data/gpus';
import { cn } from '@/lib/utils/cn';
import { bestQuant as pickBestQuant, formatLoss, referenceQuant } from '@/lib/utils/quality';
import { sizeAt4K } from '@/lib/utils/quant-source';
import { quantLevelKey } from '@/lib/utils/recommend';
import MacModelSetup from '@/components/hub/MacModelSetup';
import ModelQuickRun, { type QuickRunTab } from '@/components/hub/ModelQuickRun';
import ModelExplainer from '@/components/hub/ModelExplainer';
import ModelPlacement from '@/components/hub/ModelPlacement';
import ModelGuides from '@/components/hub/ModelGuides';
import { getHFStats, formatDownloads, hfStats } from '@/lib/data/hf-stats';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { modelscopeRepoMap } from '@/lib/data/modelscope-repos';
import SimilarModels from '@/components/hub/SimilarModels';
import ModelCardBadge from '@/components/hub/ModelCardBadge';
import QuantFileLine from '@/components/hub/QuantFileLine';
import RelatedReports from '@/components/reports/RelatedReports';
import RerankerLink from '@/components/tools/RerankerLink';
import CopyButton from '@/components/ui/CopyButton';
import PageFreshnessNote from '@/components/layout/PageFreshnessNote';
import { getSimilarModels } from '@/lib/utils/related';
import { activeParamsB, isMoE, isSuperseded, quantConfidence, supersededDiffNote } from '@/lib/utils/model-meta';
import { hasImageInput, licenceOf } from '@/lib/utils/model-facts';
import { canOfferOllamaLaunch, generateCLI, ggufFileGB } from '@/lib/utils/cli';
import { guideLinksForModel } from '@/lib/utils/model-guides';
import { pairHref, pairPages } from '@/lib/utils/pair-pages';

const formatColors: Record<string, string> = {
  GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
};

const hwColors: Record<string, string> = {
  'consumer-gpu': 'bg-green-500/10 text-green-400 border-green-500/20',
  mac: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'cpu-vps': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'pro-gpu': 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  model: QuantModel;
  lang?: Lang;
}

export default function ModelDetail({ model, lang = 'en' }: Props) {
  const t = translations[lang];
  const d = t.hub.detail;
  const hf = getHFStats(model.id);
  const hfRepo = hf?.repo ?? hfRepoMap[model.id as keyof typeof hfRepoMap];
  const modelscopeRepo = modelscopeRepoMap[model.id];

  const bestQuant = pickBestQuant(model.quants);
  const defaultQuant = referenceQuant(model.quants);
  const licence = licenceOf(model.id);
  const multimodal = hasImageInput(model.id);
  const moeActive = isMoE(model) ? activeParamsB(model) : undefined;
  const pairs = pairPages().filter(p => p.model.id === model.id);
  const guides = guideLinksForModel(model);

  const compareTarget = getSimilarModels(model.id, 1)[0]?.id ?? 'qwen2.5-7b';
  const defaultHfUrl = hfRepo
    ? `https://huggingface.co/${hfRepo}`
    : defaultQuant.hfSearchUrl;

  const calcUrl = (quantLevel: string) =>
    `/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(quantLevel)}&ctx=4096&batch=1`;

  // Pre-generate quick launch commands on the server using the shared CLI generator.
  const quickRunTabs: QuickRunTab[] = [];
  const src = defaultQuant.format === 'GGUF' ? defaultQuant.source : undefined;
  const runRepo = src?.repo ?? hfRepo;
  const filename = (src?.parts ?? 1) === 1 ? src?.file : undefined;
  const shardStem = (src?.parts ?? 1) > 1 ? src?.file?.split('/').pop()?.replace(/-\d+-of-\d+\.gguf$/, '') : undefined;

  if (defaultQuant.format === 'GGUF') {
    const llamaOut = generateCLI({
      framework: 'llamacpp',
      env: 'linux',
      modelId: model.id,
      modelName: model.name,
      hfRepo: runRepo,
      ggufFilename: filename,
      ggufShardStem: shardStem,
      quantLevel: defaultQuant.level,
      fileGB: ggufFileGB(model, defaultQuant.level),
      gpuLayers: 99,
      contextLen: 4096,
      threads: 8,
      port: 8080,
      backend: 'cuda',
      lang,
    });
    quickRunTabs.push({
      id: 'llamacpp',
      label: 'llama.cpp',
      command: llamaOut.command,
      isTemplate: !filename || /<hf-[^>]+-repo-id>/.test(llamaOut.command),
    });

    if (canOfferOllamaLaunch(model.id, runRepo) && (filename || /-GGUF$/i.test(runRepo ?? ''))) {
      const ollamaOut = generateCLI({
        framework: 'ollama',
        env: 'linux',
        modelId: model.id,
        modelName: model.name,
        hfRepo: runRepo,
        ggufFilename: filename,
        ggufShardStem: shardStem,
        quantLevel: defaultQuant.level,
        fileGB: ggufFileGB(model, defaultQuant.level),
        gpuLayers: 99,
        contextLen: 4096,
        threads: 8,
        port: 11434,
        lang,
      });
      quickRunTabs.push({
        id: 'ollama',
        label: 'Ollama',
        command: ollamaOut.command,
        isTemplate: !filename || /<hf-[^>]+-repo-id>/.test(ollamaOut.command),
      });
    }
  } else if (defaultQuant.format === 'AWQ' || defaultQuant.format === 'GPTQ') {
    const vllmOut = generateCLI({
      framework: 'vllm',
      env: 'linux',
      modelId: model.id,
      modelName: model.name,
      hfRepo: runRepo,
      quantLevel: `${defaultQuant.format} ${defaultQuant.level}`,
      gpuLayers: 99,
      contextLen: 4096,
      threads: 8,
      port: 8000,
      lang,
    });
    quickRunTabs.push({
      id: 'vllm',
      label: 'vLLM',
      command: vllmOut.command,
      isTemplate: true,
    });
  }

  const contextFormatted = model.contextLength >= 1048576
    ? `${(model.contextLength / 1048576).toFixed(0)}M`
    : model.contextLength >= 1000
      ? `${(model.contextLength / 1024).toFixed(0)}K`
      : String(model.contextLength);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.quantHub, href: '/quant-hub/' },
          { label: model.name },
        ]}
      />

      {/* Top Hero Header */}
      <header className="mb-8 pb-6 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">{model.name}</h1>
          <span className="badge bg-violet-500/15 text-violet-300 border-violet-500/25 font-mono">
            {model.paramLabel}
          </span>
          {licence && (
            <a
              href={licence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="badge bg-white/[0.04] text-slate-300 border-white/[0.1] hover:border-violet-400/40 transition-colors"
            >
              {licence.short} ↗
            </a>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-3">{model.family}</p>

        {isSuperseded(model) && (() => {
          const successor = model.supersededBy ? models.find(m => m.id === model.supersededBy) : undefined;
          return (
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90 max-w-3xl">
              <p>
                <span className="font-semibold">⚠ {t.hub.model.superseded}</span>
                {successor && (
                  <>
                    {' · '}
                    <Link href={`/quant-hub/${successor.id}/`} className="underline text-amber-100 hover:text-white">
                      {t.hub.model.prefer.replace('{name}', successor.name)}
                    </Link>
                  </>
                )}
              </p>
              {successor && (
                <p className="mt-1.5 text-amber-200/70">
                  {t.hub.model.supersededBody
                    .replace('{name}', successor.name)
                    .replace('{reason}', supersededDiffNote(model, successor, lang))}
                  {' '}
                  <Link
                    href={`/tools/compare/?a=${model.id}&b=${successor.id}`}
                    className="underline text-amber-100 hover:text-white whitespace-nowrap"
                  >
                    {t.hub.model.compareLink} →
                  </Link>
                </p>
              )}
            </div>
          );
        })()}

        <p className="text-slate-300 max-w-4xl leading-relaxed text-[15px]">{model.description[lang]}</p>

        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <Link
            href={calcUrl(quantLevelKey(defaultQuant))}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors glow-purple"
          >
            <Calculator size={14} />
            {d.calcVram}
          </Link>
          <a
            href={hfRepo ? `https://huggingface.co/${hfRepo}` : (model.quants[0]?.hfSearchUrl ?? '#')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl glass glass-hover text-slate-200 text-sm font-semibold transition-colors"
          >
            {t.hub.model.viewHF}
            <ExternalLink size={14} />
          </a>
          {modelscopeRepo && (
            <a
              href={`https://modelscope.cn/models/${modelscopeRepo}/files`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl glass glass-hover text-slate-200 text-sm font-semibold transition-colors"
            >
              {t.hub.model.viewModelScope.replace('{uploader}', modelscopeRepo.split('/')[0])}
              <ExternalLink size={14} />
            </a>
          )}
          <Link
            href={`/tools/compare/?a=${model.id}&b=${compareTarget}`}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl glass glass-hover text-slate-300 text-sm font-semibold transition-colors"
          >
            {d.compare}
          </Link>
          <CopyButton
            text={defaultHfUrl}
            label={d.copyHfSearch}
            copiedLabel={d.hfCopied}
          />
        </div>
      </header>

      {/* Two-Column Content + Sticky Specs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Left Primary Column */}
        <div className="space-y-6 min-w-0">
          <MacModelSetup modelId={model.id} lang={lang} />

          <ModelQuickRun
            tabs={quickRunTabs}
            title={d.quickRunTitle}
            subtitle={d.quickRunSub.replace('{quant}', `${defaultQuant.format} ${defaultQuant.level}`)}
            copyLabel={t.calc.launchCopy}
            copyTemplateLabel={t.calc.launchCopyTemplate}
            copiedLabel={d.hfCopied}
            cliHref={`/tools/cli-gen/?model=${model.id}`}
            openCliLabel={d.openCliGen}
          />

          {/* Quantization Variants Table */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-slate-100">{d.quantTable}</h2>
              <p className="text-xs text-slate-400 mt-1">{d.quantTableSub}</p>
              <p className="text-[11px] text-slate-500 mt-1">{t.hub.confidence.legend}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-white/[0.06] bg-white/[0.015]">
                    <th className="text-left px-4 sm:px-5 py-3 font-medium">{d.colFormat}</th>
                    <th className="text-left px-3 py-3 font-medium">{d.colLevel}</th>
                    <th className="text-right px-3 py-3 font-medium">{d.colBpw}</th>
                    <th className="text-right px-3 py-3 font-medium">{d.colVram}</th>
                    <th className="text-right px-3 py-3 font-medium">{d.colPplLoss}</th>
                    <th className="text-right px-3 py-3 font-medium">{d.colSpeed}</th>
                    <th className="text-left px-3 py-3 font-medium">{t.hub.confidence.col}</th>
                    <th className="text-right px-4 sm:px-5 py-3 font-medium">{d.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {model.quants.map((quant, i) => {
                    const level = quantLevelKey(quant);
                    const isBest = quant === bestQuant;
                    const isRef = quant === defaultQuant;
                    const conf = quantConfidence(model.id, quant);
                    return (
                      <tr
                        key={`${quant.format}-${quant.level}-${i}`}
                        className={cn(
                          'border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors',
                          isRef && 'bg-violet-500/[0.04]',
                        )}
                      >
                        <td className="px-4 sm:px-5 py-3">
                          <span className={cn('badge text-xs font-mono', formatColors[quant.format])}>
                            {quant.format}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-200 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            {quant.level}
                            {isBest && <Zap size={11} className="text-amber-400" aria-label={d.bestQuality} />}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-400">{quant.bpw}</td>
                        <td className="px-3 py-3 text-right font-mono font-medium text-violet-300 whitespace-nowrap">
                          {sizeAt4K(model, quant).toFixed(1)} GB
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-400">{formatLoss(quant)}</td>
                        <td className="px-3 py-3 text-right font-mono text-orange-300 whitespace-nowrap">
                          {quant.speedRTX4090 ? `${quant.speedRTX4090} tok/s` : '—'}
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            'badge text-[10px]',
                            conf === 'measured' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            conf === 'community' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                            conf === 'estimated' && 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                          )}>
                            {t.hub.confidence[conf]}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={calcUrl(level)}
                              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              {d.calc}
                            </Link>
                            <a
                              href={quant.hfSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-0.5"
                            >
                              HF
                              <ExternalLink size={9} />
                            </a>
                            <CopyButton
                              text={quant.hfSearchUrl}
                              label={d.copyLink}
                              copiedLabel={d.hfCopied}
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-slate-300">{d.filesTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">{d.filesSub}</p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {model.quants.map((quant, i) => (
                  <li key={`src-${quant.format}-${quant.level}-${i}`} className="flex flex-wrap sm:flex-nowrap gap-2">
                    <span className="font-mono text-slate-300 shrink-0 w-28">{quant.format} {quant.level}</span>
                    <QuantFileLine quant={quant} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ModelExplainer model={model} lang={lang} bare />
          <ModelPlacement model={model} lang={lang} />
          <ModelGuides guides={guides} lang={lang} />
        </div>

        {/* Right Sticky Specs & Ecosystem Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          {/* Compact Model Specifications Card */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
              {d.specsTitle}
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                <dt className="text-slate-500">{d.totalParams}</dt>
                <dd className="font-mono font-semibold text-slate-200">{model.params.toFixed(2)}B</dd>
              </div>
              {moeActive !== undefined && (
                <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                  <dt className="text-slate-500">{d.activeParams}</dt>
                  <dd className="font-mono font-semibold text-cyan-300">{moeActive}B</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                <dt className="text-slate-500">{d.context}</dt>
                <dd className="font-mono font-semibold text-slate-200">{contextFormatted}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                <dt className="text-slate-500">{d.bestQuality}</dt>
                <dd className="font-mono text-violet-300">{bestQuant.format} {bestQuant.level}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                <dt className="text-slate-500">{d.bestAccuracy}</dt>
                <dd className="font-mono text-slate-300">
                  {bestQuant.pplLossPercent === undefined ? '—' : `+${bestQuant.pplLossPercent.toFixed(1)}%`}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                <dt className="text-slate-500">{d.modality}</dt>
                <dd className="text-slate-300 text-xs font-medium">
                  {multimodal ? d.multimodal : d.textOnly}
                </dd>
              </div>
              {licence && (
                <div className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.04]">
                  <dt className="text-slate-500">{d.licence}</dt>
                  <dd className="text-right">
                    <a
                      href={licence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-cyan-300 hover:underline"
                    >
                      {licence.short} ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {model.hardwareTags.map(hw => (
                <span key={hw} className={cn('badge text-[11px]', hwColors[hw])}>
                  {t.hub.hardware[hw as keyof typeof t.hub.hardware] ?? hw}
                </span>
              ))}
            </div>

            {hf && hf.downloads > 0 && (
              <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-xs text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>⬇ {formatDownloads(hf.downloads)} {d.hfDownloads}</span>
                  <span>♥ {hf.likes} {d.hfLikes}</span>
                </div>
                {hfRepo && (
                  <a
                    href={`https://huggingface.co/${hfRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-violet-400 hover:text-violet-300 font-mono"
                  >
                    {hfRepo}
                  </a>
                )}
                <p className="text-[11px] text-slate-600">
                  {d.hfFetched} {new Date(hfStats.fetchedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </section>

          {/* Popular GPU Pair Answers */}
          {pairs.length > 0 && (
            <section className="rounded-2xl border border-white/[0.08] bg-[#111218] p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">{t.pair.cards}</h2>
              <ul className="flex flex-wrap gap-2">
                {pairs.map(p => (
                  <li key={p.gpu.id}>
                    <Link
                      href={pairHref(model, p.gpu)}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-violet-500/15 text-violet-300 border border-white/[0.08] hover:border-violet-500/30 transition-colors"
                    >
                      {gpuDisplayName(p.gpu, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ModelCardBadge key={model.id} modelId={model.id} />
          <RelatedReports modelId={model.id} lang={lang} />
          <RerankerLink placement="model" />
        </aside>
      </div>

      {/* Full-width Similar Models & Freshness Footer */}
      <SimilarModels modelId={model.id} lang={lang} />
      <div className="mt-8">
        <PageFreshnessNote lang={lang} />
      </div>
    </div>
  );
}
