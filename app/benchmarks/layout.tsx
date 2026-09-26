import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'LLM benchmarks: measured tok/s and VRAM | quantized.uk',
  // The old copy named the RTX 4060 Ti as measured — its three rows were
  // removed once the roofline check showed they exceeded the card's real
  // bandwidth (see CLAUDE.md), and nothing has re-measured it since. Naming
  // only the cards this page actually has runs for.
  description:
    'Throughput and perplexity measured on RTX 4090, RTX 3090, M3 Max and M2 Ultra — plus what is estimated instead, and the full test method.',
  path: '/benchmarks',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}