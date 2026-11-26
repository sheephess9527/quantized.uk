'use client';

import { useState, useMemo } from 'react';
import Link from '@/components/i18n/LocalLink';
import { Clock, ChevronRight, Code2, Terminal, Server, Layers, Search } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils/cn';

export interface CookbookCardSummary {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  category: 'edge' | 'server' | 'docker' | 'mac';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  readMin: { en: number; zh: number };
}

const categoryIcons: Record<string, React.ElementType> = {
  all:    Layers,
  edge:   Terminal,
  server: Server,
  docker: Code2,
  mac:    Terminal,
};

const difficultyColors = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced:     'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function CookbookIndexContent({ items }: { items: CookbookCardSummary[] }) {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const categories = ['all', 'edge', 'server', 'docker', 'mac'] as const;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(a => {
      if (activeCategory !== 'all' && a.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = `${a.title} ${a.titleZh} ${a.description} ${a.descriptionZh} ${a.tags.join(' ')} ${a.id}`.toLowerCase();
      return q.split(/\s+/).every(token => haystack.includes(token));
    });
  }, [items, activeCategory, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.cookbook },
        ]}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.cookbook.title}</h1>
        <p className="text-slate-400">{t.cookbook.subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const Icon = categoryIcons[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-medium transition-all duration-150 border',
                  active
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/25'
                    : 'text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/10'
                )}
              >
                <Icon size={12} />
                {t.cookbook.categories[cat]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label={t.cookbook.searchPlaceholder.replace('{n}', String(items.length))}
            placeholder={t.cookbook.searchPlaceholder.replace('{n}', String(items.length))}
            className="w-full min-h-[40px] rounded-xl bg-white/[0.03] border border-white/[0.12] pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="glass rounded-2xl p-5 text-sm text-slate-400">
          {t.cookbook.searchEmpty.replace('{q}', query.trim())}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(article => (
            <Link
              key={article.id}
              href={`/cookbook/${article.id}/`}
              className="glass glass-hover rounded-2xl p-5 text-left group transition-all duration-200 hover:scale-[1.01] block"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
                    {t.cookbook.difficulty[article.difficulty]}
                  </span>
                  <span className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07]">
                    {t.cookbook.categories[article.category]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
                  <Clock size={10} />
                  {article.readMin[lang]} {t.cookbook.readTime}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 mb-2 leading-snug">
                {lang === 'zh' ? article.titleZh : article.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {lang === 'zh' ? article.descriptionZh : article.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {article.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="badge text-xs bg-white/[0.03] text-slate-500 border-white/[0.05] font-mono">
                    {tag}
                  </span>
                ))}
              </div>

              <span className="flex items-center gap-1 text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
                {t.cookbook.readGuide}
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
