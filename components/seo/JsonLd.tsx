import { SITE_URL, SITE_NAME } from '@/lib/seo';

interface Props {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteJsonLd() {
  return (
    <JsonLd
      data={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description:
            'LLM quantization reference — VRAM calculator, quantized model hub, benchmarks, and deployment cookbook.',
          inLanguage: ['en', 'zh-Hans'],
          // The Hub's own `?q=` filter is a real search endpoint, so this is a
          // claim the site can actually honour rather than boilerplate.
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/quant-hub/?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
        },
      ]}
    />
  );
}