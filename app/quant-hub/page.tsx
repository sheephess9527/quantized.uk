'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { models } from '@/lib/data/models';
import ModelCard from '@/components/hub/ModelCard';
import FilterBar, { HubFilters } from '@/components/hub/FilterBar';

export default function QuantHubPage() {
  const { t, lang } = useLanguage();
  const [filters, setFilters] = useState<HubFilters>({
    search: '', paramRange: '', category: '', hardware: '', format: '',
  });

  const filtered = useMemo(() => {
    return models.filter(m => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.family.toLowerCase().includes(q)) return false;
      }
      if (filters.paramRange) {
        const p = m.params;
        if (filters.paramRange === '≤3B'  && p > 3)   return false;
        if (filters.paramRange === '7B'   && (p <= 3 || p > 9))   return false;
        if (filters.paramRange === '14B'  && (p <= 9 || p > 20))  return false;
        if (filters.paramRange === '32B'  && (p <= 20 || p > 50)) return false;
        if (filters.paramRange === '70B+' && p <= 50) return false;
      }
      if (filters.category && !m.categories.includes(filters.category)) return false;
      if (filters.hardware && !m.hardwareTags.includes(filters.hardware)) return false;
      if (filters.format  && !m.quants.some(q => q.format === filters.format)) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.hub.title}</h1>
        <p className="text-slate-400">{t.hub.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          count={filtered.length}
          total={models.length}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-lg mb-2">{t.hub.noResults}</p>
          <button
            onClick={() => setFilters({ search: '', paramRange: '', category: '', hardware: '', format: '' })}
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            {t.hub.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(model => (
            <ModelCard key={model.id} model={model} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
