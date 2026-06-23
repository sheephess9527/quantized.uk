'use client';

import { useState } from 'react';
import { Clock, ChevronRight, Code2, Terminal, Server, Layers } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { articles } from '@/lib/data/cookbook';
import { cn } from '@/lib/utils/cn';

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

function ArticleModal({ article, onClose, lang }: { article: typeof articles[0]; onClose: () => void; lang: 'en' | 'zh' }) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors text-lg font-bold"
          >
            ✕
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
              {t.cookbook.difficulty[article.difficulty]}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={10} /> {article.readTime} {t.cookbook.readTime}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            {lang === 'zh' ? article.titleZh : article.title}
          </h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {article.tags.map(tag => (
              <span key={tag} className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07] font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {article.content.map((section, i) => (
            <div key={i}>
              <h3 className="text-base font-semibold text-slate-200 mb-2">
                {lang === 'zh' ? section.headingZh : section.heading}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                {lang === 'zh' ? section.bodyZh : section.body}
              </p>
              {section.code && (
                <div className="code-block">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    <span className="ml-1 text-xs text-slate-600">{section.code.lang}</span>
                  </div>
                  <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
                    <code>{section.code.content}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CookbookPage() {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [openArticle, setOpenArticle] = useState<typeof articles[0] | null>(null);

  const categories = ['all', 'edge', 'server', 'docker', 'mac'] as const;

  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t.cookbook.title}</h1>
        <p className="text-slate-400">{t.cookbook.subtitle}</p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border',
                activeCategory === cat
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

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(article => (
          <button
            key={article.id}
            onClick={() => setOpenArticle(article)}
            className="glass glass-hover rounded-2xl p-5 text-left group transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap gap-1.5">
                <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
                  {t.cookbook.difficulty[article.difficulty]}
                </span>
                <span className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07]">
                  {article.category}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 shrink-0">
                <Clock size={10} />
                {article.readTime} {t.cookbook.readTime}
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
                <span key={tag} className="badge text-xs bg-white/[0.03] text-slate-600 border-white/[0.05] font-mono">
                  {tag}
                </span>
              ))}
            </div>

            <span className="flex items-center gap-1 text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
              {t.cookbook.readGuide}
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>

      {/* Article modal */}
      {openArticle && (
        <ArticleModal
          article={openArticle}
          onClose={() => setOpenArticle(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
