'use client';

/**
 * Downloadable result card (Grok Bot, 2026-10-14). Drawn on a <canvas> in the
 * reader's browser and saved as a 1200×630 PNG (the OG size, so it previews
 * well when posted). Nothing is rendered server-side: the site is a static
 * export on Cloudflare Pages, and a per-result image endpoint would need a
 * Worker invocation per share — this costs no requests at all.
 * Every figure on the card is passed in from the calculator's own result.
 */
import { useState } from 'react';
import { ImageDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface Props {
  modelName: string;
  level: string;
  contextLabel: string;
  totalGB: number;
  weightsGB: number;
  kvGB: number;
  rigLabel?: string;
  verdict?: 'green' | 'yellow' | 'red';
  /** Calibrated tok/s with its range, when the calculator has one. */
  speed?: { tokS: number; low: number; high: number };
}

const VERDICT_COLOR = { green: '#34d399', yellow: '#facc15', red: '#f87171' } as const;

export default function ShareCard(p: Props) {
  const { t, lang } = useLanguage();
  const [busy, setBusy] = useState(false);

  const draw = (): HTMLCanvasElement => {
    const W = 1200, H = 630;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d')!;
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0b1020'); bg.addColorStop(1, '#1e1338');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const font = (w: number, s: number) => `${w} ${s}px ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`;
    g.fillStyle = '#a78bfa'; g.font = font(600, 28);
    g.fillText(t.calc.cardKicker, 64, 84);
    g.fillStyle = '#f1f5f9'; g.font = font(700, 60);
    g.fillText(p.modelName, 64, 168, W - 128);
    g.fillStyle = '#94a3b8'; g.font = font(500, 32);
    g.fillText(`${p.level} · ${t.calc.cardContext.replace('{ctx}', p.contextLabel)}`, 64, 222, W - 128);

    g.fillStyle = '#f8fafc'; g.font = font(800, 120);
    const big = `${p.totalGB.toFixed(1)} GB`;
    g.fillText(big, 64, 372);
    g.fillStyle = '#94a3b8'; g.font = font(500, 28);
    g.fillText(t.calc.cardBreakdown.replace('{w}', p.weightsGB.toFixed(1)).replace('{kv}', p.kvGB.toFixed(1)), 64, 420, W - 128);

    let y = 492;
    if (p.rigLabel && p.verdict) {
      g.fillStyle = VERDICT_COLOR[p.verdict];
      g.beginPath(); g.arc(78, y - 10, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e2e8f0'; g.font = font(600, 32);
      const vt = p.verdict === 'green' ? t.calc.green : p.verdict === 'yellow' ? t.calc.yellow : t.calc.red;
      g.fillText(`${p.rigLabel} · ${vt}`, 104, y, W - 168);
      y += 50;
    }
    if (p.speed) {
      g.fillStyle = '#6ee7b7'; g.font = font(500, 28);
      g.fillText(t.calc.cardSpeed.replace('{n}', String(p.speed.tokS)).replace('{low}', String(p.speed.low)).replace('{high}', String(p.speed.high)), 64, y, W - 128);
    }
    g.fillStyle = '#64748b'; g.font = font(500, 24);
    g.fillText(lang === 'zh' ? 'quantized.uk/zh/tools/vram-calc' : 'quantized.uk/tools/vram-calc', 64, H - 40);
    g.textAlign = 'right';
    g.fillText(t.calc.cardEstimate, W - 64, H - 40);
    return c;
  };

  const save = async () => {
    setBusy(true);
    try {
      const blob: Blob | null = await new Promise(r => draw().toBlob(r, 'image/png'));
      if (!blob) return;
      const name = `quantized-${p.modelName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${p.level}.png`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={save}
      disabled={busy}
      data-testid="share-card"
      className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300 disabled:opacity-50"
    >
      <ImageDown size={15} /> {t.calc.cardSave}
    </button>
  );
}
