import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import QuestionPage from '@/components/tools/QuestionPage';

export const metadata: Metadata = pageMetadata({
  title: 'How Much Context Fits on Your GPU | quantized.uk',
  description: 'The longest context each recommended model keeps comfortably on common GPUs and Macs, with the default fp16 KV cache and with it quantized to q8_0 or q4_0.',
  path: '/tools/context-length',
});

export default function Page() {
  return <QuestionPage kind="context" />;
}
