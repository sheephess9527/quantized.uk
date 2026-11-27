'use client';

import { useState, useMemo, useRef } from 'react';
import { Terminal, Copy, Check, Download, Sparkles, Cpu } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import CopyButton from '@/components/ui/CopyButton';

export interface ParsedBenchRow {
  model: string;
  sizeGiB?: string;
  paramsB?: string;
  backend: string;
  ngl?: string;
  test: string;
  tokS: number;
  stdDev?: number;
}

/**
 * Deterministic parser for `llama-bench` Markdown table, JSON, CSV, or
 * `ollama run --verbose` terminal output. Runs 100% in the browser — zero
 * backend dependency, and generates a shareable SVG/PNG benchmark report card.
 */
export function parseLlamaBenchOutput(raw: string): {
  rows: ParsedBenchRow[];
  buildInfo?: string;
  pp512?: number;
  tg128?: number;
  modelName?: string;
  backendName?: string;
} {
  const text = raw.trim();
  if (!text) return { rows: [] };

  const rows: ParsedBenchRow[] = [];
  let buildInfo: string | undefined;

  // 1. Try JSON array (`llama-bench -o json`)
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of arr) {
        if (!item || typeof item !== 'object') continue;
        const avg = Number(item.avg_ts ?? item.ts ?? item.tokens_per_second);
        if (!Number.isFinite(avg) || avg <= 0) continue;
        const nPrompt = Number(item.n_prompt ?? 0);
        const nGen = Number(item.n_gen ?? 0);
        const test = nPrompt > 0 && nGen === 0 ? `pp${nPrompt}` : nGen > 0 && nPrompt === 0 ? `tg${nGen}` : String(item.test ?? 'run');
        rows.push({
          model: String(item.model_type ?? item.model_filename ?? 'GGUF model'),
          sizeGiB: item.model_size ? `${(Number(item.model_size) / 1024 ** 3).toFixed(2)} GiB` : undefined,
          paramsB: item.model_n_params ? `${(Number(item.model_n_params) / 1e9).toFixed(2)}B` : undefined,
          backend: String(item.backends ?? item.backend ?? 'GPU'),
          ngl: item.n_gpu_layers !== undefined ? String(item.n_gpu_layers) : undefined,
          test,
          tokS: Number(avg.toFixed(2)),
          stdDev: item.stddev_ts ? Number(Number(item.stddev_ts).toFixed(2)) : undefined,
        });
        if (!buildInfo && item.build_commit) {
          buildInfo = `b${item.build_number ?? ''} (${item.build_commit})`;
        }
      }
    } catch {
      // fall through to Markdown / text parsing
    }
  }

  // 2. Parse llama-bench Markdown table (`| model | size | params | backend | ngl | test | t/s |`)
  if (rows.length === 0) {
    const lines = text.split(/\r?\n/);
    let headers: string[] = [];
    for (const line of lines) {
      const bMatch = line.match(/build:\s*([0-9a-f]{7,12})\s*\((\d+)\)/i);
      if (bMatch) buildInfo = `b${bMatch[2]} (${bMatch[1]})`;

      if (!line.includes('|')) continue;
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length < 3) continue;
      if (cells.every(c => /^[-:]+$/.test(c))) continue;

      if (headers.length === 0 && cells.some(c => /model|test|t\/s|backend/i.test(c))) {
        headers = cells.map(c => c.toLowerCase());
        continue;
      }

      const idxModel = headers.findIndex(h => h.includes('model'));
      const idxSize = headers.findIndex(h => h.includes('size'));
      const idxParams = headers.findIndex(h => h.includes('params'));
      const idxBackend = headers.findIndex(h => h.includes('backend'));
      const idxNgl = headers.findIndex(h => h.includes('ngl'));
      const idxTest = headers.findIndex(h => h.includes('test'));
      const idxTs = headers.findIndex(h => h.includes('t/s') || h.includes('tok/s'));

      const testCell = cells[idxTest >= 0 ? idxTest : cells.length - 2] ?? '';
      const tsCell = cells[idxTs >= 0 ? idxTs : cells.length - 1] ?? '';
      const tsMatch = tsCell.match(/(\d+(?:\.\d+)?)(?:\s*±\s*(\d+(?:\.\d+)?))?/);
      if (!tsMatch) continue;
      const tokS = Number(tsMatch[1]);
      if (!Number.isFinite(tokS) || tokS <= 0) continue;

      rows.push({
        model: cells[idxModel >= 0 ? idxModel : 0] || 'Model',
        sizeGiB: idxSize >= 0 ? cells[idxSize] : undefined,
        paramsB: idxParams >= 0 ? cells[idxParams] : undefined,
        backend: (idxBackend >= 0 ? cells[idxBackend] : 'Local') || 'Local',
        ngl: idxNgl >= 0 ? cells[idxNgl] : undefined,
        test: testCell,
        tokS,
        stdDev: tsMatch[2] ? Number(tsMatch[2]) : undefined,
      });
    }
  }

  // 3. Parse `ollama run ... --verbose` output (`prompt eval rate: 1420.55 tokens/s` / `eval rate: 68.42 tokens/s`)
  if (rows.length === 0) {
    const pe = text.match(/prompt eval rate:\s*(\d+(?:\.\d+)?)\s*tokens\/s/i);
    const ge = text.match(/(?:^|\n)\s*eval rate:\s*(\d+(?:\.\d+)?)\s*tokens\/s/i);
    if (pe) {
      rows.push({ model: 'Ollama local run', backend: 'Ollama', test: 'pp (prompt eval)', tokS: Number(pe[1]) });
    }
    if (ge) {
      rows.push({ model: 'Ollama local run', backend: 'Ollama', test: 'tg (eval rate)', tokS: Number(ge[1]) });
    }
  }

  const ppRow = rows.find(r => /^pp/i.test(r.test));
  const tgRow = rows.find(r => /^tg/i.test(r.test));

  return {
    rows,
    buildInfo,
    pp512: ppRow?.tokS,
    tg128: tgRow?.tokS,
    modelName: rows[0]?.model,
    backendName: rows[0]?.backend,
  };
}

const SAMPLE_BENCH = `| model                          |       size |     params | backend    | ngl |          test |                  t/s |
| ------------------------------ | ---------: | ---------: | ---------- | --: | ------------: | -------------------: |
| qwen3 8B Q4_K - Medium         |   4.68 GiB |     8.19 B | CUDA       |  99 |         pp512 |      4820.45 ± 18.20 |
| qwen3 8B Q4_K - Medium         |   4.68 GiB |     8.19 B | CUDA       |  99 |         tg128 |       142.30 ±  0.45 |

build: b12774 (12774)`;

export default function LlamaBenchParser() {
  const { lang } = useLanguage();
  const zh = lang === 'zh';
  const [raw, setRaw] = useState('');
  const [gpuLabel, setGpuLabel] = useState('RTX 4090 24G');
  const [copiedCard, setCopiedCard] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const parsed = useMemo(() => parseLlamaBenchOutput(raw || SAMPLE_BENCH), [raw]);
  const isSample = !raw.trim();

  const benchCmd = `llama-bench -m ./model-Q4_K_M.gguf -p 512 -n 128 -ngl 99`;

  const copyMarkdownCard = () => {
    const lines = [
      `**quantized.uk Local Benchmark Card** — ${gpuLabel} (${parsed.backendName ?? 'GPU'}${parsed.buildInfo ? ` · ${parsed.buildInfo}` : ''})`,
      `- Model: \`${parsed.modelName ?? 'GGUF'}\` ${parsed.rows[0]?.sizeGiB ? `(${parsed.rows[0].sizeGiB})` : ''}`,
      ...(parsed.pp512 !== undefined ? [`- Prompt Prefill (\`pp512\`): **${parsed.pp512.toFixed(1)} tok/s**`] : []),
      ...(parsed.tg128 !== undefined ? [`- Token Generation (\`tg128\`): **${parsed.tg128.toFixed(1)} tok/s**`] : []),
      `- Verified against: https://quantized.uk${zh ? '/zh' : ''}/tools/speed/`,
    ].join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const downloadSvgCard = () => {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantized-bench-${gpuLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 mb-8" aria-labelledby="llama-bench-parser-title">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Terminal size={13} />
            {zh ? '本地实测解析器 · 战报卡生成' : 'Instant llama-bench / Ollama Parser & Share Card'}
          </span>
          <h2 id="llama-bench-parser-title" className="text-lg font-bold text-slate-100 mt-1">
            {zh
              ? '粘贴 llama-bench 或 ollama --verbose 终端输出，一键生成硬件实测战报卡'
              : 'Paste llama-bench or ollama --verbose output to generate a verified speed card'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {zh
              ? '支持 llama-bench 默认 Markdown 表格、-o json 输出，以及 ollama run --verbose 输出。纯浏览器本地解析，自动分离首字预填充（pp512）与解码速度（tg128）。'
              : 'Accepts llama-bench Markdown tables, -o json output, and ollama run --verbose logs. Parsed entirely in your browser to separate prompt prefill (pp512) from token generation (tg128).'}
          </p>
        </div>
      </div>

      {/* Step 1: One-click benchmark command */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-bg-recessed border border-ink/[0.08] px-3.5 py-2.5">
        <span className="text-xs font-semibold text-slate-400 shrink-0">
          {zh ? '1. 运行测试命令：' : '1. Run benchmark:'}
        </span>
        <code className="text-xs font-mono text-sky-300 flex-1 min-w-[220px] break-all">{benchCmd}</code>
        <CopyButton
          text={benchCmd}
          label={zh ? '复制命令' : 'Copy command'}
          copiedLabel={zh ? '已复制' : 'Copied'}
          className="min-h-9 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input textarea + hardware label */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="bench-gpu-input" className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Cpu size={13} />
              {zh ? '你的硬件型号（展示在战报卡上）：' : 'Your hardware label (shown on card):'}
            </label>
            <input
              id="bench-gpu-input"
              type="text"
              value={gpuLabel}
              onChange={e => setGpuLabel(e.target.value)}
              className="rounded-lg bg-bg-recessed border border-ink/[0.12] px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="RTX 4090 / M4 Max 128G"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="bench-raw-input" className="text-xs font-medium text-slate-400">
              {zh ? '2. 粘贴终端输出：' : '2. Paste terminal output:'}
            </label>
            {isSample ? (
              <span className="text-[11px] text-amber-300">
                {zh ? '当前展示示例数据 — 粘贴你的输出即可替换' : 'Showing sample output — paste yours to replace'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setRaw('')}
                className="text-[11px] text-sky-400 hover:text-sky-300"
              >
                {zh ? '重置为示例' : 'Reset to sample'}
              </button>
            )}
          </div>

          <textarea
            id="bench-raw-input"
            rows={6}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={SAMPLE_BENCH}
            className="w-full rounded-xl bg-bg-recessed border border-ink/[0.1] p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 leading-relaxed"
          />
        </div>

        {/* Right: Visual SVG Share Card + Copy/Download */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-3">
          <div className="rounded-xl bg-bg-recessed border border-sky-500/25 p-3 overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 560 220"
              className="w-full h-auto rounded-lg"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={zh ? '本地大模型实测战报卡' : 'Local LLM benchmark report card'}
            >
              <defs>
                <linearGradient id="qCardBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0b1120" />
                  <stop offset="100%" stopColor="#111c33" />
                </linearGradient>
              </defs>
              <rect width="560" height="220" rx="14" fill="url(#qCardBg)" stroke="#1e3a5f" strokeWidth="1.5" />
              <text x="24" y="34" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                QUANTIZED.UK // LOCAL BENCHMARK VERIFIED
              </text>
              <text x="536" y="34" textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                {parsed.backendName ?? 'GPU'} {parsed.buildInfo ? `· ${parsed.buildInfo}` : ''}
              </text>

              <text x="24" y="66" fill="#f1f5f9" fontSize="20" fontFamily="sans-serif" fontWeight="bold">
                {gpuLabel || 'Local GPU'}
              </text>
              <text x="24" y="88" fill="#94a3b8" fontSize="13" fontFamily="monospace">
                {parsed.modelName ?? 'No model parsed'} {parsed.rows[0]?.sizeGiB ? `· ${parsed.rows[0].sizeGiB}` : ''} {parsed.rows[0]?.paramsB ? `· ${parsed.rows[0].paramsB}` : ''}
              </text>

              {/* PP512 Box */}
              <rect x="24" y="106" width="246" height="74" rx="10" fill="#0f172a" stroke="#1e293b" />
              <text x="40" y="128" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                {zh ? '首字预填充速度 (Prompt Prefill)' : 'PROMPT PREFILL (PP512)'}
              </text>
              <text x="40" y="162" fill="#38bdf8" fontSize="26" fontFamily="monospace" fontWeight="bold">
                {parsed.pp512 !== undefined ? `${parsed.pp512.toFixed(1)} tok/s` : '—'}
              </text>

              {/* TG128 Box */}
              <rect x="290" y="106" width="246" height="74" rx="10" fill="#0f172a" stroke="#1e293b" />
              <text x="306" y="128" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                {zh ? '词元生成速度 (Token Decode)' : 'TOKEN GENERATION (TG128)'}
              </text>
              <text x="306" y="162" fill="#34d399" fontSize="26" fontFamily="monospace" fontWeight="bold">
                {parsed.tg128 !== undefined ? `${parsed.tg128.toFixed(1)} tok/s` : '—'}
              </text>

              <text x="24" y="204" fill="#64748b" fontSize="10" fontFamily="monospace">
                quantized.uk/tools/speed/ — exact-file VRAM &amp; roofline reference
              </text>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyMarkdownCard}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 text-xs font-semibold transition-colors"
              >
                {copiedCard ? <Check size={13} /> : <Copy size={13} />}
                {copiedCard
                  ? (zh ? '已复制 Markdown 战报' : 'Copied Markdown report')
                  : (zh ? '复制 Markdown 战报（发论坛/Reddit）' : 'Copy Markdown summary')}
              </button>
              <button
                type="button"
                onClick={downloadSvgCard}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl glass glass-hover text-slate-200 text-xs font-semibold"
              >
                <Download size={13} />
                {zh ? '下载 SVG 战报卡' : 'Download SVG card'}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles size={11} />
              {zh ? `已解析 ${parsed.rows.length} 条测试行` : `Parsed ${parsed.rows.length} test row${parsed.rows.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
