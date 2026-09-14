import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * QTZ-026: one shared layout so all five page-type OG images stay visually
 * consistent — the brand mark and dark palette in one place, not copy-pasted
 * into five files that would drift the moment one of them is edited.
 *
 * No custom font is loaded. `ImageResponse`'s default sans-serif renders
 * correctly with zero build-time network dependency (unlike `next/font`,
 * which needs Google Fonts reachable at build time) and every acceptance
 * criterion for this item is about content and dimensions, not typography.
 */
export function renderOgImage({
  eyebrow,
  title,
  stats,
  footer,
}: {
  /** Small top label — page type, e.g. "GPU" or "Guide". */
  eyebrow: string;
  /** The headline — model name, card name, guide title, etc. */
  title: string;
  /** 1-3 short stat lines under the title. */
  stats: string[];
  /** Bottom-right line, usually a fit/pick summary. */
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#0a0a0f',
          backgroundImage: 'radial-gradient(circle at 15% 15%, #1a1230 0%, #0a0a0f 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: 'white',
              fontWeight: 700,
            }}
          >
            Q
          </div>
          <div style={{ fontSize: 22, color: '#a78bfa', fontWeight: 700, letterSpacing: -0.5 }}>
            {eyebrow}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/*
            Guide titles run past 55 characters (the longest is 56); model
            names top out at 31. A fixed `width` plus normal text flow is what
            actually wraps long text in Satori — a flex row with no width
            collapses to the text's natural (huge) size and runs off the
            1200px canvas instead.
          */}
          <div
            style={{
              width: '100%',
              fontSize: title.length > 44 ? 42 : title.length > 24 ? 52 : 68,
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: -1.5,
              lineHeight: 1.15,
              display: 'flex',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ fontSize: 30, color: '#cbd5e1', display: 'flex' }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 26, color: '#64748b', display: 'flex' }}>
            {footer ?? ''}
          </div>
          <div style={{ fontSize: 26, color: '#475569', fontWeight: 600, display: 'flex' }}>
            quantized<span style={{ color: '#a78bfa' }}>.uk</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
