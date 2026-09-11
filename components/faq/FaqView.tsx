'use client';

import Link from '@/components/i18n/LocalLink';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { faqGroups } from '@/lib/utils/faq';

/**
 * Every answer is rendered from the index (`lib/utils/faq.ts`), so the FAQ
 * cannot drift from the calculator — which is exactly how the cookbook guides
 * ended up telling readers a 14B "needs 36GB+" when it needs 11.0.
 *
 * `<details>` rather than a JS accordion: the answers are then in the exported
 * HTML and readable with the bundle blocked, which is the point of writing
 * them. The first item of each group opens by default.
 */
export default function FaqView() {
  const { t, lang } = useLanguage();
  const f = t.faq;
  const groups = faqGroups();

  const fill = (s: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Breadcrumbs items={[{ label: t.nav.home, href: '/' }, { label: f.title }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{f.title}</h1>
        <p className="text-slate-400 leading-relaxed">
          {fill(f.intro, { models: models.length, gpus: gpuDatabase.length })}
        </p>
      </div>

      <div className="space-y-6">
        {groups.map(group => (
          <section key={group.id} id={group.id} className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-3">{group.heading[lang]}</h2>
            <div className="divide-y divide-white/[0.05]">
              {group.items.map((item, i) => (
                <details key={item.id} id={item.id} open={i === 0} className="group py-3 first:pt-0">
                  <summary className="cursor-pointer list-none min-h-[44px] flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5 transition-transform group-open:rotate-90" aria-hidden="true">
                      &rsaquo;
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">{item.q[lang]}</h3>
                  </summary>
                  <div className="pl-5 pt-2">
                    <p className="text-sm text-slate-400 leading-relaxed">{item.a[lang]}</p>
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-violet-400 hover:text-violet-300"
                    >
                      {item.link.label[lang]} <ArrowRight size={14} />
                    </Link>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
