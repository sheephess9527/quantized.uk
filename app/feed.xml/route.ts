import { models } from '@/lib/data/models';
import { changelog, dataLastUpdated } from '@/lib/data/meta';
import { SITE_URL } from '@/lib/seo';
import { isRecentModel } from '@/lib/utils/model-meta';

export const dynamic = 'force-static';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function GET() {
  const recentModels = models.filter(m => isRecentModel(m) || m.addedAt);
  const items: string[] = [];

  for (const entry of changelog.slice(0, 12)) {
    items.push(`
    <item>
      <title>${escapeXml(entry.en)}</title>
      <link>${SITE_URL}/#changelog</link>
      <guid isPermaLink="false">changelog-${entry.date}-${escapeXml(entry.en.slice(0, 40))}</guid>
      <pubDate>${new Date(entry.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(entry.en)}</description>
    </item>`);
  }

  for (const m of recentModels.slice(0, 20)) {
    const date = m.addedAt ?? dataLastUpdated;
    items.push(`
    <item>
      <title>${escapeXml(`Model: ${m.name}`)}</title>
      <link>${SITE_URL}/quant-hub/${m.id}/</link>
      <guid isPermaLink="true">${SITE_URL}/quant-hub/${m.id}/</guid>
      <pubDate>${new Date(date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(m.description.en)}</description>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>quantized.uk — updates</title>
    <link>${SITE_URL}/</link>
    <description>New models, data cadence, and site updates for LLM quantization intelligence.</description>
    <language>en</language>
    <lastBuildDate>${new Date(dataLastUpdated + 'T12:00:00Z').toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
