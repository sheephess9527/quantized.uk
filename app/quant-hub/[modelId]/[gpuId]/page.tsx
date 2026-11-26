import { quantWeights } from '@/lib/utils/vram';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/components/i18n/LocalLink';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import QuantFileLine from '@/components/hub/QuantFileLine';
import { models } from '@/lib/data/models';
import { gpuDisplayName } from '@/lib/data/gpus';
import { gpuBySlug, gpuSlug } from '@/lib/utils/gpu-page';
import {
  pairData,
  pairHref,
  pairPages,
  pairSize,
  pairAnswer,
} from '@/lib/utils/pair-pages';
import { speedQuote } from '@/lib/utils/speed-label';
import { quantLevelKey } from '@/lib/utils/recommend';
import { translations } from '@/lib/i18n/translations';
import {
  canonical,
  defaultRobots,
  feedAlternates,
  fitTitle,
  languageAlternates,
  ogLocale,
  pageOgImage,
  displayWidth,
  extendDescription,
} from '@/lib/seo';

type Params = { modelId: string; gpuId: string };
const fill = (s: string, values: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => values[k]);
function data(params: Params) {
  const model = models.find(m => m.id === params.modelId);
  const gpu = gpuBySlug(params.gpuId);
  if (!model || !gpu) return notFound();
  const pair = pairData(model, gpu);
  if (!pair.eligible || !pair.recommended) return notFound();
  return pair;
}
export function generateStaticParams() {
  return pairPages().map(({ model, gpu }) => ({
    modelId: model.id,
    gpuId: gpuSlug(gpu),
  }));
}
export function pairMetadata(params: Params, lang: 'en' | 'zh'): Metadata {
  const { model, gpu, recommended: r } = data(params);
  const t = translations[lang].pair;
  const values = {
    model: model.name,
    gpu: gpuDisplayName(gpu, lang),
    quant: r.quant.level,
    total: r.totalGB.toFixed(1),
    verdict: t[r.verdict],
  };
  const path = `${lang === 'zh' ? '/zh' : ''}${pairHref(model, gpu)}`;
  const questionTitle = fitTitle(fill(t.question, values));
  let title = fill(t.title, values);
  if (displayWidth(title) > 60)
    title = `${model.id}${lang === 'zh' ? ' 配 ' : ' / '}${gpuSlug(gpu)}`;
  title = fitTitle(title);
  if (displayWidth(questionTitle) <= 60) title = questionTitle;
  const description = extendDescription(
    fill(t.description, values),
    [
      fill(t.metaHeadroom, { headroom: r.headroomGB.toFixed(1) }),
      t.metaContext,
      t.metaTables,
    ],
    lang
  );
  return {
    title,
    description,
    robots: defaultRobots,
    alternates: {
      canonical: canonical(path),
      languages: languageAlternates(path),
      ...feedAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: canonical(path),
      ...ogLocale(path),
      images: [pageOgImage(`/quant-hub/${model.id}`, model.name)],
    },
  };
}
export function generateMetadata({ params }: { params: Params }) {
  return pairMetadata(params, 'en');
}

export default function PairPage({
  params,
  lang = 'en',
}: {
  params: Params;
  lang?: 'en' | 'zh';
}) {
  const { model, gpu, recommended: r, rows, measured } = data(params);
  const t = translations[lang].pair;
  const gpuName = gpuDisplayName(gpu, lang);
  const answer = pairAnswer(model, gpu)!;
  const { weightBytes } = quantWeights(answer.quant);
  const worked = {
    quant: `${answer.quant.format} ${answer.quant.level}`,
    weights: answer.memory.modelWeightsGB.toFixed(2),
    ctx: answer.contextLength.toLocaleString('en-US'),
    max: model.contextLength.toLocaleString('en-US'),
    weightFormula: weightBytes !== undefined
      ? `${weightBytes.toLocaleString('en-US')} B ÷ 2³⁰ × 1.02`
      : `${model.params} × 10⁹ × ${answer.quant.bpw} ÷ 8 ÷ 2³⁰ × 1.02`,
    kvFormula: answer.kvFormula,
    kv: answer.memory.kvCacheGB.toFixed(2),
    activation: answer.memory.activationsGB.toFixed(2),
    total: answer.memory.totalGB.toFixed(2),
    capacity: answer.capacityGB.toFixed(2),
    limit: answer.comfortableLimitGB.toFixed(2),
    headroom: answer.memory.headroomGB.toFixed(2),
    comparison: answer.contextLength ? '≤' : '>',
  };
  const values = {
    model: model.name,
    gpu: gpuName,
    quant: `${r.quant.format} ${r.quant.level}`,
    total: r.totalGB.toFixed(1),
    headroom: r.headroomGB.toFixed(1),
    verdict: t[r.verdict],
  };
  const quote = speedQuote(gpu, model, r.quant, 4096);
  const related = pairPages();
  const links = [
    ...related
      .filter(p => p.model.id === model.id && p.gpu.id !== gpu.id)
      .slice(0, 3),
    ...related
      .filter(p => p.gpu.id === gpu.id && p.model.id !== model.id)
      .slice(0, 3),
  ];
  const calculatorParams = new URLSearchParams({
    mode: 'forward',
    model: model.id,
    gpu: gpu.id,
    quant: quantLevelKey(r.quant),
    ctx: '4096',
    batch: '1',
    cache: 'f16',
    cards: '1',
  });
  const calculator = `/tools/vram-calc/?${calculatorParams}`;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
      <Breadcrumbs
        items={[
          { label: t.home, href: '/' },
          { label: t.hub, href: '/quant-hub/' },
          { label: model.name, href: `/quant-hub/${model.id}/` },
          { label: gpuName },
        ]}
      />
      <h1 className="text-3xl font-bold text-slate-100">
        {fill(t.question, values)}
      </h1>
      <section className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-5 space-y-3" aria-label={t.details}>
        <p className="text-lg font-semibold text-violet-200">
          {answer.contextLength ? fill(t.download, worked) : answer.anyQuantFits ? t.noContext : t.noQuant}
        </p>
        {answer.quant.source && <p className="text-sm"><QuantFileLine quant={answer.quant} /></p>}
        <p>{answer.contextLength ? fill(t.longest, worked) : `${worked.quant} · ${worked.weights} GiB`}</p>
        <p className="text-sm text-slate-300 leading-relaxed">{fill(t.calculation, { ...worked, ctx: answer.workedContext.toLocaleString('en-US') })}</p>
        <p className="text-xs text-slate-400">{t.sizingCaveat}</p>
      </section>
      <p className="text-xl text-violet-300">{fill(t.answer, values)}</p>
      <p className="text-sm text-slate-400">{t.note}</p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t.measured}</h2>
        {measured.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  {[t.framework, t.quant, 'tok/s', t.memory].map(h => (
                    <th className="p-2" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measured.map((row, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="p-2">{row.framework}</td>
                    <td className="p-2">{row.quant}</td>
                    <td className="p-2">{row.speedTokSec}</td>
                    <td className="p-2">{row.vramUsedGB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{t.none}</p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t.quants}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                {[t.quant, t.total, t.verdict, t.basis].map(h => (
                  <th key={h} className="p-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr
                  key={`${row.quant.format}:${row.quant.level}`}
                  className="border-t border-white/10"
                >
                  <td className="p-2">
                    {row.quant.format} {row.quant.level}
                  </td>
                  <td className="p-2">{row.totalGB.toFixed(1)}</td>
                  <td className="p-2">{t[row.verdict]}</td>
                  <td className="p-2">
                    {row.quant.source ? t.verified : t.estimated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          {t.contexts} · {r.quant.format} {r.quant.level}
        </h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              {[t.context, t.total, t.verdict].map(h => (
                <th key={h} className="p-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[4096, 16384, 32768, 131072]
              .filter(ctx => ctx <= model.contextLength)
              .map(ctx => {
                const row = pairSize(model, gpu, r.quant, ctx);
                return (
                  <tr key={ctx} className="border-t border-white/10">
                    <td className="p-2">{ctx / 1024}K</td>
                    <td className="p-2">{row.totalGB.toFixed(1)}</td>
                    <td className="p-2">{t[row.verdict]}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-semibold">{t.speed}</h2>
        {measured.map((row, i) => (
          <p key={i}>
            {t.measuredSpeed}: {row.speedTokSec} tok/s, {row.quant},{' '}
            {row.framework}
          </p>
        ))}
        <p>
          {r.quant.format} {r.quant.level}:{' '}
          {quote.low !== undefined
            ? `${quote.low}–${quote.high} tok/s`
            : quote.point !== undefined
              ? `${quote.point} tok/s`
              : t.unavailable}{' '}
          ·{' '}
          {quote.source === 'measured'
            ? t.measuredSpeed
            : quote.source === 'derived'
              ? t.derived
              : quote.source === 'other-card'
                ? `${t.other} (${quote.referenceCard})`
                : t.ceiling}
        </p>
      </section>
      <nav className="flex flex-wrap gap-5 text-violet-300">
        <Link href={`/quant-hub/${model.id}/`}>{t.model}</Link>
        <Link href={`/gpu/${gpuSlug(gpu)}/`}>{t.gpu}</Link>
        <Link href={calculator}>{t.calculator}</Link>
      </nav>
      <section>
        <h2 className="text-xl font-semibold mb-3">{t.related}</h2>
        <ul className="space-y-2 text-violet-300">
          {links.map(p => (
            <li key={pairHref(p.model, p.gpu)}>
              <Link href={pairHref(p.model, p.gpu)}>
                {p.model.name} · {gpuDisplayName(p.gpu, lang)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
