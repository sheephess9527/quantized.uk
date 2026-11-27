import Link from '@/components/i18n/LocalLink';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { benchmarkMethodology } from '@/lib/data/meta';
import { translations, type Lang } from '@/lib/i18n/translations';
import { memoryAccuracy } from '@/lib/utils/bench-calibration';
import { ACTIVATION_BUFFER, KV_CACHE_TYPES, WEIGHT_OVERHEAD } from '@/lib/utils/vram';

const link = 'font-medium text-sky-300 underline underline-offset-4 hover:text-sky-200';
const panel = 'glass rounded-2xl p-5 sm:p-6';
const heading = 'text-xl font-semibold text-slate-100';

function fill(template: string, values: Record<string, number>) {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder));
}

export default function MethodologyPage({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const m = t.methodology;
  const { compared, total, hardware, meanAbsoluteError, maxAbsoluteError } = memoryAccuracy();
  const { context, batch } = benchmarkMethodology;
  const buffer = Math.round(ACTIVATION_BUFFER * 100);
  const formatError = (error: number | null) => error === null ? '—' : `${error.toFixed(2)} GiB`;
  const metrics = [
    { label: m.meanError, value: formatError(meanAbsoluteError) },
    { label: m.maxError, value: formatError(maxAbsoluteError) },
    { label: m.runs, value: `${compared} / ${total}` },
  ];
  const formulas = [
    { title: m.weightsTitle, formula: fill(m.weightsFormula, { overhead: Math.round(WEIGHT_OVERHEAD * 100) }), body: m.weightsBody },
    { title: m.cacheTitle, formula: m.cacheFormula, body: m.cacheBody, note: fill(m.cacheTypes, { f16: KV_CACHE_TYPES.f16, q8: KV_CACHE_TYPES.q8_0, q4: KV_CACHE_TYPES.q4_0 }) },
    { title: m.totalTitle, formula: fill(m.totalFormula, { buffer }), body: fill(m.totalBody, { buffer }) },
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 pb-10 pt-24 text-slate-300 sm:px-6">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: m.title }]} />
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-100 sm:text-4xl">{m.title}</h1>
        <p className="max-w-2xl leading-relaxed text-slate-400">{m.intro}</p>
      </header>

      <div className="space-y-8">
        <section className={`${panel} space-y-4 text-sm leading-relaxed`} aria-labelledby="accuracy">
          <h2 id="accuracy" className={heading}>{m.accuracyTitle}</h2>
          <dl className="grid gap-3 sm:grid-cols-3">
            {metrics.map(({ label, value }) => (
              <div key={label} className="flex flex-col rounded-xl border border-sky-400/20 bg-sky-500/5 px-4 py-3">
                <dt className="text-slate-300">{label}</dt>
                <dd className="order-first font-mono text-2xl font-semibold text-sky-200 tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p>{fill(m.results, { compared, total, hardware, context, batch })}</p>
          <p>{m.errorDefinition}</p>
          <p className="text-slate-400">{m.limitation}</p>
          <Link className={`${link} inline-block`} href="/benchmarks/#memory-calibration">{m.comparisonLink}</Link>
        </section>

        <section className="space-y-3" aria-labelledby="formulas">
          <h2 id="formulas" className={heading}>{m.formulasTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-400">{m.units}</p>
          {formulas.map(({ title, formula, body, note }) => (
            <div key={title} className={`${panel} space-y-2 text-sm leading-relaxed`}>
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="rounded-lg bg-bg-recessed px-3 py-2 font-mono text-sky-200">{formula}</p>
              <p>{body}</p>
              {note && <p className="text-slate-400">{note}</p>}
            </div>
          ))}
          <Link className={`${link} inline-block text-sm`} href="/tools/vram-calc/">
            {lang === 'zh' ? '用大模型显存计算器估算你的配置' : 'Estimate your setup with the LLM VRAM calculator'}
          </Link>
        </section>

        <section className={`${panel} space-y-3 text-sm leading-relaxed`} aria-labelledby="sources">
          <h2 id="sources" className={heading}>{m.sourcesTitle}</h2>
          <ul className="space-y-3">
            <li>
              <p>{m.modelSource}</p>
              <Link className={link} href="/quant-hub/">{t.nav.quantHub}</Link>{' · '}
              <a className={link} href="/data/v1/models.json">{m.modelData}</a>{' · '}
              <a className={link} href="https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/config.json">{m.configSource}</a>
            </li>
            <li>
              <p>{m.hardwareSource}</p>
              <Link className={link} href="/gpu/">{t.gpuPage.allGpus}</Link>{' · '}
              <a className={link} href="/data/v1/gpus.json">{m.gpuData}</a>
            </li>
            <li>
              <p>{m.benchmarkSource}</p>
              <Link className={link} href="/benchmarks/">{t.nav.benchmarks}</Link>
            </li>
          </ul>
          <a className={link} href="https://github.com/ggml-org/llama.cpp/blob/master/ggml/src/ggml-common.h">{m.cacheSource}</a>
        </section>
      </div>
    </article>
  );
}
