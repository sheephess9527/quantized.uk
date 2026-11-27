import Link from '@/components/i18n/LocalLink';
import { ArrowRight, Rss, Sparkles } from 'lucide-react';
import { translations, type Lang } from '@/lib/i18n/translations';
import { models } from '@/lib/data/models';
import { gpuDisplayName } from '@/lib/data/gpus';
import { dataLastUpdated } from '@/lib/data/meta';
import { isRecentModel, nameCarriesLabel } from '@/lib/utils/model-meta';
import { latestEntries, isRecentDate } from '@/lib/utils/latest-additions';
import { gpuSlug } from '@/lib/utils/gpu-page';

export default function WeeklyUpdates({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const w = t.home.weekly;
  // Newest first, and never empty: the 45-day window alone left two models
  // here, in file order, and would have shown nothing a month later under a
  // heading that still said "this week". The NEW badge keeps the window.
  // Hardware rides along since 2026-10-05: a new machine had no way onto the
  // homepage, which is where a reader checking "did they add X yet" looks.
  const recent = latestEntries(models, 6);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="section-title text-lg flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            {w.title}
          </h2>
          <p className="section-subtitle text-xs mt-0.5">
            {w.subtitle}
            <span className="text-slate-600 font-mono ml-2">{dataLastUpdated}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/quant-hub/?recency=recent"
            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 py-2.5 -my-2.5 min-h-[44px]"
          >
            {w.viewHub} <ArrowRight size={12} />
          </Link>
          {/* The head advertises /zh/feed.xml on the Chinese tree; this visible
              link used to send the same reader to the English feed. It is not a
              `LocalLink` because the leak gate skips asset-looking paths, so the
              language is resolved explicitly here. */}
          <a
            href={lang === 'zh' ? '/zh/feed.xml' : '/feed.xml'}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-400 py-2.5 -my-2.5 min-h-[44px]"
          >
            <Rss size={12} /> {w.rss}
          </a>
        </div>
      </div>

      {recent.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {recent.map(e => e.kind === 'model' ? (
            <li key={e.model.id}>
              <Link
                href={`/quant-hub/${e.model.id}/`}
                className="block rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-3 py-2.5 hover:border-sky-500/25 hover:bg-sky-500/[0.04] transition-all"
              >
                {isRecentModel(e.model) && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 mr-1.5">
                    {t.hub.model.newBadge}
                  </span>
                )}
                <span className="text-sm text-slate-200 font-medium">{e.model.name}</span>
                <span className="block text-xs text-slate-600 font-mono mt-0.5">
                  {/* "added", not a bare date. `addedAt` is when this index
                      picked the model up, but printed next to a NEW badge a
                      bare date reads as the model's release date — and several
                      of these were released a year before we indexed them. */}
                  {!nameCarriesLabel(e.model.name, e.model.paramLabel) && <>{e.model.paramLabel} · </>}{t.hub.model.addedOn.replace('{date}', e.date)}
                </span>
              </Link>
            </li>
          ) : (
            <li key={`hw-${e.gpus[0].id}`}>
              {/* A same-day batch links its first row; that page names and
                  links its same-budget siblings. */}
              <Link
                href={`/gpu/${gpuSlug(e.gpus[0])}/`}
                className="block rounded-xl border border-ink/[0.06] bg-ink/[0.02] px-3 py-2.5 hover:border-sky-500/25 hover:bg-sky-500/[0.04] transition-all"
              >
                {isRecentDate(e.date) && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 mr-1.5">
                    {t.hub.model.newBadge}
                  </span>
                )}
                <span className="text-sm text-slate-200 font-medium">{e.gpus.map(g => gpuDisplayName(g, lang)).join(' · ')}</span>
                <span className="block text-xs text-slate-600 font-mono mt-0.5">
                  {w.hardware} · {e.gpus.every(g => g.name.includes(`${g.vram}G`)) ? '' : `${Array.from(new Set(e.gpus.map(g => g.vram))).join(' / ')} GB · `}{t.hub.model.addedOn.replace('{date}', e.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/*
        No changelog prose here any more. This block listed the latest three
        entries while the hero pill showed the newest one and the changelog
        section below showed it again — the same paragraph three times on one
        page. This section's own job is the models that arrived; what changed
        belongs to `/changelog/`, one link away.
      */}
      <Link
        href="/changelog/"
        className="inline-flex items-center min-h-[44px] mt-1 text-xs text-slate-500 hover:text-slate-300 border-t border-ink/[0.05] pt-3 w-full"
      >
        {w.viewChangelog} →
      </Link>
    </section>
  );
}
