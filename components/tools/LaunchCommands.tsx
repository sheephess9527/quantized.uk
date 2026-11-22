'use client';

/**
 * Copy-ready launch commands inside the calculator result (Grok Bot,
 * 2026-10-14). No second command generator: every string comes from
 * `generateCLI` in `lib/utils/cli.ts`, the same code behind /tools/cli-gen/,
 * fed with the calculator's own answer — the level picked, the context, and
 * the GPU-layer count from `offloadPlan` when the model does not fit whole.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import type { GPU } from '@/lib/data/gpus';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { generateCLI, ggufFileGB, canOfferOllamaLaunch, type Framework, type Env } from '@/lib/utils/cli';
import { backendFor } from '@/lib/utils/gpu-page';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface Props {
  model: QuantModel;
  quant: QuantVariant;
  contextLen: number;
  advanced: boolean;
  gpu?: GPU;
  /** From `offloadPlan` when part of the model has to sit in system RAM. */
  gpuLayers?: number;
  /** From `offloadPlan().moe`: llama.cpp keeps every layer on the card and moves only experts. */
  cpuMoe?: { n: number; all: boolean };
}

export default function LaunchCommands({ model, quant, contextLen, gpu, gpuLayers, cpuMoe, advanced }: Props) {
  const { t, lang } = useLanguage();
  const source = quant.format === 'GGUF' ? quant.source : undefined;
  const repo = source?.repo ?? hfRepoMap[model.id as keyof typeof hfRepoMap];
  const filename = (source?.parts ?? 1) === 1 ? source?.file : undefined;
  const shardStem = (source?.parts ?? 1) > 1 ? source?.file?.split('/').pop()?.replace(/-\d+-of-\d+\.gguf$/, '') : undefined;
  const levels = useMemo(() => {
    const out: { fw: Framework; label: string; level: string }[] = [];
    if (quant.format === 'GGUF') {
      out.push({ fw: 'llamacpp', label: 'llama.cpp', level: quant.level });
      if (gpuLayers === undefined && canOfferOllamaLaunch(model.id, repo) && (filename || /-GGUF$/i.test(repo ?? ''))) out.push({ fw: 'ollama', label: 'Ollama', level: quant.level });
    }
    if (quant.format === 'AWQ' || quant.format === 'GPTQ') {
      out.push({ fw: 'vllm', label: 'vLLM', level: `${quant.format} ${quant.level}` });
    }
    return out;
  }, [quant, gpuLayers, model.id, repo, filename]);
  const [fw, setFw] = useState<Framework | null>(null);
  // Most readers are on Windows desktops, and a bash block pasted into
  // PowerShell fails on its first line. Start from Linux (what the HTML was
  // built with) and switch after mount, so hydration never sees a difference.
  const mac = gpu?.type === 'apple';
  const [os, setOs] = useState<Env>('linux');
  useEffect(() => {
    try { if (/Windows/i.test(navigator.userAgent)) setOs('windows'); } catch { /* keep linux */ }
  }, []);
  const [copiedCommand, setCopiedCommand] = useState<string>();
  const scriptRef = useRef<HTMLDetailsElement>(null);
  const active = levels.find(l => l.fw === fw) ?? levels[0];
  const out = useMemo(() => {
    if (!active) return null;
    return generateCLI({
      framework: active.fw,
      env: mac ? 'mac' : os,
      modelId: model.id,
      modelName: model.name,
      hfRepo: repo,
      ggufFilename: filename,
      ggufShardStem: shardStem,
      quantLevel: active.level,
      fileGB: ggufFileGB(model, active.level),
      // Expert offload applies to llama.cpp only; Ollama keeps its own layer split.
      gpuLayers: active.fw === 'llamacpp' && cpuMoe ? 99 : gpuLayers ?? 99,
      cpuMoe: active.fw === 'llamacpp' ? cpuMoe : undefined,
      contextLen,
      threads: 8,
      port: active.fw === 'ollama' ? 11434 : 8080,
      ollamaSetContext: active.fw === 'ollama',
      backend: gpu ? backendFor(gpu) : 'cuda',
      lang,
      gpuName: gpu?.name,
    });
  }, [active, gpu, model, gpuLayers, cpuMoe, contextLen, lang, mac, os, repo, filename]);
  if (!active || !out) return null;
  const needsSourceCheck = !filename || /<hf-[^>]+-repo-id>|<gfx-target>/.test(out.command);
  const copyLabel = needsSourceCheck ? t.calc.launchCopyTemplate : t.calc.launchCopy;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out.command);
      setCopiedCommand(out.command);
      setTimeout(() => setCopiedCommand(value => value === out.command ? undefined : value), 1500);
    } catch {
      // Open the script for manual selection when clipboard access is blocked.
      if (scriptRef.current) scriptRef.current.open = true;
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-white/[0.06]" data-testid="launch-commands">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <p className="text-xs font-medium text-slate-400">{needsSourceCheck ? t.calc.launchTemplateTitle : t.calc.launchTitle}</p>
        <div className="flex gap-1.5" role="tablist">
          {levels.map(l => (
            <button
              key={l.fw}
              role="tab"
              aria-selected={l.fw === active.fw}
              onClick={() => setFw(l.fw)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border min-h-[32px]',
                l.fw === active.fw ? 'bg-violet-500/15 text-violet-300 border-violet-500/25' : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      {!mac && (
        <div className="flex items-center gap-1.5 mb-2" role="group" aria-label={t.calc.launchOs}>
          <span className="text-[11px] text-slate-500 mr-1">{t.calc.launchOs}</span>
          {(['windows', 'linux'] as Env[]).map(o => (
            <button
              key={o}
              onClick={() => setOs(o)}
              aria-pressed={os === o}
              className={cn(
                'px-2 py-1 rounded-lg text-[11px] border min-h-[32px]',
                os === o ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
              )}
            >
              {o === 'windows' ? 'Windows' : 'Linux'}
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={copy}
          aria-label={copyLabel}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 text-xs text-violet-200 hover:bg-violet-500/25"
        >
          {copiedCommand === out.command ? <Check size={14} /> : <Copy size={14} />}
          {copiedCommand === out.command ? t.calc.launchCopied : copyLabel}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">
        {t.calc.launchNote.replace('{level}', active.level).replace('{ctx}', String(contextLen))}
        {active.fw === 'llamacpp' && cpuMoe
          ? ` ${(cpuMoe.all ? t.calc.launchMoeAll : t.calc.launchMoe).replace(/\{n\}/g, String(cpuMoe.n))}`
          : gpuLayers !== undefined && ` ${t.calc.launchOffload.replace('{n}', String(gpuLayers))}`}
      </p>
      {needsSourceCheck && <p className="mt-1.5 text-xs text-amber-300/90">{t.calc.launchTemplateNote}</p>}
      {advanced && <p className="mt-1.5 text-xs text-amber-300/90">{t.calc.runPlanAdvanced}</p>}
      {active.fw === 'vllm' && !mac && os === 'windows' && (
        <p className="mt-1.5 text-xs text-amber-300/90">{out.notes[0]}</p>
      )}
      <details ref={scriptRef} className="mt-1 min-w-0">
        <summary className="min-h-[44px] cursor-pointer py-3 text-sm text-violet-200">
          {t.calc.launchShowScript}
        </summary>
        <pre className="overflow-x-auto whitespace-pre rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-slate-300">{out.command}</pre>
        {out.notes.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {out.notes.slice(0, 3).map((n, i) => <li key={i} className="text-[11px] leading-relaxed text-slate-400">· {n}</li>)}
          </ul>
        )}
      </details>
    </div>
  );
}
