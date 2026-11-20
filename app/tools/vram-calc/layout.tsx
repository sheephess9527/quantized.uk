import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Local LLM VRAM Calculator: Which Model Fits Your GPU',
  description:
    'LLM VRAM / RAM calculator: any model or Hugging Face repo, mixed GPUs, speed, time to first token, serving capacity and QLoRA/LoRA fine-tuning memory.',
  path: '/tools/vram-calc',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}