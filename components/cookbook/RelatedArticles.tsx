'use client';

import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { getRelatedArticles } from '@/lib/utils/related';
import { cn } from '@/lib/utils/cn';

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface Props {
  articleId: string;
}

export default function RelatedArticles({ articleId }: Props) {
  const { t, lang } = useLanguage();
  const related = getRelatedArticles(articleId);
  if (related.length === 0) return null;

  const r = t.cookbook.related;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">{r.title}</h2>
      <div className="grid gap-3">
        {related.map(article => (
          <Link
            key={article.id}
            href={`/cookbook/${article.id}/`}
            className="group glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={cn('badge text-xs', difficultyColors[article.difficulty])}>
                    {t.cookbook.difficulty[article.difficulty]}
                  </span>
                  <span className="badge text-xs bg-white/[0.04] text-slate-500 border-white/[0.07]">
                    {t.cookbook.categories[article.category]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={10} />
                    {article.readTime} {t.cookbook.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {lang === 'zh' ? article.titleZh : article.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {lang === 'zh' ? article.descriptionZh : article.description}
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 shrink-0 mt-1 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}