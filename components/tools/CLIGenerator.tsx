'use client';

import { useState, useMemo } from 'react';
import { Terminal, Copy, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { generateCLI, Framework, Env } from '@/lib/utils/cli';
import { cn } from '@/lib/utils/cn';

type OutputTab = 'cmd' | 'compose' | 'notes';

const FRAMEWORKS: { id: Framework; label: string; color: string }[] = [
  { id: 'llamacpp', label: 'llama.cpp',  color: '#7c3aed' },
  { id: 'ollama',   label: 'Ollama',     color: '#06b6d4' },
  { id: 'vllm',     label: 'vLLM',       color: '#f97316' },
];

const ENVS: { id: Env; labelKey: keyof ReturnType<typeof useLanguage>['t']['cli']['envOptions'] }[] = [
  { id: 'linux',   labelKey: 'linux'   },
  { id: 'mac',     labelKey: 'mac'     },
  { id: 'docker',  labelKey: 'docker'  },
  { id: 'compose', labelKey: 'compose' },
];

export default function CLIGenerator() {
  const { t } = useLanguage();
  const [framework, setFramework] = useState<Framework>('llamacpp');
  const [env, setEnv] = useState<Env>('linux');
  const [modelId, setModelId] = useState('');
  const [quantLevel, setQuantLevel] = useState('Q4_K_M');
  const [gpuLayers, setGpuLayers] = useState(99);
  const [contextLen, setContextLen] = useState(4096);
  const [threads, setThreads] = useState(8);
  const [port, setPort] = useState(8080);
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<OutputTab>('cmd');
  const [copied, setCopied] = useState(false);

  const selectedModel = models.find(m => m.id === modelId);

  const availableQuants = useMemo(() => {
    if (!selectedModel) return ['Q4_K_M', 'Q4_K_S', 'Q6_K', 'Q8_0', 'AWQ INT4', 'EXL2 4.65bpw'];
    if (framework === 'llamacpp' || framework === 'ollama') {
      return selectedModel.quants.filter(q => q.format === 'GGUF').map(q => q.level);
    }
    if (framework === 'vllm') {
      return selectedModel.quants.filter(q => q.format === 'AWQ' || q.format === 'GPTQ').map(q => `${q.format} ${q.level}`);
    }
    return selectedModel.quants.map(q => `${q.format} ${q.level}`);
  }, [selectedModel, framework]);

  const output = useMemo(() => {
    if (!modelId) return null;
    return generateCLI({
      framework,
      env,
      modelId,
      modelName: selectedModel?.name ?? modelId,
      quantLevel,
      gpuLayers,
      contextLen,
      threads,
      port,
      apiKey: apiKey || undefined,
    });
  }, [framework, env, modelId, selectedModel, quantLevel, gpuLayers, contextLen, threads, port, apiKey]);

  const copyText = () => {
    const text = activeTab === 'compose' ? output?.compose : output?.command;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabContent: Record<OutputTab, string | null | undefined> = {
    cmd:     output?.command,
    compose: output?.compose,
    notes:   output?.notes?.map((n, i) => `# ${i + 1}. ${n}`).join('\n'),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: config */}
      <div className="space-y-5">
        {/* Framework */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">{t.cli.framework}</label>
          <div className="flex gap-2">
            {FRAMEWORKS.map(f => (
              <button
                key={f.id}
                onClick={() => { setFramework(f.id); setQuantLevel('Q4_K_M'); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border"
                style={
                  framework === f.id
                    ? { background: `${f.color}18`, color: f.color, borderColor: `${f.color}30` }
                    : { background: 'transparent', color: '#475569', borderColor: 'rgba(255,255,255,0.06)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">{t.cli.env}</label>
          <div className="grid grid-cols-2 gap-2">
            {ENVS.map(e => (
              <button
                key={e.id}
                onClick={() => setEnv(e.id)}
                className={cn(
                  'py-2 rounded-xl text-xs font-medium transition-all duration-150 border',
                  env === e.id
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                    : 'text-slate-500 border-white/[0.06] hover:text-slate-300'
                )}
              >
                {t.cli.envOptions[e.labelKey]}
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.cli.model}</label>
          <div className="relative">
            <select
              value={modelId}
              onChange={e => setModelId(e.target.value)}
              className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="">{t.calc.modelPlaceholder}</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.paramLabel})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Quant */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.cli.quant}</label>
          <div className="flex flex-wrap gap-1.5">
            {availableQuants.map(q => (
              <button
                key={q}
                onClick={() => setQuantLevel(q)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                  quantLevel === q
                    ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                    : 'text-slate-500 border-white/[0.06] hover:text-slate-300'
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Run options */}
        <div className="glass rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-slate-400">{t.cli.options}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t.cli.gpuLayers,  value: gpuLayers,  setter: (v: string) => setGpuLayers(Number(v)),  type: 'number' },
              { label: t.cli.contextLen, value: contextLen, setter: (v: string) => setContextLen(Number(v)), type: 'number' },
              { label: t.cli.threads,    value: threads,    setter: (v: string) => setThreads(Number(v)),    type: 'number' },
              { label: t.cli.port,       value: port,       setter: (v: string) => setPort(Number(v)),       type: 'number' },
            ].map(({ label, value, setter, type }) => (
              <div key={label}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/40 font-mono"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.cli.options} — API Key (optional)</label>
            <input
              type="text"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-sm text-slate-400 focus:outline-none focus:border-violet-500/40 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Right: output */}
      <div>
        {output ? (
          <div className="glass rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center border-b border-white/[0.06]">
              {(['cmd', 'compose', 'notes'] as OutputTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={tab === 'compose' && !output.compose}
                  className={cn(
                    'px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                    activeTab === tab
                      ? 'text-violet-300 border-violet-500'
                      : 'text-slate-500 border-transparent hover:text-slate-300',
                    tab === 'compose' && !output.compose && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  {t.cli.outputTab[tab]}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={copyText}
                className="flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t.cli.copied : t.cli.copy}
              </button>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                <code>{tabContent[activeTab] || '# Not available for this configuration'}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 flex items-center justify-center h-full min-h-48">
            <div className="text-center">
              <Terminal size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">{t.cli.selectFirst}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
