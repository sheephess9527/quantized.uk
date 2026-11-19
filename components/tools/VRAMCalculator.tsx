'use client';

import { useState, useMemo, useEffect, useRef, useCallback, type MouseEvent } from 'react';
import ConfidenceTag from '@/components/ui/ConfidenceTag';
import Link from '@/components/i18n/LocalLink';
import { Calculator, Cpu, MemoryStick, Zap, ChevronDown, Copy, Check, ArrowRightLeft, Search, Wrench, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import CalculatorEvidence from '@/components/tools/CalculatorEvidence';
import RerankerLink from '@/components/tools/RerankerLink';
import RelatedReports from '@/components/reports/RelatedReports';
import RunReportForm from '@/components/feedback/RunReportForm';
import VramStackBar from './VramStackBar';
import { models } from '@/lib/data/models';
import { gpuDatabase, POPULAR_GPU_IDS, type GPU } from '@/lib/data/gpus';
import { quantBPW, quantGroups, calcVRAM, getVerdict, KV_CACHE_TYPES, type KvCacheType } from '@/lib/utils/vram';
import LaunchCommands from '@/components/tools/LaunchCommands';
import ShareCard from '@/components/tools/ShareCard';
import { speedQuote, streamTokS, feelHref, feelContext } from '@/lib/utils/speed-label';
import { measuredSpeed, CALIBRATION_ERROR } from '@/lib/utils/measured-speed';
import { modelShape, levelTable, contextReach, rigSpeedCeiling, offloadPlan, canStack, capacityGB, MAX_CARDS, RAM_SETUPS, rigFormatAllowed, servingCapacity, rigDevices, VLLM_MEMORY_UTILIZATION, type RamSetup } from '@/lib/utils/calc-insights';
import { getRecommendations, quantLevelKey, SortBy, type RecommendationInput } from '@/lib/utils/recommend';
import { hasImageInput } from '@/lib/utils/model-facts';
import { usableCapacityGB, formatAllowed, tightCeiling, backendFor, vllmRocmSupported } from '@/lib/utils/gpu-page';
import { cn } from '@/lib/utils/cn';
import { contextLabel, exactLabel } from '@/lib/utils/context-label';
import { formatLoss, referenceQuant } from '@/lib/utils/quality';
import { groupedModels } from '@/lib/utils/model-groups';
import { useUrlQuery } from '@/lib/hooks/useUrlQuery';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { trackEvent } from '@/lib/analytics';
import { nameCarriesLabel, isMoE, isSuperseded, activeParamsB } from '@/lib/utils/model-meta';
import { homePicks } from '@/lib/utils/home-picks';
import { searchModels } from '@/lib/utils/model-search';
import { importFromHub, parseRepoInput, mmprojFromHub, type ImportedShape } from '@/lib/utils/hf-import';
import { hfRepoMap } from '@/lib/data/hf-repos';
import type { ModelArch, QuantModel, QuantVariant } from '@/lib/data/types';
import { rigPrefillSeconds } from '@/lib/utils/prefill';
import { prefillData } from '@/lib/data/prefill';
import { finetuneMemory, type FtMethod, type FtOptimizer, type FtShape } from '@/lib/utils/finetune';
import { bySmallestCard, sizeAt } from '@/lib/utils/model-explainer';
import { GPU_COUNT } from '@/lib/site';

type Mode = 'forward' | 'reverse' | 'finetune';
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

/** Index entry whose Hub repo is `repo` (either the repo read or the base it named). */
function indexedModelFor(shape: ImportedShape) {
  const wanted = [shape.repo, shape.configRepo].filter(Boolean).map(r => r!.toLowerCase());
  const id = Object.entries(hfRepoMap).find(([, r]) => wanted.includes(r.toLowerCase()))?.[0];
  return id ? models.find(m => m.id === id) : undefined;
}

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

/** The speed player's link for this pick, or undefined when it could only show a ceiling there. */
function feelTarget(gpu: GPU | undefined, model: QuantModel, quant: QuantVariant, contextLen: number): string | undefined {
  const ctx = feelContext(contextLen);
  if (gpu && streamTokS(speedQuote(gpu, model, quant, ctx)) === undefined) return undefined;
  const right = gpu?.id === 'rtx4090' ? gpuDatabase.find(g => g.id === 'rtx5090') : undefined;
  return feelHref(gpu, right, { model, quant }, ctx);
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
  /** Further cards of other models in the same machine (a 3060 beside a 3090). */
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [ram, setRam] = useState<RamSetup>('ddr5-5600');
  const [formatGroup, setFormatGroup] = useState<keyof typeof quantGroups>('GGUF');
  const [customParams, setCustomParams] = useState('7');
  const [customLayers, setCustomLayers] = useState('32');
  const [customKvHeads, setCustomKvHeads] = useState('8');
  const [customHeadDim, setCustomHeadDim] = useState('128');
  // A Hugging Face import fills the four fields above and, when the config says
  // so, the attention shape and trained window that a hand-typed model lacks.
  const [customAttention, setCustomAttention] = useState<ModelArch['attention']>(undefined);
  const [customCtx, setCustomCtx] = useState<number | undefined>(undefined);
  const [customRepo, setCustomRepo] = useState('');
  const [hfInput, setHfInput] = useState('');
  const [hfBusy, setHfBusy] = useState(false);
  const [hfError, setHfError] = useState<'badInput' | 'notFound' | 'network' | null>(null);
  const [hfShape, setHfShape] = useState<ImportedShape | null>(null);
  const [hfEdited, setHfEdited] = useState(false);
  const hfInputRef = useRef<HTMLInputElement>(null);
  // Fine-tune mode.
  const [ftMethod, setFtMethod] = useState<FtMethod>('qlora');
  const [ftOpt, setFtOpt] = useState<FtOptimizer>('adamw');
  const [ftRank, setFtRank] = useState(16);
  const [ftSeq, setFtSeq] = useState(2048);
  const [ftBatch, setFtBatch] = useState(1);
  const [ftCkpt, setFtCkpt] = useState(true);
  const [ftHidden, setFtHidden] = useState('');
  const [ftVocab, setFtVocab] = useState('');
  /** Per index model: config read from the Hub for the fields inference never needed. */
  const [ftHub, setFtHub] = useState<Record<string, ImportedShape | 'loading' | 'failed'>>({});
  const [selectedGpuId, setSelectedGpuId] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('quality');
  const [includeYellow, setIncludeYellow] = useState(true);
  const [bestPerModel, setBestPerModel] = useState(true);
  const [reverseInput, setReverseInput] = useState<RecommendationInput>('text');
  const [linkCopied, setLinkCopied] = useState(false);
  const [invalidModelId, setInvalidModelId] = useState<string | null>(null);
  const [modelQuery, setModelQuery] = useState('');
  /** A multimodal model's vision encoder, in GB — entered or read, never assumed. */
  const [mmprojGB, setMmprojGB] = useState('');
  const [mmprojFile, setMmprojFile] = useState('');
  const [mmprojState, setMmprojState] = useState<'idle' | 'loading' | 'failed'>('idle');
  /** A frozen result to compare the live one against. */
  const [pinned, setPinned] = useState<{ desc: string; totalGB: number; verdict?: VerdictColor; capacity?: number } | null>(null);
  /** Rigs the reader saved, kept in this browser only. */
  const [savedRigs, setSavedRigs] = useState<{ gpuId: string; cards: number; extra: string[] }[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('qz-rigs');
      if (raw) setSavedRigs((JSON.parse(raw) as { gpuId: string; cards: number; extra: string[] }[])
        .filter(r => gpuDatabase.some(g => g.id === r.gpuId)).slice(0, 5));
    } catch { /* storage unavailable: the feature simply starts empty */ }
  }, []);
  const storeRigs = (next: { gpuId: string; cards: number; extra: string[] }[]) => {
    setSavedRigs(next);
    try { window.localStorage.setItem('qz-rigs', JSON.stringify(next)); } catch { /* not persisted */ }
  };

  // Precedence: URL > stored config > default. A shared link has to win over
  // whatever the recipient happens to have saved, or the link shows something
  // other than what the sender saw. Waits for `configReady` so the stored
  // fallback is not missed on first paint.
  useEffect(() => {
    if (urlInitialized.current || !searchParams || !configReady) return;
    const modeParam = searchParams.get('mode');
    const m: Mode = modeParam === 'reverse' || modeParam === 'finetune' ? modeParam : 'forward';
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
    const extraParam = searchParams.get('extra');
    if (extraParam) setExtraIds(extraParam.split(',').filter(id => gpuDatabase.some(g => g.id === id)).slice(0, MAX_CARDS - 1));
    const cardsParam = Number(searchParams.get('cards'));
    if (Number.isInteger(cardsParam) && cardsParam >= 1 && cardsParam <= MAX_CARDS) setCards(cardsParam);
    const ramParam = searchParams.get('ram');
    if (ramParam && ramParam in RAM_SETUPS) setRam(ramParam as RamSetup);
    const ftm = searchParams.get('ft'); if (ftm === 'qlora' || ftm === 'lora' || ftm === 'full') setFtMethod(ftm);
    if (searchParams.get('opt') === 'adamw8bit') setFtOpt('adamw8bit');
    const rk = Number(searchParams.get('r')); if ([8, 16, 32, 64, 128].includes(rk)) setFtRank(rk);
    const sq = Number(searchParams.get('seq')); if (sq >= 256 && sq <= 131072) setFtSeq(sq);
    const mb = Number(searchParams.get('mb')); if (mb >= 1 && mb <= 64) setFtBatch(mb);
    if (searchParams.get('gc') === '0') setFtCkpt(false);
    const mm = Number(searchParams.get('mmproj')); if (mm > 0 && mm < 50) setMmprojGB(String(mm));
    const hid = searchParams.get('hidden'); if (hid && Number(hid) > 0) setFtHidden(hid);
    const voc = searchParams.get('vocab'); if (voc && Number(voc) > 0) setFtVocab(voc);
    // A custom model is only shareable if its shape travels with the link —
    // without these the recipient got the 7B / 32-layer defaults.
    if (modelParam === 'custom') {
      const p = searchParams.get('params'); if (p) setCustomParams(p);
      const l = searchParams.get('layers'); if (l) setCustomLayers(l);
      const kv = searchParams.get('kv'); if (kv) setCustomKvHeads(kv);
      const hd = searchParams.get('hd'); if (hd) setCustomHeadDim(hd);
      // An imported shape travels as numbers, never as a re-fetch: the
      // recipient sees what the sender saw even if the repo has changed.
      const full = Number(searchParams.get('full'));
      const win = Number(searchParams.get('win'));
      const wt = Number(searchParams.get('wt'));
      if (full > 0 || win > 0) setCustomAttention({ fullLayers: full || 0, ...(win > 0 && wt > 0 ? { windowLayers: win, windowTokens: wt } : {}) });
      const mctx = Number(searchParams.get('mctx')); if (mctx > 0) setCustomCtx(mctx);
      const repo = searchParams.get('repo'); if (repo && /^[\w.-]+\/[\w.-]+$/.test(repo)) setCustomRepo(repo);
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
    if (searchParams.get('all') === '1') setBestPerModel(false);
    if (searchParams.get('input') === 'image') setReverseInput('image');
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
    if (extraIds.length) params.set('extra', extraIds.join(','));
    if (ram !== 'ddr5-5600') params.set('ram', ram);
    if (mode === 'finetune') {
      params.set('ft', ftMethod);
      if (ftOpt !== 'adamw') params.set('opt', ftOpt);
      if (ftMethod !== 'full') params.set('r', String(ftRank));
      params.set('seq', String(ftSeq));
      params.set('mb', String(ftBatch));
      if (!ftCkpt) params.set('gc', '0');
      if (ftHidden) params.set('hidden', ftHidden);
      if (ftVocab) params.set('vocab', ftVocab);
    }
    if (mode === 'forward' && Number(mmprojGB) > 0) params.set('mmproj', mmprojGB);
    if (mode === 'forward' || mode === 'finetune') {
      if (selectedModelId) params.set('model', selectedModelId);
      if (selectedModelId === 'custom') {
        params.set('params', customParams);
        params.set('layers', customLayers);
        params.set('kv', customKvHeads);
        params.set('hd', customHeadDim);
        if (customAttention?.fullLayers !== undefined) params.set('full', String(customAttention.fullLayers));
        if (customAttention?.windowLayers) {
          params.set('win', String(customAttention.windowLayers));
          params.set('wt', String(customAttention.windowTokens ?? 0));
        }
        if (customCtx) params.set('mctx', String(customCtx));
        if (customRepo) params.set('repo', customRepo);
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
      if (!bestPerModel) params.set('all', '1');
      if (reverseInput === 'image') params.set('input', 'image');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`);
  }, [mode, selectedModelId, selectedQuant, contextLen, batchSize, selectedGpuId, profileGpuId, sortBy, includeYellow, bestPerModel, reverseInput, customParams, customLayers, customKvHeads, customHeadDim, customAttention, customCtx, customRepo, kvType, cards, extraIds, ram, ftMethod, ftOpt, ftRank, ftSeq, ftBatch, ftCkpt, ftHidden, ftVocab, mmprojGB]);

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
    setFtHidden('');
    setFtVocab('');
    setMmprojGB('');
    setMmprojFile('');
    setMmprojState('idle');
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
  const openForward = (e: MouseEvent, modelId: string, level: string, extraGB?: number) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setMode('forward');
    setSelectedModelId(modelId);
    setInvalidModelId(null);
    setSelectedQuant(level);
    setFormatGroup(findFormatGroup(level));
    setMmprojGB(extraGB === undefined ? '' : String(extraGB));
    setMmprojFile('');
    setMmprojState('idle');
    setExtraIds([]);
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
        extraGB: Number(mmprojGB) > 0 ? Number(mmprojGB) : undefined,
      };
    }
    const bpw = tableBpw;
    return {
      paramsB: parseFloat(customParams) || 7,
      layers: parseInt(customLayers) || 32,
      kvHeads: parseInt(customKvHeads) || 8,
      headDim: parseInt(customHeadDim) || 128,
      attention: customAttention,
      bpw,
      contextLength: contextLen,
      batchSize,
      kvBytesPerValue: KV_CACHE_TYPES[kvType],
      extraGB: Number(mmprojGB) > 0 ? Number(mmprojGB) : undefined,
    };
  }, [selectedModel, selectedQuant, contextLen, batchSize, customParams, customLayers, customKvHeads, customHeadDim, customAttention, kvType, mmprojGB]);

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
    return getRecommendations(selectedGpu, contextLen, batchSize, sortBy, includeYellow, KV_CACHE_TYPES[kvType], canStack(selectedGpu) ? cards : 1, bestPerModel, reverseInput);
  }, [selectedGpu, contextLen, batchSize, sortBy, includeYellow, kvType, cards, bestPerModel, reverseInput]);

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

  const runImport = async (raw?: string) => {
    const input = raw ?? hfInput;
    if (raw !== undefined) setHfInput(raw);
    setSelectedModelId('custom');
    setInvalidModelId(null);
    setHfBusy(true);
    setHfError(null);
    const r = await importFromHub(input);
    setHfBusy(false);
    if (!r.ok) {
      setHfError(r.error);
      setHfShape(null);
      return;
    }
    const sh = r.shape;
    setHfShape(sh);
    setHfEdited(false);
    setModelQuery('');
    if (sh.paramsB) setCustomParams(String(+sh.paramsB.toFixed(2)));
    if (sh.layers) setCustomLayers(String(sh.layers));
    if (sh.kvHeads) setCustomKvHeads(String(sh.kvHeads));
    if (sh.headDim) setCustomHeadDim(String(sh.headDim));
    // The attention shape belongs to the layer count it was read with; without
    // a readable config there is no shape, and a stale one must not linger.
    setCustomAttention(sh.layers ? sh.attention : undefined);
    setCustomCtx(sh.contextLength);
    setCustomRepo(sh.repo);
    trackEvent('HF Import');
  };
  const openImport = () => {
    setSelectedModelId('custom');
    setInvalidModelId(null);
    const pasted = modelQuery.includes('/') ? parseRepoInput(modelQuery) : null;
    if (pasted) { void runImport(pasted); return; }
    setTimeout(() => hfInputRef.current?.focus(), 0);
  };
  const pastedRepo = modelQuery.includes('/') ? parseRepoInput(modelQuery) : null;

  // ── Fine-tune mode ──────────────────────────────────────────────────────
  // Inference sizing never needed the model width or the vocabulary; fine-
  // tuning does (activations, logits, embeddings kept 16-bit under QLoRA).
  // An imported config supplies them; an index model can read its own on
  // request; otherwise the width falls back to heads × head size, labelled.
  const ftHubEntry = selectedModel ? ftHub[selectedModel.id] : undefined;
  const ftHubShape: ImportedShape | undefined = selectedModel
    ? (typeof ftHubEntry === 'object' ? ftHubEntry : undefined)
    : selectedModelId === 'custom' ? hfShape ?? undefined : undefined;
  // MLA entries store a compressed cache shape (e.g. 1 × 288), which says
  // nothing about the model width — no fallback for those.
  const ftIsMla = !!selectedModel && selectedModel.arch.kvHeads === 1 && ![64, 80, 96, 128, 256].includes(selectedModel.arch.headDim);
  const ftHiddenGuess = selectedModel && !ftIsMla ? selectedModel.arch.attHeads * selectedModel.arch.headDim : undefined;
  const ftHiddenSource: 'manual' | 'config' | 'heads' | 'missing' =
    Number(ftHidden) > 0 ? 'manual' : ftHubShape?.hidden ? 'config' : ftHiddenGuess ? 'heads' : 'missing';
  const ftVocabValue = Number(ftVocab) || ftHubShape?.vocab;
  const ftShape: FtShape | null = useMemo(() => {
    const hidden = Number(ftHidden) || ftHubShape?.hidden || ftHiddenGuess;
    if (!hidden) return null;
    if (selectedModel) {
      const a = selectedModel.arch;
      return {
        paramsB: selectedModel.params,
        layers: a.layers,
        hidden,
        qDim: ftIsMla ? hidden : a.attHeads * a.headDim,
        kvDim: ftIsMla ? hidden : a.kvHeads * a.headDim,
        intermediate: ftHubShape?.intermediate,
        vocab: ftVocabValue,
        tiedEmbeddings: ftHubShape?.tiedEmbeddings,
      };
    }
    if (selectedModelId !== 'custom') return null;
    return {
      paramsB: parseFloat(customParams) || 7,
      layers: parseInt(customLayers) || 32,
      hidden,
      qDim: hidden,
      kvDim: (parseInt(customKvHeads) || 8) * (parseInt(customHeadDim) || 128),
      intermediate: ftHubShape?.intermediate,
      vocab: ftVocabValue,
      tiedEmbeddings: ftHubShape?.tiedEmbeddings,
    };
  }, [selectedModel, selectedModelId, ftHidden, ftHubShape, ftHiddenGuess, ftIsMla, ftVocabValue, customParams, customLayers, customKvHeads, customHeadDim]);
  const ftRun = (method: FtMethod) => ftShape
    ? finetuneMemory({ shape: ftShape, method, optimizer: ftOpt, rank: ftRank, seqLen: ftSeq, batch: ftBatch, checkpointing: ftCkpt })
    : null;
  const ftResult = ftRun(ftMethod);
  const readFtHub = async () => {
    if (!selectedModel) return;
    const id = selectedModel.id;
    const repo = hfRepoMap[id];
    if (!repo) { setFtHub(h => ({ ...h, [id]: 'failed' })); return; }
    setFtHub(h => ({ ...h, [id]: 'loading' }));
    const r = await importFromHub(repo);
    setFtHub(h => ({ ...h, [id]: r.ok && (r.shape.hidden || r.shape.vocab) ? r.shape : 'failed' }));
  };

  /** Cards actually counted: stacking only means something for discrete cards. */
  const profileCards = profileGpu && canStack(profileGpu) ? cards : 1;
  // Extra cards only count beside a discrete card on the same backend — one
  // llama.cpp/vLLM build drives them all — and the rig stays within MAX_CARDS.
  const profileExtras = useMemo(() => {
    if (!profileGpu || !canStack(profileGpu)) return [];
    return extraIds
      .map(id => gpuDatabase.find(g => g.id === id))
      .filter((g): g is GPU => !!g && canStack(g) && backendFor(g) === backendFor(profileGpu))
      .slice(0, Math.max(0, MAX_CARDS - profileCards));
  }, [extraIds, profileGpu, profileCards]);
  const rigLabel = profileGpu
    ? [`${profileCards > 1 ? `${profileCards}× ` : ''}${profileGpu.name}`, ...profileExtras.map(g => g.name)].join(' + ')
    : '';
  const rigCapacity = profileGpu ? capacityGB(profileGpu, profileCards, profileExtras) : 0;
  const multiDevice = profileCards > 1 || profileExtras.length > 0;

  // Second-order answers for the reader's own card — see calc-insights.ts.
  const levels = useMemo(
    () => selectedModel ? levelTable(selectedModel, profileGpu ?? undefined, contextLen, batchSize, KV_CACHE_TYPES[kvType], profileCards, profileExtras, Number(mmprojGB) > 0 ? Number(mmprojGB) : undefined) : [],
    [selectedModel, profileGpu, contextLen, batchSize, kvType, profileCards, profileExtras, mmprojGB],
  );
  const reach = useMemo(() => {
    if (!profileGpu) return undefined;
    if (selectedQuantObj && !rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format)) return undefined;
    const { bpw, contextLength: _ctx, ...shape } = calcInput;
    // A hand-typed model has no declared window; 128K is the generic ceiling.
    // An imported one carries its trained context.
    return contextReach(shape, bpw, profileGpu, selectedModel?.contextLength ?? customCtx ?? 131072, profileCards, profileExtras);
  }, [calcInput, profileGpu, selectedModel, selectedQuantObj, profileCards, profileExtras, customCtx]);
  /** Largest preset chip inside the reach, so "use it" lands on a round value. */
  const reachPreset = reach
    ? [...CONTEXT_PRESETS].reverse().find(p => p <= (reach.comfortable || reach.tight))
    : undefined;

  const contextLimit = selectedModel?.contextLength ?? customCtx ?? 131072;
  const formatOk = !profileGpu || !selectedQuantObj || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format);
  const currentVerdict = profileGpu
    ? formatOk ? getVerdict(result.totalGB, rigCapacity, tightCeiling(profileGpu)) : 'red'
    : undefined;
  const overBudget = !!profileGpu && formatOk && result.totalGB > rigCapacity;
  const quantOptions = levels.filter(row =>
    contextLen <= contextLimit && row.key !== selectedQuant && row.formatOk &&
    (row.verdict === 'green' || ((overBudget || currentVerdict === 'red') && row.verdict === 'yellow')) &&
    row.totalGB < result.totalGB && row.totalGB <= rigCapacity &&
    (!calcInput.extraGB || row.quant.format === selectedQuantObj?.format)
  );
  const quantFix = quantOptions.find(row => row.pick) ??
    quantOptions.find(row => row.verdict === 'green') ?? quantOptions[quantOptions.length - 1];
  const contextFix = profileGpu && formatOk && reach && currentVerdict !== 'green'
    ? [reach.comfortable || (overBudget ? reach.tight : 0), ...CONTEXT_PRESETS.slice().reverse()]
        .filter(ctx => ctx > 0 && ctx < contextLen && ctx <= contextLimit)
        .map(ctx => {
          const totalGB = calcVRAM({ ...calcInput, contextLength: ctx }).totalGB;
          return { ctx, totalGB, verdict: getVerdict(totalGB, rigCapacity, tightCeiling(profileGpu)) };
        })
        .find(row => row.totalGB < result.totalGB && row.totalGB <= rigCapacity &&
          (row.verdict === 'green' || ((overBudget || currentVerdict === 'red') && row.verdict === 'yellow')))
    : undefined;

  const modelLookupFailed = selectedModelId !== '' && selectedModelId !== 'custom' && !selectedModel;
  // No model selected means no result. Allowing `selectedModelId === ''` here
  // meant the panel silently fell through to the custom-model defaults (7B /
  // 32 layers / 8 kvHeads) and presented 4.98 GB plus a green verdict on all 43
  // GPUs as if it were an answer about a model the reader never picked.
  const showForwardResult = mode === 'forward' && !modelLookupFailed && !invalidModelId && (
    selectedModelId === 'custom' || !!selectedModel
  );
  const launchOffload = showForwardResult && profileGpu && formatOk && !ctxOverModel
    ? offloadPlan(calcInput, result, profileGpu, profileCards, ram, selectedModel, selectedQuantObj?.format, profileExtras, selectedQuantObj?.level)
    : undefined;
  const canShowLaunch = selectedModel && selectedQuantObj && formatOk && !ctxOverModel;
  const launchCommands = canShowLaunch && (!overBudget || launchOffload) ? (
    <LaunchCommands
      model={selectedModel}
      quant={selectedQuantObj}
      contextLen={contextLen}
      gpu={profileGpu ?? undefined}
      gpuLayers={launchOffload?.gpuLayers}
      cpuMoe={launchOffload?.moe && { n: launchOffload.moe.n, all: launchOffload.moe.all }}
      advanced={multiDevice || batchSize !== 1 || kvType !== 'f16' || !!calcInput.extraGB}
    />
  ) : null;
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
      <RerankerLink placement="vram" />
      {/* Mode toggle + share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['forward', 'reverse', 'finetune'] as Mode[]).map(m => (
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
              {m === 'forward' ? <Calculator size={14} /> : m === 'reverse' ? <ArrowRightLeft size={14} /> : <Wrench size={14} />}
              {m === 'forward' ? t.calc.modeForward : m === 'reverse' ? t.calc.modeReverse : t.calc.modeFinetune}
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
        {mode === 'forward' ? t.calc.modeForwardDesc : mode === 'reverse' ? t.calc.modeReverseDesc : t.calc.modeFinetuneDesc}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {mode !== 'reverse' ? (
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
                <button
                  type="button"
                  onClick={openImport}
                  className="mt-2 inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 text-xs text-violet-300 hover:text-violet-200"
                >
                  {pastedRepo ? `${t.calc.hfLabel}: ${pastedRepo}` : t.calc.hfOpen} →
                </button>
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

              {mode === 'forward' && profileGpu && canStack(profileGpu) && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.cardCount}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: MAX_CARDS - profileExtras.length }, (_, i) => i + 1).map(n => (
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
                  {/* A second, different card in the same machine — the most
                      common hobbyist rig, which the identical-card count could
                      not describe. Same backend only: one build drives them. */}
                  {profileExtras.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profileExtras.map((g, i) => (
                        <button
                          key={`${g.id}-${i}`}
                          onClick={() => setExtraIds(ids => ids.filter((_, j) => j !== i))}
                          aria-label={t.calc.extraCardRemove.replace('{gpu}', g.name)}
                          className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border bg-violet-500/15 text-violet-200 border-violet-500/30"
                        >
                          + {g.name} <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {profileCards + profileExtras.length < MAX_CARDS && (
                    <div className="relative mt-2">
                      <select
                        aria-label={t.calc.extraCardAdd}
                        value=""
                        onChange={e => { const id = e.target.value; if (id) setExtraIds(ids => [...ids, id]); }}
                        className="w-full appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
                      >
                        <option value="">+ {t.calc.extraCardAdd}</option>
                        {gpuDatabase
                          .filter(g => canStack(g) && backendFor(g) === backendFor(profileGpu))
                          .map(g => <option key={g.id} value={g.id}>{g.name} ({g.vram} GB)</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  )}
                  {profileExtras.length > 0 && <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{t.calc.extraCardNote}</p>}
                </div>
              )}

              {mode === 'forward' && (profileGpu || savedRigs.length > 0) && (() => {
                const nameOf = (r: { gpuId: string; cards: number; extra: string[] }) => {
                  const g = gpuDatabase.find(x => x.id === r.gpuId);
                  return [`${r.cards > 1 ? `${r.cards}× ` : ''}${g?.name ?? r.gpuId}`, ...r.extra.map(id => gpuDatabase.find(x => x.id === id)?.name ?? id)].join(' + ');
                };
                const current = profileGpu ? { gpuId: profileGpu.id, cards: profileCards, extra: profileExtras.map(g => g.id) } : null;
                const same = (a: { gpuId: string; cards: number; extra: string[] }, b: typeof a) => a.gpuId === b.gpuId && a.cards === b.cards && a.extra.join() === b.extra.join();
                return (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {savedRigs.length > 0 && <span className="text-[11px] text-slate-600">{t.calc.rigSaved}</span>}
                    {savedRigs.map((r, i) => (
                      <span key={i} className="inline-flex items-center rounded-lg border border-white/[0.08] text-xs">
                        <button
                          onClick={() => { setGpuId(r.gpuId); setCards(r.cards); setExtraIds(r.extra); }}
                          aria-pressed={!!current && same(current, r)}
                          className={cn('px-2.5 py-1 min-h-[36px] sm:min-h-0', current && same(current, r) ? 'text-violet-200' : 'text-slate-300 hover:text-violet-200')}
                        >
                          {nameOf(r)}
                        </button>
                        <button
                          onClick={() => storeRigs(savedRigs.filter((_, j) => j !== i))}
                          aria-label={t.calc.rigRemove.replace('{rig}', nameOf(r))}
                          className="px-2 py-1 text-slate-600 hover:text-slate-300 border-l border-white/[0.06]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {current && !savedRigs.some(r => same(r, current)) && (
                      <button
                        onClick={() => storeRigs([...savedRigs, current].slice(-5))}
                        className="px-2.5 py-1 min-h-[36px] sm:min-h-0 rounded-lg text-xs text-violet-300 border border-dashed border-violet-500/30 hover:text-violet-200"
                      >
                        + {t.calc.rigSave}
                      </button>
                    )}
                  </div>
                );
              })()}

              {selectedModelId === 'custom' && (
                <div className="glass rounded-xl p-4 space-y-3">
                  <div>
                    <label htmlFor="calc-hf" className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.hfLabel}</label>
                    <form onSubmit={e => { e.preventDefault(); void runImport(); }} className="flex gap-2">
                      <input
                        id="calc-hf"
                        ref={hfInputRef}
                        value={hfInput}
                        onChange={e => setHfInput(e.target.value)}
                        placeholder={t.calc.hfPlaceholder}
                        autoComplete="off"
                        spellCheck={false}
                        className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40"
                      />
                      <button
                        type="submit"
                        disabled={hfBusy || !hfInput.trim()}
                        className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium text-violet-200 bg-violet-500/15 border border-violet-500/30 disabled:opacity-50"
                      >
                        {hfBusy ? t.calc.hfLoading : t.calc.hfButton}
                      </button>
                    </form>
                    <p className="text-[11px] text-slate-600 mt-1">{t.calc.hfPrivacy}</p>
                    {hfError && (
                      <p className="text-xs text-amber-300 mt-2" role="alert">
                        {hfError === 'badInput' ? t.calc.hfErrBadInput : hfError === 'notFound' ? t.calc.hfErrNotFound : t.calc.hfErrNetwork}
                      </p>
                    )}
                    {hfShape && !hfError && (() => {
                      const sh = hfShape;
                      const indexed = indexedModelFor(sh);
                      const notes = sh.notes.map(n => {
                        switch (n) {
                          case 'gated': return t.calc.hfNoteGated;
                          case 'noConfig': return t.calc.hfNoteNoConfig;
                          case 'viaBase': return t.calc.hfNoteViaBase.replace('{base}', sh.configRepo ?? '');
                          case 'noParams': return t.calc.hfNoteNoParams;
                          case 'mla': return t.calc.hfNoteMla;
                          case 'linear': return t.calc.hfNoteLinear.replace('{full}', String(sh.attention?.fullLayers ?? 0));
                          case 'window': return t.calc.hfNoteWindow
                            .replace('{win}', String(sh.attention?.windowLayers ?? 0))
                            .replace('{cells}', (sh.attention?.windowTokens ?? 0).toLocaleString('en-US'));
                          case 'windowIgnored': return t.calc.hfNoteWindowIgnored;
                          case 'moe': return t.calc.hfNoteMoe
                            .replace('{experts}', String(sh.experts ?? ''))
                            .replace('{active}', sh.expertsPerToken ? t.calc.hfNoteMoeActive.replace('{n}', String(sh.expertsPerToken)) : '');
                        }
                      });
                      return (
                        <div className="mt-2 space-y-1.5">
                          {sh.layers && (
                            <p className="text-xs text-emerald-300/90">
                              {t.calc.hfDone
                                .replace('{repo}', sh.repo)
                                .replace('{layers}', String(sh.layers))
                                .replace('{kv}', String(sh.kvHeads ?? '?'))
                                .replace('{hd}', String(sh.headDim ?? '?'))
                                .replace('{params}', sh.paramsB ? t.calc.hfParams.replace('{p}', String(+sh.paramsB.toFixed(2))) : '')}
                              {sh.contextLength ? ` ${t.calc.hfMaxCtx.replace('{ctx}', contextLabel(sh.contextLength))}` : ''}
                              {hfEdited ? ` · ${t.calc.hfEdited}` : ''}
                            </p>
                          )}
                          {notes.map((n, i) => (
                            <p key={i} className="text-[11px] text-slate-500 leading-relaxed">{n}</p>
                          ))}
                          {indexed && (
                            <button
                              type="button"
                              onClick={() => chooseModel(indexed.id)}
                              className="inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border text-violet-200 border-violet-500/30 bg-violet-500/10"
                            >
                              {t.calc.hfInIndex.replace('{name}', indexed.name)}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs font-medium text-slate-400">{t.calc.customLabel}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t.calc.customParams,  value: customParams,  setter: setCustomParams },
                      // The attention shape was read for this layer count; a new
                      // count by hand invalidates it.
                      { label: t.calc.customLayers,  value: customLayers,  setter: (v: string) => { setCustomLayers(v); setCustomAttention(undefined); } },
                      { label: t.calc.customKvHeads, value: customKvHeads, setter: setCustomKvHeads },
                      { label: t.calc.customHeadDim, value: customHeadDim, setter: setCustomHeadDim },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="block text-xs text-slate-500 mb-1">{label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={e => { setter(e.target.value); if (hfShape) setHfEdited(true); }}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'forward' && ((selectedModel && hasImageInput(selectedModel.id)) || selectedModelId === 'custom') && (() => {
                const repo = selectedModel ? hfRepoMap[selectedModel.id] : undefined;
                const gguf = !!repo && /-GGUF$/i.test(repo);
                return (
                  <div>
                    <label htmlFor="calc-mmproj" className="block text-xs font-medium text-slate-400 mb-1.5">{t.calc.mmprojLabel}</label>
                    <div className="flex gap-2">
                      <input
                        id="calc-mmproj"
                        type="number"
                        min={0}
                        step={0.01}
                        value={mmprojGB}
                        onChange={e => { setMmprojGB(e.target.value); setMmprojFile(''); }}
                        placeholder={t.calc.mmprojPlaceholder}
                        className="w-32 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40"
                      />
                      {gguf && (
                        <button
                          type="button"
                          disabled={mmprojState === 'loading'}
                          onClick={async () => {
                            setMmprojState('loading');
                            const r = await mmprojFromHub(repo!);
                            if (!r) { setMmprojState('failed'); return; }
                            setMmprojState('idle');
                            setMmprojGB(r.gb.toFixed(2));
                            setMmprojFile(r.file);
                          }}
                          className="px-3 py-2 rounded-lg text-xs text-violet-200 bg-violet-500/15 border border-violet-500/30 disabled:opacity-50"
                        >
                          {mmprojState === 'loading' ? t.calc.hfLoading : t.calc.mmprojRead}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      {mmprojFile && Number(mmprojGB) > 0
                        ? t.calc.mmprojFound.replace('{file}', mmprojFile).replace('{gb}', Number(mmprojGB).toFixed(2))
                        : Number(mmprojGB) > 0 ? '' : `${t.calc.mmprojNone}${gguf ? '' : ` ${t.calc.mmprojManual}`}`}
                    </p>
                    {mmprojState === 'failed' && <p className="text-xs text-amber-300 mt-1">{t.calc.mmprojFailed}</p>}
                  </div>
                );
              })()}
              {mode === 'forward' && (
                <>
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
              )}
              {mode === 'finetune' && (
                <>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftMethod}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([['qlora', t.calc.ftQlora], ['lora', t.calc.ftLora], ['full', t.calc.ftFull]] as [FtMethod, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtMethod(v)}
                        aria-pressed={ftMethod === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors', ftMethod === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {ftMethod !== 'full' && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftRank}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([8, 16, 32, 64, 128].map(n => [n, String(n)]) as [number, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtRank(v)}
                        aria-pressed={ftRank === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors font-mono', ftRank === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftOptimizer}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([['adamw', t.calc.ftAdamw], ['adamw8bit', t.calc.ftAdamw8]] as [FtOptimizer, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtOpt(v)}
                        aria-pressed={ftOpt === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors', ftOpt === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftSeq}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([512, 1024, 2048, 4096, 8192, 16384, 32768].map(n => [n, contextLabel(n)]) as [number, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtSeq(v)}
                        aria-pressed={ftSeq === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors font-mono', ftSeq === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftBatch}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([1, 2, 4, 8, 16].map(n => [n, String(n)]) as [number, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtBatch(v)}
                        aria-pressed={ftBatch === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors font-mono', ftBatch === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.ftCkpt}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([[true, t.calc.ftOn], [false, t.calc.ftOff]] as [boolean, string][]).map(([v, l]) => (
                      <button
                        key={String(v)}
                        onClick={() => setFtCkpt(v)}
                        aria-pressed={ftCkpt === v}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border transition-colors', ftCkpt === v
                          ? 'bg-violet-500/20 text-violet-200 border-violet-500/30'
                          : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {(selectedModel || selectedModelId === 'custom') && (
                  <div className="glass rounded-xl p-4 space-y-3">
                    <p className="text-xs font-medium text-slate-400">{t.calc.ftShapeTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ft-hidden" className="block text-xs text-slate-500 mb-1">{t.calc.ftHidden}</label>
                        <input
                          id="ft-hidden"
                          type="number"
                          value={ftHidden}
                          placeholder={String(ftHubShape?.hidden ?? ftHiddenGuess ?? '')}
                          onChange={e => setFtHidden(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-violet-500/40"
                        />
                        <p className="text-[11px] text-slate-600 mt-1">
                          {ftHiddenSource === 'config' ? t.calc.ftFromConfig : ftHiddenSource === 'heads' ? t.calc.ftFromHeads : ftHiddenSource === 'missing' ? t.calc.ftMissing : ''}
                        </p>
                      </div>
                      <div>
                        <label htmlFor="ft-vocab" className="block text-xs text-slate-500 mb-1">{t.calc.ftVocab}</label>
                        <input
                          id="ft-vocab"
                          type="number"
                          value={ftVocab}
                          placeholder={ftHubShape?.vocab ? String(ftHubShape.vocab) : ''}
                          onChange={e => setFtVocab(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-violet-500/40"
                        />
                        <p className="text-[11px] text-slate-600 mt-1">
                          {ftVocab ? '' : ftHubShape?.vocab ? t.calc.ftFromConfig : t.calc.ftMissing}
                        </p>
                      </div>
                    </div>
                    {selectedModel && !(ftHubShape?.hidden && ftHubShape?.vocab) && (
                      <button
                        type="button"
                        onClick={() => void readFtHub()}
                        disabled={ftHubEntry === 'loading'}
                        className="inline-flex items-center min-h-[36px] sm:min-h-0 px-2.5 py-1 rounded-lg text-xs border text-violet-200 border-violet-500/30 bg-violet-500/10 disabled:opacity-50"
                      >
                        {ftHubEntry === 'loading' ? t.calc.hfLoading : t.calc.ftReadHub}
                      </button>
                    )}
                    {ftHubEntry === 'failed' && <p className="text-xs text-amber-300">{t.calc.ftReadFailed}</p>}
                  </div>
                )}
                </>
              )}
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
                <p className="text-xs font-medium text-slate-400 mb-1.5">{t.calc.reverseInput}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['text', 'image'] as const).map(input => (
                    <button
                      key={input}
                      type="button"
                      aria-pressed={reverseInput === input}
                      onClick={() => setReverseInput(input)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs border transition-colors', reverseInput === input
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'
                        : 'text-slate-500 border-white/[0.06] hover:text-slate-300')}
                    >
                      {input === 'text' ? t.calc.reverseText : t.calc.reverseImage}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{reverseInput === 'image' ? t.calc.reverseImageNote : t.calc.reverseTextNote}</p>
              </div>

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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestPerModel}
                  onChange={e => setBestPerModel(e.target.checked)}
                  className="accent-violet-500"
                />
                <span className="text-xs text-slate-400">{t.calc.bestPerModel}</span>
              </label>
            </>
          )}

          {mode !== 'finetune' && (
          <>
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
          </>
          )}
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
              <section data-testid="run-plan" className="glass min-w-0 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-200">{t.calc.runPlanTitle}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {selectedModel?.name ?? (customRepo || t.calc.customLabel)} · {selectedQuant} · {contextLabel(contextLen)}
                </p>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-slate-400" aria-live="polite">
                  <span>{t.calc.runPlanEstimate.replace('{gb}', result.totalGB.toFixed(2))}</span>
                  {profileGpu && <span>· {rigLabel} · {t.calc.runPlanBudget.replace('{gb}', rigCapacity.toFixed(2))}</span>}
                  {currentVerdict && contextLen <= contextLimit && (
                    <span className={verdictConfig[currentVerdict].label}>· {
                      !formatOk ? t.calc.levelsNoRun :
                      overBudget ? t.calc.runPlanOverBudget : currentVerdict === 'green' ? t.calc.green :
                      currentVerdict === 'yellow' ? t.calc.yellow : t.calc.red
                    }</span>
                  )}
                  {profileGpu && formatOk && contextLen <= contextLimit && result.totalGB <= rigCapacity && (
                    <span>· {t.calc.runPlanHeadroom.replace('{gb}', (rigCapacity - result.totalGB).toFixed(2))}</span>
                  )}
                </p>
                {(currentVerdict === 'yellow' || currentVerdict === 'red') && (quantFix || contextFix) && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-400">{t.calc.runPlanAdjust}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {quantFix && (
                        <button type="button" onClick={() => {
                          setSelectedQuant(quantFix.key);
                          setFormatGroup(findFormatGroup(quantFix.key));
                        }} className="min-h-[44px] rounded-lg border border-violet-500/30 px-3 text-left text-xs text-violet-200 hover:bg-violet-500/10">
                          {t.calc.runPlanQuant.replace('{level}', quantFix.key).replace('{gb}', quantFix.totalGB.toFixed(2))}
                          {' · '}{quantFix.verdict === 'green' ? t.calc.green : t.calc.yellow}
                        </button>
                      )}
                      {contextFix && (
                        <button type="button" onClick={() => setContextLen(contextFix.ctx)}
                          className="min-h-[44px] rounded-lg border border-violet-500/30 px-3 text-left text-xs text-violet-200 hover:bg-violet-500/10">
                          {t.calc.runPlanContext.replace('{ctx}', contextLabel(contextFix.ctx)).replace('{gb}', contextFix.totalGB.toFixed(2))}
                          {' · '}{contextFix.verdict === 'green' ? t.calc.green : t.calc.yellow}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {overBudget && !quantFix && !contextFix && (
                  <p className="mt-3 text-xs text-slate-400">{t.calc.runPlanNoAdjustment}</p>
                )}
                {launchCommands && launchOffload ? (
                  <details className="mt-3 rounded-lg border border-white/10 px-3">
                    <summary className="cursor-pointer py-3 text-sm text-violet-200">{t.calc.runPlanOffload}</summary>
                    <div className="pb-3">
                      <p className="text-xs text-slate-400">
                        {t.calc.runPlanReserve
                          .replace('{reserve}', launchOffload.reserveGB.toFixed(2))
                          .replace('{budget}', launchOffload.gpuBudgetGB.toFixed(2))
                          .replace('{ram}', (launchOffload.moe?.ramGB ?? launchOffload.ramGB).toFixed(1))}
                      </p>
                      {launchCommands}
                    </div>
                  </details>
                ) : launchCommands}
              </section>
              <CalculatorEvidence
                quant={selectedQuantObj}
                context={contextLen} batch={batchSize} kv={kvType} encoder={result.extraGB ?? 0}
                calibrated={!!profileGpu && !!selectedModel && !!selectedQuantObj && !multiDevice
                  && rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format)
                  && getVerdict(result.totalGB, rigCapacity, tightCeiling(profileGpu)) !== 'red'
                  && !!measuredSpeed(profileGpu, selectedModel, selectedQuantObj)}
              />
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.calc.resultsTitle}</h3>
                <div className="space-y-3">
                  {[
                    { icon: Cpu,         label: t.calc.modelWeights, value: result.modelWeightsGB, color: 'text-violet-400' },
                    { icon: MemoryStick, label: t.calc.kvCache,      value: result.kvCacheGB,      color: 'text-cyan-400'   },
                    { icon: Zap,         label: t.calc.activations,  value: result.activationsGB,  color: 'text-orange-400' },
                    ...(result.extraGB ? [{ icon: ImageIcon, label: t.calc.mmprojRow, value: result.extraGB, color: 'text-pink-400' }] : []),
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
                <VramStackBar
                  weightsGB={result.modelWeightsGB}
                  kvGB={result.kvCacheGB}
                  activationsGB={result.activationsGB}
                  extraGB={result.extraGB}
                  capacityGB={profileGpu && (!selectedQuantObj || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format)) ? rigCapacity : undefined}
                  tightCeiling={profileGpu ? tightCeiling(profileGpu) : undefined}
                  formatBlocked={!!profileGpu && !!selectedQuantObj && !rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format)}
                />
                <p className="text-xs text-slate-600 mt-3">{t.calc.overhead}</p>
                {(() => {
                  const desc = `${selectedModel ? selectedModel.name : customRepo || t.calc.customLabel} · ${selectedQuant} · ${contextLabel(contextLen)}${kvType !== 'f16' ? ` · KV ${kvType}` : ''}${batchSize > 1 ? ` · ×${batchSize}` : ''}${profileGpu ? ` · ${rigLabel}` : ''}`;
                  const fmtOk = !profileGpu || !selectedQuantObj || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format);
                  const nowVerdict: VerdictColor | undefined = profileGpu ? (fmtOk ? getVerdict(result.totalGB, rigCapacity, tightCeiling(profileGpu)) : 'red') : undefined;
                  const line = (label: string, d: string, gb: number, v?: VerdictColor, cap?: number) => (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-10 shrink-0 text-slate-500">{label}</span>
                      <span className="flex-1 min-w-0 truncate text-slate-400">{d}</span>
                      <span className="font-mono text-slate-200">{gb.toFixed(1)} {t.calc.gbUnit}{cap ? ` / ${cap.toFixed(0)}` : ''}</span>
                      {v && <span className={cn('w-2 h-2 rounded-full shrink-0', verdictConfig[v].dot)} aria-label={v === 'green' ? t.calc.green : v === 'yellow' ? t.calc.yellow : t.calc.red} />}
                    </div>
                  );
                  return pinned ? (
                    <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-400">{t.calc.pinTitle}</p>
                        <button onClick={() => setPinned(null)} className="text-[11px] text-slate-500 hover:text-slate-300">{t.calc.pinClear}</button>
                      </div>
                      {line('A', pinned.desc, pinned.totalGB, pinned.verdict, pinned.capacity)}
                      {line(t.calc.pinNow, desc, result.totalGB, nowVerdict, profileGpu ? rigCapacity : undefined)}
                      <p className={cn('text-xs font-mono', result.totalGB > pinned.totalGB ? 'text-amber-300/90' : 'text-emerald-300/90')}>
                        {result.totalGB >= pinned.totalGB ? '+' : ''}{(result.totalGB - pinned.totalGB).toFixed(2)} {t.calc.gbUnit}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPinned({ desc, totalGB: result.totalGB, verdict: nowVerdict, capacity: profileGpu ? rigCapacity : undefined })}
                      className="mt-2 text-xs text-violet-300 hover:text-violet-200 min-h-[32px]"
                    >
                      {t.calc.pinA} →
                    </button>
                  );
                })()}
                {/* The file is params × bits: for a row whose bpw was derived
                    from a published file, this is that file's size. */}
                <p className="text-xs text-slate-500 mt-1.5">
                  {t.calc.download.replace('{gb}', ((calcInput.paramsB * calcInput.bpw) / 8).toFixed(1))}{' '}
                  {result.extraGB ? `${t.calc.mmprojDownload.replace('{gb}', result.extraGB.toFixed(2))} ` : ''}
                  <span className="text-slate-600">{t.calc.downloadOllama}</span>
                </p>

                {/* The path the task book asks for: a reader who has an answer
                    here should not have to re-enter it in the next tool. The
                    shared config already carries model/quant/context, so these
                    links only need to name the destination. */}
                {selectedModel && selectedQuantObj && (() => {
                  const okFmt = !profileGpu || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format);
                  const verdict = profileGpu ? (okFmt ? getVerdict(result.totalGB, rigCapacity, tightCeiling(profileGpu)) : 'red') : undefined;
                  const sp = profileGpu && verdict !== 'red' && !multiDevice ? measuredSpeed(profileGpu, selectedModel, selectedQuantObj) : undefined;
                  return (
                    <div className="mt-4">
                      <ShareCard
                        modelName={selectedModel.name}
                        level={quantLevelKey(selectedQuantObj)}
                        contextLabel={contextLabel(contextLen)}
                        totalGB={result.totalGB}
                        weightsGB={result.modelWeightsGB}
                        kvGB={result.kvCacheGB}
                        rigLabel={profileGpu ? rigLabel : undefined}
                        verdict={verdict}
                        speed={sp}
                      />
                    </div>
                  );
                })()}
                {selectedModel && (
                  <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                    {selectedQuantObj && !profileGpu && (() => {
                      // With a card picked the player is offered as a button beside the speed line
                      // above; with none it opens on the defaults from here.
                      const href = feelTarget(undefined, selectedModel, selectedQuantObj, contextLen);
                      return href ? (
                        <Link href={href} className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300">
                          {t.calc.feelThisNoCard} →
                        </Link>
                      ) : null;
                    })()}
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
              </div>

              {selectedModel && <RelatedReports modelId={selectedModel.id} gpuId={profileGpu?.id} />}
              {(() => {
                const configuration = {
                  model: selectedModel?.name || customRepo || t.calc.customLabel,
                  quant: selectedQuantObj ? `${selectedQuantObj.format} ${selectedQuantObj.level}` : selectedQuant,
                  file: selectedQuantObj?.source ? `${selectedQuantObj.source.repo} / ${selectedQuantObj.source.file ?? ''}` : undefined,
                  hardware: profileGpu ? `${rigLabel} · RAM ${RAM_SETUPS[ram].label}` : t.evidence.unknown,
                  context: contextLen, sequences: batchSize, kv: kvType,
                  encoderGiB: result.extraGB ?? 0, estimatedGiB: result.totalGB,
                  sizingInput: JSON.stringify(calcInput),
                };
                return <RunReportForm key={JSON.stringify(configuration)} configuration={configuration} />;
              })()}

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
                  const capacity = rigCapacity;
                  const formatOk = !selectedQuantObj || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format);
                  const v = getVerdict(result.totalGB, capacity, tightCeiling(profileGpu));
                  return (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 mb-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs text-slate-500">{t.calc.hwYourCard}</span>
                        <span className="text-xs text-slate-300 font-medium">{rigLabel}</span>
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
                        const bound = rigSpeedCeiling(profileGpu, profileCards, profileExtras, selectedModel, selectedQuantObj, v);
                        if (!bound) return null;
                        const text = bound.basis === 'moe'
                          ? t.calc.speedMoELine
                              .replace('{n}', String(bound.tokS))
                              .replace('{active}', String(bound.activeB))
                          : t.calc.speedLine
                              .replace('{n}', String(bound.tokS))
                              .replace('{bw}', profileGpu.bandwidth.toLocaleString('en-US'))
                              .replace('{gb}', (profileGpu.bandwidth / bound.tokS).toFixed(1));
                        const cal = !multiDevice && v !== 'red' ? measuredSpeed(profileGpu, selectedModel, selectedQuantObj) : undefined;
                        return (
                          <>
                            {cal && (
                              <p className="text-xs text-emerald-300/90 leading-relaxed mt-2" data-testid="measured-speed">
                                {t.calc.measuredLine
                                  .replace('{n}', String(cal.tokS))
                                  .replace('{low}', String(cal.low))
                                  .replace('{high}', String(cal.high))
                                  .replace('{tg}', String(cal.row.tg128))
                                  .replace('{src}', String(cal.row.source))
                                  .replace('{k}', String(CALIBRATION_ERROR.n))}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 leading-relaxed mt-2">
                              {text}{multiDevice && ` ${profileExtras.length ? t.calc.speedMixedNote : t.calc.speedMultiNote}`}
                            </p>
                          </>
                        );
                      })()}
                      {v !== 'red' && formatOk && selectedModel && selectedQuantObj && (() => {
                        // Offered only when the speed tool can stream this model on the reader's card
                        // (a measured or calibrated rate) — never for a bare ceiling.
                        const href = feelTarget(profileGpu, selectedModel, selectedQuantObj, contextLen);
                        if (!href) return null;
                        return (
                          <Link
                            href={href}
                            data-testid="feel-button"
                            className="mt-3 flex items-center gap-3 rounded-xl border border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/20 px-4 py-2.5 min-h-[44px] transition-colors"
                          >
                            <span aria-hidden className="text-violet-300 text-base">▶</span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-violet-200">{t.calc.feelThis.replace('{card}', profileGpu.name)}</span>
                              <span className="block text-xs text-slate-400">{t.calc.feelHint}</span>
                            </span>
                          </Link>
                        );
                      })()}
                      {v !== 'red' && formatOk && (() => {
                        // Time to first token for a prompt the length of the chosen context.
                        const devices = rigDevices(profileGpu, profileCards, profileExtras);
                        const shape = selectedModel
                          ? {
                              activeParamsB: activeParamsB(selectedModel) ?? selectedModel.params,
                              layers: selectedModel.arch.layers,
                              qDim: selectedModel.arch.attHeads * selectedModel.arch.headDim,
                              attention: selectedModel.arch.attention,
                            }
                          : hfShape?.hidden
                            ? { activeParamsB: parseFloat(customParams) || 7, layers: parseInt(customLayers) || 32, qDim: hfShape.hidden, attention: customAttention }
                            : undefined;
                        if (!shape) return null;
                        const secs = rigPrefillSeconds(devices, shape, contextLen);
                        if (secs === undefined) return null;
                        const fmt = secs < 1 ? t.calc.secUnder1
                          : secs < 60 ? t.calc.secN.replace('{n}', secs < 10 ? secs.toFixed(1) : String(Math.round(secs)))
                          : t.calc.minSec.replace('{m}', String(Math.floor(secs / 60))).replace('{s}', String(Math.round(secs % 60)));
                        const row = prefillData[profileGpu.id];
                        return (
                          <div className="mt-2">
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t.calc.prefillLine.replace('{ctx}', contextLabel(contextLen)).replace('{t}', fmt)}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                              {t.calc.prefillNote.replace('{backend}', row?.backend ?? '').replace('{src}', String(row?.source ?? ''))}
                              {selectedModel && isMoE(selectedModel) ? ` ${t.calc.prefillMoe}` : ''}
                            </p>
                          </div>
                        );
                      })()}
                      {v !== 'red' && formatOk && (() => {
                        // vLLM splits a mixed rig evenly, so the smallest card bounds every card.
                        // llama-server (the only server off CUDA and vLLM-listed ROCm) splits by memory instead.
                        const be = backendFor(profileGpu);
                        const vllmRuns = be === 'cuda' || (be === 'rocm' && vllmRocmSupported(profileGpu.name));
                        const devices = rigDevices(profileGpu, profileCards, profileExtras);
                        const servCap = vllmRuns && profileExtras.length
                          ? devices.length * Math.min(...devices.map(usableCapacityGB))
                          : capacity;
                        const { bpw: shapeBpw, contextLength: _ctx, ...shape } = calcInput;
                        const limit = selectedModel?.contextLength ?? customCtx ?? 131072;
                        const rows = servingCapacity(shape, shapeBpw, servCap, [4096, 8192, 32768].filter(c => c <= limit));
                        if (rows.length === 0) return null;
                        return (
                          <div className="mt-3 pt-2 border-t border-white/[0.05]">
                            <p className="text-xs font-medium text-slate-400">{t.calc.servingTitle}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                              {(vllmRuns ? t.calc.servingIntro : t.calc.servingIntroLocal).replace('{util}', String(Math.round(VLLM_MEMORY_UTILIZATION * 100)))}
                            </p>
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                              {rows.map(r => (
                                <div key={r.ctx} className="rounded-lg border border-white/[0.06] px-2 py-1.5 text-center">
                                  <p className="text-[11px] text-slate-500">{t.calc.servingRow.replace('{ctx}', contextLabel(r.ctx))}</p>
                                  <p className="font-mono text-sm text-slate-200">{r.users > 0 ? t.calc.servingUsers.replace('{n}', String(r.users)) : t.calc.servingNone}</p>
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{t.calc.servingNote}{vllmRuns && profileExtras.length ? ` ${t.calc.servingNoteMixed}` : ''}</p>
                          </div>
                        );
                      })()}
                      {v === 'red' && formatOk && (() => {
                        const plan = launchOffload;
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
                            {plan.moe ? (
                              <div className="mt-2 pt-2 border-t border-white/[0.05]" data-testid="moe-offload">
                                <p className="text-xs font-medium text-slate-400">{t.calc.moeTitle}</p>
                                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                                  {(plan.moe.all ? t.calc.moeLineAll : t.calc.moeLine)
                                    .replace(/\{n\}/g, String(plan.moe.n))
                                    .replace('{k}', String(plan.moe.cpuMoeLayers))
                                    .replace('{m}', String(plan.moe.moeLayers))
                                    .replace('{gpu}', plan.moe.gpuGB.toFixed(1))
                                    .replace('{ram}', plan.moe.ramGB.toFixed(1))}
                                </p>
                                {plan.moe.tokS !== undefined && (
                                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    {t.calc.moeSpeed
                                      .replace('{n}', String(plan.moe.tokS))
                                      .replace('{ram}', RAM_SETUPS[ram].label)}
                                  </p>
                                )}
                                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{t.calc.moeNote}</p>
                              </div>
                            ) : plan.moeNoRoom ? (
                              <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.calc.moeNoRoom}</p>
                            ) : selectedModel && isMoE(selectedModel) && !selectedModel.arch.moe && (
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
                  {recommendations.map(({ model, quant, totalGB, verdict, extraGB }) => {
                    const level = quantLevelKey(quant);
                    const cfg = verdictConfig[verdict];
                    const forwardParams = new URLSearchParams({ mode: 'forward', model: model.id, quant: level, ctx: String(contextLen), batch: String(batchSize), cache: kvType, cards: String(canStack(selectedGpu!) ? cards : 1) });
                    if (selectedGpuId) forwardParams.set('gpu', selectedGpuId);
                    if (extraGB !== undefined) forwardParams.set('mmproj', String(extraGB));
                    return (
                      <div
                        key={`${model.id}-${quant.format}-${quant.level}`}
                        data-model-id={model.id}
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
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                            <span className="font-mono">{totalGB.toFixed(1)} {t.calc.gbUnit}</span>
                            {(() => {
                              const r = contextReach(modelShape(model, batchSize, KV_CACHE_TYPES[kvType], extraGB), quant.bpw, selectedGpu!, model.contextLength, canStack(selectedGpu!) ? cards : 1);
                              const best = r.comfortable || r.tight;
                              return best ? <span>{t.calc.reverseMaxCtx.replace('{ctx}', contextLabel(best))}</span> : null;
                            })()}
                            <span>PPL {quant.pplLossPercent === undefined ? formatLoss(quant) : `−${formatLoss(quant)}`}</span>
                            {(() => {
                              const sp = verdict !== 'red' && !(canStack(selectedGpu!) && cards > 1) ? measuredSpeed(selectedGpu!, model, quant) : undefined;
                              return sp ? <span className="text-emerald-300/80">{t.calc.reverseSpeed.replace('{n}', String(sp.tokS))}</span> : null;
                            })()}
                            {quant.speedRTX4090 != null && <span>{t.calc.speedOn4090.replace('{n}', String(quant.speedRTX4090))}<ConfidenceTag modelId={model.id} quant={quant} /></span>}
                          </div>
                          {extraGB !== undefined && <p className="text-[11px] text-slate-600 mt-1">{t.calc.reverseEncoder.replace('{gb}', extraGB.toFixed(2))}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/quant-hub/${model.id}/`}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {t.calc.viewModel}
                          </Link>
                          <Link
                            href={`/tools/vram-calc/?${forwardParams}`}
                            onClick={e => openForward(e, model.id, level, extraGB)}
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

          {mode === 'finetune' && ftResult && ftShape && !invalidModelId && !modelLookupFailed && (() => {
            const cap = profileGpu ? usableCapacityGB(profileGpu) : undefined;
            // Without the vocabulary the logits term is missing, so the total is a
            // floor — a verdict on a floor would call a card big enough that isn't.
            const partial = ftResult.logitsGB === undefined;
            const verdictFor = (gb: number) => (profileGpu && cap && !partial ? getVerdict(gb, cap, tightCeiling(profileGpu)) : undefined);
            const v = verdictFor(ftResult.totalGB);
            const pct = (ftResult.trainableParams / (ftShape.paramsB * 1e9)) * 100;
            const fmtCount = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(1)}M`);
            const rows: [string, number | undefined, string][] = [
              [t.calc.ftBase, ftResult.baseGB, 'bg-violet-400'],
              [t.calc.ftTrainable, ftResult.trainableGB, 'bg-emerald-400'],
              [t.calc.ftActivations, ftResult.activationsGB, 'bg-cyan-400'],
              [t.calc.ftLogits, ftResult.logitsGB, 'bg-pink-400'],
              [t.calc.ftOverhead, ftResult.overheadGB, 'bg-orange-400'],
            ];
            return (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">{t.calc.ftResults}</h3>
                  <div className="space-y-3">
                    {rows.map(([label, value, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', color)} />
                        <span className="text-xs text-slate-400 flex-1">{label}</span>
                        <span className="font-mono text-sm text-slate-200">
                          {value === undefined ? '—' : value.toFixed(2)} <span className="text-xs text-slate-600">{t.calc.gbUnit}</span>
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                      <Calculator size={13} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300 flex-1">{t.calc.total}</span>
                      <span className="font-mono text-lg font-bold text-slate-100">
                        {partial ? '≥ ' : ''}{ftResult.totalGB.toFixed(1)} <span className="text-xs text-slate-500">{t.calc.gbUnit}</span>
                      </span>
                    </div>
                    {v && profileGpu && cap && (
                      <p className={cn('text-xs', verdictConfig[v].label)}>
                        {v === 'green' ? t.calc.green : v === 'yellow' ? t.calc.yellow : t.calc.red} · {t.calc.ftOnCard.replace('{gpu}', profileGpu.name)} ({ftResult.totalGB.toFixed(1)} / {cap.toFixed(1)} {t.calc.gbUnit})
                      </p>
                    )}
                    {ftMethod !== 'full' && (
                      <p className="text-xs text-slate-500">
                        {t.calc.ftTrainableCount.replace('{n}', fmtCount(ftResult.trainableParams)).replace('{pct}', `${pct < 0.1 ? pct.toFixed(2) : pct.toFixed(1)}%`)}
                      </p>
                    )}
                    {partial && <p className="text-xs text-amber-300/90">{t.calc.ftNoVocab} {profileGpu ? t.calc.ftNoVerdict : ''}</p>}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">{t.calc.ftCompare}</h3>
                  <div className="space-y-2">
                    {(['qlora', 'lora', 'full'] as FtMethod[]).map(m => {
                      const r = ftRun(m)!;
                      const mv = verdictFor(r.totalGB);
                      return (
                        <button
                          key={m}
                          onClick={() => setFtMethod(m)}
                          aria-pressed={ftMethod === m}
                          className={cn('w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                            ftMethod === m ? 'border-violet-500/30 bg-violet-500/10' : 'border-white/[0.06] hover:border-white/10')}
                        >
                          <span className="text-xs text-slate-300 flex-1">{m === 'qlora' ? t.calc.ftQlora : m === 'lora' ? t.calc.ftLora : t.calc.ftFull}</span>
                          <span className="font-mono text-sm text-slate-200">{partial ? '≥ ' : ''}{r.totalGB.toFixed(1)} {t.calc.gbUnit}</span>
                          {mv && <span className={cn('w-2 h-2 rounded-full', verdictConfig[mv].dot)} aria-label={mv === 'green' ? t.calc.green : mv === 'yellow' ? t.calc.yellow : t.calc.red} />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-3">{t.calc.ftSingleCard}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{t.calc.ftAssumptions}</p>
                </div>
              </div>
            );
          })()}

          {((mode === 'forward' && !showForwardResult) || (mode === 'reverse' && !showReverseResult) || (mode === 'finetune' && !(ftResult && ftShape))) && (
            <div className="glass rounded-2xl p-8 flex items-center justify-center h-full min-h-48">
              <div className="text-center">
                <Calculator size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600">
                  {mode === 'forward' ? t.calc.pickModel : mode === 'reverse' ? t.calc.selectGpuPlaceholder : (selectedModel || selectedModelId === 'custom') ? t.calc.ftNeedHidden : t.calc.ftPickModel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keeps the pinned bar from covering the end of the page. */}
      {showForwardResult && <div className="h-16 lg:hidden" aria-hidden="true" />}
      {showForwardResult && !resultsInView && (() => {
        const capacity = rigCapacity;
        const formatOk = !profileGpu || !selectedQuantObj || rigFormatAllowed(profileGpu, profileExtras, selectedQuantObj.format);
        const v = profileGpu ? (formatOk ? getVerdict(result.totalGB, capacity, tightCeiling(profileGpu)) : 'red') : null;
        return (
          <div
            className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur px-4 pt-2.5"
            style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedModel ? selectedModel.name : customRepo || t.calc.customLabel} · {selectedQuant} · {contextLabel(contextLen)}
                </p>
                <p className="text-sm text-slate-200 truncate">
                  <span className="font-mono font-semibold">{result.totalGB.toFixed(1)} {t.calc.gbUnit}</span>
                  {v ? (
                    <span className={cn('ml-2 text-xs', verdictConfig[v].label)}>
                      {v === 'green' ? t.calc.green : v === 'yellow' ? t.calc.yellow : t.calc.red} · {rigLabel}
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
