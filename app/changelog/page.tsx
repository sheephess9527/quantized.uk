import type { Metadata } from 'next';
import ChangelogView from '@/components/changelog/ChangelogView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Data changelog — what changed, and when | quantized.uk',
  description:
    'Every correction and addition to the model index, GPU list and guides, newest first — including the figures that were wrong and what they are now.',
  path: '/changelog/',
});

export default function ChangelogPage() {
  return <ChangelogView />;
}
