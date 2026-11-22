import type { CacheStorage, PagesFunction, Request as PagesRequest, Response as PagesResponse } from '@cloudflare/workers-types';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import wasm from '@resvg/resvg-wasm/index_bg.wasm';
import font from '@/lib/og/vram-font.bin';
import { vramImageUrl, vramPreview } from '@/lib/og/vram-result';
import { vramSvg } from '@/lib/og/vram-svg';

declare const caches: CacheStorage;
declare const Request: typeof PagesRequest;
declare const Response: typeof PagesResponse;

const imageHeaders = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' };
let rendererReady: Promise<void> | undefined;

const renderImage: PagesFunction = async ({ request, waitUntil }) => {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const preview = vramPreview(url.searchParams, lang);
  if (!preview) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (request.method === 'HEAD') return new Response(null, { headers: imageHeaders });

  const cacheKey = new Request(vramImageUrl(url, lang).href);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;
  await (rendererReady ??= initWasm(wasm));
  const svg = new Resvg(vramSvg(preview), {
    font: { fontBuffers: [new Uint8Array(font)], loadSystemFonts: false, defaultFontFamily: 'Noto Sans SC' },
  });
  try {
    const png = svg.render();
    try {
      const response = new Response(png.asPng(), { headers: imageHeaders });
      waitUntil(caches.default.put(cacheKey, response.clone()).catch(() => {}));
      return response;
    } finally {
      png.free();
    }
  } finally {
    svg.free();
  }
};

export const onRequestGet = renderImage;
export const onRequestHead = renderImage;
