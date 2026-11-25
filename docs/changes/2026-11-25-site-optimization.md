# 2026-11-25 Website audit and optimization

## Scope

Full live and repository audit of `quantized.uk` covering client bundle composition, edge caching headers, localization consistency across `/` and `/zh/**`, structured data (`WebSite` / `Organization` / `FAQPage`), accessibility, hardware discovery across 126 configurations, Hub off-screen layout performance, and Privacy Policy accuracy.

## Changes

### 1. Client bundle reduction and server-rendered static views

- Extracted the ~420 lines of bilingual `/legal/`, `/about/` and `/privacy/` essays out of `lib/i18n/translations.ts` into server-only `lib/i18n/static-pages.ts`, keeping only the short `linkLabel` entries in `translations.ts` for `Footer`. This reduces the shared root-layout translation payload shipped on all 1,492 pages.
- Converted non-interactive reference and index views to Server Components taking an explicit `lang` prop (`AboutView`, `LegalView`, `PrivacyView`, `ToolIndexView`, `ChangelogView`, `FaqView`, `BestHubContent`, `FormatIndexView`, `FormatHeatmap`, `PendingView`), removing unnecessary client imports of `models` (~263 KB raw, previously pulled into `/about/`, `/tools/`, `/faq/`, `/best/`, `/formats/`) and `changelog` (~249 KB raw on `/changelog/`).
- Converted static homepage sections (`HeroSection`, `WeeklyUpdates`, `PopularStarts`, `MeasuredCases`, `TodayBoard`, `HomeFaq`, `QuickAccess`, `ExploreStrip`, `DataChangelog`) to Server Components driven by `HomeContent({ lang })` alongside `StatsBar({ lang })`, keeping `benchmarks.ts`, `faq.ts`, and `model-explainer.ts` out of the homepage client bundle.

### 2. Static asset caching and head preload cleanup

- Updated `public/_headers` with `Cache-Control: public, max-age=31536000, immutable` on `/_next/static/*` (previously served with 4-hour `max-age=14400, must-revalidate` revalidation on Cloudflare Pages) and `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` on static icons, `/og.png`, `/model-card-badge.svg`, and the ten build-time `/*/opengraph-image` routes.
- Switched `components/analytics/Plausible.tsx` from `strategy="afterInteractive"` to `strategy="lazyOnload"` (with explicit `"none"` / `"false"` opt-out support on `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) so Next.js no longer injects `<link rel="preload" href="https://plausible.io/js/script.js" as="script"/>` in `<head>` and HTTP `Link` headers ahead of fonts and critical chunks.
- Added standard `<meta name="mobile-web-app-capable" content="yes">` alongside `appleWebApp` in `app/layout.tsx`.

### 3. Localization, structured data, accessibility, and UX

- Separated localized hardware display names on modified cards in `lib/data/gpus.ts` (`name: 'RTX 2080 Ti 22G (Mod)', nameZh: 'RTX 2080 Ti 22G（改装）'` and `name: 'RTX 4090 48G (Mod)', nameZh: 'RTX 4090 48G（改装）'`) via `gpuDisplayName(gpu, lang)`, eliminating Chinese text leaks on English pages while preserving `gpuSlug()` URLs and WebGL renderer matching (`lib/utils/gpu-detect.ts`).
- Unified all GPU `<select>` pickers (`HardwareProfileSelector`, `HomeMatch`, `VRAMCalculator`) on the shared 8-group localized `GPU_GROUPS` (`nvidia-consumer`, `laptop`, `nvidia-pro`, `nvidia-unified`, `amd`, `intel`, `apple`, `cpu`), separating the 27 laptop GPUs cleanly and adding `aria-label` on the compact navbar selector.
- Localized the mobile menu button `aria-label` (`openMenu` / `closeMenu`) in `components/layout/Navbar.tsx`.
- Added an instant client-side hardware search box and memoized `fitsOnGpu` counts on `/gpu/` and `/zh/gpu/` (`components/gpu/GpuIndexContent.tsx`) for filtering across all 126 hardware rows.
- Added `.cv-card` (`content-visibility: auto; contain-intrinsic-size: auto 320px`) and O(1) `supersededBy` name lookup in `components/hub/ModelCard.tsx` to defer off-screen layout/paint on `/quant-hub/` while retaining all prerendered headings and links in `out/`.
- Added a direct pre-filled VRAM calculator link (`/tools/vram-calc/?mode=forward&model=…&gpu=…`) alongside the model and GPU links in `lib/utils/not-found.ts` for non-generated `/quant-hub/{model}/{gpu}/` pair URLs.
- Patched site-wide `WebSite` and `Organization` JSON-LD on `out/zh/**/*.html` in `scripts/localize-export.mjs` so Chinese pages emit Chinese descriptions and point `SearchAction` at `https://quantized.uk/zh/quant-hub/?q={search_term_string}`.
- Updated `/privacy/` and `/zh/privacy/` (`lib/i18n/static-pages.ts`) and `PRIVACY_LASTMOD` (`app/sitemap.ts`) to accurately reflect default Plausible loading, Cloudflare Web Analytics edge beacon usage, and URL-based language routing (only the optional hardware profile uses `localStorage`).

## Verification

- `npm run typecheck`, `npm run lint`, and `npm test` (all 18 data, consistency, speed, CLI, RSS, GPU-detect, embed, share, GGUF-file, calculator-simplification, Ollama-tag, and HF-stats suites) passed.
- `next build` + `npm run postbuild` passed across 1,492 HTML pages (745 Chinese pages), 1,394 structured-data entities, and 3,817 exported files in `out/` (down from 3,825).
- Measured asset bundle improvements:
  - Homepage (`/` and `/zh/`): 21 static JS/CSS files (`1,141.9 KB` raw / `363.5 KB` gzipped) → **19 files (`1,068.7 KB` raw / `316.1 KB` gzipped)**, saving **73.2 KB raw / 47.4 KB gzipped** on first load and removing `<head>` preload contention for `plausible.io/js/script.js`.
  - Reference and index routes (`/about/`, `/legal/`, `/privacy/`, `/tools/`, `/changelog/`, `/faq/`, `/best/`, `/formats/`, `/pending/` and `/zh/**` mirrors): **167 kB** First Load JS (`722.6 KB` raw / `231.0 KB` gzipped across 14 files), eliminating redundant client downloads of `models` (~263 KB) and `changelog` (~249 KB).
- Headless Google Chrome (`390×844` mobile viewport) passed the built-in `scripts/check-live.mjs --phone-ui` regression suite in English and Chinese, verified zero console/page/hydration errors and zero horizontal overflow across 22 routes, verified localized Chinese `<optgroup>` labels (`笔记本显卡`) and mobile menu `aria-label` (`打开菜单`), verified instant GPU search filtering on `/zh/gpu/`, and verified the pre-filled VRAM calculator link on non-generated `/quant-hub/{model}/{gpu}/` 404 pages.

## Pre-work review of other agents' changes

- Before editing, ran `git fetch origin main` and reviewed `git log origin/main`. The latest upstream commits at start were `0e55db5` (four GGUF models + runtime status), `6b35139` and `7514647` (`docs/changes/2026-11-25-patrol.md` only — Pages build retry and production verification). This branch is based on `7514647`; no upstream code overlapped with the files changed here.

## Handoff notes for the next agent

- **Server Components by default for read-only views.** The views listed in §1 now take `lang: Lang` as a prop and must not import `useLanguage()` or add `'use client'`. If a view needs interactivity, split out a small client island instead of converting the whole view back — otherwise `models` / `changelog` re-enter the client bundle (re-check with the asset sizes above).
- **Long-form page copy lives in `lib/i18n/static-pages.ts`**, not `translations.ts`. When editing `/privacy/`, also bump `lastUpdated` there and `PRIVACY_LASTMOD` in `app/sitemap.ts`.
- **GPU names:** always render through `gpuDisplayName(gpu, lang)`. Never put Chinese text in `name`; use `nameZh`. `gpuSlug()` still derives from `name`, so renaming `name` changes URLs.
- **GPU pickers:** use the shared `GPU_GROUPS` / `rowsInGpuGroup()` from `lib/data/gpus.ts`; do not reintroduce per-component group lists.
- **`page.tsx` gotcha:** Next.js type checking rejects props on parameterless pages and any extra named exports. Keep `app/**/page.tsx` as a plain default export that renders `<View lang="en|zh" />`.
- **Postbuild gates added in `scripts/localize-export.mjs`:** `/zh/` `SearchAction` must point at `/zh/quant-hub/`, no `plausible.io` preload in `<head>`, and no `改装` on English `/`. A failure here means a regression, not a flaky test.
- **Not done / candidates for follow-up:** homepage interactive islands (`HomeMatch`, `StatsBar` data) still ship `gpus` + part of `models` (~316 KB gz total); a further split would need a lighter precomputed GPU/model index. Live `Cache-Control` on `/_next/static/*` should be verified with `curl -sI` after each deploy because Cloudflare Pages may merge `_headers` rules.
- **Pre-existing bug found (not introduced here, verified on live production before deploy):** `/zh/<anything-missing>/` 404 pages log React hydration errors #425/#418/#423. Cause: the export only has a root `out/404.html` (English static HTML); on `/zh/` paths the client switches to Chinese from the URL, so the text mismatches. React recovers and shows "页面未找到", so readers are unaffected. Suggested fix: emit `out/zh/404.html` with Chinese static HTML (Cloudflare Pages serves the nearest `404.html` up the path) and add a postbuild assertion for it. English 404s are clean.
- **Local testing footgun:** a static server that always returns the root `404.html` does not match Cloudflare Pages' nearest-`404.html` lookup. Block third-party requests (Plausible / Cloudflare beacon) or use `waitUntil: 'load'` in headless checks, because `networkidle` can hang on them.
- **Verification after this note:** headless Chrome over 25 routes (with and without a saved hardware profile) found no hydration or console errors except the pre-existing `/zh/` 404 issue above.
