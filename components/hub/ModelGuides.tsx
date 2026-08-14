'use client';

import Link from '@/components/i18n/LocalLink';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type { GuideLink } from '@/lib/utils/model-guides';

/**
 * "You found the model — here's how to actually run it."
 * Completes the home → detail → calculator → guide path in the hub direction.
 */
export default function ModelGuides({ guides }: { guides: GuideLink[] }) {
  const { t, lang } = useLanguage();
  const g = t.hub.guides;

  if (guides.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 sm:p-6 mt-6">
      <h2 className="section-title text-base flex items-center gap-2 mb-1">
        <BookOpen size={15} className="text-orange-400" />
        {g.title}
      </h2>
      <p className="section-subtitle text-xs mb-4">{g.subtitle}</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {guides.map(guide => (
          <li key={guide.id}>
            <Link
              href={`/cookbook/${guide.id}/`}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-orange-500/25 hover:bg-orange-500/[0.04] transition-all group h-full"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-slate-200 font-medium">
                  {lang === 'zh' ? guide.titleZh : guide.title}
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={10} /> {guide.readTime} min
                  </span>
                  <span>·</span>
                  <span>{g.difficulty[guide.difficulty as keyof typeof g.difficulty] ?? guide.difficulty}</span>
                  {guide.exact && (
                    <>
                      <span>·</span>
                      <span className="text-orange-400/90">{g.coversThis}</span>
                    </>
                  )}
                </span>
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-orange-400 shrink-0 mt-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
