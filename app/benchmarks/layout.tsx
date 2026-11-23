import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  // 5.3k Google impressions at position ~6 and no clicks under the old
  // "LLM benchmarks: measured tok/s and VRAM" title (Search Console 2026-10-29
  // to 11-21): name the cards and the runtimes searchers compare.
  title: 'Local LLM speed tests: tok/s on RTX 4090, 3090 and Mac',
  // The old copy named the RTX 4060 Ti as measured — its three rows were
  // removed once the roofline check showed they exceeded the card's real
  // bandwidth (see CLAUDE.md), and nothing has re-measured it since. Naming
  // only the cards this page actually has runs for.
  description:
    'Measured tokens/s, VRAM and perplexity for Llama 3.1 8B, Qwen3 and more with llama.cpp, Ollama, ExLlamaV2 and vLLM on RTX 4090, 3090, M3 Max and M2 Ultra.',
  path: '/benchmarks',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}