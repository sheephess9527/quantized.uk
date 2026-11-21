'use client';

import { useLanguage } from '@/lib/i18n/context';

/**
 * One horizontal bar for the forward result: weights | KV cache | activations
 * (| vision encoder) | free, scaled to the reader's card. Every segment is a
 * field of the same `calcVRAM` result the rows above print, and the dashed tick
 * sits at 88% — the line `getVerdict` turns amber at — so the bar can never
 * tell a different story from the verdict. Without a card (or when the card's
 * backend cannot load the format) it shows composition only, scaled to the
 * total, with no "free" claim. An overflow inside the tight band is worded as a
 * spill to system RAM, matching the amber verdict, not as "does not fit".
 */
export default function VramStackBar({
  weightsGB,
  kvGB,
  activationsGB,
  extraGB = 0,
  capacityGB,
  tightCeiling = 1.05,
  formatBlocked = false,
}: {
  weightsGB: number;
  kvGB: number;
  activationsGB: number;
  extraGB?: number;
  /** Usable capacity of the reader's rig; omit when there is no card to judge against. */
  capacityGB?: number;
  /** `tightCeiling(gpu)` — past the card but under this, the overflow spills to system RAM (amber, not red). */
  tightCeiling?: number;
  /** The card is picked but its backend cannot load this format — there is no capacity to compare with. */
  formatBlocked?: boolean;
}) {
  const { t } = useLanguage();
  const total = weightsGB + kvGB + activationsGB + extraGB;
  if (total <= 0) return null;
  const cap = capacityGB && capacityGB > 0 ? capacityGB : undefined;
  const scale = cap ? Math.max(cap, total) : total;
  const pct = (gb: number) => `${(gb / scale) * 100}%`;
  const free = cap ? cap - total : 0;

  const segments = [
    { gb: weightsGB, cls: 'bg-violet-500', label: t.calc.modelWeights },
    { gb: kvGB, cls: 'bg-cyan-400', label: t.calc.kvCache },
    { gb: activationsGB, cls: 'bg-orange-400', label: t.calc.activations },
    { gb: extraGB, cls: 'bg-pink-400', label: t.calc.mmprojRow },
  ].filter(s => s.gb > 0);

  const summary = cap
    ? (free >= 0
        ? t.calc.stackFree.replace('{used}', total.toFixed(1)).replace('{cap}', cap.toFixed(1)).replace('{free}', free.toFixed(1))
        : (total / cap <= tightCeiling ? t.calc.stackSpill : t.calc.stackOver)
            .replace('{used}', total.toFixed(1)).replace('{cap}', cap.toFixed(1)).replace('{over}', (-free).toFixed(1)))
    : formatBlocked ? t.calc.stackFormat : t.calc.stackNoCard;
  const aria = `${segments.map(s => `${s.label} ${s.gb.toFixed(1)} GiB`).join(', ')}. ${summary}`;

  return (
    <div className="mt-4">
      <div role="img" aria-label={aria} className="relative h-3 w-full rounded-full bg-white/[0.06] overflow-hidden flex">
        {segments.map(s => (
          <div key={s.label} className={`${s.cls} h-full shrink-0`} style={{ width: pct(s.gb) }} title={`${s.label} ${s.gb.toFixed(2)} GiB`} />
        ))}
        {cap && total > cap && (
          // Past the card: hatch the part that does not fit (amber when it only spills).
          <div
            className={`absolute top-0 bottom-0 right-0 ${total / cap <= tightCeiling ? 'bg-amber-400/70' : 'bg-red-500/60'}`}
            style={{ width: `${((total - cap) / scale) * 100}%`, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 3px, rgba(0,0,0,0.35) 3px 6px)' }}
          />
        )}
        {cap && (
          <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-white" style={{ left: pct(cap * 0.88) }} />
        )}
      </div>
      <p className={`text-xs mt-2 ${cap && free < 0 ? (total / cap <= tightCeiling ? 'text-amber-300' : 'text-red-300') : 'text-slate-400'}`}>{summary}</p>
      {cap && <p className="text-[11px] text-slate-500 mt-0.5">{t.calc.stackComfort}</p>}
    </div>
  );
}
