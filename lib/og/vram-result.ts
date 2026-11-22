import { gpuDatabase } from '@/lib/data/gpus';
import { models } from '@/lib/data/models';
import { canStack, capacityGB, MAX_CARDS, modelShape, rigExtras, rigFormatAllowed, verdictOn } from '@/lib/utils/calc-insights';
import { getRecommendations, readRecommendationFilters, quantLevelKey, type SortBy } from '@/lib/utils/recommend';
import { calcVRAM, KV_CACHE_TYPES, quantBPW } from '@/lib/utils/vram';
import { NO_SHARE_GPU, readVramAttention, readVramEncoder, VRAM_SHARE_PARAM } from '@/lib/utils/vram-link';

type Locale = 'en' | 'zh';
type Tone = 'green' | 'yellow' | 'red' | 'neutral';

const text = {
  en: {
    forward: 'VRAM estimate', reverse: 'GPU → Models', custom: 'Custom model',
    tokens: 'tokens', batch: 'batch', estimate: 'estimated', usable: 'usable',
    unsupportedContext: 'Context exceeds model limit', unshipped: 'Quant not shipped',
    unsupportedFormat: 'Format not supported', overBudget: 'Over budget',
    green: 'Comfortable fit', yellow: 'Tight fit', red: 'Does not fit',
    variants: 'compatible configs', image: 'image input',
  },
  zh: {
    forward: '显存预估', reverse: '显卡 → 模型', custom: '自定义模型',
    tokens: '词元', batch: '并发', estimate: '预估', usable: '可用',
    unsupportedContext: '超出模型上下文上限', unshipped: '模型未发布此量化',
    unsupportedFormat: '不支持此格式', overBudget: '超出显存预算',
    green: '从容运行', yellow: '勉强可用', red: '无法运行',
    variants: '个兼容配置', image: '图像输入',
  },
} as const;

export const VRAM_IMAGE_PATH = '/api/vram-share.png';
export const VRAM_IMAGE_SIZE = { width: 600, height: 315 };

export interface VramPreview {
  eyebrow: string;
  title: string;
  details: string;
  answer: string;
  hardware?: string;
  tone: Tone;
}

function int(raw: string | null, max: number) {
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 && n <= max ? n : undefined;
}

export function vramPreview(params: URLSearchParams, lang: Locale): VramPreview | undefined {
  if (params.get(VRAM_SHARE_PARAM) !== '1' || params.toString().length > 2048) return;
  const t = text[lang];
  const ctx = int(params.get('ctx'), 16_777_216);
  const batch = int(params.get('batch') ?? '1', 1024);
  const rawCache = params.get('cache') ?? 'f16';
  if (!ctx || !batch || (rawCache !== 'f16' && rawCache !== 'q8_0' && rawCache !== 'q4_0')) return;
  const kvBytes = KV_CACHE_TYPES[rawCache];
  const details = [
    `${ctx.toLocaleString('en-US')} ${t.tokens}`,
    ...(batch > 1 ? [`${t.batch} ${batch}`] : []),
    ...(rawCache !== 'f16' ? [`${rawCache} KV`] : []),
  ];
  const gpuId = params.get('gpu');
  const gpu = gpuDatabase.find(g => g.id === gpuId);
  if (!gpu && gpuId !== NO_SHARE_GPU) return;
  const n = int(params.get('cards') ?? '1', MAX_CARDS);
  if (!n) return;
  const cards = gpu && canStack(gpu) ? n : 1;
  const mode = params.get('mode');

  if (mode === 'reverse') {
    if (!gpu) return;
    const rawSort = params.get('sort');
    const sort: SortBy = rawSort === 'speed' || rawSort === 'vram' ? rawSort : 'quality';
    const input = params.get('input') === 'image' ? 'image' : 'text';
    const filters = readRecommendationFilters(params);
    const extras = rigExtras(gpu, (params.get('extra') ?? '').split(','), cards);
    if (cards > 1 || extras.length > 0) filters.minTok = 0;
    const rows = getRecommendations(gpu, ctx, batch, sort, params.get('yellow') !== '0', kvBytes,
      cards, params.get('all') !== '1', input, filters);
    return {
      eyebrow: t.reverse,
      title: gpu.name,
      details: [...details, ...(input === 'image' ? [t.image] : [])].join(' · '),
      answer: `${rows.length} ${t.variants}`,
      hardware: `${cards > 1 ? `${cards}× · ` : ''}${capacityGB(gpu, cards).toFixed(2)} GiB ${t.usable}`,
      tone: rows.length ? 'green' : 'neutral',
    };
  }

  if (mode !== 'forward') return;
  const id = params.get('model');
  const model = models.find(m => m.id === id);
  if (!model && id !== 'custom') return;
  const level = params.get('quant');
  if (!level) return;
  const quant = model?.quants.find(q => quantLevelKey(q) === level);
  const bpw = quant?.bpw ?? (Object.hasOwn(quantBPW, level) ? quantBPW[level] : undefined);
  if (!bpw) return;

  const extraGB = readVramEncoder(params.get('mmproj'));
  if ((extraGB ?? 0) > 1_000_000) return;
  const shape = model ? modelShape(model, batch, kvBytes, extraGB) : {
    paramsB: parseFloat(params.get('params') ?? '') || 7,
    layers: parseInt(params.get('layers') ?? '') || 32,
    kvHeads: parseInt(params.get('kv') ?? '') || 8,
    headDim: parseInt(params.get('hd') ?? '') || 128,
    attention: readVramAttention(params),
    batchSize: batch,
    kvBytesPerValue: kvBytes,
    extraGB,
  };
  if ([shape.paramsB, shape.layers, shape.kvHeads, shape.headDim].some(n => n <= 0 || n > 1_000_000)) return;
  const { totalGB } = calcVRAM({ ...shape, bpw, contextLength: ctx });
  if (!Number.isFinite(totalGB) || totalGB >= 1e9) return;
  const extras = rigExtras(gpu ?? null, (params.get('extra') ?? '').split(','), cards);
  let tone: Tone = 'neutral';
  let verdict: string | undefined;
  const contextLimit = model?.contextLength ?? (Number(params.get('mctx')) || 131072);
  if (ctx > contextLimit) {
    verdict = t.unsupportedContext;
    tone = 'yellow';
  } else if (model && !quant) {
    verdict = t.unshipped;
    tone = 'yellow';
  } else if (gpu) {
    if (quant && !rigFormatAllowed(gpu, extras, quant.format)) {
      verdict = t.unsupportedFormat;
      tone = 'red';
    } else if (totalGB > capacityGB(gpu, cards, extras)) {
      verdict = t.overBudget;
      tone = 'red';
    } else {
      tone = verdictOn(totalGB, gpu, cards, extras);
      verdict = t[tone];
    }
  }
  const rig = gpu && [`${cards > 1 ? `${cards}× ` : ''}${gpu.name}`, ...extras.map(g => g.name)].join(' + ');
  return {
    eyebrow: t.forward,
    title: model?.name ?? t.custom,
    details: [level, ...details].join(' · '),
    answer: [`${totalGB.toFixed(2)} GiB ${t.estimate}`, verdict].filter(Boolean).join(' · '),
    hardware: rig || undefined,
    tone,
  };
}

const imageKeys = [
  VRAM_SHARE_PARAM, 'mode', 'ctx', 'batch', 'cache', 'gpu', 'cards',
  'model', 'quant', 'params', 'layers', 'kv', 'hd', 'full', 'win', 'wt', 'mctx', 'mmproj', 'extra',
  'sort', 'yellow', 'all', 'input', 'minTok', 'feat',
];

export function vramImageUrl(url: URL, lang: Locale): URL {
  const image = new URL(VRAM_IMAGE_PATH, url.origin);
  image.searchParams.set('lang', lang);
  for (const key of imageKeys) {
    const value = url.searchParams.get(key);
    if (value !== null) image.searchParams.set(key, value);
  }
  return image;
}
