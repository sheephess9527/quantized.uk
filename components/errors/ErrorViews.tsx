'use client';

import Link from '@/components/i18n/LocalLink';
import { AlertTriangle, Calculator, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { textWithGuardedEmail } from '@/components/ui/EmailOffGuard';
import { canonical, FEEDBACK_EMAIL } from '@/lib/seo';
import { localizeHref } from '@/lib/i18n/routing';
import { articles } from '@/lib/data/cookbook';
import { runtimeErrors, errorById, type RuntimeErrorEntry } from '@/lib/data/errors';

/**
 * `/errors/` and `/errors/<id>/`. All text comes from `lib/data/errors.ts`,
 * where every message is quoted from the source file it cites.
 */

type GroupKey = 'memory' | 'file' | 'gpu' | 'amd' | 'ollama';

/** Grouped by what the reader is fighting, not by which program printed it. */
const GROUP_OF: Record<string, GroupKey> = {
  'cuda-out-of-memory': 'memory',
  'unable-to-allocate-buffer': 'memory',
  'failed-to-allocate-kv-cache': 'memory',
  'metal-failed-to-allocate-buffer': 'memory',
  'torch-cuda-out-of-memory': 'memory',
  'vllm-free-memory-less-than-utilization': 'memory',
  'unknown-model-architecture': 'file',
  'wrong-number-of-tensors': 'file',
  'gguf-invalid-magic': 'file',
  'failed-to-initialize-cuda': 'gpu',
  'docker-could-not-select-device-driver': 'gpu',
  'ollama-100-percent-cpu': 'gpu',
  'torch-capability-not-compatible': 'gpu',
  'rocblas-cannot-read-tensilelibrary': 'amd',
  'hsa-override-gfx-version': 'amd',
  'ollama-model-incompatible': 'ollama',
  'ollama-requires-newer-version': 'ollama',
  'ollama-model-not-found': 'ollama',
  'ollama-pull-manifest-not-found': 'ollama',
};
const GROUP_ORDER: GroupKey[] = ['memory', 'file', 'gpu', 'amd', 'ollama'];

export const errorGroup = (id: string): GroupKey => GROUP_OF[id] ?? 'file';

export function ErrorIndexView() {
  const { t, lang } = useLanguage();
  const e = t.errorPages;
  const path = localizeHref('/errors/', lang);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: e.indexTitle,
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          numberOfItems: runtimeErrors.length,
          itemListElement: runtimeErrors.map((err, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: err.title[lang],
            url: canonical(localizeHref(`/errors/${err.id}/`, lang)),
          })),
        }}
      />
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: t.nav.tools, href: '/tools/' }, { label: t.nav.errors }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{e.indexTitle}</h1>
        <p className="text-slate-400 max-w-3xl leading-relaxed">{e.indexSubtitle}</p>
        <p className="text-xs text-slate-500 mt-2">{e.count.replace('{n}', String(runtimeErrors.length))}</p>
      </div>

      <div className="space-y-8">
        {GROUP_ORDER.map(g => {
          const items = runtimeErrors.filter(err => errorGroup(err.id) === g);
          if (items.length === 0) return null;
          return (
            <section key={g}>
              <h2 className="text-lg font-bold text-slate-100 mb-3">{e.groups[g]}</h2>
              <ul className="space-y-3">
                {items.map(err => (
                  <li key={err.id}>
                    <Link href={`/errors/${err.id}/`} className="block glass glass-hover rounded-2xl p-4">
                      <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                        <span className="badge bg-white/[0.05] border-white/[0.08] text-slate-400">{err.runtime}</span>
                      </span>
                      <span className="block font-semibold text-slate-200">{err.title[lang]}</span>
                      <code className="block mt-1.5 font-mono text-xs text-amber-300/90 break-words">{err.message}</code>
                      <span className="block text-sm text-slate-400 leading-relaxed mt-1.5">{err.summary[lang]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="text-sm text-slate-500 mt-8">{textWithGuardedEmail(e.notListed, FEEDBACK_EMAIL)}</p>
    </div>
  );
}

export function ErrorDetailView({ id }: { id: string }) {
  const { t, lang } = useLanguage();
  const e = t.errorPages;
  const err = errorById(id);
  if (!err) return null;
  const path = localizeHref(`/errors/${err.id}/`, lang);
  const guides = (err.guides ?? [])
    .map(g => articles.find(a => a.id === g))
    .filter((a): a is (typeof articles)[number] => !!a);
  const related = (err.seeAlso ?? []).map(errorById).filter((x): x is RuntimeErrorEntry => !!x);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: err.title[lang],
          description: err.summary[lang],
          url: canonical(path),
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          dateModified: err.checkedAt,
          about: err.runtime,
        }}
      />
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.tools, href: '/tools/' },
          { label: t.nav.errors, href: '/errors/' },
          { label: err.title[lang] },
        ]}
      />
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="badge bg-amber-500/10 border-amber-500/20 text-amber-300 inline-flex items-center gap-1">
          <AlertTriangle size={12} aria-hidden /> {err.runtime}
        </span>
        <span className="text-xs text-slate-500">{e.groups[errorGroup(err.id)]}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-5">{err.title[lang]}</h1>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{err.setting ? e.messageSetting : e.message}</h2>
        <pre className="bg-black/30 border border-white/[0.06] rounded-xl p-4 font-mono text-sm text-amber-200 whitespace-pre-wrap break-words">{err.message}</pre>
        {err.message.includes('<') && <p className="text-xs text-slate-500 mt-1.5">{e.placeholders}</p>}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{e.meaning}</h2>
        <p className="text-slate-300 leading-relaxed">{err.summary[lang]}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{e.causes}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-400 leading-relaxed">
          {err.causes.map((c, i) => <li key={i}><Rich text={c[lang]} /></li>)}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">{e.fixes}</h2>
        <ol className="list-decimal pl-5 space-y-2 text-slate-400 leading-relaxed">
          {err.fixes.map((f, i) => <li key={i}><Rich text={f[lang]} /></li>)}
        </ol>
      </section>

      {err.calc && (
        <section className="glass rounded-2xl p-4 sm:p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-100 mb-1">{e.calcTitle}</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">{e.calcBody}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/tools/vram-calc/" className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
              <Calculator size={14} aria-hidden /> {e.calcLink}
            </Link>
            <Link href="/tools/context-length/" className="text-cyan-300 hover:text-cyan-200">{e.contextLink}</Link>
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{e.guides}</h2>
          <ul className="space-y-1.5">
            {guides.map(a => (
              <li key={a.id}>
                <Link href={`/cookbook/${a.id}/`} className="text-violet-300 hover:text-violet-200">
                  {lang === 'zh' ? a.titleZh : a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{e.seeAlso}</h2>
          <ul className="space-y-1.5">
            {related.map(r => (
              <li key={r.id}>
                <Link href={`/errors/${r.id}/`} className="text-violet-300 hover:text-violet-200">{r.title[lang]}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-white/[0.06] pt-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">{e.sources}</h2>
        <ul className="space-y-1 text-sm">
          {err.sources.map(s => (
            <li key={s.url}>
              <a href={s.url} rel="noopener nofollow" target="_blank" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 break-all">
                {s.label} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-2">{e.checked.replace('{date}', err.checkedAt)}</p>
      </section>
    </div>
  );
}

/** `code` only; the entries use it for flags and commands. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`')
          ? <code key={i} className="font-mono text-xs text-cyan-300 bg-white/[0.04] rounded px-1 py-0.5 break-words">{part.slice(1, -1)}</code>
          : <span key={i}>{part}</span>,
      )}
    </>
  );
}
