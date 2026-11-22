import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { calcVRAM, getVerdict, KV_CACHE_TYPES } from './vram';
import { referenceQuant } from './quality';
import { quantLevelKey } from './recommend';
import { capacityGB, canStack, MAX_CARDS, tightCeiling, backendFor } from './gpu-page';
import { rigFormatAllowed } from './calc-insights';
import { translations, type Lang } from '@/lib/i18n/translations';

export function parseEmbedFit(params: URLSearchParams | null) {
  if (!params) return null;
  const model = models.find(m => m.id === params.get('model'));
  const gpu = gpuDatabase.find(g => g.id === params.get('gpu'));
  if (!model || !gpu) return null;
  const quant = params.has('quant') ? model.quants.find(q => quantLevelKey(q) === params.get('quant')) : referenceQuant(model.quants);
  const ctx = Number(params.get('ctx') ?? Math.min(4096, model.contextLength));
  const batch = Number(params.get('batch') ?? 1);
  const cache = params.get('cache') ?? 'f16';
  const cards = Number(params.get('cards') ?? 1);
  const mmproj = Number(params.get('mmproj') ?? 0);
  const extra = params.get('extra') ? params.get('extra')!.split(',').map(id => gpuDatabase.find(g => g.id === id)) : [];
  if (!quant || !Number.isInteger(ctx) || ctx < 1 || ctx > model.contextLength ||
      !Number.isInteger(batch) || batch < 1 || batch > 64 || !Object.hasOwn(KV_CACHE_TYPES, cache) ||
      !Number.isInteger(cards) || cards < 1 || cards > MAX_CARDS || (cards > 1 && !canStack(gpu)) ||
      !Number.isFinite(mmproj) || mmproj < 0 || mmproj >= 50 || extra.some(g => !g || !canStack(g) || backendFor(g) !== backendFor(gpu)) ||
      extra.length + cards > MAX_CARDS || (extra.length > 0 && !canStack(gpu))) return null;
  const extras = extra.filter((g): g is NonNullable<typeof g> => !!g);
  const result = calcVRAM({ paramsB: model.params, ...model.arch, bpw: quant.bpw, contextLength: ctx,
    batchSize: batch, kvBytesPerValue: KV_CACHE_TYPES[cache as keyof typeof KV_CACHE_TYPES], extraGB: mmproj });
  const capacity = capacityGB(gpu, cards, extras);
  const formatOk = rigFormatAllowed(gpu, extras, quant.format);
  const verdict = formatOk ? getVerdict(result.totalGB, capacity, tightCeiling(gpu)) : 'red';
  const query = new URLSearchParams({ model: model.id, gpu: gpu.id, quant: quantLevelKey(quant), ctx: String(ctx), batch: String(batch), cache, cards: String(cards), mmproj: String(mmproj) });
  if (extras.length) query.set('extra', extras.map(g => g.id).join(','));
  return { model, gpu, quant, ctx, result, capacity, formatOk, verdict, query,
    gpuLabel: [`${cards > 1 ? `${cards}× ` : ''}${gpu.name}`, ...extras.map(g => g.name)].join(' + ') };
}

export function buildEmbedSnippets(fit: NonNullable<ReturnType<typeof parseEmbedFit>>, lang: Lang) {
  const base = `https://quantized.uk${lang === 'zh' ? '/zh' : ''}`;
  const query = new URLSearchParams(fit.query);
  query.set('utm_source', 'embed');
  const src = `${base}/embed/fit/?${query}`;
  query.set('mode', 'forward');
  const calculator = `${base}/tools/vram-calc/?${query}`;
  const t = translations[lang];
  const verdict = fit.formatOk ? t.calc[fit.verdict] : t.calc.levelsNoRun;
  const label = `${fit.gpuLabel} · ${fit.model.name} ${quantLevelKey(fit.quant)}: ${verdict} — quantized.uk`;
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return { src, calculator, verdict,
    html: `<iframe src="${escape(src)}" width="360" height="160" title="${escape(t.embed.title)}" loading="lazy" style="border:0"></iframe>`,
    markdown: `[${label.replace(/[\\[\]]/g, '\\$&')}](${calculator})` };
}
