import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import QuestionPage from '@/components/tools/QuestionPage';

export const metadata: Metadata = pageMetadata({
  title: 'Which LLM Quant to Download for Your GPU | quantized.uk',
  description: 'Q4, Q5 or Q8? Every quant level of the models that fit the most common GPUs and Macs, sized at 4K context, with the highest-quality level that fits comfortably.',
  path: '/tools/which-quant',
});

export default function Page() {
  return <QuestionPage kind="quant" lang="en" />;
}
