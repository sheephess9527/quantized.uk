'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { changelog, dataLastUpdated } from '@/lib/data/meta';
import { cn } from '@/lib/utils/cn';

/**
 * Collapsed by default. The full log is the site's memory and is not going
 * anywhere — but it was the tallest block on a homepage whose job is to answer
 * "what can I run", and the three most recent entries already appear in
 * `WeeklyUpdates` above.
 *
 * The `#changelog` id stays on the outer element: the hero pill, the About
 * page and any external link all point at it, and moving the log to its own
 * route would have broken every one of them.
 */
const PREVIEW = 5;

export default function DataChangelog() {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? changelog : changelog.slice(0, PREVIEW);
  const c = t.home.changelog;

  return (
    <div id="changelog" className="glass rounded-2xl p-5 scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="section-title text-lg">{c.title}</h2>
          <p className="section-subtitle text-xs mt-0.5">
            {c.subtitle.replace('{date}', dataLastUpdated)}
          </p>
        </div>
        {changelog.length > PREVIEW && (
          <span className="text-xs font-mono text-slate-600">
            {c.latest.replace('{n}', String(shown.length)).replace('{total}', String(changelog.length))}
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {shown.map((entry, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-slate-600 shrink-0 pt-0.5 w-20">{entry.date}</span>
            <span className="text-slate-400 leading-relaxed">{entry[lang]}</span>
          </li>
        ))}
      </ul>

      {changelog.length > PREVIEW && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 min-h-[44px] mt-2 text-xs font-medium text-violet-400 hover:text-violet-300"
        >
          {expanded ? c.showLess : c.showAll.replace('{n}', String(changelog.length))}
          <ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}

      <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-white/[0.05]">{c.disclaimer}</p>
    </div>
  );
}
