'use client';

import { List } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { Article } from '@/lib/data/cookbook';
import { cn } from '@/lib/utils/cn';

interface Props {
  article: Article;
}

export function sectionId(index: number): string {
  return `section-${index}`;
}

export default function ArticleToc({ article }: Props) {
  const { t, lang } = useLanguage();
  const toc = t.cookbook.toc;

  if (article.content.length < 2) return null;

  return (
    <nav aria-label={toc.label} className="glass rounded-xl p-4 lg:sticky lg:top-28">
      <div className="flex items-center gap-2 mb-3">
        <List size={13} className="text-cyan-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{toc.title}</span>
      </div>
      <ol className="space-y-1.5">
        {article.content.map((section, i) => (
          <li key={i}>
            <a
              href={`#${sectionId(i)}`}
              className={cn(
                'block text-xs text-slate-500 hover:text-cyan-300 transition-colors leading-relaxed',
                'border-l-2 border-transparent hover:border-cyan-500/40 pl-2.5 py-0.5',
              )}
            >
              <span className="text-slate-700 font-mono mr-1.5">{i + 1}.</span>
              {lang === 'zh' ? section.headingZh : section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}