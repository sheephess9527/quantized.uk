import type { HTMLRewriter as PagesRewriter, PagesFunction, Response as PagesResponse } from '@cloudflare/workers-types';
import { VRAM_IMAGE_SIZE, vramImageUrl, vramPreview } from './vram-result';
import { VRAM_SHARE_PARAM } from '@/lib/utils/vram-link';

declare const HTMLRewriter: typeof PagesRewriter;
declare const Response: typeof PagesResponse;

export function vramPage(lang: 'en' | 'zh'): PagesFunction {
  return async context => {
    const url = new URL(context.request.url);
    if (url.searchParams.get(VRAM_SHARE_PARAM) !== '1') return context.next();
    const card = vramPreview(url.searchParams, lang);
    if (!card) return context.next();

    const page = await context.env.ASSETS.fetch(new URL(url.pathname, url.origin));
    if (!page.ok || !page.headers.get('Content-Type')?.includes('text/html')) return context.next();
    const image = vramImageUrl(url, lang).href;
    const description = [card.details, card.answer, card.hardware].filter(Boolean).join(' — ');
    const title = `${card.title} · ${card.eyebrow} | quantized.uk`;
    const rewriter = new HTMLRewriter();
    const set = (selector: string, content: string) =>
      rewriter.on(selector, { element(el) { el.setAttribute('content', content); } });
    set('meta[property="og:url"]', url.href);
    for (const [kind, attribute] of [['og', 'property'], ['twitter', 'name']]) {
      for (const [key, content] of Object.entries({
        title,
        description,
        image,
        'image:alt': `${card.title} — ${description}`,
        'image:width': String(VRAM_IMAGE_SIZE.width),
        'image:height': String(VRAM_IMAGE_SIZE.height),
      })) set(`meta[${attribute}="${kind}:${key}"]`, content);
    }
    const response = new Response(page.body, page);
    response.headers.delete('ETag');
    response.headers.delete('Last-Modified');
    response.headers.delete('Content-Length');
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, follow');
    return rewriter.transform(response);
  };
}
