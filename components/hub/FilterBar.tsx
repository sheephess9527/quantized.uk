'use client';

import { Search, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';

export interface HubFilters {
  search: string;
  paramRange: string;
  category: string;
  hardware: string;
  format: string;
}

interface Props {
  filters: HubFilters;
  onChange: (f: HubFilters) => void;
  count: number;
  total: number;
  profileFilterActive?: boolean;
}

export default function FilterBar({ filters, onChange, count, total, profileFilterActive }: Props) {
  const { t } = useLanguage();

  const set = (key: keyof HubFilters) => (val: string) =>
    onChange({ ...filters, [key]: val });

  const hasActiveFilters =
    filters.search || filters.paramRange || filters.category ||
    filters.hardware || filters.format;

  const clearAll = () => onChange({ search: '', paramRange: '', category: '', hardware: '', format: '' });

  const renderGroup = (
    label: string,
    key: keyof HubFilters,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <p className="text-xs text-slate-600 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(({ value, label: l }) => (
          <button
            key={value}
            onClick={() => set(key)(filters[key] === value ? '' : value)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border',
              filters[key] === value
                ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10'
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          placeholder={t.hub.search}
          value={filters.search}
          onChange={e => set('search')(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderGroup(t.hub.filters.params, 'paramRange', [
          { value: '≤3B',  label: '≤3B' },
          { value: '7B',   label: '7B'  },
          { value: '14B',  label: '14B' },
          { value: '32B',  label: '32B' },
          { value: '70B+', label: '70B+' },
        ])}

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

        {renderGroup(t.hub.filters.format, 'format', [
          { value: 'GGUF', label: 'GGUF' },
          { value: 'AWQ',  label: 'AWQ'  },
          { value: 'EXL2', label: 'EXL2' },
          { value: 'GPTQ', label: 'GPTQ' },
          { value: 'HQQ',  label: 'HQQ'  },
        ])}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className={cn(
          'text-xs font-medium',
          count < total
            ? profileFilterActive ? 'text-amber-400/80' : 'text-violet-400/70'
            : 'text-slate-600',
        )}>
          {count} / {total} models
        </p>
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
  );
}
