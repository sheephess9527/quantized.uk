'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { SHIPPED_FORMATS } from '@/lib/utils/hub-url';
import { PARAM_RANGES, PARAM_RANGE_LABEL } from '@/lib/utils/param-buckets';
import { localizeHref } from '@/lib/i18n/routing';

export interface HubFilters {
  search: string;
  paramRange: string;
  category: string;
  hardware: string;
  format: string;
  /** `text` | `multimodal` — input the model accepts, not what it is for. */
  input: string;
  /** `commercial` | `restricted` | `noncommercial` — see lib/data/model-facts.ts. */
  licence: string;
  recency: string;
  showLegacy: string;
}

interface Props {
  filters: HubFilters;
  onChange: (f: HubFilters) => void;
  count: number;
  total: number;
  profileFilterActive?: boolean;
  legacyCount: number;
  desktopSearch: ReactNode;
  mobileStats: ReactNode;
}

export function HubSearch({ filters, onChange, gpuFilterId, id }: Pick<Props, 'filters' | 'onChange'> & {
  gpuFilterId: string | null;
  id: string;
}) {
  const { t, lang } = useLanguage();

  return (
    <form role="search" action={localizeHref('/quant-hub/', lang)} method="get" className="relative">
      <label htmlFor={id} className="sr-only">{t.hub.search}</label>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true" />
      <input
        type="search"
        id={id}
        name="q"
        placeholder={t.hub.searchPlaceholder}
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        className="w-full min-h-[44px] sm:min-h-0 bg-ink/[0.04] border border-ink/[0.14] rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40"
      />
      {gpuFilterId && <input type="hidden" name="gpu" value={gpuFilterId} />}
      {filters.paramRange && <input type="hidden" name="size" value={filters.paramRange} />}
      {filters.category && <input type="hidden" name="cat" value={filters.category} />}
      {filters.hardware && <input type="hidden" name="hw" value={filters.hardware} />}
      {filters.format && <input type="hidden" name="fmt" value={filters.format} />}
      {filters.input && <input type="hidden" name="input" value={filters.input} />}
      {filters.licence && <input type="hidden" name="lic" value={filters.licence} />}
      {filters.recency && <input type="hidden" name="recency" value={filters.recency} />}
      {filters.showLegacy && <input type="hidden" name="legacy" value={filters.showLegacy} />}
    </form>
  );
}

export default function FilterBar({ filters, onChange, count, total, profileFilterActive, legacyCount, desktopSearch, mobileStats }: Props) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'search' && value).length;

  const set = (key: keyof HubFilters) => (val: string) =>
    onChange({ ...filters, [key]: val });

  const hasActiveFilters =
    filters.search || filters.paramRange || filters.category ||
    filters.hardware || filters.format || filters.input || filters.licence ||
    filters.recency || filters.showLegacy;

  const clearAll = () => onChange({
    search: '', paramRange: '', category: '', hardware: '', format: '',
    input: '', licence: '', recency: '', showLegacy: '',
  });

  const renderGroup = (
    label: string,
    key: keyof HubFilters,
    options: { value: string; label: string }[],
    hint?: string,
  ) => (
    <div>
      <p className="text-xs text-slate-600 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(({ value, label: l }) => (
          <button
            key={value}
            // A filter chip is a toggle, and its only "on" signal was a violet
            // background. Screen readers announced every chip identically,
            // selected or not.
            aria-pressed={filters[key] === value}
            onClick={() => set(key)(filters[key] === value ? '' : value)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border',
              filters[key] === value
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/25'
                : 'text-slate-500 border-ink/[0.06] hover:text-slate-300 hover:border-ink/10'
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {/* The licence classes are a judgement, so the rule that made it is printed here
          rather than left for the reader to infer from three chips. */}
      {hint && <p className="text-[11px] leading-snug text-slate-600 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="glass rounded-2xl px-4 sm:p-5">
      {/*
        A real GET form, not a bare input.

        Every page on this site advertises a `SearchAction` pointing at
        `/quant-hub/?q={term}`, and that URL does work — but the control that
        produces it was an input with no `name` and no form around it, so
        nothing could submit it without JavaScript and no browser or crawler
        could discover the interface from the markup. With the form, pressing
        Enter navigates to the advertised URL and the page filters on
        hydration; the hidden inputs carry the other active filters across so
        submitting a search does not silently clear the size or format chip.

        This is as far as a static export goes: there is no server to render a
        pre-filtered document per query, so `?q=` is honoured after mount by
        `HubQueryObserver`. The URL is real, shareable and crawlable either way.
      */}
      <div className="hidden sm:block mb-4">{desktopSearch}</div>
      <button type="button" aria-expanded={expanded} aria-controls="hub-filters"
        onClick={() => setExpanded(!expanded)}
        className="flex sm:hidden w-full min-h-[44px] items-center justify-between gap-2 text-left text-sm font-medium text-sky-300"
      >
        {t.hub.moreFilters}{activeCount > 0 && ` (${activeCount})`}
        <ChevronDown size={14} aria-hidden="true" className={expanded ? 'rotate-180' : undefined} />
      </button>
      <div id="hub-filters" className={cn('gap-4 pb-4 sm:grid sm:pb-0', expanded ? 'grid' : 'hidden')}>
      <div className="sm:hidden">{mobileStats}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {renderGroup(t.hub.filters.params, 'paramRange', PARAM_RANGES.map(value => ({ value, label: PARAM_RANGE_LABEL[value] })))}

        {renderGroup(t.hub.filters.category, 'category', [
          { value: 'general',    label: t.hub.categories.general    },
          { value: 'code',       label: t.hub.categories.code       },
          { value: 'multimodal', label: t.hub.categories.multimodal },
          { value: 'instruct',   label: t.hub.categories.instruct   },
        ])}

        {renderGroup(t.hub.filters.hardware, 'hardware', [
          { value: 'consumer-gpu', label: t.hub.hardware['consumer-gpu'] },
          { value: 'mac',          label: t.hub.hardware['mac']          },
          { value: 'cpu-vps',      label: t.hub.hardware['cpu-vps']      },
          { value: 'pro-gpu',      label: t.hub.hardware['pro-gpu']      },
        ])}

        {renderGroup(
          t.hub.filters.format,
          'format',
          SHIPPED_FORMATS.map(f => ({ value: f, label: f })),
        )}

        {/* Input and licence answer two questions the task/family filters cannot: what
            goes in, and what the terms allow. Both are recorded per model in
            lib/data/model-facts.ts. */}
        {renderGroup(t.hub.filters.input, 'input', [
          { value: 'text',       label: t.hub.input.text       },
          { value: 'multimodal', label: t.hub.input.multimodal },
        ])}

        {renderGroup(
          t.hub.filters.licence,
          'licence',
          [
            { value: 'commercial',    label: t.hub.licenceClasses.commercial    },
            { value: 'restricted',    label: t.hub.licenceClasses.restricted    },
            { value: 'noncommercial', label: t.hub.licenceClasses.noncommercial },
          ],
          t.hub.licenceHint,
        )}

        {renderGroup(t.hub.filters.recency, 'recency', [
          { value: 'recent', label: t.hub.recency.recent },
        ])}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className={cn(
            'text-xs font-medium',
            count < total
              ? profileFilterActive ? 'text-amber-400/80' : 'text-sky-400'
              : 'text-slate-500',
          )}>
            {t.hub.modelCount.replace('{count}', String(count)).replace('{total}', String(total))}
          </p>
          {/*
            QTZ-029: legacy models used to sit in the same list as everything
            current, with only a small amber badge saying otherwise. Hidden by
            default now — a reader browsing "what should I run" should not
            have to notice the badge on their own — but never gone: the toggle
            keeps them one click away, and their pages are still indexed.
          */}
          {legacyCount > 0 && (
            <button
              aria-pressed={filters.showLegacy === 'show'}
              onClick={() => set('showLegacy')(filters.showLegacy === 'show' ? '' : 'show')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border',
                filters.showLegacy === 'show'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                  : 'text-slate-500 border-ink/[0.06] hover:text-slate-300 hover:border-ink/10',
              )}
            >
              {t.hub.showLegacy.replace('{n}', String(legacyCount))}
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={10} />
            {t.hub.clearFilters}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
