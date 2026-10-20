import type { Metadata } from 'next';
import PendingView from '@/components/pending/PendingView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'New models not runnable locally yet | quantized.uk',
  description:
    'Open models announced or released that cannot run locally yet — no weights, no llama.cpp support or no checked files — with the reason and what would change it.',
  path: '/pending/',
});

export default function PendingPage() {
  return <PendingView />;
}
