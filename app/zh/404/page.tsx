import type { Metadata } from 'next';
import NotFoundContent from '@/components/layout/NotFoundContent';
import { models } from '@/lib/data/models';
import { articles } from '@/lib/data/cookbook';

/**
 * Chinese 404 page (`/zh/404/`).
 *
 * Next.js static export only generates a root `out/404.html` from `app/not-found.tsx`
 * (which prerenders in English because `usePathname()` is not under `/zh`). When a
 * reader visits a missing `/zh/...` URL, serving the English `out/404.html` causes a
 * React hydration text mismatch (#425/#418/#423) as soon as the client reads the
 * `/zh/...` pathname.
 *
 * Prerendering this route under `/zh/404/` gives `usePathname()` a `/zh` prefix at
 * build time so the entire page (Navbar, NotFoundContent, Footer) renders in Chinese,
 * and `scripts/localize-export.mjs` copies `out/zh/404/index.html` to `out/zh/404.html`
 * for Cloudflare Pages' nearest-directory `404.html` lookup.
 */
export const metadata: Metadata = {
  title: '页面未找到 | quantized.uk',
  description: '该页面不存在。请浏览量化模型库、显存计算器或实战部署指南。',
  alternates: {},
  robots: { index: false, follow: true },
};

export default function ZhNotFoundPage() {
  return <NotFoundContent counts={{ models: models.length, guides: articles.length }} />;
}
