# 2026-11-26 — Site optimization round 2: server-rendered content routes, Chinese 404 hydration fix, cookbook search & data caching

## 1. Context & Baseline

Following the 2026-11-25 bundle reduction and static-asset optimization pass (`docs/changes/2026-11-25-site-optimization.md`) and the 2026-11-26 search-intent pass (`docs/changes/2026-11-26-search-intent.md`), several high-traffic content and reference surfaces were still marked `'use client'` only because they called `useLanguage()`, shipping the full model/GPU/guide datasets into client JavaScript bundles across hundreds of static pages. In addition, three handoff items from the November 25 audit remained open:

1. **Chinese 404 React Hydration Error (`#425 / #418 / #423`)**: Cloudflare Pages serves `out/zh/404.html` for missing `/zh/**` URLs if present, and falls back to `out/404.html` (prerendered at `/_not-found` with English pathname → English text, then hydrated at `/zh/...` → Chinese text mismatch).
2. **Remaining raw `gpu.name` usages**: 19 reader-facing components, pages and prose generators still displayed `gpu.name` directly instead of `gpuDisplayName(gpu, lang)`, leaving English `(mod)` labels on Chinese pages for the modified RTX 4090 48G and RTX 2080 Ti 22G rows.
3. **Cookbook search & filter accessibility**: `/cookbook/` and `/zh/cookbook/` had 28 guides and category filter pills without `aria-pressed` or keyword search, and shipped all 28 full article bodies in the index page's client bundle.

---

## 2. Changes Made

### A. Server Component conversion across content, guide, format, error and quick-answer routes

Converted read-only content components from `'use client'` to Server Components accepting explicit `lang: Lang`:

- **Model detail pages (`/quant-hub/[modelId]` & `/zh/quant-hub/[modelId]`, 328 pages)**:
  - Converted `components/hub/ModelDetail.tsx`, `components/hub/MacModelSetup.tsx`, `components/hub/ModelExplainer.tsx`, `components/hub/ModelPlacement.tsx`, `components/hub/ModelGuides.tsx`, `components/hub/SimilarModels.tsx`, and `components/reports/RelatedReports.tsx` to Server Components; updated `app/quant-hub/[modelId]/page.tsx` to pass `lang` to all children.
  - Only tiny interactive leaves (`CopyButton`, `ModelCardBadge`, `QuantFileLine`, `Breadcrumbs`, `RerankerLink`) remain client components.
- **Cookbook index & 28 guide pages (`/cookbook`, `/cookbook/[slug]` & `/zh/**` mirrors, 58 pages)**:
  - Created `components/cookbook/CookbookIndexContent.tsx` as a lightweight client island receiving pre-mapped `CookbookCardSummary[]` props (title, description, category, difficulty, readTime, tags, verified badge text) instead of full multi-section article bodies, and converted `app/cookbook/page.tsx` to a Server Component.
  - Converted `components/cookbook/ArticleView.tsx`, `components/cookbook/GuideReferences.tsx`, `components/cookbook/GuideNextSteps.tsx`, and `components/cookbook/RelatedArticles.tsx` to Server Components taking `lang`.
  - Slimmed `components/cookbook/ArticleToc.tsx` to accept lightweight `{ heading: string; headingZh: string }[]` section headings.
- **Format pages (`/formats/[slug]` & `/zh/formats/[slug]`, 30 pages)**:
  - Converted `components/formats/FormatSingleContent.tsx` and `components/formats/FormatCompareContent.tsx` to Server Components taking `lang`; updated `app/formats/[slug]/page.tsx`.
- **Error lookup index & detail pages (`/errors`, `/errors/[id]` & `/zh/**` mirrors, 42 pages)**:
  - Converted `ErrorIndexView` and `ErrorDetailView` in `components/errors/ErrorViews.tsx` to Server Components taking `lang`; updated `app/errors/page.tsx`, `app/zh/errors/page.tsx`, `app/errors/[id]/page.tsx`, and `app/zh/errors/[id]/page.tsx`.
- **Quick-answer tool pages (`/tools/speed`, `/tools/which-quant`, `/tools/context-length` & `/zh/**` mirrors, 6 pages)**:
  - Converted `components/tools/QuestionPage.tsx` to a Server Component taking `lang` and updated `components/tools/ToolExplainer.tsx` to accept optional `lang`; updated all 6 route files.
- **Best-by-VRAM tier pages (`/best/[tier]` & `/zh/best/[tier]`, 10 pages)**:
  - Converted `components/best/BestTierContent.tsx` to a Server Component taking `lang`; only the collapsed `GpuUpgradeComparison` disclosure remains a client island.
- **Benchmarks pages (`/benchmarks` & `/zh/benchmarks`, 2 pages)**:
  - Created `components/benchmarks/BenchmarksView.tsx` as a Server Component, converted `components/benchmarks/BenchDataTables.tsx`, `components/benchmarks/CoverageSection.tsx`, and `components/benchmarks/RunStandard.tsx` to Server Components taking `lang` (while keeping `MeasuredMatrixSection` and `BenchCharts` as client islands), and updated `app/benchmarks/page.tsx` and `app/zh/benchmarks/page.tsx`.
- **DataFreshness strip**:
  - Converted `components/home/DataFreshness.tsx` to a Server Component taking optional `lang`; updated `components/home/HomeContent.tsx` and `components/hub/QuantHubContent.tsx`.

#### First Load JS impact (Next.js production build report)

| Route group | Pages (EN + ZH) | Before First Load JS | After First Load JS | Reduction |
|---|---:|---:|---:|---:|
| `/cookbook/[slug]` | 56 | 256 kB | **177 kB** | **−79 kB (−30.9%)** |
| `/cookbook` | 2 | 250 kB | **176 kB** | **−74 kB (−29.6%)** |
| `/formats/[slug]` | 30 | 257 kB | **167 kB** | **−90 kB (−35.0%)** |
| `/errors` & `/errors/[id]` | 42 | 250 kB | **167 kB** | **−83 kB (−33.2%)** |
| `/tools/speed`, `/tools/which-quant`, `/tools/context-length` | 6 | 248 kB | **168 kB** | **−80 kB (−32.3%)** |
| `/best/[tier]` | 10 | 265 kB | **258 kB** | **−7 kB** (server-rendered table + FAQ) |
| `/benchmarks` | 2 | 390 kB | **283 kB** | **−107 kB (−27.4%)** |
| `/quant-hub/[modelId]` | 328 | 264 kB | **263 kB** | Server-rendered `ModelDetail` + 6 subviews (no hydration tree for content sections) |

### B. Fixed `/zh/**` 404 React Hydration Error (`out/zh/404.html`)

- Added `app/zh/404/page.tsx` rendering `<NotFoundView />` under a `/zh/` pathname with `robots: { index: false, follow: false }`. Because `LanguageProvider` derives `lang` from `usePathname()`, prerendering at `/zh/404/` produces Chinese server HTML matching client hydration on any `/zh/**` URL.
- Updated `scripts/localize-export.mjs` to:
  1. Copy `out/zh/404/index.html` (after `<html lang="zh-Hans">` and JSON-LD patching) to `out/zh/404.html`, which Cloudflare Pages automatically serves for missing `/zh/*` paths.
  2. Skip `zh/404` alongside `404` in the SEO meta-description/title/JSON-LD indexable-page checks.
  3. Assert that `out/zh/404.html` exists and contains both `lang="zh-Hans"` and `<h1>页面未找到</h1>`.

### C. Site-wide `gpuDisplayName(gpu, lang)` consistency & unified GPU `<optgroup>` pickers

- Replaced all remaining reader-facing `gpu.name` references with `gpuDisplayName(gpu, lang)` across 19 files:
  - Components: `components/hub/GpuQuickChips.tsx` (also added `aria-pressed`), `components/hub/ModelPlacement.tsx`, `components/hub/QuantHubContent.tsx`, `components/gpu/GpuUpgradeComparison.tsx`, `components/gpu/GpuPageContent.tsx`, `components/best/BestTierContent.tsx`, `components/cookbook/GuideReferences.tsx`, `components/cookbook/GuideNextSteps.tsx`, `components/tools/FormatWizard.tsx`, `components/tools/ModelCompare.tsx`, `components/tools/SpeedFeel.tsx`, `components/tools/VRAMCalculator.tsx`, `components/guides/LocalGuidePage.tsx`.
  - Pages & generators: `app/gpu/[gpuId]/page.tsx`, `app/quant-hub/[modelId]/page.tsx`, `app/quant-hub/[modelId]/[gpuId]/page.tsx`, `lib/utils/gpu-explainer.ts`, `lib/utils/compare.ts`, `lib/utils/hub-export.ts`.
- Unified duplicate local `GPU_GROUPS` definitions in `components/tools/VRAMCalculator.tsx` and the flat GPU `<select>`s in `components/tools/SpeedFeel.tsx` to import `GPU_GROUPS` and `rowsInGpuGroup` from `lib/data/gpus.ts`.

### D. Cookbook instant search & filter accessibility

- In `components/cookbook/CookbookIndexContent.tsx`:
  - Added an instant search input (filtering across localized title, description, tags, and verified stack) with a clear (`×`) button, live result count when filtered, and an empty-state reset button.
  - Added `aria-pressed={cat === c.key}` to all category filter buttons.
  - Added bilingual keys `searchPlaceholder`, `clearSearch`, `showingCount`, and `noMatch` under `cookbook` in `lib/i18n/translations.ts`.

### E. Edge `Cache-Control` headers for public JSON feeds, RSS, and `llms.txt`

- Updated `public/_headers` to add `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` on `/data/v1/models.json`, `/data/v1/gpus.json`, `/feed.xml`, `/zh/feed.xml`, `/llms.txt`, and `/zh/llms.txt`.

---

## 3. Verification

- `npm run typecheck` → passed (0 errors).
- `npm run lint` → passed (`✔ No ESLint warnings or errors`).
- `npm test` → all 18 data, recommendation, calculator, CLI, RSS, pair-page and llms.txt test suites passed.
- `npm run build` (`prebuild` + `next build` + `postbuild`) → passed:
  - 1,494 HTML files (747 Chinese pages patched, 0 link leaks, 0 `undefined` leaks, 1,394 structured-data entities verified, `out/zh/404.html` verified).
  - Total exported files: 3,814 (`out/` well under the 15,000-file gate).

---

## 4. Handoff notes

- **What is done**:
  - All read-only content views (`/quant-hub/[modelId]`, `/cookbook`, `/cookbook/[slug]`, `/formats/[slug]`, `/errors`, `/errors/[id]`, `/tools/speed`, `/tools/which-quant`, `/tools/context-length`, `/best/[tier]`, and static sections of `/benchmarks`) are now Server Components taking explicit `lang`.
  - `out/zh/404.html` is generated from `app/zh/404/page.tsx` and gated in `scripts/localize-export.mjs`, resolving the `/zh/**` 404 hydration mismatch.
  - `gpuDisplayName(gpu, lang)` is used across all reader-facing surfaces and prose helpers, and `GPU_GROUPS` / `rowsInGpuGroup` from `lib/data/gpus.ts` powers the hardware `<select>`s in `VRAMCalculator`, `SpeedFeel`, `HardwareProfileSelector`, and `HomeMatch`.
  - `/cookbook/` and `/zh/cookbook/` have instant keyword search and `aria-pressed` filter buttons.
  - `public/_headers` caches `/data/v1/*.json`, `/feed.xml`, `/zh/feed.xml`, `/llms.txt`, and `/zh/llms.txt` at the edge.
- **Traps / footguns to avoid**:
  1. **Never call a synchronous helper exported from a `'use client'` file inside a Server Component**: during RSC bundling, exports from a `'use client'` module become client reference proxies (`TypeError: w is not a function` during static prerendering). Keep pure helpers in `lib/utils/**` or inline in the Server Component (for example, `id={\`section-${i}\`}` in `ArticleView.tsx` vs `ArticleToc.tsx`).
  2. **Next.js App Router `page.tsx` props**: default exports in `app/**/page.tsx` only accept `{ params, searchParams }` in Next.js's generated `.next/types` check. When sharing a view between `app/foo/[id]/page.tsx` and `app/zh/foo/[id]/page.tsx`, render the shared component (`<ErrorDetailView id={params.id} lang="zh" />`) rather than adding a custom `lang` prop to the page's default export signature.
  3. **Keep static views server-rendered**: do not re-add `'use client'` or `useLanguage()` to `ModelDetail`, `ArticleView`, `FormatSingleContent`, `FormatCompareContent`, `ErrorViews`, `QuestionPage`, `BestTierContent`, `BenchDataTables`, `CoverageSection`, `RunStandard`, or `RelatedReports`.
