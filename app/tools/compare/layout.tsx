import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Model Comparison | quantized.uk',
  description: 'Side-by-side comparison of quantized LLMs — VRAM, speed, quality, and GPU fit.',
  openGraph: { title: 'LLM Model Compare Tool | quantized.uk' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}