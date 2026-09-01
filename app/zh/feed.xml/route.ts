import { feedResponse } from '@/lib/feed/build';

export const dynamic = 'force-static';

export function GET() {
  return feedResponse('zh');
}
