import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VRAM / RAM Calculator | quantized.uk',
  description: 'Calculate LLM memory requirements for any model, quant format, and context length. Forward and reverse GPU lookup with shareable URLs.',
  openGraph: { title: 'VRAM Calculator for LLMs | quantized.uk' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}