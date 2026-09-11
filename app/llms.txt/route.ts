import { models } from '@/lib/data/models';
import { gpuDatabase } from '@/lib/data/gpus';
import { articles } from '@/lib/data/cookbook';
import { formatPairs } from '@/lib/utils/format-compare';
import { dataLastUpdated } from '@/lib/data/meta';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * Was `public/llms.txt`, a hand-maintained file that advertised "79+ models"
 * while the index held 81 — the same drift as the six metadata strings, on the
 * one file whose entire audience is machines reading the site's own claims
 * about itself. Generated from the data now, like `feed.xml`.
 */
export function GET() {
  const body = `# quantized.uk

> LLM quantization intelligence for developers running models on consumer hardware.
> Data last updated ${dataLastUpdated}.

## What this site is

- Static reference site (no model hosting, no accounts)
- ${models.length} quantized LLM index with per-quant VRAM, speed and quality metadata
- ${gpuDatabase.length} GPUs, each with a page listing what fits it at 4K context
- ${formatPairs.length} quantization-format comparison pages
- ${articles.length} deployment cookbook guides (llama.cpp, Ollama, vLLM, Docker, WSL2)
- Real-hardware benchmarks (RTX 4090/3090, Apple Silicon)
- Full Chinese edition at /zh/ (same content, hreflang-paired)

## How the numbers are produced

- VRAM figures are **calculated**, not measured: model weights at the level's
  bits-per-weight, plus KV cache for the stated context, plus a 10% activation
  buffer. The green verdict stops at 88% of the card, not 100%.
- Models whose layers do not all cache attention the same way (hybrid linear
  attention, sliding-window) carry an explicit attention shape, so their KV
  cache is not sized as though every layer cached the full context.
- Per-quant perplexity loss is shown only where someone published one. A model
  without a published figure shows a dash, never an estimate dressed as a
  measurement.
- Speed figures come from this site's own benchmark runs and name the hardware
  and framework version they were produced on.

## Key URLs

- Home: ${SITE_URL}/ (Chinese: ${SITE_URL}/zh/)
- Model index: ${SITE_URL}/quant-hub/
- GPU index: ${SITE_URL}/gpu/
- Tools: ${SITE_URL}/tools/
- VRAM calculator: ${SITE_URL}/tools/vram-calc/
- Format comparisons: ${SITE_URL}/formats/
- Cookbook: ${SITE_URL}/cookbook/
- Benchmarks: ${SITE_URL}/benchmarks/
- Data changelog: ${SITE_URL}/changelog/
- About: ${SITE_URL}/about/
- Sitemap: ${SITE_URL}/sitemap.xml
- Feed: ${SITE_URL}/feed.xml

## Languages

- English at the root: ${SITE_URL}/
- Chinese (Simplified) under /zh/: ${SITE_URL}/zh/
- Language is carried by the URL, not a cookie or toggle state. Every page has a
  hreflang-paired mirror in the other tree, and both are prerendered — the
  Chinese text is in the HTML, not swapped in by JavaScript.

## Contact

No public source repository link on the site. Feedback: hello@quantized.uk.
See /about/ for maintenance and update policy.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
