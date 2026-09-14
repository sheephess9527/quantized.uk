import { SITE_URL, SITE_NAME, FEEDBACK_EMAIL } from '@/lib/seo';
import { changelog } from '@/lib/data/meta';

/**
 * QTZ-034: derived, not typed — the earliest recorded changelog entry, to
 * month precision (the day itself is a record-keeping artifact, not a claim
 * about when the site actually started). Grows correctly if an older entry
 * is ever backfilled; never needs a manual bump.
 */
const FOUNDING_MONTH = changelog.reduce((min, c) => (c.date < min ? c.date : min), changelog[0].date).slice(0, 7);

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
          alternateName: 'Quantized',
          url: SITE_URL,
          // QTZ-034: `founder` and `sameAs` are deliberately absent, not
          // empty placeholders. /about/ describes an intentionally unnamed
          // indie maintainer — no real Person name exists to cite, and this
          // site's own stated privacy posture is no public source repo, so
          // there is no real GitHub/HF/X account to point `sameAs` at
          // either. A schema entity is not more credible for citing an
          // identity that does not exist; omitting the field is the honest
          // choice the audit's own instructions call for ("do not fill in
          // URLs that don't exist").
          description:
            'An independent, hand-maintained reference for running quantized open-weight LLMs on local hardware — per-quant VRAM, measured throughput, and deployment guides.',
          foundingDate: FOUNDING_MONTH,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
          contactPoint: {
            '@type': 'ContactPoint',
            email: FEEDBACK_EMAIL,
            contactType: 'editorial corrections',
            availableLanguage: ['en', 'zh-Hans'],
          },
          knowsAbout: [
            'LLM quantization', 'GGUF', 'MXFP4', 'AWQ', 'EXL2', 'GPTQ',
            'llama.cpp', 'vLLM', 'Ollama', 'ExLlamaV2',
            'local LLM inference', 'GPU VRAM requirements', 'Apple Silicon inference',
          ],
        },
      ]}
    />
  );
}