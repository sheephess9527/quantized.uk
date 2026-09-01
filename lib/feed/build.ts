import { models } from '@/lib/data/models';
import { changelog, dataLastUpdated } from '@/lib/data/meta';
import { SITE_URL } from '@/lib/seo';
import { isRecentModel } from '@/lib/utils/model-meta';
import type { Lang } from '@/lib/i18n/translations';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CHANNEL = {
  en: {
    title: 'quantized.uk — updates',
    description: 'New models, data cadence, and site updates for LLM quantization intelligence.',
    language: 'en',
    modelPrefix: 'Model: ',
    base: '',
  },
  zh: {
    title: 'quantized.uk — 更新',
    description: 'LLM 量化情报：新模型、数据节奏与站点更新。',
    language: 'zh-Hans',
    modelPrefix: '模型：',
    base: '/zh',
  },
} as const;

/**
 * One builder for both trees. The Chinese edition is a full static mirror, so a
 * reader who subscribes from `/zh/` should get Chinese entries pointing at
 * Chinese URLs — an English-only feed quietly sends them back across the
 * language boundary the rest of the site works to preserve.
 */
export function buildFeed(lang: Lang): string {
  const c = CHANNEL[lang];
  const selfPath = `${c.base}/feed.xml`;
  const recentModels = models.filter(m => isRecentModel(m) || m.addedAt);
  const items: string[] = [];

  for (const entry of changelog.slice(0, 12)) {
    const text = entry[lang];
    items.push(`
    <item>
      <title>${escapeXml(text)}</title>
      <link>${SITE_URL}${c.base}/#changelog</link>
      <guid isPermaLink="false">changelog-${lang}-${entry.date}-${escapeXml(entry.en.slice(0, 40))}</guid>
      <pubDate>${new Date(entry.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(text)}</description>
    </item>`);
  }

  for (const m of recentModels.slice(0, 20)) {
    const date = m.addedAt ?? dataLastUpdated;
    const url = `${SITE_URL}${c.base}/quant-hub/${m.id}/`;
    items.push(`
    <item>
      <title>${escapeXml(`${c.modelPrefix}${m.name}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(m.description[lang])}</description>
    </item>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${c.title}</title>
    <link>${SITE_URL}${c.base}/</link>
    <description>${escapeXml(c.description)}</description>
    <language>${c.language}</language>
    <lastBuildDate>${new Date(dataLastUpdated + 'T12:00:00Z').toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}${selfPath}" rel="self" type="application/rss+xml"/>
    ${items.join('\n')}
  </channel>
</rss>`;
}

export function feedResponse(lang: Lang): Response {
  return new Response(buildFeed(lang), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
