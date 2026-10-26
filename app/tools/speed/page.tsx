import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import QuestionPage from '@/components/tools/QuestionPage';

export const metadata: Metadata = pageMetadata({
  title: 'LLM Speed on Your GPU: Tokens per Second | quantized.uk',
  description: 'Tokens per second on the most common GPUs and Macs: an estimate scaled from each card\'s own measured llama.cpp run, plus the bound its memory bandwidth sets.',
  path: '/tools/speed',
});

export default function Page() {
  return <QuestionPage kind="speed" />;
}
