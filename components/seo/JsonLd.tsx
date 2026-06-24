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
          inLanguage: ['en', 'zh'],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      ]}
    />
  );
}