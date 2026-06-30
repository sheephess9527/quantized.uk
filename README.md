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
| **Cookbook** | `/cookbook` | 22 deployment guides with standalone `/cookbook/[slug]/` pages (8GB GPU, WSL2, Docker GPU, VPS, Mac, Nginx) |
| **VRAM Calculator** | `/tools/vram-calc` | Dual-mode: Model→VRAM (forward) or GPU→Models (reverse); shareable URL params; verdict against 33 real GPUs |
| **Format Wizard** | `/tools/format-wizard` | 3-question wizard → personalised GGUF / AWQ / EXL2 recommendation |
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
  tools/vram-calc/page.tsx  # VRAM calculator wrapper (Suspense boundary for URL params)
  tools/cli-gen/page.tsx    # CLI generator wrapper
  globals.css               # Glass / glow utilities, grid background

components/
  layout/                   # Navbar (with lang toggle + Tools dropdown), Footer
  home/                     # HeroSection, StatsBar, TodayBoard, FormatHeatmap, QuickAccess, FormatRadar
  hub/                      # ModelCard, ModelDetail, FilterBar
  tools/                    # VRAMCalculator, CLIGenerator

lib/
  stats.ts                  # getSiteStats() — dynamic counts for homepage StatsBar
  data/                     # ── all content lives here ──
    models.ts               #   67 models — exports combined `models` array
    models-extra*.ts        #   models-extra .. models-extra-5 (base 10 + 5 packs)
    cookbook*.ts            #   cookbook + cookbook-extra + cookbook-extra-2 (22 guides)
    hf-repos.ts / .mjs      #   HF repo mapping for the build-time stats fetch
    hf-stats.json           #   cached HF download/like counts (refreshed on prebuild)
    formats.ts              #   5 formats (GGUF/AWQ/EXL2/GPTQ/HQQ) + radar data
    benchmarks.ts           #   speed + perplexity + matrix datasets
    gpus.ts                 #   33 GPUs (NVIDIA consumer/pro, Apple Silicon, CPU RAM)
    cookbook.ts             #   4 deployment recipes (bilingual)
  i18n/
    translations.ts         #   EN/ZH dictionary
    context.tsx             #   LanguageProvider + useLanguage() hook
  utils/
    vram.ts                 #   calcVRAM(), getVerdict(), quant BPW tables
    recommend.ts            #   getRecommendations() — GPU→model reverse lookup
    cli.ts                  #   generateCLI() → llama.cpp / Ollama / vLLM
    cn.ts                   #   clsx + tailwind-merge helper

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
  modelCount: models.length,        // currently 10
  formatCount: quantFormats.length, // currently 5
  gpuCount: gpuDatabase.length,     // currently 33
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
| Add a model | `lib/data/models-extra-5.ts` (or a new `models-extra-6.ts` imported by `models.ts`). Include `arch` + `quants` |
| Add a GPU to the calculator | `lib/data/gpus.ts` |
| Add a deployment guide | `lib/data/cookbook-extra-2.ts` (EN + ZH fields) |
| Add/track a quant format | `lib/data/formats.ts` (+ `formatRadarData`) |
| Add benchmark rows | `lib/data/benchmarks.ts` |
| Map a model to its HF repo | `lib/data/hf-repos.ts` **and** `hf-repos.mjs` (keep both in sync) |
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
- **Static-export limits:** no route handlers, no request-time data fetching, no `next/image` optimization (`images.unoptimized: true`). Everything is build-time only. `generateStaticParams()` is how dynamic routes (`[modelId]`, `[slug]`) become static pages.
- **`trailingSlash: true`** — internal links resolve to `/path/`. Keep links consistent.
- **HF repo map drift:** `hf-repos.ts` (app) and `hf-repos.mjs` (build script) are separate files — update both.

---

## 9. Changelog

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
