import type { Metadata } from 'next';
import FaqView from '@/components/faq/FaqView';
import { JsonLd } from '@/components/seo/JsonLd';
import { models } from '@/lib/data/models';
import { faqGroups } from '@/lib/utils/faq';
import { canonical, defaultRobots, feedAlternates, languageAlternates, ogLocale, OG_IMAGE, SITE_NAME } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const path = '/faq';
  const url = canonical(path);
  const title = 'Local LLM FAQ: VRAM and quantization | quantized.uk';
  const description = `Before downloading a 20GB model: how much VRAM you need, what Q4 costs in quality, and which format your runtime reads — computed from ${models.length} models.`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path), ...feedAlternates(path) },
    robots: defaultRobots,
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', images: [OG_IMAGE], ...ogLocale(path) },
  };
}

/**
 * `FAQPage` lives here and **only** here. The homepage shows four of the same
 * questions as a visible block with no schema of its own — emitting them twice
 * would put one question at two URLs, which is the duplicate-entity problem
 * rather than extra coverage.
 */
export default function FaqPage({ lang = 'en' }: { lang?: 'en' | 'zh' }) {
  const groups = faqGroups();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
          url: canonical(lang === 'zh' ? '/zh/faq' : '/faq'),
          mainEntity: groups.flatMap(g =>
            g.items.map(item => ({
              '@type': 'Question',
              name: item.q[lang],
              acceptedAnswer: { '@type': 'Answer', text: item.a[lang] },
            })),
          ),
        }}
      />
      <FaqView />
    </>
  );
}
