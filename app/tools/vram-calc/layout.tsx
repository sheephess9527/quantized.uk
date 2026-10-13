import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'VRAM / RAM Calculator for LLMs | quantized.uk',
  description:
    'LLM VRAM calculator: any model or Hugging Face repo, mixed GPUs, speed, time to first token, serving capacity and QLoRA/LoRA fine-tuning memory.',
  path: '/tools/vram-calc',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}