'use client';

import { useLanguage } from '@/lib/i18n/context';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical } from '@/lib/seo';
import { localizeHref } from '@/lib/i18n/routing';
import type { ToolContent } from '@/lib/data/tool-content';

/**
 * Prose + FAQ below a tool, with the schema that goes with it.
 *
 * The tool pages carried a single `h1` and no body text at all — nothing for a
 * search engine to rank on terms like "LLM VRAM calculator", and nothing for a
 * first-time reader to calibrate the widget against. The FAQ is rendered
 * visibly on purpose: Google requires FAQPage markup to correspond to content
 * the reader can actually see.
 */
export default function ToolExplainer({
  content,
  toolName,
  path,
}: {
  content: ToolContent;
  toolName: string;
  /** English path, e.g. `/tools/vram-calc/`. Localized for the schema below. */
  path: string;
}) {
  const { lang } = useLanguage();
  const url = canonical(localizeHref(path, lang));

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: toolName,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any (web)',
            url,
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            description: content.summary[lang],
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
            mainEntity: content.faqs.map(f => ({
              '@type': 'Question',
              name: f.q[lang],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lang] },
            })),
          },
        ]}
      />

      <div className="mt-12 space-y-8">
        {content.sections.map(section => (
          <section key={section.heading.en} className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-3">{section.heading[lang]}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              <Rich text={section.body[lang]} />
            </p>
          </section>
        ))}

        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">
            {lang === 'zh' ? '常见问题' : 'Common questions'}
          </h2>
          <dl className="space-y-4">
            {content.faqs.map(faq => (
              <div key={faq.q.en} className="border-t border-white/[0.05] pt-4 first:border-0 first:pt-0">
                <dt className="text-sm font-semibold text-slate-200 mb-1.5">{faq.q[lang]}</dt>
                <dd className="text-sm text-slate-400 leading-relaxed">
                  <Rich text={faq.a[lang]} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}

/** Minimal inline formatting: `code` and **bold**, which the copy uses throughout. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="font-mono text-xs text-cyan-300 bg-white/[0.04] rounded px-1 py-0.5">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
