# quantized.uk

> AI Quantization Intelligence — bridging the gap between research papers and real-world LLM deployment on consumer hardware.

A full-stack static intelligence website for indie developers and geeks who run quantized LLMs locally. It answers the questions people actually have: *"Will this model fit in my VRAM? Which quant format should I pick? How much quality do I lose? What's the exact command to run it?"*

**Live:** https://quantized.uk · **Repo:** `sheephess9527/quantized.uk` · **Host:** Cloudflare Pages

---

## 📌 New maintainer? Start here

You're an AI agent or a new account picking this up cold. Read this box, then do the [Handoff Checklist](#8-handoff-checklist-do-this-first).

- **What it is:** Next.js 14 **static-export** site. No backend, no database, no runtime API. All content is hardcoded TypeScript under `lib/data/`.
- **Run it:** `npm install && npm run dev` → http://localhost:3000. Build: `npm run build` → static files in `out/`.
- **Deploy:** Push to `main` on GitHub → Cloudflare **Pages** auto-builds and publishes `out/`. No manual deploy step.
- **Change content:** data = `lib/data/*.ts`; UI strings = `lib/i18n/translations.ts` (add **both** `en` and `zh`); pages = `app/`; reusable UI = `components/`.
- **Biggest footguns:** Cloudflare *Pages* not *Workers*; output dir is `out` not `.next`; Next.js ≥ 14.2.35; every UI string needs both languages. Full list in [§6](#6-deployment--cloudflare-pages).
- **Docs discipline:** read `CLAUDE.md` first — it's the working agreement. **Every change updates `README.md` (changelog + affected section) and `CLAUDE.md` (if a convention changed) in the same commit.** A behaviour change that touches neither doc is incomplete.

---

## 1. Product Concept

The target audience is developers running LLMs on their own hardware (RTX cards, Apple Silicon, cheap VPS). The site turns scattered, paper-grade quantization knowledge into practical, at-a-glance tooling.

### Core features

| Feature | Route | What it does |
|---|---|---|
| **Dashboard** | `/` | Hero, data-driven stats, "Today" feed, format heat map, format radar chart, quick links to tools |
| **Quant Hub** | `/quant-hub` | Searchable/filterable index of quantized models with per-quant VRAM, context, speed and quality stats |
| **Model Detail** | `/quant-hub/[modelId]` | Per-model quant comparison table, HF links, one-click jump to VRAM calculator with pre-filled params |
| **Benchmarks** | `/benchmarks` | Inference-speed bar chart, perplexity-vs-quant line chart, full comparison matrix |
| **Cookbook** | `/cookbook` | 23 deployment guides with standalone `/cookbook/[slug]/` pages (8GB GPU, WSL2, Docker GPU, VPS, Mac, Nginx) |
| **VRAM Calculator** | `/tools/vram-calc` | Dual-mode: Model→VRAM (forward) or GPU→Models (reverse); shareable URL params; verdict against 43 real GPUs (incl. AMD Radeon) |
| **Format Wizard** | `/tools/format-wizard` | 3-question wizard (NVIDIA / AMD / Mac / CPU) → personalised GGUF / AWQ / EXL2 recommendation |
| **CLI Generator** | `/tools/cli-gen` | Generate ready-to-run commands for llama.cpp / Ollama / vLLM / ExLlamaV2 across Linux / Mac / Docker / Compose |

### Design language

- **Dark-mode first**, glassmorphism surfaces (`.glass`, `.glass-hover`)
- Violet / cyan accent palette, glow effects (`.glow-purple`, `.glow-cyan`)
- High information density — data-rich cards over whitespace
- Framer Motion for hero animations and floating format badges

### Internationalisation

- **English default UI with one-click toggle to Chinese**
- Pure client-side i18n: React Context + `localStorage`, **no URL-based routing** (keeps static export simple)
- The full bilingual dictionary lives in `lib/i18n/translations.ts`

---

## 2. Tech Stack

- **Next.js 14** (App Router) with `output: 'export'` → static HTML
- **TypeScript** throughout
- **Tailwind CSS** for styling, custom animations in `tailwind.config.ts`
- **Recharts** — radar (format comparison), bar (speed), line (perplexity)
- **Framer Motion** — hero + micro-interactions
- **lucide-react** icons, `clsx` + `tailwind-merge` (`cn()` helper)

> **Zero API calls / zero backend.** Every dataset is a static TypeScript constant under `lib/data/`. This is what makes the whole thing deployable as flat files on a CDN.

---

## 3. Project Structure

```
app/                        # Next.js App Router pages
  layout.tsx                # Root layout: Inter font + LanguageProvider + Navbar/Footer
  page.tsx                  # Dashboard
  quant-hub/page.tsx        # Model index (client: filter state)
  quant-hub/[modelId]/      # Per-model detail pages (SSG via generateStaticParams)
    page.tsx
  benchmarks/page.tsx       # Charts + matrix
  cookbook/page.tsx         # Recipe index (links to /cookbook/[slug]/)
  cookbook/[slug]/page.tsx    # Standalone article pages (SSG)
  feed.xml/route.ts         # RSS (force-static)
  tools/vram-calc/page.tsx  # VRAM calculator wrapper (Suspense boundary for URL params)
  tools/cli-gen/page.tsx    # CLI generator wrapper
  globals.css               # Glass / glow utilities, grid background

components/
  layout/                   # Navbar (lang + GPU profile + Tools), Footer
  home/                     # Hero, JobPaths, WeeklyUpdates, StatsBar, TodayBoard, …
  hub/                      # ModelCard, ModelDetail, ModelGuides, FilterBar (incl. recency)
  cookbook/                 # ArticleView, GuideNextSteps (guide → hub/calculator)
  tools/                    # VRAMCalculator, CLIGenerator, FormatWizard, ModelCompare

lib/
  stats.ts                  # getSiteStats() — dynamic counts for homepage StatsBar
  data/                     # ── all content lives here ──
    models.ts               #   79 models — exports combined `models` array + todayFeed
    models-extra*.ts        #   models-extra .. models-extra-8 (packs)
    types.ts                #   QuantModel fields (status, addedAt, confidence, …)
    cookbook*.ts            #   cookbook + extras (23 guides; verifiedAt on key articles)
    hf-repos.mjs            #   HF repo map (single source; .ts re-exports)
    hf-stats.json           #   cached HF download/like counts (refreshed on prebuild)
    formats.ts              #   5 formats (GGUF/AWQ/EXL2/GPTQ/HQQ) + radar data
    benchmarks.ts           #   speed + perplexity + matrix datasets
    gpus.ts                 #   43 GPUs (NVIDIA consumer/pro, AMD Radeon/ROCm, Apple Silicon, CPU RAM)
    meta.ts                 #   dataLastUpdated + changelog
  i18n/
    translations.ts         #   EN/ZH dictionary
    context.tsx             #   LanguageProvider + useLanguage() hook
  utils/
    vram.ts                 #   calcVRAM(), getVerdict(), quant BPW tables
    recommend.ts            #   getRecommendations() — GPU→model reverse lookup
    model-meta.ts           #   isRecentModel, quantConfidence, superseded helpers
    model-guides.ts         #   guideLinksForModel() — model → cookbook links (hub direction)
    hub-url.ts              #   shareable Hub filter URLs
    cli.ts                  #   generateCLI() → llama.cpp / Ollama / vLLM / ExLlama
    cn.ts                   #   clsx + tailwind-merge helper

scripts/
  fetch-hf-stats.mjs        # prebuild — refresh HF downloads/likes (fails gracefully offline)
  localize-export.mjs       # postbuild — patch <html lang> for /zh, fail on English link leaks

next.config.js              # output: 'export', trailingSlash, images.unoptimized
wrangler.toml               # Cloudflare Pages: pages_build_output_dir = "out"
```

---

## 4. Key Implementation Notes

### VRAM calculation (`lib/utils/vram.ts`)

```
total = model_weights + kv_cache + activation_buffer

model_weights     = params × bpw / 8
kv_cache          = 2 × layers × kvHeads × headDim × contextLen × batchSize × 2 bytes
activation_buffer = 10% of the above
```

`getVerdict(totalGB, gpuVram)` returns `green` / `yellow` / `red` so the calculator can colour-code each GPU.

**Which `bpw` gets used.** `quantBPW` is a *generic* per-level table and is the fallback, not the
authority. When a model is selected and it actually ships the chosen level, the calculator uses
that model's own `quant.bpw` instead — some models are far off the generic figure (GPT-OSS ships
mostly-MXFP4 MoE weights, so its Q8_0 is 5.10 bpw, not 8.5). Reverse mode has always sized from
`quant.bpw`; forward mode was corrected on 2026-08-18. Two consequences worth remembering:

- A level missing from `quantBPW` still breaks things — it cannot be *selected*, and custom-model
  sizing falls through to the `?? 4.85` default. Adding a new level means adding it to **both**
  `quantBPW` and `quantGroups`.
- The generic table is what a custom (non-indexed) model is sized with, so keep it honest.

### VRAM calculator modes (`components/tools/VRAMCalculator.tsx`)

The calculator supports two modes, toggled at the top of the page:

| Mode | Direction | Use case |
|---|---|---|
| **Forward** (`mode=forward`) | Model → VRAM | Pick a model + quant + context → see memory breakdown and per-GPU verdict |
| **Reverse** (`mode=reverse`) | GPU → Models | Pick your GPU + context → list all compatible model×quant configs |

Reverse lookup is powered by `getRecommendations()` in `lib/utils/recommend.ts`, which iterates every model×quant pair, runs `calcVRAM()`, filters by `getVerdict()`, and sorts by quality / speed / VRAM footprint.

**Shareable URLs** — all calculator state is synced to query params via `window.history.replaceState`:

```
# Forward: model + quant + context
/tools/vram-calc/?mode=forward&model=llama-3.1-8b&quant=Q4_K_M&ctx=4096&batch=1

# Reverse: GPU + sort order
/tools/vram-calc/?mode=reverse&gpu=rtx4060ti16&ctx=4096&batch=1&sort=quality

# Optional: exclude marginal (yellow) fits in reverse mode
/tools/vram-calc/?mode=reverse&gpu=rtx4090&ctx=8192&sort=speed&yellow=0
```

Supported `sort` values: `quality` (lowest PPL loss), `speed` (highest tok/s), `vram` (smallest footprint).

### Model detail pages (`app/quant-hub/[modelId]/`)

Each model gets a statically generated detail page via `generateStaticParams()`. Pages include:

- Model metadata, hardware tags, and bilingual description
- Summary cards (max context, variant count, best quality quant, accuracy retained)
- Full quant comparison table (format, level, BPW, VRAM, PPL loss, speed, HF link)
- CTA buttons: "Calculate VRAM" (pre-fills calculator) and "Hugging Face"

Model cards in the hub link to their detail page; the HF shortcut opens in a new tab without navigating away.

### Homepage stats (`lib/stats.ts`)

`getSiteStats()` computes real numbers from the data files — never hardcoded:

```ts
{
  modelCount: models.length,        // currently 75
  formatCount: quantFormats.length, // currently 5
  gpuCount: gpuDatabase.length,     // currently 43
  avgAccuracy: '97.x%',             // 100 − min(pplLossPercent) per model, averaged
}
```

`StatsBar` imports this at render time so the dashboard always reflects actual data.

### CLI generation (`lib/utils/cli.ts`)

`generateCLI(opts)` dispatches by framework and environment, emitting both a shell command and (where relevant) a `docker-compose.yml`. AWQ/GPTQ quant flags are injected automatically for vLLM.

### i18n gotcha

`translations[lang]` infers a union type that doesn't match `typeof translations.en`. The fix is an explicit cast in `context.tsx`:

```ts
const t = translations[lang] as typeof translations.en;
```

### i18n: what the build checks for you

`npm run build` ends with `scripts/localize-export.mjs` (`postbuild`), which does two things to
`out/` that no amount of type-checking can:

1. Rewrites `<html lang="en">` → `lang="zh-Hans"` on every `out/zh/**` page. A single App Router
   root layout serves both trees, so the attribute is a compile-time constant.
2. **Fails the build** if any page under `out/zh/**` links to the English version of a page that
   exists. This is the one i18n mistake that is invisible everywhere else: components are shared
   across both trees, so a single bare `next/link` quietly exiles Chinese readers, and nothing in
   `next build`, `next lint` or code review catches it.

If the build fails with "link(s) escape the Chinese tree", the fix is always the same — use
`@/components/i18n/LocalLink` instead of `next/link`. Server components that cannot use a hook
should branch on an explicit `lang` prop (see `app/quant-hub/[modelId]/page.tsx`).

Structured data has the same trap: JSON-LD is emitted from the shared component, so it must be
localized too, or a Chinese page advertises a URL its own canonical tag disowns.

### TypeScript / bundler gotcha

`[...new Set(...)]` fails to down-level with the bundler module target. Use `Array.from(new Set(...))` instead (see `ModelCard.tsx`).

---

## 5. Local Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → ./out
npm run lint
```

The production build emits flat HTML/JS/CSS into `out/`. You can preview it with any static server (`npx serve out`).

> **Note on `postbuild`:** `npm run build` ends with `scripts/localize-export.mjs`, which patches
> `<html lang>` for the Chinese tree and **fails the build** if a `/zh` page links into the English
> tree. Unlike `prebuild` this one is a gate, not a best-effort refresh — a non-zero exit here is a
> real bug in the export (see §4, "i18n: what the build checks for you").

> **Note on `prebuild`:** `npm run build` first runs `scripts/fetch-hf-stats.mjs` (via the `prebuild` hook) to refresh Hugging Face download/like counts. It fails gracefully — on any network/API error it keeps the cached `lib/data/hf-stats.json` and exits 0, so **builds work fully offline**. Run it standalone with `npm run fetch-hf`.

---

## 6. Deployment — Cloudflare Pages

The site is hosted on **Cloudflare Pages** (static hosting), connected to the GitHub repo for automatic builds on push to `main`.

### Correct configuration

| Setting | Value |
|---|---|
| Framework preset | None / Next.js (Static HTML Export) |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| Production branch | `main` |
| Deploy command | *(leave empty)* |

`wrangler.toml` pins the output directory so Pages picks it up automatically:

```toml
name = "quantized"
pages_build_output_dir = "out"
```

### Hard-won lessons (so you don't repeat them)

1. **Use Cloudflare *Pages*, not *Workers*.** Workers run server-side code and cannot serve a static `out/` directory — pointing a Worker at this repo just renders a placeholder ("Hello world"). Pages is purpose-built for static sites and auto-publishes `out/`.
2. **Output directory is `out`, not `.next`.** With `output: 'export'`, Next.js writes flat files to `out/`. Cloudflare's auto-detected `.next` default is wrong for static export.
3. **No deploy command needed.** Pages auto-deploys after a successful build. `wrangler deploy` / `wrangler pages deploy` as a deploy command will fail with an *Authentication error [10000]* unless the build token has the right Pages permissions. If the UI *forces* a non-empty deploy command, use the shell no-op `true` (not `done` — `done` is a reserved shell keyword and throws a syntax error).
4. **Next.js ≥ 14.2.35.** Cloudflare's Wrangler/Pages build pipeline rejects older 14.2.x releases. Pin at least `14.2.35` in `package.json`.
5. **Code must be on the production branch.** Cloudflare builds from `main`; if your work is on a feature branch you'll get `ENOENT: package.json` until it's merged.
6. **Custom domain** (`quantized.uk`) is attached inside the Pages project → *Custom domains*. If you migrate from Workers to Pages, re-bind the domain to the new Pages project.

---

## 7. Updating Content

All content is data-driven — no code changes required to add data:

- **New model** → append to `lib/data/models.ts` (include `arch` and per-quant stats so the VRAM calculator, hub, detail page, and reverse lookup all work automatically)
- **New GPU** → append to `lib/data/gpus.ts`
- **New recipe** → append to `lib/data/cookbook.ts` (provide both EN and ZH fields)
- **New UI string** → add to both `en` and `zh` in `lib/i18n/translations.ts`

Push to `main` and Cloudflare Pages rebuilds and redeploys automatically.

Adding a model to `models.ts` automatically:
- Increments the homepage model count via `getSiteStats()`
- Generates a new `/quant-hub/[modelId]/` page at build time
- Makes the model appear in VRAM reverse lookup results

---

## 8. Handoff Checklist (do this first)

A fresh agent/account taking over should run this top to bottom:

1. **Clone & install:** `git clone <repo> && cd quantized.uk && npm install`
2. **Run locally:** `npm run dev` → http://localhost:3000. Click through every page (Dashboard, Quant Hub + a model detail, Benchmarks, Cookbook + an article, VRAM Calc both modes, Format Wizard, CLI Gen) and the **EN/中文** toggle (top-right) to confirm rendering.
3. **Build:** `npm run build`, then confirm `out/index.html` has real content (not a placeholder). Preview with `npx serve out`.
4. **Make a change → deploy:** edit data → `npm run build` to type-check & lint → `git commit` → `git push origin main`. Cloudflare Pages rebuilds automatically (~2–3 min). Watch the deploy log in the Pages dashboard if nothing appears.
5. **Gate before every commit:** `npm run build` must pass — it runs the same type-check + lint Cloudflare runs.

### Git workflow

- **Remote:** `origin` → `sheephess9527/quantized.uk`
- **Production branch:** `main` — Cloudflare Pages builds & deploys from here on every push.
- **Agent dev branch:** `claude/quantized-uk-platform-yxfz9v` (used for Claude-driven work).
- Pushing to `main` triggers a live deploy. Always `git push -u origin <branch>`; retry with backoff on transient network errors. Don't open a PR unless asked.
- If a push is rejected (`fetch first`), another session pushed in parallel — `git pull --rebase origin main`, resolve, then push.

### Where to make each change

| I want to… | Edit |
|---|---|
| Add a model | `lib/data/models-extra-7.ts` (or a new `models-extra-N.ts` imported by `models.ts`). Include `arch` + `quants`; set `addedAt` for Hub recency |
| Add a GPU to the calculator | `lib/data/gpus.ts` |
| Add a deployment guide | `lib/data/cookbook-extra-2.ts` (EN + ZH fields) |
| Add/track a quant format | `lib/data/formats.ts` (+ `formatRadarData`) |
| Add benchmark rows | `lib/data/benchmarks.ts` |
| Map a model to its HF repo | `lib/data/hf-repos.mjs` only (`hf-repos.ts` re-exports) |
| Change/translate any UI text | `lib/i18n/translations.ts` — add to **both** `en` and `zh` |
| Tweak the VRAM formula | `lib/utils/vram.ts` |
| Tweak generated commands | `lib/utils/cli.ts` |
| Restyle a surface | `app/globals.css` utilities + Tailwind in components |

### Data schema cheat-sheet (the contract — build fails if you break it)

```ts
// lib/data/models.ts → each model in `models`
interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;            // 'Q4_K_M', 'INT4', '4.65bpw'
  bpw: number;              // bits per weight — drives VRAM math
  vramGB: number;           // approx weights-only size
  pplLossPercent: number;   // perplexity loss vs FP16, %
  speedRTX4090?: number;    // tok/s reference
  hfSearchUrl: string;      // use the hf('terms') helper
}
interface ModelArch { layers: number; attHeads: number; kvHeads: number; headDim: number; }
interface QuantModel {
  id: string; name: string; family: string;
  params: number;           // billions, numeric (8.03)
  paramLabel: string;       // '8B'
  categories: string[];     // 'general' | 'instruct' | 'code' | 'small' ...
  hardwareTags: string[];   // 'consumer-gpu' | 'mac' | 'cpu-vps' | 'datacenter'
  contextLength: number;
  arch: ModelArch;          // REQUIRED — VRAM calculator + reverse lookup read this
  quants: QuantVariant[];
  description: { en: string; zh: string };
}

// lib/data/gpus.ts → `gpuDatabase`
interface GPU {
  id: string; name: string;
  vram: number;             // GB (Apple = unified memory)
  type: 'nvidia-consumer' | 'nvidia-pro' | 'apple' | 'amd' | 'cpu';
  isUnified?: boolean; isCPU?: boolean; icon: string;  // emoji
}

// lib/data/cookbook.ts → `articles` (note: flat *Zh fields, not nested {en,zh})
interface Section { heading; headingZh; body; bodyZh: string; code?: { lang: string; content: string }; }
interface Article {
  id; title; titleZh; description; descriptionZh: string;
  category: 'edge' | 'server' | 'docker' | 'mac';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number; tags: string[]; publishedAt: string;  // 'YYYY-MM-DD'
  content: Section[];
}
```

Shared types live in `lib/data/types.ts`. `models.ts` style uses nested `{ en, zh }`; `cookbook.ts` uses flat `*Zh` fields — match the file you're editing.

### Known gotchas

- **Bilingual completeness:** add a string to `en` but forget `zh` → the Chinese UI shows `undefined`. Always add both, and keep `zh`'s shape identical to `en` (the `t` cast in `context.tsx` hides mismatches otherwise).
- **`Set` spread:** `[...new Set(...)]` fails to down-level under the bundler target — use `Array.from(new Set(...))`.
- **Static-export limits:** no request-time data fetching, no `next/image` optimization (`images.unoptimized: true`). Everything is build-time only. `generateStaticParams()` is how dynamic routes (`[modelId]`, `[slug]`) become static pages. Static route handlers are OK only with `export const dynamic = 'force-static'` (e.g. `/feed.xml`).
- **`trailingSlash: true`** — internal links resolve to `/path/`. Keep links consistent.
- **HF repo map:** single source `lib/data/hf-repos.mjs` (build script + `hf-repos.ts` re-export). Edit the `.mjs` only.

---

## 9. Changelog

### 2026-08-18 — Chinese-edition audit: the /zh tree stops leaking, and the calculator stops lying

A full review of the `/zh` work shipped on 2026-08-08. The routes and hreflang were right; four
things underneath them were not, and all four were invisible in `next build`.

**1. `<html lang="en">` on all 113 Chinese pages.** The previous entry logged this as an accepted
limitation, on the theory that only hreflang matters. It also decides how a screen reader
pronounces the page, and it is the one language signal in the markup that contradicted the other
two. Fixed without multi-root layouts: `scripts/localize-export.mjs` runs as `postbuild` and
rewrites `lang="en"` → `lang="zh-Hans"` across `out/zh/**` (113/113 patched). `LanguageProvider`
keeps it correct across client-side navigation, where no fresh document is ever parsed; the inline
head script now only matters for the shared 404, which no build step can localize.

**2. Five pages still used bare `next/link`** — `cookbook`, `about`, `legal`, `privacy`,
`not-found`. The 2026-08-08 entry claimed the swap covered every link-rendering component; it
missed the page files. Effect: **every one of the 23 guide cards on `/zh/cookbook/` linked to the
English guide**, on the surface that takes the most traffic. Now `LocalLink`, and the postbuild
script **fails the build** if any Chinese page links to an English page that exists — the leak is
only visible in exported HTML, so that is where it is now checked.

**3. Structured data described the wrong page.** `/zh/quant-hub/*` and `/zh/cookbook/*` re-exported
the English component, so 102 Chinese pages emitted JSON-LD carrying the English headline,
description and `url` — contradicting their own canonical tag. Both page components now take a
`lang` prop that the `/zh` mirror passes, and emit `inLanguage`. `Breadcrumbs` had the same split:
localized links, English URLs in `BreadcrumbList`. Also added `og:locale` (`zh_CN` / `en_GB`) via
`ogLocale()` in `lib/seo.ts`.

**4. Nav highlighting was dead across the entire Chinese tree.** `isActive()` tested the raw
pathname against English hrefs, so on `/zh/**` no nav item and no tools dropdown ever lit up. It
now compares against `toEnPath(pathname)`. `toggleLang` also preserved neither query nor hash —
switching language on a filtered Hub view silently reset the reader's filters.

**Calculator correctness (unrelated to i18n, found in the same sweep):**

- `EXL2 3.5bpw` was used by **6 model rows** but missing from `quantBPW` / `quantGroups` — the
  exact footgun CLAUDE.md documents for MXFP4, hit again. The level was unselectable, and anything
  sized against it fell through to the `?? 4.85` default.
- **Forward mode ignored each model's own measured bpw**, always taking the generic per-level
  table. Reverse mode has always sized from `quant.bpw`, so the two halves of one tool disagreed
  about the same model. Forward mode now prefers the model's own row when it ships that level.
  For GPT-OSS this is not a rounding difference: **Q8_0 was overstated by 67%** (21.1 GB vs
  12.7 GB) and Q4_K_M by 18% — enough to tell a 16GB-card owner that a model that fits does not.

**Docs:** `llms.txt` still described language as a "client-side toggle, same URLs", which had been
false since the `/zh` ship.

### 2026-08-08 (e) — Chinese edition becomes indexable: `/zh/**` routes + hreflang

The site had a complete Chinese translation that **no search engine could see**. i18n was
client-only (React Context + `localStorage`), so every built page shipped English HTML and Chinese
appeared only after a click. Roughly half the site's content was worth zero in search, and the
`WebSite` JSON-LD claimed `inLanguage: ['en','zh']` — a claim no crawler could verify.

**URL is now the source of truth for language.** English stays at the root (existing URLs are
untouched — that was a hard constraint); Chinese mirrors it under `/zh`. Subpath rather than
subdomain, so both trees share domain authority.

- `lib/i18n/routing.ts` — `langFromPathname` / `toEnPath` / `toZhPath` / `mirrorPath` /
  `localizeHref`.
- `LanguageProvider` derives language from `usePathname()` instead of `localStorage`, and
  `toggleLang` now navigates to the mirrored URL rather than mutating state. **This is what makes
  the translation indexable:** `usePathname()` resolves during static prerendering, so `/zh/**`
  pages carry Chinese in the HTML. Verified on the built output — `/zh/` contains 1503 CJK
  characters vs 2 at `/`.
- `components/i18n/LocalLink.tsx` — drop-in `next/link` replacement that keeps a reader inside
  their language tree. Swapped across all 19 link-rendering components; without it a Chinese
  reader clicking any nav item would land back in English.
- **113 new routes** under `app/zh/**` (11 static + 79 models + 23 guides), each re-exporting the
  English page component with its own Chinese metadata. Total build: **119 → 232 pages**.
- **hreflang** on every page in both trees (`en`, `zh-Hans`, `x-default`) via
  `languageAlternates()` in `lib/seo.ts`, plus per-URL `xhtml:link` alternates in the sitemap
  (113 → 226 URLs). Without these the two trees read as duplicate content rather than translations.
- `<html lang>` is corrected before paint by a path-based inline script; the static attribute
  stays `en` because a single root layout serves both trees.
- `llms.txt` notes the Chinese edition.

**Known limitation (resolved 2026-08-18):** the `lang` attribute in the raw HTML was `en` for
`/zh/**` until the inline script ran. Rather than multi-root layouts (`app/(en)/` + `app/(zh)/`,
which would mean moving every existing page file), the exported HTML is now patched by
`scripts/localize-export.mjs` as a `postbuild` step — see the 2026-08-18 entry.

### 2026-08-08 (d) — Hub → cookbook links + honest sitemap dates

Completes the internal-link loop opened in (c), and fixes a sitemap signal that was inert.

- **`ModelGuides` on all 79 model pages** (`components/hub/ModelGuides.tsx` +
  `lib/utils/model-guides.ts`). Previously the hub linked to the cookbook **nowhere** — a reader
  on a model page had no route to "how do I actually run this", and the guides (the only pages
  drawing traffic) got no internal links from the 79 largest page group on the site.
  - Exact matches come from reversing `article.relatedModelIds`; the rest fill in from a curated
    `hardwareTag → guides` map, labelled differently so a hardware suggestion never claims to
    cover the specific model.
  - Exact matches are sorted by `relatedModelIds.length` ascending — the more focused guide wins.
    Without this, article file order decided which matches survived the cap, which pushed the
    dedicated `gpt-oss-mxfp4-local` guide off the GPT-OSS pages entirely.
  - `guideLinksForModel()` returns a **minimal** `GuideLink`, not the `Article`. The page is a
    server component, so full guide bodies (23 guides of prose and code blocks) never enter the
    79 client bundles.
- **Per-page `lastModified` in `app/sitemap.ts`.** Every URL previously reported
  `dataLastUpdated`, so all 119 entries claimed the same date — a uniform lastmod is discounted
  by crawlers. Now models report `addedAt`, guides report `verifiedAt ?? publishedAt`, and only
  pages genuinely driven by the site-wide data date report it. Output went from 1 distinct date
  to 4.
- `t.hub.guides` added in **both** `en` and `zh`.

### 2026-08-08 (c) — AMD is a first-class target + guides now route into the tools

Same traffic reading as (b): the top-5 pages are the homepage plus four non-standard-hardware
cookbook guides, `amd-rocm-llamacpp` among them. Two things were broken for exactly those readers.

**AMD was unsupported by the tools, while an AMD guide was the #2 page.**

- `gpuDatabase` had **no AMD entries at all** — the `'amd'` member of the `GPU['type']` union
  existed but was never used. A reader arriving on the ROCm guide could not select their card in
  the VRAM calculator. Added 10: RX 7900 XTX / XT / GRE, 7800 XT, 7700 XT, 6900 XT, 6800 XT,
  6700 XT, PRO W7900 48G, Instinct MI100 32G (**33 → 43 GPUs**; `getSiteStats()` picks this up
  automatically).
- **The Format Wizard actively gave AMD users a wrong answer.** `HardwareType` was
  `'nvidia' | 'mac' | 'cpu'`, so AMD users had to pick "NVIDIA" — and with priority = speed the
  wizard then recommended **EXL2 via ExLlamaV2, which is CUDA-only and cannot run on ROCm**.
  Added `'amd'` to `HardwareType` with scoring that reflects reality: GGUF (llama.cpp ROCm/Vulkan)
  strongly preferred, EXL2 pushed to last with an explicit reason, AWQ/GPTQ/HQQ penalised for
  partial ROCm support. `FormatWizard.tsx` now maps `gpu.type === 'amd'` instead of falling
  through to `'nvidia'`.
- `GpuQuickChips` featured list gained `rx7900xtx` (7 → 8 chips).

**Guides did not route readers into the tools.** Only 1 of 23 guides mentioned the reverse VRAM
lookup, and it did so as an unclickable plain-text code block.

- New optional `Article` fields in `lib/data/cookbook.ts`: `gpuPreset` (`{ gpuId, ctx }`) and
  `relatedModelIds`.
- New `components/cookbook/GuideNextSteps.tsx` — renders a prefilled reverse-lookup link
  (`/tools/vram-calc/?mode=reverse&gpu=…&ctx=…&sort=quality`) plus links to the models the guide
  covers. Returns `null` when a guide sets neither field, so unwired guides are unaffected.
- Wired 7 guides: `amd-rocm-llamacpp`, `wsl2-ollama-gpu`, `mac-m3-pro-limits`,
  `dual-gpu-70b-llamacpp` (models only — no single GPU entry represents a 2×24GB split),
  `gpt-oss-mxfp4-local`, `8gb-gpu-starter-guide`, `rtx4060ti-what-to-run`.
- `t.cookbook.nextSteps` added in **both** `en` and `zh`.

**SEO:** cookbook `Article` JSON-LD now emits `dateModified` from `verifiedAt` (omitted when the
guide has none, so it stays an honest claim).

### 2026-08-08 (b) — Traffic-informed model batch (79 models)

First batch picked against observed page traffic rather than model-release news. The top-5 pages
were the homepage plus four cookbook guides — `amd-rocm-llamacpp`, `wsl2-ollama-gpu`,
`dual-gpu-70b-llamacpp`, `mac-m3-pro-limits` — i.e. **all four are non-standard-hardware guides,
none is a single-NVIDIA-card guide**. Volume was far too low to be conclusive (single-digit views),
so this is treated as a directional hypothesis: the site's pull is hardware-constrained readers.
Selection followed from that — nothing in this batch is a 400B-class flagship.

- **79 models** — new pack `lib/data/models-extra-8.ts` (`extraModels8`), all `addedAt: 2026-08-08`:
  - **Qwen3-VL 8B** — current-gen multimodal that still fits a 12GB card at Q4 (~5.9GB).
  - **Qwen3-VL 30B-A3B** — multimodal MoE, ~3B active, suits unified memory and CPU offload.
  - **Magistral Small 1.2 24B** — `[THINK]`-tagged reasoning at Q4 ~14GB, i.e. on a 16GB card.
  - **Seed-OSS 36B** — dense, native 512K context; Q4 weights ~22GB (24GB card or 2×16GB).
- **Qwen2-VL 7B marked `superseded` → `qwen3-vl-8b`** (kept listed, per the no-delete rule).
- Arch fields cross-checked against published configs and against the site's own sibling entries;
  a search result claiming Magistral is 32 layers / hidden 14336 was discarded as unreliable
  (that is Mistral 7B's shape — the 24B Small family is 40 layers, matching `mistral-small-24b`
  and `devstral-small-2507` already in the index).
- Seed-OSS's `contextLength: 524288` is honest but expensive: 512K of KV cache is ~128GB on its
  own at fp16, which the model description says outright rather than letting the calculator
  surprise someone.
- Editor's Picks refreshed; `hfRepoMap` entries added; counts `75+ → 79+` across
  `lib/seo.ts`, `lib/i18n/translations.ts` (en + zh), `app/layout.tsx`,
  `app/quant-hub/layout.tsx`, `public/llms.txt`, `public/og.svg`; `og.png` re-rendered.

### 2026-08-08 — GPT-OSS cookbook + MXFP4 in the VRAM calculator (23 guides)

Follow-up to the 08-07 model batch: the models landed, but the two surfaces a visitor actually
uses after finding them did not support their native format.

- **VRAM calculator now offers `MXFP4` (4.25 bpw)** — `lib/utils/vram.ts`, added to `quantBPW`
  and into the `GGUF` group in `quantGroups`. Previously the only way to size a GPT-OSS model was
  to pick `Q4_K_M` (4.85), which **overstated weights by ~14%** (12.8GB → 14.6GB on the 20B), i.e.
  the calculator told 16GB-card owners the model was tighter than it is. The CLI generator was
  unaffected — it derives levels from each model's own `quants` array, so `MXFP4` already flowed
  through there.
- **New cookbook guide** `gpt-oss-mxfp4-local` in `lib/data/cookbook-extra-2.ts` (**23 guides**):
  why re-quantizing GPT-OSS makes it larger and no better, per-context VRAM sizing, the `--jinja`
  requirement for the harmony chat template, MoE expert offload (`--n-cpu-moe`) to run the 120B on
  a 24GB card, reasoning-effort tuning, and a failure-mode table.
- **No `verifiedAt` on the new guide.** The field means "commands were re-checked on this date";
  this environment has no GPU and no network access to Hugging Face, so the commands could not be
  run. Setting it would have made the badge meaningless everywhere it appears. See the rule now
  recorded in `CLAUDE.md`.
- Guide count `22 → 23` in `app/cookbook/layout.tsx` and `public/llms.txt`
  (`components/home/ExploreStrip.tsx` already derives it from `articles.length`).
- `dataLastUpdated` → `2026-08-08` + changelog entry.

### 2026-08-07 — Cadence pack: MoE freshness batch (75 models)

- **75 models** — new pack `lib/data/models-extra-7.ts` (`extraModels7`), all `addedAt: 2026-08-07`:
  - **GPT-OSS 20B** (21B total / 3.6B active) and **GPT-OSS 120B** (117B / 5.1B active) — OpenAI
    open-weight MoE, shipped *natively* in MXFP4. Listed with a `MXFP4` quant level and
    `pplLossPercent: 0.0`, because the released checkpoint already is the 4-bit one; there is no
    FP16 original to lose quality against. This is the first entry where a quant row is the
    reference rather than a degradation of it.
  - **GLM-4.5-Air** (106B / 12B active) — agentic/reasoning MoE, Q4 ≈ 64GB.
  - **Devstral Small 1.1 24B** — Mistral + All Hands agentic coder, Q4 ≈ 14GB on a 16GB card.
- Arch fields (`layers` / `attHeads` / `kvHeads` / `headDim`) verified against published model
  configs, since they feed the VRAM calculator's KV-cache math — GPT-OSS uses `headDim: 64`,
  which is half the usual 128 and materially changes long-context KV estimates.
- `hfRepoMap` entries added in `lib/data/hf-repos.mjs` for all four.
- **Editor's Picks / `todayFeed`** refreshed to the new batch (4 new + 2 hot).
- **`dataLastUpdated`** → `2026-08-07`, changelog entry added (drives Home weekly block,
  Hub `?recency=recent`, and `/feed.xml`).
- Marketing copy **71+ → 75+**: `lib/seo.ts`, `lib/i18n/translations.ts` (en + zh),
  `app/layout.tsx`, `app/quant-hub/layout.tsx`, `public/llms.txt`, `public/og.svg`;
  `public/og.png` re-rendered (1200×630, §10 recipe).
- Cookbook `verifiedAt` left at `2026-07-22` — the monthly re-verify is not due yet.

### 2026-07-22 (c) — OG PNG + full cookbook verified stacks

- Re-rendered `public/og.png` from `og.svg` (Chrome headless, 1200×630) with **71+ Models** copy.
- All **22** cookbook articles now have `verifiedAt` + `verifiedStack` (not only the 4 high-traffic guides).

### 2026-07-22 (b) — Docs sync after cadence pack

- Fixed stale counts/structure in README (71 models, project tree, HF map = `.mjs` only).
- Rewrote **CONTRIBUTING.md** for packs through `extra-6`, cadence fields, verified cookbook, feedback email.
- `og.svg` marketing line → 71+ models (re-render `og.png` with §10 recipe if share cards must match).
- `llms.txt` contact line → `hello@quantized.uk`.

### 2026-07-22 — Cadence pack A+B+C (freshness + trust + rhythm)

- **71 models** — `models-extra-6.ts`: Gemma 3 27B IT, DeepSeek-R1-Distill-Llama-8B, Phi-4 14B, Qwen3 1.7B; Editor’s Picks refreshed.
- **Cadence fields** on `QuantModel` / `QuantVariant` / cookbook `Article` (`status`, `supersededBy`, `addedAt`, `confidence`, `verifiedAt`, `verifiedStack`) — see `lib/data/types.ts`, helpers in `lib/utils/model-meta.ts`.
- **Superseded** legacy entries (OpenChat, Zephyr, WizardLM-2, Yi-1.5-34B, Solar) point to Qwen3 successors; cards/detail show amber prefer link.
- **Confidence column** on model quant tables (measured / estimated / community).
- **Hub “Recently added”** filter (`?recency=recent`, 45-day window via `addedAt`).
- **Home “This week’s updates”** + **`/feed.xml` RSS** (static route handler).
- **Cookbook verified stack** banners on 8GB, WSL2, Docker Ollama, VPS llama.cpp guides.
- **Benchmarks** matrix/speed rows for R1-Llama-8B, Phi-4, Qwen3-Coder 30B-A3B.
- **`dataLastUpdated`** / changelog bumped to 2026-07-22. Conventions in `CLAUDE.md`.

### 2026-06-24 (e) — Perf & share-card fixes

- **OG image now PNG** — social platforms don't render SVG `og:image`, so shares had no preview
  card. `public/og.png` (1200×630) is rendered from `og.svg` (master, kept in repo) with the
  Chromium recipe (§10); refreshed copy ("67+ Models") and added the staircase motif from the
  app icon. Refs updated in `app/layout.tsx` + `lib/seo.ts`.
- **Fonts self-hosted via `next/font`** — removed the render-blocking Google Fonts `@import`
  from `globals.css` (Inter was being downloaded twice). JetBrains Mono now loads through
  `next/font` too; Tailwind `sans`/`mono` point at `--font-inter`/`--font-mono` variables.
- **Charts lazy-loaded** — Recharts is dynamically imported (`ssr: false` + skeletons):
  `FormatRadarLazy` on the dashboard, `BenchCharts` on `/benchmarks`. First-load JS:
  home 289→191 kB (−34%), benchmarks 230→128 kB (−44%).

### 2026-06-24 (d) — PWA install, custom app icon, iOS safe areas

- **Installable PWA / Add to Home Screen** — `public/site.webmanifest` (standalone display,
  theme color), `apple-touch-icon` + iOS web-app meta (fullscreen launch, `quantized` label),
  `theme-color` + `viewportFit: cover`. Wired via `metadata`/`viewport` in `app/layout.tsx`.
- **Custom app icon** — quantization-staircase mark (violet→cyan, glass tile) as master
  `public/icon.svg`; rasterised PNG set (180/192/512) for iOS/Android/favicon. See §10.
- **iOS safe-area fix** — Navbar + `<main>` pad by `env(safe-area-inset-top)` so content clears
  the status bar / notch in standalone mode; `body` pads bottom/sides (home indicator, landscape).
- **Docs discipline** — added `CLAUDE.md` (working agreement); every change now updates README +
  CLAUDE.md in the same commit.

### 2026-06-24 (c) — Phase 3: HF pipeline, model compare, cookbook ×15

**HF data pipeline**
- `scripts/fetch-hf-stats.mjs` runs on `prebuild` — fetches downloads/likes from Hugging Face API
- Stats cached in `lib/data/hf-stats.json`, displayed on model detail pages
- Repo mapping in `lib/data/hf-repos.ts` (25 models with known HF repos)

**Model compare tool** (`/tools/compare`)
- Side-by-side A vs B comparison: params, VRAM, PPL, speed, format count
- GPU profile integration for fit verdict
- Shareable URL: `?a=llama-3.1-8b&b=qwen2.5-7b&ctx=4096`

**Cookbook expansion** (4 → 15 articles)
- RTX 4060 Ti guide, DeepSeek-R1 EXL2 vs GGUF, ExLlamaV2 setup, dual-GPU 70B
- Qwen2.5-Coder 32B on 4090, Mac M3 Pro limits, Windows CUDA llama.cpp
- TabbyAPI, custom GGUF quantizing, vLLM production tuning, CPU OpenBLAS

### 2026-06-24 (b) — Phase 1 & 2: trust, SEO, hardware profile, format wizard

**Phase 1 — Trust & SEO**
- Today Feed → honest "Editor's Picks" (no fake timestamps), links to model detail pages
- Format Heat Index methodology disclaimer
- Benchmarks page: collapsible test methodology panel with framework versions and sources
- Homepage data changelog (`lib/data/meta.ts`)
- `sitemap.xml` + `robots.txt` auto-generated at build
- Static OG share image (`public/og.svg`) + per-page metadata layouts
- `metadataBase` + Twitter card metadata

**Phase 2 — Product depth**
- **Hardware profile** — navbar GPU selector, saved in `localStorage`, filters Quant Hub + pre-fills VRAM reverse mode
- **Format Wizard** (`/tools/format-wizard`) — 3 questions → ranked format recommendation with reasoning
- **ExLlamaV2 CLI** — fourth framework option in CLI generator
- **30 models** — expanded from 10 via `lib/data/models-extra.ts` (Qwen2.5-72B, DeepSeek-R1, Llama 3.3 70B, etc.)

**New files**
| File | Purpose |
|---|---|
| `lib/data/meta.ts` | Changelog, data sources, benchmark methodology |
| `lib/data/types.ts` | Shared model type definitions |
| `lib/data/models-extra.ts` | 20 additional models |
| `lib/hardware-profile/context.tsx` | GPU profile provider (localStorage) |
| `lib/utils/format-wizard.ts` | Format recommendation scoring engine |
| `components/home/DataChangelog.tsx` | Homepage update log |
| `components/benchmarks/MethodologyPanel.tsx` | Benchmark test conditions |
| `components/tools/FormatWizard.tsx` | Format wizard UI |
| `components/layout/HardwareProfileSelector.tsx` | Navbar GPU picker |
| `app/sitemap.ts` / `app/robots.ts` | SEO infrastructure |
| `public/og.svg` | Static Open Graph image |

### 2026-06-24 (a) — Model details, GPU reverse lookup, trust fixes

**Trust & accuracy**
- Homepage stats now computed from real data (`lib/stats.ts`) instead of hardcoded values (was "30+ models", now reflects actual count)
- Footer GitHub link points to [github.com/sheephess9527/quantized.uk](https://github.com/sheephess9527/quantized.uk) (was generic `github.com`)
- Copyright year updated to 2026

**Model detail pages** (`/quant-hub/[modelId]/`)
- 10 statically generated detail pages (one per model in `models.ts`)
- Quant variant comparison table with per-row HF links and VRAM calculator deep links
- Hub model cards are now clickable → navigate to detail page
- Per-model `generateMetadata()` for SEO titles and descriptions

**VRAM calculator enhancements**
- **Forward mode** (Model → VRAM): original behaviour — pick model, see memory breakdown + GPU verdicts
- **Reverse mode** (GPU → Models): pick GPU, list all compatible model×quant configs
- Sort reverse results by quality, speed, or VRAM footprint
- Toggle to include/exclude marginal (yellow) fits
- Shareable URL params synced to browser address bar
- "Copy share link" button for Reddit / Discord / forum sharing

**New files**
| File | Purpose |
|---|---|
| `lib/stats.ts` | `getSiteStats()` — dynamic homepage statistics |
| `lib/utils/recommend.ts` | `getRecommendations()` — GPU→model reverse lookup engine |
| `app/quant-hub/[modelId]/page.tsx` | SSG model detail route |
| `components/hub/ModelDetail.tsx` | Model detail page UI |

**i18n**
- Added `hub.detail.*` strings (EN/ZH) for model detail pages
- Added `calc.modeForward`, `calc.modeReverse`, `calc.sortBy`, `calc.shareLink`, etc. (EN/ZH) for calculator modes

**Build output**
- 19 static pages (was 9): +10 model detail pages
- Commit: `fea3184` on `main`

---

## 10. PWA & App Icon (Add to Home Screen)

The site is an installable PWA — on iPhone, **Share → Add to Home Screen** drops a
custom icon that launches the site **fullscreen** (no Safari chrome). On Android/desktop
Chrome it installs the same way via the web manifest.

**What makes it work** (all wired in `app/layout.tsx` + `public/`):
- `public/site.webmanifest` — `display: standalone`, theme/background `#0a0a0f`, icon set
- `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-title=quantized`, status-bar style (via `metadata.appleWebApp`)
- `theme-color` (via the `viewport` export) + `viewportFit: 'cover'` for notch/safe-area
- `apple-touch-icon.png` (180×180) for the iOS home-screen icon

**Icon design** — `public/icon.svg` is the master (a quantization *staircase*: a continuous
signal discretised into violet→cyan steps, with sample dots, on a dark glass tile). Edit the
SVG, then regenerate the PNGs. This environment has no ImageMagick/sharp, so we rasterise with
the bundled Chromium. Key quirks learned: this Chromium renders an `<img>` SVG at its intrinsic
size (ignores CSS downscaling) and clamps `--force-device-scale-factor` to a floor of `0.5`, and
viewports ≤128px screenshot blank. The reliable recipe:

```bash
cd public
SVG=/tmp/icon-fluid.svg
sed 's/ width="512" height="512"//' icon.svg > "$SVG"   # viewBox-only → scales to container
cat > /tmp/wrap.html <<HTML
<!doctype html><meta charset="utf-8">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:#0a0812;overflow:hidden}
img{position:fixed;inset:0;width:100%;height:100%}</style><img src="file://$SVG">
HTML
CHROME=/opt/pw-browsers/chromium-*/chrome-linux/chrome
ren(){ T=$1; W=$((T*2)); "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir=/tmp/cd$T --force-device-scale-factor=0.5 --virtual-time-budget=3000 \
  --screenshot="$2" --window-size="$W,$W" file:///tmp/wrap.html; }   # 2×window + 0.5 dsf = T px
ren 512 icon-512.png; ren 192 icon-192.png; ren 180 apple-touch-icon.png
```

Favicons under ~48px render blank in this Chromium, so the favicon is served as the SVG
(`/icon.svg`) with the PNGs as fallback — all declared in `metadata.icons`.
