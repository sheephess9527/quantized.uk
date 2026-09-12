import { Rss } from 'lucide-react';
import type { Lang } from '@/lib/i18n/translations';
import { dataLastUpdated } from '@/lib/data/meta';

const COPY = {
  en: {
    text: "This page's figures change when the model or the runtime does.",
    updated: 'Last updated',
  },
  zh: {
    text: '本页数字会随模型数据或运行时版本的变化而更新。',
    updated: '最近更新',
  },
} as const;

/**
 * QTZ-024: the site's only user-facing action used to be a feedback mailto.
 * This line gives every model and GPU page a reason to come back — the
 * figures on it are not static, and RSS is how a reader finds out without
 * checking manually.
 */
export default function PageFreshnessNote({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const feedHref = lang === 'zh' ? '/zh/feed.xml' : '/feed.xml';
  return (
    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
      <span>{c.text}</span>
      <span aria-hidden className="text-slate-700">·</span>
      <span>{c.updated} {dataLastUpdated}</span>
      <span aria-hidden className="text-slate-700">·</span>
      <a
        href={feedHref}
        className="inline-flex items-center gap-1 min-h-[24px] text-violet-400 hover:text-violet-300 transition-colors"
      >
        <Rss size={11} /> RSS → {feedHref}
      </a>
    </p>
  );
}
