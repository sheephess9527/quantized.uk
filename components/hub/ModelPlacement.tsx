'use client';

import Link from '@/components/i18n/LocalLink';
import { useLanguage } from '@/lib/i18n/context';
import { modelPlacement, gpuSlug } from '@/lib/utils/model-placement';
import { quantLevelKey } from '@/lib/utils/recommend';
import { GPU_PAGE_CONTEXT } from '@/lib/utils/gpu-page';
import type { QuantModel } from '@/lib/data/types';

/**
 * The model page's links out to the rest of the site.
 *
 * Before this, the internal link graph ran almost entirely through the header
 * and footer: fourteen hub URLs on every page, while the four single-format
 * pages had one inbound link each and a model page emitted 7–9 links, none of
 * them to a format page or a hardware page. Every relationship rendered here
 * is computed (`model-placement.ts`) from data the site already holds.
 *
 * Anchor text is always the target's own name, never "here".
 */
export default function ModelPlacement({ model }: { model: QuantModel }) {
  const { t, lang } = useLanguage();
  const p = t.hub.placement;
  const x = modelPlacement(model);

  const fill = (s: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s);

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 pt-0.5">{label}</dt>
      <dd className="flex flex-wrap gap-x-3 gap-y-1.5 items-center text-sm">{children}</dd>
    </div>
  );

  const chip =
    'inline-flex items-center min-h-[44px] text-sm text-slate-300 hover:text-violet-300 transition-colors';

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-100 mb-1">{p.title}</h2>
      <p className="text-sm text-slate-500 mb-3 leading-relaxed">
        {fill(p.basis, { quant: quantLevelKey(x.quant), ctx: GPU_PAGE_CONTEXT / 1024 })}
      </p>

      <dl>
        {x.comfortable.length > 0 && (
          <Row label={p.comfortable}>
            {x.comfortable.map(c => (
              <Link key={c.gpu.id} href={`/gpu/${gpuSlug(c.gpu)}/`} className={chip}>
                {c.gpu.name}
                <span className="ml-1.5 font-mono text-xs text-slate-500">
                  {c.gpu.vram}GB · +{c.headroomGB.toFixed(1)}
                </span>
              </Link>
            ))}
          </Row>
        )}

        {x.tight.length > 0 && (
          <Row label={p.tight}>
            {x.tight.map(c => (
              <Link key={c.gpu.id} href={`/gpu/${gpuSlug(c.gpu)}/`} className={chip}>
                {c.gpu.name}
                <span className="ml-1.5 font-mono text-xs text-slate-500">{c.gpu.vram}GB</span>
              </Link>
            ))}
          </Row>
        )}

        {x.misses.length > 0 && (
          <Row label={p.misses}>
            {x.misses.map(c => (
              <Link key={c.gpu.id} href={`/gpu/${gpuSlug(c.gpu)}/`} className={chip}>
                {c.gpu.name}
                <span className="ml-1.5 font-mono text-xs text-amber-400/70">
                  +{c.overBy?.toFixed(1)}GB {p.over}
                </span>
              </Link>
            ))}
          </Row>
        )}

        {x.formats.length > 0 && (
          <Row label={p.ships}>
            {x.formats.map(f => (
              <Link key={f.id} href={`/formats/${f.id}/`} className={chip}>
                {f.name}
              </Link>
            ))}
          </Row>
        )}

        {x.pairs.length > 0 && (
          <Row label={p.compare}>
            {x.pairs.map(pair => (
              <Link key={pair.slug} href={`/formats/${pair.slug}/`} className={chip}>
                {pair.label}
              </Link>
            ))}
          </Row>
        )}

        {x.bestTiers.length > 0 && (
          <Row label={p.bestFor}>
            {x.bestTiers.map(b => (
              <Link key={b.slug} href={`/best/${b.slug}/`} className={chip}>
                {fill(t.best.tierTitle, { label: b.label })}
              </Link>
            ))}
          </Row>
        )}

        <Row label={p.doIt}>
          <Link href={x.calcHref} className={chip}>
            {p.sizeIt}
          </Link>
          <Link href={x.cliHref} className={chip}>
            {p.commandIt}
          </Link>
        </Row>
      </dl>
    </section>
  );
}
