'use client';

import { useLanguage } from '@/lib/i18n/context';
import type { QuantModel } from '@/lib/data/types';
import { modelExplainer } from '@/lib/utils/model-explainer';

/**
 * Renders the derived prose and FAQ for a model page. The same content is
 * emitted as `FAQPage` schema by the route, so the questions a crawler sees are
 * the ones a reader sees — the rule the audit flagged for structured data.
 */
export default function ModelExplainer({ model }: { model: QuantModel }) {
  const { t, lang } = useLanguage();
  const { sections, faqs } = modelExplainer(model);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-4">
      {sections.map((s, i) => (
        <section key={i} className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-2">{s.heading[lang]}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{s.body[lang]}</p>
        </section>
      ))}

      <section className="glass rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">{t.hub.model.faqTitle}</h2>
        <dl className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i}>
              <dt className="text-sm font-semibold text-slate-200">{f.q[lang]}</dt>
              <dd className="text-sm text-slate-400 leading-relaxed mt-1">{f.a[lang]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
