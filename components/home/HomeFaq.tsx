'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { faqGroups, homeFaqIds } from '@/lib/utils/faq';

/**
 * Four of the site's questions, on the page most people land on.
 *
 * Deliberately **no `FAQPage` schema here** — `/faq/` carries it for all 24.
 * Emitting the same four questions as structured data at two URLs asks a search
 * engine to decide which page owns them, which is a duplicate-entity problem
 * rather than double coverage. This block is visible content and a link.
 */
export default function HomeFaq() {
  const { t, lang } = useLanguage();
  const all = faqGroups().flatMap(g => g.items);
  const ids = homeFaqIds();
  const picked = ids.map(id => all.find(i => i.id === id)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="section-title text-lg flex items-center gap-2">
          <HelpCircle size={16} className="text-cyan-400" />
          {t.faq.homeTitle}
        </h2>
        <Link
          href="/faq/"
          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 py-2.5 -my-2.5 min-h-[44px]"
        >
          {t.faq.homeAll.replace('{n}', String(all.length))} <ArrowRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {picked.map((item, i) => (
          <details key={item.id} open={i === 0} className="group py-3 first:pt-0">
            <summary className="cursor-pointer list-none min-h-[44px] flex items-start gap-2">
              <span className="text-violet-400 mt-0.5 transition-transform group-open:rotate-90" aria-hidden="true">
                &rsaquo;
              </span>
              <h3 className="text-sm font-semibold text-slate-200">{item.q[lang]}</h3>
            </summary>
            <p className="pl-5 pt-2 text-sm text-slate-400 leading-relaxed">{item.a[lang]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
