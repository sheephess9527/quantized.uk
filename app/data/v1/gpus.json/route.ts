import { gpusExport } from '@/lib/utils/data-export';

export const dynamic = 'force-static';

/** Public JSON of the index — see `lib/utils/data-export.ts` for what is in it and why. */
export function GET() {
  return new Response(JSON.stringify(gpusExport(), null, 1), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
