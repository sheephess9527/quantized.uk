import { feedResponse } from '@/lib/feed/build';

export const dynamic = 'force-static';

/**
 * `/rss.xml` is the alias readers and feed readers guess first. A static export
 * cannot issue a redirect, so this serves the same document; the channel's
 * atom:self link still names /feed.xml as the canonical location.
 */
export function GET() {
  return feedResponse('en');
}
