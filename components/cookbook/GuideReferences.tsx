'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import { guideReferences, gpuSlug } from '@/lib/utils/guide-references';
import type { Article } from '@/lib/data/cookbook';

/**
 * "What this guide uses" — the cookbook's links into the model index, the
 * hardware pages, the formats and the picks.
 *
 * Guides are where the traffic lands and were the least connected section on
 * the site: 3–8 outbound links, one page with two inbound. Every row is derived
 * from what the guide already declares, so it cannot name a card or a model the
 * guide is not about.
 */
export default function GuideReferences({ article }: { article: Article }) {
  const { t } = useLanguage();
  const r = t.cookbook.references;
  const x = guideReferences(article);

  const rows = [
    x.gpu ? 1 : 0,
    x.models.length,
    x.formats.length,
    x.bestTier ? 1 : 0,
    x.related.length,
  ].reduce((a, b) => a + b, 0);
  if (rows === 0) return null;

  const chip =
    'inline-flex items-center min-h-[44px] text-sm text-slate-300 hover:text-violet-300 transition-colors';

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 pt-0.5">{label}</dt>
      <dd className="flex flex-wrap gap-x-3 gap-y-1.5 items-center text-sm">{children}</dd>
    </div>
  );

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="section-title text-base mb-2">{r.title}</h2>
      <dl>
        {x.gpu && (
          <Row label={r.hardware}>
            <Link href={`/gpu/${gpuSlug(x.gpu)}/`} className={chip}>
              {x.gpu.name}
              <span className="ml-1.5 font-mono text-xs text-slate-500">{x.gpu.vram}GB</span>
            </Link>
            {x.siblings.map(s => (
              <Link key={s.id} href={`/gpu/${gpuSlug(s)}/`} className={chip}>
                {s.name}
              </Link>
            ))}
          </Row>
        )}

        {x.models.length > 0 && (
          <Row label={r.models}>
            {x.models.map(m => (
              <Link key={m.id} href={`/quant-hub/${m.id}/`} className={chip}>
                {m.name}
                <span className="ml-1.5 font-mono text-xs text-slate-500">{m.paramLabel}</span>
              </Link>
            ))}
          </Row>
        )}

        {x.formats.length > 0 && (
          <Row label={r.format}>
            {x.formats.map(f => (
              <Link key={f.id} href={`/formats/${f.id}/`} className={chip}>
                {f.name}
              </Link>
            ))}
          </Row>
        )}

        {x.bestTier && (
          <Row label={r.picks}>
            <Link href={`/best/${x.bestTier.slug}/`} className={chip}>
              {t.best.tierTitle.replace('{label}', x.bestTier.label)}
            </Link>
          </Row>
        )}

        {x.related.length > 0 && (
          <Row label={r.next}>
            {x.related.map(a => (
              <Link key={a.id} href={`/cookbook/${a.id}/`} className={chip}>
                {a.title}
              </Link>
            ))}
          </Row>
        )}
      </dl>
    </section>
  );
}
