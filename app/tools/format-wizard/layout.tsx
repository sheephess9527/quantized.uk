import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Format Selection Wizard | quantized.uk',
  description: 'Not sure which quant format to pick? Answer 3 questions and get a personalised GGUF, AWQ, or EXL2 recommendation.',
  openGraph: { title: 'Quant Format Wizard | quantized.uk' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}