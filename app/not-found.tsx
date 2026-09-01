import type { Metadata } from 'next';
import NotFoundContent from '@/components/layout/NotFoundContent';

/**
 * A server component so it can carry its own metadata. Inheriting the root
 * layout's made every 404 claim the homepage's title and, worse, a canonical
 * pointing at `/` — telling crawlers that a missing page *is* the homepage.
 * `alternates: {}` clears the inherited canonical rather than self-referencing
 * a URL that does not exist.
 */
export const metadata: Metadata = {
  title: 'Page not found | quantized.uk',
  description: 'This page does not exist. Browse the model index, tools, or deployment guides instead.',
  alternates: {},
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}
