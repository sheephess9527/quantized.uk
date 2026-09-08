'use client';

import { useState } from 'react';
import { ChevronDown, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * The same data the chart above draws, as a table.
 *
 * A Recharts SVG is a pile of `<path>` elements: the numbers in it are not
 * text, so a screen reader gets nothing and neither does anyone who cannot
 * separate the bar colours. This is the text equivalent — collapsed by
 * default so it does not duplicate the chart visually, but present in the
 * static HTML either way, which also means the figures are indexable.
 *
 * The chart itself is marked `role="img"` with a label by the caller, so
 * assistive tech announces it as one object and points here instead of
 * reading several hundred path nodes.
 */
export default function ChartTable({
  caption,
  columns,
  rows,
  toggleLabel,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
  toggleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-medium text-slate-400 hover:text-slate-200"
      >
        <Table2 size={12} />
        {toggleLabel}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs min-w-[420px]">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/[0.06]">
                {columns.map((c, i) => (
                  <th key={c} scope="col" className={cn('font-medium py-2 pr-3', i > 0 && 'text-right')}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {row.map((cell, j) => (
                    <td key={j} className={cn('py-2 pr-3', j === 0 ? 'text-slate-300' : 'text-right font-mono text-slate-400')}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
