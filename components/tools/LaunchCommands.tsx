'use client';

/**
 * Copy-ready launch commands inside the calculator result (Grok Bot,
 * 2026-10-14). No second command generator: every string comes from
 * `generateCLI` in `lib/utils/cli.ts`, the same code behind /tools/cli-gen/,
 * fed with the calculator's own answer — the level picked, the context, and
 * the GPU-layer count from `offloadPlan` when the model does not fit whole.
 */
import { useEffect, useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { QuantModel, QuantVariant } from '@/lib/data/types';
import type { GPU } from '@/lib/data/gpus';
import { hfRepoMap } from '@/lib/data/hf-repos';
import { generateCLI, ggufFileGB, type Framework, type Env } from '@/lib/utils/cli';
import { backendFor, formatAllowed } from '@/lib/utils/gpu-page';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

interface Props {
  model: QuantModel;
  quant: QuantVariant;
  contextLen: number;
  gpu?: GPU;
  /** From `offloadPlan` when part of the model has to sit in system RAM. */
  gpuLayers?: number;
  /** From `offloadPlan().moe`: llama.cpp keeps every layer on the card and moves only experts. */
  cpuMoe?: { n: number; all: boolean };
}

export default function LaunchCommands({ model, quant, contextLen, gpu, gpuLayers, cpuMoe }: Props) {
  const { t, lang } = useLanguage();
  const levels = useMemo(() => {
    const gguf = quant.format === 'GGUF' ? quant : model.quants.find(q => q.format === 'GGUF' && q.level === 'Q4_K_M') ?? model.quants.find(q => q.format === 'GGUF');
    const vl = quant.format === 'AWQ' || quant.format === 'GPTQ' ? quant : model.quants.find(q => q.format === 'AWQ') ?? model.quants.find(q => q.format === 'GPTQ');
    const out: { fw: Framework; label: string; level: string }[] = [];
    if (gguf) {
      out.push({ fw: 'llamacpp', label: 'llama.cpp', level: gguf.level });
      out.push({ fw: 'ollama', label: 'Ollama', level: gguf.level });
    }
    // vLLM only where the card's backend runs that format (CUDA, or a ROCm card
    // on vLLM's list) — the same rule as every recommendation on the site — and
    // not when the answer is a CPU/GPU split, which vLLM does not do.
    if (vl && (!gpu || formatAllowed(gpu, vl.format)) && gpuLayers === undefined) out.push({ fw: 'vllm', label: 'vLLM', level: `${vl.format} ${vl.level}` });
    return out;
  }, [model, quant, gpu, gpuLayers]);
  const [fw, setFw] = useState<Framework | null>(null);
  // Most readers are on Windows desktops, and a bash block pasted into
  // PowerShell fails on its first line. Start from Linux (what the HTML was
  // built with) and switch after mount, so hydration never sees a difference.
  const mac = gpu?.type === 'apple';
  const [os, setOs] = useState<Env>('linux');
  useEffect(() => {
    try { if (/Windows/i.test(navigator.userAgent)) setOs('windows'); } catch { /* keep linux */ }
  }, []);
  const [copied, setCopied] = useState(false);
  const active = levels.find(l => l.fw === fw) ?? levels[0];
  const out = useMemo(() => {
    if (!active) return null;
    const source = model.quants.find(q => q.format === 'GGUF' && q.level === active.level)?.source;
    return generateCLI({
      framework: active.fw,
      env: mac ? 'mac' : os,
      modelId: model.id,
      modelName: model.name,
      hfRepo: source?.repo ?? hfRepoMap[model.id as keyof typeof hfRepoMap],
      ggufFilename: (source?.parts ?? 1) === 1 ? source?.file : undefined,
      quantLevel: active.level,
      fileGB: ggufFileGB(model, active.level),
      // Expert offload applies to llama.cpp only; Ollama keeps its own layer split.
      gpuLayers: active.fw === 'llamacpp' && cpuMoe ? 99 : gpuLayers ?? 99,
      cpuMoe: active.fw === 'llamacpp' ? cpuMoe : undefined,
      contextLen,
      threads: 8,
      port: 8080,
      backend: gpu ? backendFor(gpu) : 'cuda',
      lang,
      gpuName: gpu?.name,
    });
  }, [active, gpu, model, gpuLayers, cpuMoe, contextLen, lang, mac, os]);
  if (!active || !out) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked: the text stays selectable */ }
  };

  return (
    <div className="mt-4 pt-3 border-t border-white/[0.06]" data-testid="launch-commands">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <p className="text-xs font-medium text-slate-400">{t.calc.launchTitle}</p>
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
      <div className="relative">
        <pre className="text-[11px] leading-relaxed font-mono text-slate-300 bg-black/30 rounded-xl p-3 pr-12 overflow-x-auto whitespace-pre">{out.command}</pre>
        <button
          onClick={copy}
          aria-label={t.calc.launchCopy}
          className="absolute top-2 right-2 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">
        {t.calc.launchNote.replace('{level}', active.level).replace('{ctx}', String(contextLen))}
        {active.fw === 'llamacpp' && cpuMoe
          ? ` ${(cpuMoe.all ? t.calc.launchMoeAll : t.calc.launchMoe).replace(/\{n\}/g, String(cpuMoe.n))}`
          : gpuLayers !== undefined && ` ${t.calc.launchOffload.replace('{n}', String(gpuLayers))}`}
      </p>
      {out.notes.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {out.notes.slice(0, 3).map((n, i) => <li key={i} className="text-[11px] text-slate-600 leading-relaxed">· {n}</li>)}
        </ul>
      )}
    </div>
  );
}
