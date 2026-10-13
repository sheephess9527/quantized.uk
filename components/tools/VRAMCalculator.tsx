'use client';

import { useState, useMemo, useEffect, useRef, useCallback, type MouseEvent } from 'react';
import ConfidenceTag from '@/components/ui/ConfidenceTag';
import Link from '@/components/i18n/LocalLink';
import { Calculator, Cpu, MemoryStick, Zap, ChevronDown, Copy, Check, ArrowRightLeft, Search } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import { gpuDatabase, POPULAR_GPU_IDS, type GPU } from '@/lib/data/gpus';
import { quantBPW, quantGroups, calcVRAM, getVerdict, KV_CACHE_TYPES, type KvCacheType } from '@/lib/utils/vram';
import { levelTable, contextReach, speedCeiling, offloadPlan, canStack, capacityGB, MAX_CARDS, RAM_SETUPS, type RamSetup } from '@/lib/utils/calc-insights';
import { getRecommendations, quantLevelKey, SortBy } from '@/lib/utils/recommend';
import { usableCapacityGB, formatAllowed, tightCeiling } from '@/lib/utils/gpu-page';
import { cn } from '@/lib/utils/cn';
import { contextLabel, exactLabel } from '@/lib/utils/context-label';
import { formatLoss, referenceQuant } from '@/lib/utils/quality';
import { groupedModels } from '@/lib/utils/model-groups';
import { useUrlQuery } from '@/lib/hooks/useUrlQuery';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { trackEvent } from '@/lib/analytics';
import { nameCarriesLabel, isMoE, isSuperseded } from '@/lib/utils/model-meta';
import { homePicks } from '@/lib/utils/home-picks';
import { searchModels } from '@/lib/utils/model-search';
import { bySmallestCard, sizeAt } from '@/lib/utils/model-explainer';
import { GPU_COUNT } from '@/lib/seo';

type Mode = 'forward' | 'reverse';
type VerdictColor = 'green' | 'yellow' | 'red';

const verdictConfig: Record<VerdictColor, { bar: string; label: string; dot: string }> = {
  green:  { bar: 'bg-emerald-500', label: 'text-emerald-400',  dot: 'bg-emerald-400' },
  yellow: { bar: 'bg-yellow-500',  label: 'text-yellow-400',   dot: 'bg-yellow-400'  },
  red:    { bar: 'bg-red-500',     label: 'text-red-400',      dot: 'bg-red-400'      },
};

const CONTEXT_PRESETS = [512, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

/** The card list grouped the way a reader looks for their card — by vendor line. */
const GPU_GROUPS: { types: GPU['type'][]; key: 'gpuGroupNvidia' | 'gpuGroupPro' | 'gpuGroupUnified' | 'gpuGroupAmd' | 'gpuGroupIntel' | 'gpuGroupApple' | 'gpuGroupCpu' }[] = [
  { types: ['nvidia-consumer'], key: 'gpuGroupNvidia' },
  { types: ['nvidia-pro'], key: 'gpuGroupPro' },
  { types: ['nvidia-unified'], key: 'gpuGroupUnified' },
  { types: ['amd'], key: 'gpuGroupAmd' },
  { types: ['intel'], key: 'gpuGroupIntel' },
  { types: ['apple'], key: 'gpuGroupApple' },
  { types: ['cpu'], key: 'gpuGroupCpu' },
];

const POPULAR_GPUS = POPULAR_GPU_IDS
  .map(id => gpuDatabase.find(g => g.id === id))
  .filter((g): g is GPU => !!g);

/** Before the reader names a card there is nothing to rank against, so the
 *  suggestions are simply the newest entries — never a quality claim — limited
 *  to ones a single 24 GB card holds comfortably at 4K, or a 1T model that fits
 *  nothing would be the first thing offered. */
const NEWEST_MODELS = [...models]
  .filter(m => !isSuperseded(m) && getVerdict(sizeAt(m, referenceQuant(m.quants).bpw, 4096).totalGB, 24) === 'green')
  .sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))
  .slice(0, 4);

const SEARCH_LIMIT = 8;

/** Both card pickers (forward verdict, reverse lookup) list the same groups. */
function gpuOptgroups(label: (key: (typeof GPU_GROUPS)[number]['key']) => string) {
  return GPU_GROUPS.map(group => {
    const rows = gpuDatabase.filter(g => group.types.includes(g.type));
    return rows.length === 0 ? null : (
      <optgroup key={group.key} label={label(group.key)}>
        {rows.map(g => (
          <option key={g.id} value={g.id}>{g.icon} {g.name} ({g.vram} GB)</option>
        ))}
      </optgroup>
    );
  });
}

function findFormatGroup(quant: string): keyof typeof quantGroups {
  for (const [group, levels] of Object.entries(quantGroups)) {
    if (levels.includes(quant)) return group as keyof typeof quantGroups;
  }
  return 'GGUF';
}

export default function VRAMCalculator() {
  const { t } = useLanguage();
  const { gpuId: profileGpuId, gpu: profileGpu, config, hydrated: configReady, updateConfig, setGpuId } = useHardwareProfile();
  const searchParams = useUrlQuery();
  const urlInitialized = useRef(false);

  const [mode, setMode] = useState<Mode>('forward');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedQuant, setSelectedQuant] = useState('Q4_K_M');
  const [contextLen, setContextLen] = useState(4096);
  const [batchSize, setBatchSize] = useState(1);
  const [kvType, setKvType] = useState<KvCacheType>('f16');
  const [cards, setCards] = useState(1);
  const [ram, setRam] = useState<RamSetup>('ddr5-5600');
  const [formatGroup, setFormatGroup] = useState<keyof typeof quantGroups>('GGUF');
  const [customParams, setCustomParams] = useState('7');
  const [customLayers, setCustomLayers] = useState('32');
  const [customKvHeads, setCustomKvHeads] = useState('8');
  const [customHeadDim, setCustomHeadDim] = useState('128');
  const [selectedGpuId, setSelectedGpuId] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('quality');
  const [includeYellow, setIncludeYellow] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [invalidModelId, setInvalidModelId] = useState<string | null>(null);
  const [modelQuery, setModelQuery] = useState('');

  // Precedence: URL > stored config > default. A shared link has to win over
  // whatever the recipient happens to have saved, or the link shows something
  // other than what the sender saw. Waits for `configReady` so the stored
  // fallback is not missed on first paint.
  useEffect(() => {
    if (urlInitialized.current || !searchParams || !configReady) return;
    const m = searchParams.get('mode') === 'reverse' ? 'reverse' : 'forward';
    setMode(m);
    const modelParam = searchParams.get('model');
    if (modelParam) {
      if (modelParam === 'custom' || models.some(md => md.id === modelParam)) {
        setSelectedModelId(modelParam);
        setInvalidModelId(null);
      } else {
        setSelectedModelId('');
        setInvalidModelId(modelParam);
      }
    } else if (config.modelId) {
      setSelectedModelId(config.modelId);
    }
    // A link naming a model but no level (the homepage picks, model placement)
    // opens at that model's reference level — GPT-OSS at its native MXFP4, as
    // its own page sizes it — not at whatever the default state happened to be.
    const linkedModel = modelParam ? models.find(md => md.id === modelParam) : undefined;
    const quantParam = searchParams.get('quant')
      || (linkedModel ? quantLevelKey(referenceQuant(linkedModel.quants)) : modelParam ? '' : config.quantLevel);
    if (quantParam) {
      setSelectedQuant(quantParam);
      setFormatGroup(findFormatGroup(quantParam));
    }
    if (searchParams.get('ctx')) setContextLen(Number(searchParams.get('ctx')) || 4096);
    else if (config.contextLen) setContextLen(config.contextLen);
    if (searchParams.get('batch')) setBatchSize(Number(searchParams.get('batch')) || 1);
    const cacheParam = searchParams.get('cache');
    if (cacheParam === 'q8_0' || cacheParam === 'q4_0') setKvType(cacheParam);
    const cardsParam = Number(searchParams.get('cards'));
    if (Number.isInteger(cardsParam) && cardsParam >= 1 && cardsParam <= MAX_CARDS) setCards(cardsParam);
    const ramParam = searchParams.get('ram');
    if (ramParam && ramParam in RAM_SETUPS) setRam(ramParam as RamSetup);
    // A custom model is only shareable if its shape travels with the link —
    // without these the recipient got the 7B / 32-layer defaults.
    if (modelParam === 'custom') {
      const p = searchParams.get('params'); if (p) setCustomParams(p);
      const l = searchParams.get('layers'); if (l) setCustomLayers(l);
      const kv = searchParams.get('kv'); if (kv) setCustomKvHeads(kv);
      const hd = searchParams.get('hd'); if (hd) setCustomHeadDim(hd);
    }
    // `gpu` has to reach the shared profile, not just local state: forward
    // mode has no GPU dropdown of its own — it judges the answer against the
    // card in the navbar profile — so a link carrying `?gpu=` used to land on
    // a page that computed a size and then declined to say whether it fit.
    // An id the database does not know (a typo, a renamed card) is ignored
    // rather than kept: reverse mode used to answer "no models fit this GPU"
    // about a card that does not exist.
    const rawGpu = searchParams.get('gpu');
    const gpuParam = rawGpu && gpuDatabase.some(g => g.id === rawGpu) ? rawGpu : null;
    if (gpuParam) {
      setSelectedGpuId(gpuParam);
      if (gpuParam !== config.gpuId) updateConfig({ gpuId: gpuParam });
    } else if (profileGpuId) setSelectedGpuId(profileGpuId);
    if (searchParams.get('sort') === 'speed' || searchParams.get('sort') === 'vram') {
      setSortBy(searchParams.get('sort') as SortBy);
    }
    if (searchParams.get('yellow') === '0') setIncludeYellow(false);
    urlInitialized.current = true;
  }, [searchParams, profileGpuId, configReady, config.modelId, config.quantLevel, config.contextLen, config.gpuId, updateConfig]);

  // Write the reader's choices back so the next tool starts where they left off.
  useEffect(() => {
    if (!urlInitialized.current) return;
    updateConfig({ modelId: selectedModelId, quantLevel: selectedQuant, contextLen });
  }, [selectedModelId, selectedQuant, contextLen, updateConfig]);

  const syncUrl = useCallback(() => {
    if (!urlInitialized.current) return;
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('ctx', String(contextLen));
    params.set('batch', String(batchSize));
    if (kvType !== 'f16') params.set('cache', kvType);
    if (cards > 1) params.set('cards', String(cards));
    if (ram !== 'ddr5-5600') params.set('ram', ram);
    if (mode === 'forward') {
      if (selectedModelId) params.set('model', selectedModelId);
      if (selectedModelId === 'custom') {
        params.set('params', customParams);
        params.set('layers', customLayers);
        params.set('kv', customKvHeads);
        params.set('hd', customHeadDim);
      }
      params.set('quant', selectedQuant);
      // Forward mode judges the answer against the card in the shared profile,
      // and this rewrites the address bar on every render — so leaving `gpu`
      // out did not merely omit it from a copied link, it deleted it from a
      // link that had one. The verdict the sender saw is part of what they are
      // sharing.
      if (profileGpuId) params.set('gpu', profileGpuId);
    } else {
      if (selectedGpuId) params.set('gpu', selectedGpuId);
      params.set('sort', sortBy);
      if (!includeYellow) params.set('yellow', '0');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`);
  }, [mode, selectedModelId, selectedQuant, contextLen, batchSize, selectedGpuId, profileGpuId, sortBy, includeYellow, customParams, customLayers, customKvHeads, customHeadDim, kvType, cards, ram]);

  useEffect(() => { syncUrl(); }, [syncUrl]);

  /**
   * Changing the model must not leave the previous model's quant level
   * selected. Picking Llama 3.1 8B at `EXL2 4.65bpw` and switching to
   * GPT-OSS 20B — which ships MXFP4, Q8_0 and Q4_K_M and nothing else — left
   * EXL2 highlighted and printed a confident number for a file that does not
   * exist, sized from the generic bits-per-weight table.
   *
   * The generic vocabulary is still offered on purpose: "what would this model
   * cost at Q2_K" is a legitimate question for a calculator. It is only the
   * silent carry-over that is wrong, so the level snaps to one the new model
   * ships, and anything the reader picks afterwards that the index has no file
   * for is labelled rather than blocked.
   */
  const selectModel = useCallback((id: string) => {
    setSelectedModelId(id);
    setInvalidModelId(null);
    const model = models.find(m => m.id === id);
    if (!model) return;
    const levels = model.quants.map(quantLevelKey);
    if (levels.includes(selectedQuant)) return;
    // The level the model page sizes it at (native build, else Q4_K_M, else
    // best quality) — one rule for the whole site, `referenceQuant()`.
    const next = quantLevelKey(referenceQuant(model.quants));
    setSelectedQuant(next);
    setFormatGroup(findFormatGroup(next));
  }, [selectedQuant]);

  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * The "Calculate" link on each reverse-mode row points at this same page.
   * The query is read once, after mount, so a client-side navigation to it
   * changed the address bar and nothing else — the reader stayed on the list.
   * Switch the state directly instead; the href stays for new-tab clicks and
   * for anything reading the markup. The card the reader was browsing becomes
   * the profile card, or the forward verdict would judge a different one.
   */
  const openForward = (e: MouseEvent, modelId: string, level: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setMode('forward');
    setSelectedModelId(modelId);
    setInvalidModelId(null);
    setSelectedQuant(level);
    setFormatGroup(findFormatGroup(level));
    if (selectedGpuId && selectedGpuId !== profileGpuId) updateConfig({ gpuId: selectedGpuId });
    rootRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const selectedModel = models.find(m => m.id === selectedModelId);
  /** The window is longer than the model can attend to — the estimate prices
      cache the model would never fill. */
  const ctxOverModel = selectedModel !== undefined && contextLen > selectedModel.contextLength;
  /** True when the index has no file for the selected model at this level. */
  const levelNotShipped =
    selectedModel !== undefined &&
    !selectedModel.quants.some(q => quantLevelKey(q) === selectedQuant);
  const selectedGpu = gpuDatabase.find(g => g.id === selectedGpuId);
  /** The real quant row for the selected level, when the model ships one — its
      `format` is what decides whether a given GPU can run it at all, a
      question size alone can't answer. */
  const selectedQuantObj = selectedModel?.quants.find(q => quantLevelKey(q) === selectedQuant);

  const calcInput = useMemo(() => {
    const tableBpw = quantBPW[selectedQuant] ?? 4.85;
    if (selectedModel) {
      // `quantBPW` is a generic per-level table; a model that actually ships
      // this level carries its own measured bpw, which can differ sharply —
      // GPT-OSS's Q4_K_M is 4.10, not the table's 4.85, because most of its MoE
      // weights stay in native MXFP4. Reverse mode already sizes from
      // `quant.bpw`, so preferring it here is also what stops the two halves of
      // this calculator disagreeing about the same model.
      const own = selectedModel.quants.find(q => quantLevelKey(q) === selectedQuant);
      return {
        paramsB: selectedModel.params,
        layers: selectedModel.arch.layers,
        kvHeads: selectedModel.arch.kvHeads,
        headDim: selectedModel.arch.headDim,
        attention: selectedModel.arch.attention,
        bpw: own?.bpw ?? tableBpw,
        contextLength: contextLen,
        batchSize,
        kvBytesPerValue: KV_CACHE_TYPES[kvType],
      };
    }
    const bpw = tableBpw;
    return {
      paramsB: parseFloat(customParams) || 7,
      layers: parseInt(customLayers) || 32,
      kvHeads: parseInt(customKvHeads) || 8,
      headDim: parseInt(customHeadDim) || 128,
      bpw,
      contextLength: contextLen,
      batchSize,
      kvBytesPerValue: KV_CACHE_TYPES[kvType],
    };
  }, [selectedModel, selectedQuant, contextLen, batchSize, customParams, customLayers, customKvHeads, customHeadDim, kvType]);

  const result = useMemo(() => calcVRAM(calcInput), [calcInput]);

  // Cards that clear the estimate comfortably, smallest first — "the cheapest
  // card that runs this" is the question behind the 43-bar list. Restricted to
  // backends that can load the selected format at all (custom models have no
  // format to check, so nothing is excluded on that basis), and sized against
  // each card's usable capacity rather than its nameplate figure.
  const greenGpus = useMemo(
    () => gpuDatabase
      // CPU-only RAM rows are not cards; "smallest" is a size, with retail
      // cards ahead of datacentre ones at the same capacity (bySmallestCard) —
      // sorting on vram alone named whichever 16 GB row came first in the file.
      .filter(g => !g.isCPU && (!selectedQuantObj || formatAllowed(g, selectedQuantObj.format)) && getVerdict(result.totalGB, usableCapacityGB(g)) === 'green')
      .sort(bySmallestCard),
    [result.totalGB, selectedQuantObj],
  );
  const smallestGreen = greenGpus[0];

  const recommendations = useMemo(() => {
    if (!selectedGpu) return [];
    return getRecommendations(selectedGpu, contextLen, batchSize, sortBy, includeYellow, KV_CACHE_TYPES[kvType], canStack(selectedGpu) ? cards : 1);
  }, [selectedGpu, contextLen, batchSize, sortBy, includeYellow, kvType, cards]);

  // One-tap starts. With a card named, the suggestions are the homepage's own
  // picks for it (`homePicks`, the same ranking behind `/best/`), so the
  // calculator and the front page cannot recommend different things.
  const cardPicks = useMemo(() => (profileGpu ? homePicks(profileGpu, 'chat') : []), [profileGpu]);
  const searchHits = useMemo(
    () => (modelQuery.trim() ? searchModels(models, modelQuery, SEARCH_LIMIT) : []),
    [modelQuery],
  );
  const chooseModel = (id: string, level?: string) => {
    selectModel(id);
    if (level) {
      setSelectedQuant(level);
      setFormatGroup(findFormatGroup(level));
    }
    setModelQuery('');
  };

  /** Cards actually counted: stacking only means something for discrete cards. */
  const profileCards = profileGpu && canStack(profileGpu) ? cards : 1;

  // Second-order answers for the reader's own card — see calc-insights.ts.
  const levels = useMemo(
    () => selectedModel ? levelTable(selectedModel, profileGpu ?? undefined, contextLen, batchSize, KV_CACHE_TYPES[kvType], profileCards) : [],
    [selectedModel, profileGpu, contextLen, batchSize, kvType, profileCards],
  );
  const reach = useMemo(() => {
    if (!profileGpu) return undefined;
    if (selectedQuantObj && !formatAllowed(profileGpu, selectedQuantObj.format)) return undefined;
    const { bpw, contextLength: _ctx, ...shape } = calcInput;
    // A custom model has no declared window; 128K is the generic ceiling.
    return contextReach(shape, bpw, profileGpu, selectedModel?.contextLength ?? 131072, profileCards);
  }, [calcInput, profileGpu, selectedModel, selectedQuantObj, profileCards]);
  /** Largest preset chip inside the reach, so "use it" lands on a round value. */
  const reachPreset = reach
    ? [...CONTEXT_PRESETS].reverse().find(p => p <= (reach.comfortable || reach.tight))
    : undefined;

  const modelLookupFailed = selectedModelId !== '' && selectedModelId !== 'custom' && !selectedModel;
  // No model selected means no result. Allowing `selectedModelId === ''` here
  // meant the panel silently fell through to the custom-model defaults (7B /
  // 32 layers / 8 kvHeads) and presented 4.98 GB plus a green verdict on all 43
  // GPUs as if it were an answer about a model the reader never picked.
  const showForwardResult = mode === 'forward' && !modelLookupFailed && !invalidModelId && (
    selectedModelId === 'custom' || !!selectedModel
  );
  const showReverseResult = mode === 'reverse' && selectedGpuId !== '';

  // On a phone the answer sits below a long column of controls, so every
  // change to the context or the level hid it. A bar pinned to the bottom
  // repeats the total and the verdict while the result panel is off-screen.
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = useState(false);
  useEffect(() => {
    const el = resultsRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setResultsInView(entry.isIntersecting), { rootMargin: '0px 0px -30% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    trackEvent('VRAM Share', { mode });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const formatColors: Record<string, string> = {
    GGUF: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    AWQ:  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    EXL2: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    GPTQ: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    HQQ:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  };

  return (
    <div ref={rootRef} className="space-y-6 scroll-mt-24">
      {/* Mode toggle + share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['forward', 'reverse'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
                mode === m
                  ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                  : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10',
              )}
            >
              {m === 'forward' ? <Calculator size={14} /> : <ArrowRightLeft size={14} />}
              {m === 'forward' ? t.calc.modeForward : t.calc.modeReverse}
            </button>
          ))}
        </div>
        <button
          onClick={copyShareLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.06] hover:border-white/10 transition-colors"
        >
          {linkCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {linkCopied ? t.calc.shareCopied : t.calc.shareLink}
        </button>
      </div>

      <p className="text-sm text-slate-500 -mt-2">
        {mode === 'forward' ? t.calc.modeForwardDesc : t.calc.modeReverseDesc}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {mode === 'forward' ? (
            <>
              <div>
                <label htmlFor="calc-model" className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.model}</label>
                <div className="relative">
                  <select
                    id="calc-model"
                    value={selectedModelId}
                    onChange={e => selectModel(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">{t.calc.modelPlaceholder}</option>
                    {groupedModels().map(group => (
                      <optgroup key={group.bucket} label={group.bucket}>
                        {group.models.map(m => (
                          <option key={m.id} value={m.id}>
                            {nameCarriesLabel(m.name, m.paramLabel) ? m.name : `${m.name} (${m.paramLabel})`}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">{t.calc.customLabel}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* A 100-entry dropdown is slow to scan on a phone, and the
                    names readers type ("千问", "qwen 27b", "coding") are not
                    always the names in the list. The native select stays for
                    keyboard and screen-reader use; this sits beside it. */}
                <div className="relative mt-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="search"
                    value={modelQuery}
                    onChange={e => setModelQuery(e.target.value)}
                    aria-label={t.calc.searchLabel}
                    placeholder={t.calc.searchPlaceholder}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                {modelQuery.trim() ? (
                  searchHits.length === 0 ? (
                    <p className="text-xs text-slate-500 mt-2">{t.calc.searchNone.replace('{q}', modelQuery.trim())}</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchHits.map(m => (
                        <button
                          key={m.id}
                          onClick={() => chooseModel(m.id)}
                          className={cn('inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border transition-colors', 'text-slate-300 border-white/[0.08] hover:border-violet-500/40 hover:text-violet-200')}
                        >
                          {nameCarriesLabel(m.name, m.paramLabel) ? m.name : `${m.name} (${m.paramLabel})`}
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-600 mb-1.5">
                      {profileGpu && cardPicks.length > 0 ? t.calc.suggestForCard.replace('{gpu}', profileGpu.name) : t.calc.suggestNewest}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profileGpu && cardPicks.length > 0
                        ? cardPicks.map(pick => (
                            <button
                              key={pick.model.id}
                              onClick={() => chooseModel(pick.model.id, quantLevelKey(pick.quant))}
                              aria-pressed={selectedModelId === pick.model.id}
                              title={pick.kind === 'capable' ? t.home.match.kindCapable : pick.kind === 'headroom' ? t.home.match.kindHeadroom : t.home.match.kindFastest}
                              className={cn('inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border transition-colors', selectedModelId === pick.model.id
                                ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                                : 'text-slate-300 border-white/[0.08] hover:border-violet-500/40 hover:text-violet-200')}
                            >
                              <span className="text-slate-500 mr-1">
                                {pick.kind === 'capable' ? t.home.match.kindCapable : pick.kind === 'headroom' ? t.home.match.kindHeadroom : t.home.match.kindFastest}
                                {' · '}
                              </span>
                              {pick.model.name}
                            </button>
                          ))
                        : NEWEST_MODELS.map(m => (
                            <button
                              key={m.id}
                              onClick={() => chooseModel(m.id)}
                              aria-pressed={selectedModelId === m.id}
                              className={cn('inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border transition-colors', selectedModelId === m.id
                                ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                                : 'text-slate-300 border-white/[0.08] hover:border-violet-500/40 hover:text-violet-200')}
                            >
                              {m.name}
                            </button>
                          ))}
                    </div>
                  </div>
                )}
              </div>

              {/* The verdict needs a card, and the only place to set one used to
                  be the navbar — readers who never found it got a size and no
                  answer. This writes the same shared profile. */}
              <div>
                <label htmlFor="calc-card" className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.yourCard}</label>
                <div className="relative">
                  <select
                    id="calc-card"
                    value={profileGpuId}
                    onChange={e => setGpuId(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">{t.calc.yourCardPlaceholder}</option>
                    {gpuOptgroups(k => t.calc[k])}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                {!profileGpu && (
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-600 mb-1.5">{t.calc.popularCards}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_GPUS.map(g => (
                        <button
                          key={g.id}
                          onClick={() => setGpuId(g.id)}
                          className={cn('inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border transition-colors', 'text-slate-300 border-white/[0.08] hover:border-violet-500/40 hover:text-violet-200')}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profileGpu && canStack(profileGpu) && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.cardCount}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: MAX_CARDS }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setCards(n)}
                        aria-pressed={cards === n}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-mono border transition-colors',
                          cards === n
                            ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                            : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                        )}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                  {cards > 1 && <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{t.calc.cardCountNote.split('{n}').join(String(cards))}</p>}
                </div>
              )}

              {selectedModelId === 'custom' && (
                <div className="glass rounded-xl p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-400">{t.calc.customLabel}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t.calc.customParams,  value: customParams,  setter: setCustomParams },
                      { label: t.calc.customLayers,  value: customLayers,  setter: setCustomLayers },
                      { label: t.calc.customKvHeads, value: customKvHeads, setter: setCustomKvHeads },
                      { label: t.calc.customHeadDim, value: customHeadDim, setter: setCustomHeadDim },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="block text-xs text-slate-500 mb-1">{label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={e => setter(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.quant}</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(Object.keys(quantGroups) as Array<keyof typeof quantGroups>).map(g => (
                    <button
                      key={g}
                      onClick={() => { setFormatGroup(g); setSelectedQuant(quantGroups[g][0]); }}
                      aria-pressed={formatGroup === g}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150',
                        formatGroup === g
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                          : 'text-slate-500 border border-white/[0.06] hover:text-slate-300',
                      )}
                    >
                      {g === 'Full' ? t.calc.fullPrecision : g}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quantGroups[formatGroup].map(q => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuant(q)}
                      aria-pressed={selectedQuant === q}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                        selectedQuant === q
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10',
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="calc-reverse-card" className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.selectGpu}</label>
                <div className="relative">
                  <select
                    id="calc-reverse-card"
                    value={selectedGpuId}
                    onChange={e => setSelectedGpuId(e.target.value)}
                    className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">{t.calc.selectGpuPlaceholder}</option>
                    {gpuOptgroups(k => t.calc[k])}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                {!selectedGpu && (
                  <div className="mt-2">
                    <p className="text-[11px] text-slate-600 mb-1.5">{t.calc.popularCards}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_GPUS.map(g => (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGpuId(g.id)}
                          className="inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border transition-colors text-slate-300 border-white/[0.08] hover:border-violet-500/40 hover:text-violet-200"
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedGpu && canStack(selectedGpu) && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.cardCount}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: MAX_CARDS }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setCards(n)}
                        aria-pressed={cards === n}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-mono border transition-colors',
                          cards === n
                            ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                            : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                        )}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                  {cards > 1 && <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{t.calc.cardCountNote.split('{n}').join(String(cards))}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.sortBy}</label>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { id: 'quality' as SortBy, label: t.calc.sortQuality },
                    { id: 'speed' as SortBy,   label: t.calc.sortSpeed },
                    { id: 'vram' as SortBy,    label: t.calc.sortVram },
                  ]).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      aria-pressed={sortBy === s.id}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        sortBy === s.id
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeYellow}
                  onChange={e => setIncludeYellow(e.target.checked)}
                  className="accent-violet-500"
                />
                <span className="text-xs text-slate-400">{t.calc.includeYellow}</span>
              </label>
            </>
          )}

          {/* Shared: context + batch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">{t.calc.context}</label>
              <span className="font-mono text-xs text-violet-300">
                {contextLabel(contextLen)}
                <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                  {contextLen.toLocaleString('en-US')} {t.calc.tokens}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setContextLen(p)}
                  aria-pressed={contextLen === p}
                  // The chip is a rounded label; the exact token count is what
                  // the number actually means, so it is the accessible name.
                  aria-label={exactLabel(p)}
                  title={exactLabel(p)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                    contextLen === p
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                      : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                  )}
                >
                  {contextLabel(p)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.kvCacheType}</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(KV_CACHE_TYPES) as KvCacheType[]).map(k => (
                <button
                  key={k}
                  onClick={() => setKvType(k)}
                  aria-pressed={kvType === k}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-150 border',
                    kvType === k
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                      : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
              {kvType === 'f16' ? t.calc.kvF16Note : t.calc.kvQuantNote.split('{t}').join(kvType)}
            </p>
            {kvType !== 'f16' && mode === 'forward' && selectedQuantObj && selectedQuantObj.format !== 'GGUF' && (
              <p className="text-xs text-amber-300/80 leading-relaxed mt-1">
                {t.calc.kvNotGguf.replace('{format}', selectedQuantObj.format).replace('{t}', kvType)}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">{t.calc.batch}</label>
              <span className="font-mono text-xs text-violet-300">{batchSize}</span>
            </div>
            <input
              type="range"
              min={1} max={16} step={1}
              value={batchSize}
              onChange={e => setBatchSize(Number(e.target.value))}
              className="w-full accent-violet-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1</span><span>4</span><span>8</span><span>16</span>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div ref={resultsRef} id="calc-result" className="scroll-mt-24">
          {(invalidModelId || modelLookupFailed) && (
            <div className="glass rounded-2xl p-5 border border-amber-500/20 mb-4">
              <p className="text-sm text-amber-300">
                {t.calc.unknownModel.replace('{id}', invalidModelId ?? selectedModelId)}
              </p>
              <Link href="/quant-hub/" className="text-xs text-violet-400 hover:text-violet-300 mt-2 inline-block">
                {t.calc.browseModels}
              </Link>
            </div>
          )}
          {/*
            A level the index has no file for is still worth estimating — but
            the reader has to know the difference between "this is what the
            published quant costs" and "this is what that quant would cost if
            someone made it". Without this the two look identical, and the
            number silently comes from the generic bits-per-weight table rather
            than the model's own measured figure.
          */}
          {mode === 'forward' && showForwardResult && levelNotShipped && (
            <div className="glass rounded-2xl p-4 border border-amber-500/20 mb-4">
              <p className="text-xs text-amber-300/90 leading-relaxed">
                {t.calc.levelNotShipped
                  .replace('{level}', selectedQuant)
                  .replace('{model}', selectedModel?.name ?? '')}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                {t.calc.levelNotShippedShips.replace(
                  '{levels}',
                  (selectedModel?.quants ?? []).map(q => quantLevelKey(q)).join(' · '),
                )}
              </p>
            </div>
          )}
          {mode === 'forward' && showForwardResult && ctxOverModel && (
            <div className="glass rounded-2xl p-4 border border-amber-500/20 mb-4">
              <p className="text-xs text-amber-300/90 leading-relaxed">
                {t.calc.ctxOverModel
                  .replace('{model}', selectedModel!.name)
                  .replace('{max}', selectedModel!.contextLength.toLocaleString('en-US'))
                  .replace('{ctx}', contextLen.toLocaleString('en-US'))}
              </p>
            </div>
          )}
          {mode === 'forward' && showForwardResult && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.calc.resultsTitle}</h3>
                <div className="space-y-3">
                  {[
                    { icon: Cpu,         label: t.calc.modelWeights, value: result.modelWeightsGB, color: 'text-violet-400' },
                    { icon: MemoryStick, label: t.calc.kvCache,      value: result.kvCacheGB,      color: 'text-cyan-400'   },
                    { icon: Zap,         label: t.calc.activations,  value: result.activationsGB,  color: 'text-orange-400' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={13} className={color} />
                      <span className="text-xs text-slate-400 flex-1">{label}</span>
                      <span className="font-mono text-sm text-slate-200">
                        {value.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span>
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Calculator size={13} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300 flex-1">{t.calc.total}</span>
                      <span className="font-mono text-base font-bold text-gradient">
                        {result.totalGB.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3">{t.calc.overhead}</p>

                {/* The path the task book asks for: a reader who has an answer
                    here should not have to re-enter it in the next tool. The
                    shared config already carries model/quant/context, so these
                    links only need to name the destination. */}
                {selectedModel && (
                  <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                    <Link
                      href={`/tools/cli-gen/?model=${selectedModel.id}`}
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300"
                    >
                      {t.calc.nextCommand} →
                    </Link>
                    <Link
                      href={`/quant-hub/${selectedModel.id}/`}
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-slate-500 hover:text-slate-300"
                    >
                      {t.calc.nextGuide} →
                    </Link>
                  </div>
                )}

                {/* Actionable when the answer is "no": the reader is told what
                    to change and what it would cost, not just that it fails.
                    Format mismatches get their own message below instead —
                    halving the context does not fix a card that cannot load
                    the format at any size. */}
                {profileGpu && (!selectedQuantObj || formatAllowed(profileGpu, selectedQuantObj.format)) &&
                  getVerdict(result.totalGB, capacityGB(profileGpu, profileCards)) !== 'green' && contextLen > 512 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <p className="text-xs font-semibold text-slate-400 mb-1.5">{t.calc.adviceTitle}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t.calc.adviceCtx
                        .replace('{ctx}', contextLen / 2 >= 1024 ? `${contextLen / 2048}K` : String(contextLen / 2))
                        .replace('{gb}', calcVRAM({ ...calcInput, contextLength: contextLen / 2 }).totalGB.toFixed(2))}
                    </p>
                    {kvType === 'f16' && result.kvCacheGB >= 0.5 && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        {t.calc.adviceKv.replace('{gb}', calcVRAM({ ...calcInput, kvBytesPerValue: KV_CACHE_TYPES.q8_0 }).totalGB.toFixed(2))}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.calc.adviceQuant}</p>
                  </div>
                )}
              </div>

              {selectedModel && levels.length > 1 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    {t.calc.levelsTitle.replace('{model}', selectedModel.name)}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {(profileGpu ? t.calc.levelsIntro : t.calc.levelsNoCard).replace('{ctx}', contextLabel(contextLen))}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-white/[0.06]">
                          <th scope="col" className="py-1.5 pr-2 font-medium">{t.calc.levelsColLevel}</th>
                          <th scope="col" className="py-1.5 pr-2 font-medium text-right">{t.calc.levelsColSize}</th>
                          <th scope="col" className="py-1.5 pr-2 font-medium text-right">{t.calc.levelsColLoss}</th>
                          {profileGpu && <th scope="col" className="py-1.5 font-medium text-right">{t.calc.levelsColCard}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {levels.map(row => (
                          <tr key={row.key} className={cn('border-b border-white/[0.03]', row.key === selectedQuant && 'bg-violet-500/[0.06]')}>
                            <td className="py-1 pr-2">
                              <button
                                onClick={() => { setSelectedQuant(row.key); setFormatGroup(findFormatGroup(row.key)); }}
                                aria-pressed={row.key === selectedQuant}
                                className="font-mono text-left text-slate-300 hover:text-violet-300 min-h-[32px]"
                              >
                                {row.key}
                              </button>
                              {row.pick && (
                                <span className="ml-1.5 badge text-[10px] bg-emerald-500/15 text-emerald-300 border-emerald-500/25">{t.calc.levelsBest}</span>
                              )}
                            </td>
                            <td className="py-1 pr-2 text-right font-mono text-slate-300">{row.totalGB.toFixed(1)} GB</td>
                            <td className="py-1 pr-2 text-right font-mono text-slate-500">{formatLoss(row.quant)}</td>
                            {profileGpu && (
                              <td className="py-1 text-right">
                                {row.formatOk ? (
                                  <span className={cn('inline-flex items-center gap-1', verdictConfig[row.verdict!].label)}>
                                    <span className={cn('w-1.5 h-1.5 rounded-full', verdictConfig[row.verdict!].dot)} />
                                    {row.verdict === 'green' ? t.calc.green : row.verdict === 'yellow' ? t.calc.yellow : t.calc.red}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">{t.calc.levelsNoRun}</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">{t.calc.hwTitle}</h3>

                {/* 43 bars, almost all green in the common case, is a lot of ink
                    for very little answer. The useful facts are: how many cards
                    clear it, the smallest one that does, and — if the reader has
                    told us their card — the verdict for that card specifically.
                    The full list stays one click away. */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {greenGpus.length === 0
                    ? t.calc.hwSummaryNone
                    : t.calc.hwSummary
                        .replace('{green}', String(greenGpus.length))
                        .replace('{total}', String(GPU_COUNT))
                        .replace('{smallest}', smallestGreen!.name)
                        .replace('{vram}', String(smallestGreen!.vram))}
                </p>

                {profileGpu && (() => {
                  const capacity = capacityGB(profileGpu, profileCards);
                  const formatOk = !selectedQuantObj || formatAllowed(profileGpu, selectedQuantObj.format);
                  const v = getVerdict(result.totalGB, capacity, tightCeiling(profileGpu));
                  return (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 mb-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs text-slate-500">{t.calc.hwYourCard}</span>
                        <span className="text-xs text-slate-300 font-medium">{profileCards > 1 ? `${profileCards}× ` : ''}{profileGpu.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', formatOk ? verdictConfig[v].bar : verdictConfig.red.bar)}
                            style={{ width: formatOk ? `${Math.min(100, (result.totalGB / capacity) * 100)}%` : '100%' }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-500 shrink-0">
                          {result.totalGB.toFixed(1)} / {capacity.toFixed(1)}G
                        </span>
                      </div>
                      {profileGpu.isUnified && (
                        <p className="text-[11px] text-slate-600 mt-1">
                          {t.calc.hwUsableOf
                            .replace('{usable}', capacity.toFixed(1))
                            .replace('{nameplate}', String(profileGpu.vram))}
                        </p>
                      )}
                      <p className={cn('text-xs mt-2', formatOk ? verdictConfig[v].label : verdictConfig.red.label)}>
                        {!formatOk
                          ? t.calc.hwFormatMismatch.replace('{format}', selectedQuantObj!.format)
                          : v === 'green'
                            ? t.calc.hwAdviceGreen.replace('{spare}', (capacity - result.totalGB).toFixed(1))
                            : v === 'yellow'
                              ? t.calc.hwAdviceYellow
                              : t.calc.hwAdviceRed}
                      </p>
                      {reach && (
                        <div className="mt-3 pt-2 border-t border-white/[0.05]">
                          <p className="text-xs font-medium text-slate-400">{t.calc.reachTitle}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                            {reach.tight === 0
                              ? t.calc.reachNone
                              : reach.comfortable === 0
                                ? t.calc.reachNoneComfortable.replace('{tight}', contextLabel(reach.tight)).replace('{limit}', contextLabel(reach.limit))
                                : reach.comfortable === reach.limit
                                  ? t.calc.reachFull.replace('{limit}', contextLabel(reach.limit))
                                  : t.calc.reachLine
                                      .replace('{comfortable}', contextLabel(reach.comfortable))
                                      .replace('{tight}', contextLabel(reach.tight))
                                      .replace('{limit}', contextLabel(reach.limit))}
                          </p>
                          {reachPreset && reachPreset !== contextLen && (
                            <button
                              onClick={() => setContextLen(reachPreset)}
                              className="mt-1 text-xs text-violet-400 hover:text-violet-300 min-h-[32px]"
                            >
                              {t.calc.reachApply.replace('{ctx}', contextLabel(reachPreset))} →
                            </button>
                          )}
                        </div>
                      )}
                      {selectedModel && selectedQuantObj && formatOk && profileGpu.bandwidth && (() => {
                        const bound = speedCeiling(profileGpu, selectedModel, selectedQuantObj, v);
                        if (!bound) return null;
                        const text = bound.basis === 'moe'
                          ? t.calc.speedMoELine
                              .replace('{n}', String(bound.tokS))
                              .replace('{active}', String(bound.activeB))
                          : t.calc.speedLine
                              .replace('{n}', String(bound.tokS))
                              .replace('{bw}', profileGpu.bandwidth.toLocaleString('en-US'))
                              .replace('{gb}', (profileGpu.bandwidth / bound.tokS).toFixed(1));
                        return (
                          <p className="text-xs text-slate-500 leading-relaxed mt-2">
                            {text}{profileCards > 1 && ` ${t.calc.speedMultiNote}`}
                          </p>
                        );
                      })()}
                      {v === 'red' && formatOk && (() => {
                        const plan = offloadPlan(calcInput, result, profileGpu, profileCards, ram, selectedModel, selectedQuantObj?.format);
                        if (!plan) return null;
                        return (
                          <div className="mt-3 pt-2 border-t border-white/[0.05]">
                            <p className="text-xs font-medium text-slate-400">{t.calc.offloadTitle}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                              {(plan.gpuLayers === 0 ? t.calc.offloadNone : t.calc.offloadLine)
                                .replace(/\{g\}/g, String(plan.gpuLayers))
                                .replace('{l}', String(plan.layers))
                                .replace('{ram}', plan.ramGB.toFixed(1))}
                            </p>
                            {plan.tokS !== undefined && (
                              <>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {(Object.keys(RAM_SETUPS) as RamSetup[]).map(k => (
                                    <button
                                      key={k}
                                      onClick={() => setRam(k)}
                                      aria-pressed={ram === k}
                                      className={cn(
                                        'px-2 py-1 rounded-lg text-[11px] font-mono border transition-colors',
                                        ram === k
                                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300',
                                      )}
                                    >
                                      {RAM_SETUPS[k].label}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                                  {t.calc.offloadSpeed
                                    .replace('{n}', String(plan.tokS))
                                    .replace('{ram}', RAM_SETUPS[ram].label)
                                    .replace('{gbs}', String(RAM_SETUPS[ram].gbs))}
                                </p>
                              </>
                            )}
                            {selectedModel && isMoE(selectedModel) && (
                              <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.calc.offloadMoE}</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                <details className="group">
                  <summary className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer min-h-[44px] flex items-center">
                    {t.calc.hwShowAll.replace('{total}', String(GPU_COUNT)).replace('{cpu}', String(gpuDatabase.length - GPU_COUNT))}
                  </summary>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                  {gpuDatabase.map(gpu => {
                    const formatOk = !selectedQuantObj || formatAllowed(gpu, selectedQuantObj.format);
                    const v = formatOk ? getVerdict(result.totalGB, usableCapacityGB(gpu), tightCeiling(gpu)) : 'red';
                    const cfg = verdictConfig[v];
                    const pct = formatOk ? Math.min(100, (result.totalGB / usableCapacityGB(gpu)) * 100) : 100;
                    return (
                      <div key={gpu.id} className="flex items-center gap-2 group" title={formatOk ? undefined : t.calc.hwFormatMismatch.replace('{format}', selectedQuantObj!.format)}>
                        <span className="text-sm w-4 shrink-0">{gpu.icon}</span>
                        <span className="text-xs text-slate-400 truncate w-36 shrink-0 group-hover:text-slate-200 transition-colors">
                          {gpu.name}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-500', cfg.bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-slate-600 w-12 text-right shrink-0">{gpu.vram}G</span>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                      </div>
                    );
                  })}
                  </div>
                </details>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{t.calc.green}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{t.calc.yellow}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{t.calc.red}</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'reverse' && showReverseResult && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">{t.calc.reverseTitle}</h3>
                <span className="text-xs text-slate-500">
                  {t.calc.reverseResults.replace('{count}', String(recommendations.length))}
                </span>
              </div>

              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-8">{t.calc.reverseEmpty}</p>
              ) : (
                <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
                  {recommendations.map(({ model, quant, totalGB, verdict }) => {
                    const level = quantLevelKey(quant);
                    const cfg = verdictConfig[verdict];
                    return (
                      <div
                        key={`${model.id}-${quant.format}-${quant.level}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-200 truncate">{model.name}</span>
                            <span className={cn('badge text-xs font-mono', formatColors[quant.format])}>
                              {quant.format} {quant.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            <span className="font-mono">{totalGB.toFixed(1)} GB</span>
                            <span>PPL {quant.pplLossPercent === undefined ? formatLoss(quant) : `−${formatLoss(quant)}`}</span>
                            {quant.speedRTX4090 != null && <span>{t.calc.speedOn4090.replace('{n}', String(quant.speedRTX4090))}<ConfidenceTag modelId={model.id} quant={quant} /></span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/quant-hub/${model.id}/`}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {t.calc.viewModel}
                          </Link>
                          <Link
                            href={`/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(level)}&ctx=${contextLen}&batch=${batchSize}${selectedGpuId ? `&gpu=${selectedGpuId}` : ''}`}
                            onClick={e => openForward(e, model.id, level)}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            {t.hub.detail.calc}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {((mode === 'forward' && !showForwardResult) || (mode === 'reverse' && !showReverseResult)) && (
            <div className="glass rounded-2xl p-8 flex items-center justify-center h-full min-h-48">
              <div className="text-center">
                <Calculator size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600">
                  {mode === 'forward' ? t.calc.pickModel : t.calc.selectGpuPlaceholder}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keeps the pinned bar from covering the end of the page. */}
      {showForwardResult && <div className="h-16 lg:hidden" aria-hidden="true" />}
      {showForwardResult && !resultsInView && (() => {
        const capacity = profileGpu ? capacityGB(profileGpu, profileCards) : 0;
        const formatOk = !profileGpu || !selectedQuantObj || formatAllowed(profileGpu, selectedQuantObj.format);
        const v = profileGpu ? (formatOk ? getVerdict(result.totalGB, capacity, tightCeiling(profileGpu)) : 'red') : null;
        return (
          <div
            className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur px-4 pt-2.5"
            style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedModel ? selectedModel.name : t.calc.customLabel} · {selectedQuant} · {contextLabel(contextLen)}
                </p>
                <p className="text-sm text-slate-200 truncate">
                  <span className="font-mono font-semibold">{result.totalGB.toFixed(1)} {t.calc.gbUnit}</span>
                  {v ? (
                    <span className={cn('ml-2 text-xs', verdictConfig[v].label)}>
                      {v === 'green' ? t.calc.green : v === 'yellow' ? t.calc.yellow : t.calc.red} · {profileGpu!.name}
                    </span>
                  ) : (
                    <span className="ml-2 text-xs text-slate-500">{t.calc.stickyNoCard}</span>
                  )}
                </p>
              </div>
              <a
                href="#calc-result"
                onClick={e => { e.preventDefault(); resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-violet-200 bg-violet-500/15 border border-violet-500/30"
              >
                {t.calc.stickyDetails}
                <ChevronDown size={12} />
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}