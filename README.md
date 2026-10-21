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
| **Dashboard** | `/` | Hero, data-driven stats, "Today" feed, quick links to tools (format heat ranking lives on `/formats/`; the radar chart was removed 2026-10-03) |
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
- **Recharts** — bar (speed), line (perplexity); the format radar was removed 2026-10-03 (typed scores, no source)
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
  home/                     # Hero, HomeMatch, PopularStarts, MeasuredCases, WeeklyUpdates, …
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
    formats.ts              #   5 formats (GGUF/AWQ/EXL2/GPTQ/HQQ)
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

**The display name is not an identifier.** `modelName` ("Llama 3.1 8B Instruct") is for humans. It
is not a repo id, not a GGUF filename and not an Ollama tag, and every command that treated it as
one was broken (see the 2026-08-20 changelog entry). Real identifiers come from `hfRepo`, passed in
from `hfRepoMap`.

**`hfRepo` is not always a GGUF repo.** `hfRepoMap` exists to source HF stats, so for 14 of 79
models it points at the original weights (`openai/gpt-oss-20b`). `ggufRepoId()` gates on a `-GGUF`
suffix before any GGUF command uses it; without that gate the fix reintroduces the bug it fixed,
just with a more convincing-looking repo. When no GGUF repo is known the command shows a visible
placeholder — **an obvious placeholder beats a plausible wrong answer**, which is the rule for
vLLM (needs FP16/AWQ/GPTQ weights, not the GGUF repos this site maps) and ExLlamaV2 (per-model
repos, not derivable) too.

**Build flags track llama.cpp, not memory.** The `LLAMA_*` CMake options were renamed to `GGML_*`;
the old names are silently ignored and yield a CPU-only build that looks successful. If you touch
a build command, check it against the flag names used elsewhere in the repo (`GGML_HIP` in the AMD
guide) before trusting the one in front of you.

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
| Add/track a quant format | `lib/data/formats.ts` |
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

### 2026-10-21 (v) — Daily patrol: runtime versions; K2 Horizon family held on `/pending/`

- Runtime (verbatim tag / release lists): llama.cpp **b11769** (b11748 → b11769, all Oct 20); ExLlamaV3
  **1.6.4** (Latest, Oct 20); Ollama v0.40.7 still Pre-release (keeps v0.40.6); vLLM v0.32.0 unchanged.
  `runtimeVersions.checkedAt` → 2026-10-21.
- Gap-audit find: **K2 Horizon** (MBZUAI IFM, 2026-09-03, Apache 2.0, fully open incl. data and logs —
  MBZUAI announcement + press): 0.9B / 3.7B / 7B / 32B / 36B-A4B / 375B-A23B. llama.cpp master has
  `LLM_ARCH_K2_HORIZON` (`src/models/k2-horizon.cpp`: `build_attn_inp_kv()`, a plain per-layer cache —
  no SWA/hybrid; layer-count switch 28 → 1B, 36 + 2560/4096 → 4B/7B, 48 → 36B, 64 → 32B; optional
  attention gate and "value experts"). IFM's own GGUF repo for the 7B lists BF16 … Q4_K_M. The 7B's
  36 layers / 8 KV × 128 come from one third-party reading of its config (a note.com post whose KV
  per-token figure, 147,456 B, matches that shape) — one second-hand source, so not shipped. Added to
  `/pending/` as `awaiting-data`; needs each size's `config.json` + a GGUF listing (owner pull).
- Nothing else new in the 7-day window that is not already indexed or on `/pending/`.

### 2026-10-21 (iv) — Seed-OSS 36B and ERNIE 4.5 21B-A3B from real files (24 GB pages now name one)

- Owner-pulled listings (2026-10-21 08:25 +08, `X-Linked-Size` spot-checked): unsloth + bartowski GGUF for
  Seed-OSS-36B-Instruct and ERNIE-4.5-21B-A3B-**PT** (the index entry's checkpoint — `hfRepoMap` already
  points at `baidu/ERNIE-4.5-21B-A3B-PT`; the -Thinking checkpoint and cyankiwi's Thinking AWQ are not
  this model and were not used), QuantTrio + cyankiwi AWQ repos.
- **Seed-OSS 36B**: both BF16 GGUFs → params 36.0 → **36.16**. bartowski Q4_K_M 4.85 → 4.82, Q3_K_M
  3.87 → 3.90, Q5_K_M 5.68 → 5.66 (unsloth's same levels differ by 512 B). **AWQ INT4: QuantTrio's 8
  shards = 21,135,821,912 B → 4.68 bpw, not the typed 4.0** (4K 19.5 → 23.2 GB: tight on 24 GB). Its
  `speedRTX4090: 55` then exceeded the dense bandwidth gate (ceiling ×1.15 = 54.8) and was removed, not
  adjusted. cyankiwi's "AWQ-4bit" is `compressed-tensors` — not AWQ, not used. Description rewritten:
  Q4_K_M 23.9 GB @4K is tight on 24 GB; Q3_K_M 19.5 GB is the comfortable pick. The 24 GB GPU pages'
  "biggest" row moved from Seed AWQ to Seed Q3_K_M and now names its file.
- **ERNIE 4.5 21B-A3B**: params 21.8 → **21.83**; Q4_K_M from unsloth's file (4.89 bpw; bartowski's is
  168,252,736 B larger), Q8_0 bartowski 8.50. 4K 14.1 → 14.2 GB = 88.75% of 16 GB → just past green:
  **every 16 GB card's comfortable count −1** (64 → 63; Arc A770 / RX 6800 XT class 60 → 59). Guides
  updated in en + zh: AMD ROCm (16GB Radeon 63), Intel Arc (A770 59), 12GB guide (16GB card 63), 4060 Ti
  guide body + FAQ (63).
- Gate: `source` split-name check now accepts `.safetensors` shards. 42 rows carry `source`.

### 2026-10-21 (iii) — Gemma 4 26B-A4B was ~1.7 GB light; Qwen3.6 35B / 27B pinned to files

- Owner-pulled tree listings (2026-10-21 08:05 +08, `X-Linked-Size` spot-checked) for bartowski + unsloth
  GGUF repos of Qwen3.6 35B-A3B, Qwen3.6 27B and Gemma 4 26B-A4B. huggingface.co still returns 000 here.
- **Gemma 4 26B-A4B**: both BF16 GGUFs total 50,505,135,424 / 50,505,137,824 B → params 25.23 → **25.25**
  (the layer count missed ~0.02B). Q8_0 26,859,861,120 → 8.51 (confirms). **Q4_K_M 17,035,039,872 B →
  5.40 bpw, not the generic 4.85**: 4K 16.4 → 18.2 GB, 32K 17.0 → 18.8, 256K 21.8 → 23.6. Verdicts: every
  16 GB card tight → red (tight counts 76 → 75 NVIDIA, 72 → 71 RDNA, 69 → 68 others); RX 7900 XT 20 GB
  green → tight (75 → 74 comfortable); 24 GB still green. 4060 Ti guide "76 load at all" → 75 (en + zh).
  unsloth has no plain Q4_K_M — `UD-Q4_K_M` 16,947,541,728 B is a different file, named in the description.
- **Qwen3.6 35B-A3B**: bartowski BF16 71,065,941,536 B → params 35.59 → **35.53**; unsloth BF16 is
  69,376,638,176 B = 34.69B (same as MiniCPM-V 4.7's backbone) — bartowski's files carry ~0.84B more
  tensors, so each `source` is per-publisher, never mixed. Q4_K_M 5.01 → 5.02, Q8_0 8.50 → 8.51; sizes
  unchanged (23.4 GB @4K, tight on 24 GB). unsloth's UD-Q4_K_M (22,134,528,992 B) named.
- **Qwen3.6 27B**: bartowski BF16 → params 27.41 → **27.33** (unsloth 26.90B); Q4_K_M 5.25 → 5.26, Q5_K_M
  6.12 → 6.14, Q8_0 8.50 → 8.52; sizes unchanged (19.1 / 21.0 GB @4K / 32K).
- `source` (bartowski file + f16 mmproj bytes) on 7 more rows → 36 rows. `sizingChangedAt` → 2026-10-21
  (fit counts moved on 18 cards). No `todayFeed`, guide-figure or comfortable count on 16/24 GB changed.

### 2026-10-21 (ii) — Every size names its file; "not runnable yet" page

- **`QuantVariant.source`** (`lib/data/types.ts`): `{ repo, file?, bytes, parts?, mmprojBytes?, checkedAt }`
  — set only where a repo listing's bytes were read (tree API / CDN), never back-filled from a GiB figure
  or a search snippet. Populated for 29 rows across 13 models from listings recorded in this repo's own
  comments (Gemma 4 31B QAT, Gemma 4 12B, MiniCPM-V 4.7, MiMo-V2.6-Flash, North Mini Code, Granite 4.2
  30B/3B, LFM2.5, Nemotron 3.5 Bolt / Super VL / Lightning, Ling-3.1-flash, Muse Glimmer). `file` is set
  only when the name was read verbatim; the other rows show "file name not recorded". Not set: GiB-only
  figures (GPT-OSS, MiMo-Pro), rows whose repo was not recorded (Granite 4.2 8B, Beam).
- **`sizingBasis(quant)`** (`lib/utils/quant-source.ts`): `file` (has `source`) / `generic` (bpw equals
  `quantBPW` for the level) / `published` (bpw from a file size whose file was not recorded). Derived, so
  a row cannot claim a file it lacks.
- **Gate** (`sourceAndPendingProblems()` in `validate.ts`): `bytes × 8 / params` must land within 0.02 of
  the row's `bpw`; a `…-00001-of-N` file must carry `parts: N`; `checkedAt` ≤ `dataLastUpdated`. Proven by
  perturbation (Gemma 4 31B bytes +1e9 → "implies 4.860 bpw, row says 4.6").
- **Rendering** — one component, `components/hub/QuantFileLine.tsx`: model page (new "Which file each size
  is for" list under the quant table, with the line that a file size is not a memory figure and mmproj is
  in neither number), calculator forward result ("This size is for:"), GPU page summary rows and `/best/`
  picks ("Download:" — only when the pick's row has a `source`). `/data/v1/models.json` gains
  `sizingBasis` and `source` per quant (new fields only).
- **`/pending/` + `/zh/pending/`** (`lib/data/pending.ts`, `components/pending/PendingView.tsx`): 10 entries
  from README §9 patrol notes, each with reason (`no-weights` / `no-runtime` / `not-sized` /
  `awaiting-data` / `community-only`), detail, re-check condition and the date of the note. One page, not
  stub model pages (thin content). Gate: an entry whose id or name is in the index fails the build
  (proven by renaming Kolibri-1 to an indexed name). Linked from the footer (every page), the Hub, the
  changelog and `/llms.txt`; in the sitemap at the latest `checkedAt`.
- Evaluated and declined from the same suggestion: "never give a GB without bytes" (most rows have no
  listing; the basis label is the honest answer), MLX, a leaderboard, dropping the Chinese edition (the
  Cloudflare sample says the zh calculator is the core page — the US/UK/DE skew is the Google AI-answers
  audience only).

### 2026-10-21 — Gemma 4 31B: Google's QAT Q4_0 build

- Owner-pulled tree API sizes (2026-10-21 05:42 +08) for `google/gemma-4-31B-it-qat-q4_0-gguf`
  (created 2026-05-01, Apache 2.0): `gemma-4-31B_q4_0-it.gguf` 17,651,001,568 B (one file),
  `gemma-4-31B-it-mmproj.gguf` 1,200,726,368 B; no `config.json` in the repo.
- New `Q4_0` row on `gemma-4-31b`: 17.651e9 × 8 / 30.70B = 4.60 bpw (generic Q4_0 4.55 — the decoder
  count reconciles). 4K 20.1 GB → green on 24 GB to 16K (21.1), tight from 24K; Q4_K_M (generic) is green
  at 4K only. With the mmproj loaded, 4K is 21.3 / 24 = 88.75% → tight; the description says so.
- No `pplLossPercent`: QAT is trained for this level, but bf16 weights were also released and no
  per-level perplexity was published — not a native-format row like MXFP4.
- `hfRepoMap` unchanged (original weights): the file is named `gemma-4-31B_q4_0-it`, not
  `<repo>-<level>`, so the CLI keeps its placeholder. The Q4_K_M / Q8_0 rows stay generic.
- Fit counts: no comfortable count moved (Q4_K_M was already green at 4K on 24 GB); RX 7900 XT 20 GB tight 86 → 87 (Q4_0 at 100.5%), quoted in no guide. `sizingChangedAt` not bumped — it
  would re-date every derived page for one model's new row.
- A community MLX conversion (`bambocher/gemma-4-31B-it-qat-mlx`) prompted this; MLX stays untracked.

### 2026-10-20 (x) — +2 models (114): MiniCPM-V 4.7 35B-A3B, MiMo-V2.6-Flash

- From the owner's Hugging Face pull (2026-10-20 23:55 +08; `config.json` + tree API byte counts, CDN
  `Content-Length` spot-checked by the owner). huggingface.co is blocked here.
- **MiniCPM-V 4.7 35B-A3B** (`minicpm-v-4-7-35b-a3b`, OpenBMB, Apache 2.0): `minicpmv4_7` = SigLIP
  (27 L, 1152) + `qwen3_5_moe_text` with Qwen3.6 35B-A3B's exact shape (40 L, 10 full + 30 Gated
  DeltaNet, 2 KV × 256, 256 experts / 8, vocab 248144, 262144). Params = OpenBMB F16 GGUF
  69,375,191,008 B / 2 = 34.69B; Q8_0 → 8.51 and Q4_0 → 4.55 bpw confirm it. Levels from the same repo:
  Q4_K_S 4.59 / Q4_K_M 4.88 / Q5_K_M 5.70 / Q8_0 8.51 bpw. 4K: 20.9 / 22.2 / 25.9 / 38.6 GB →
  Q4_K_S green on 24 GB (every 24 GB card's comfortable count +1), Q4_K_M tight; Q4_K_M green on
  32 GB to 256K (27.6). mmproj 1,119,575,840 B is not in the sizes; the description says it makes
  Q4_K_S tight on 24 GB with images. `hfRepoMap` → original weights: the GGUF files are named
  `MiniCPM-V-4_7-…` (underscore), so `<repo>-<level>.gguf` would name a file that does not exist.
  IQ3_M / IQ4_XS / IQ4_NL / Q4_1 / Q5_x / Q6_K files exist but are not filed (IQ levels are not in the
  calculator's tables). Homepage feed id 24.
- **MiMo-V2.6-Flash** (`mimo-v2-6-flash`, Xiaomi, MIT, the -RL checkpoint): 48 L,
  `hybrid_layer_pattern` → 9 full (0, 5, 11 … 47; 4 KV heads) + 39 SWA-128 (8 KV heads); K 192 / V 128
  → `headDim` 160, `fullKvHeads` 4, SWA 768 cells as MiMo-V2.6-Pro (`mimo2`). Params by config
  arithmetic 308.78B (vendor 309B; MTP ships as a separate `mtp-` file). Only ggml-org publishes a
  GGUF (unsloth/bartowski: none): MXFP4 2 parts 167,369,465,152 B → 4.34 bpw (native build, loss 0.0),
  Q2_K 126,365,949,248 B → 3.27. 4K: 175.3 / 132.1 GB → MXFP4 green on M5 Ultra 512, tight on 256;
  Q2_K green on 256, tight on the 192 GB Ultras. 1M window adds ~25 GB.
- **DeepSeek-V4-Flash-0731 not added yet.** llama.cpp `deepseek4` has its own cache
  (`llama-kv-cache-dsv4`): per-layer compressed caches at ratio 4 (with a 128-wide indexer) or 128 plus
  a 128-token window, and `compress_ratios` gives 2 / 21 / 20 layers at 0 / 4 / 128. `ModelArch.attention`
  cannot express that yet, and a new shape needs checking against a published KV measurement first.
  Byte counts kept: ggml-org MXFP4 154,991,539,328 B, Q2_K 117,349,438,592 B, Q2_K_S 98,592,511,104 B.
- Guide counts re-run (`countModelsFitting`, before/after): comfortable +1 on every 24 GB card and above
  (4090/7900 XTX 86 → 87, 5090 90 → 91, Spark 98/102 → 99/103, M3 Max 48G 90 → 91); 16 GB and 12 GB
  unchanged; denominators 112 → 114; Q4_K_M "107 of the 114" (MiMo-Flash ships none); AWQ 53 unchanged.

### 2026-10-20 (ix) — Candidate review from the owner's list (docs only, no model added)

- Owner forwarded a list of ten recent models. llama.cpp master `src/llama-arch.cpp` and transformers'
  `_toctree.yml` were read today; huggingface.co stays blocked, so no config or GGUF listing was reachable.
- Worth adding, waiting on the owner's `config.json` + GGUF byte counts (priority order):
  - **MiniCPM-V-4.7-35B-A3B** (OpenBMB, 10-06): transformers `minicpmv4_7` = SigLIP + Qwen3.5 text
    backbone; llama.cpp has `qwen35moe`. The transformers defaults describe the 1B only, so the 35B's
    layer layout is unknown. Best fit for the 16–24 GB audience.
  - **MiMo-V2.6-Flash-RL** (Xiaomi, 09-21, 309B-A15B, 39 SWA + 9 global per reports): llama.cpp `mimo2`
    (same arch as the indexed V2.6-Pro); GGUF availability reported both ways; KV heads / head_dim unsourced.
  - **DeepSeek-V4-Flash / -0731** (284B-A13B): llama.cpp `deepseek4`, GGUFs exist (unsloth, ggml-org);
    compressed attention (ratios 4 / 128 + indexer) has no `ModelArch.attention` shape yet.
  - GLM-5.3-Flash: the 10-10 skip ("8-GPU class") is stale — size is not the bar; llama.cpp `glm-dsa`
    exists. Same data needed, after the three above.
- Still held: DeepSeek-V4.1-Flash(-1017) (see 10-18 (v)); Hy-Memory-30B-A3B (memory-writer model,
  community GGUFs only); Kolibri-1 (no llama.cpp arch on master); Dory 1.0 4B (support PR not merged);
  Step-5 Preview (official BF16 repo reported empty; llama.cpp `step35` is Step 3.5).
- Side candidate: MiMo-V2.6-Distill-Qwen-9B (bartowski Q4_K_M reported 5.84 GB) — same data needed.

### 2026-10-20 (viii) — AMD ROCm guide re-checked (Google's most-cited page)

- Documentation re-check, not a run (no Radeon here; no `verifiedAt`). Sources read today: llama.cpp
  master `docs/build.md` (HIP section) and `ggml/src/ggml-hip/CMakeLists.txt`; root `CMakeLists.txt`
  `llama_option_depr`; AMD's ROCm Linux system requirements (via search: RX 9070 XT gfx1201 listed,
  7.2.x); Ollama `docs/gpu.mdx` (Linux ROCm list incl. RX 9070/9060, Ryzen AI APUs; "requires the AMD
  ROCm v7 driver"); LLVM `AMDGPUUsage.rst` (gfx1200 = RX 9060 / 9060 XT, gfx1201 = RX 9070 / XT / GRE,
  gfx1151 = Radeon 8060S).
- Still correct, unchanged: `HIPCXX="$(hipconfig -l)/clang" … -DGGML_HIP=ON -DGPU_TARGETS=…`, ROCm ≥ 6.1
  gate, hipcc "legacy" warning, `AMDGPU_TARGETS` forwarded, `LLAMA_HIPBLAS` absent from the deprecation
  table, override not supported on Windows.
- Fixed: the card table had no RDNA 4 (the site lists four RX 9000 rows and vLLM's ROCm list allows
  them) — added RX 9070 family (gfx1201, ROCm 7.x) and RX 9060 family (gfx1200, attributed to Ollama's
  list, not claimed as AMD-official); "Not supported: integrated Radeon graphics" was wrong on two
  counts — Ryzen AI APUs are on Ollama's ROCm list, and llama.cpp documents the override +
  `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1` for other iGPUs (with its warning that it slows discrete cards).
  Prerequisites now say RX 9000 needs ROCm 7.x; `rocminfo` comment lists the new targets; stack line,
  description and `updatedAt` (2026-10-20) follow.

### 2026-10-20 (vii) — Google AI-features data added to the audience notes (docs only)

- Owner's Search Console export "Performance on Search — Generative AI features" (2026-07-18 → 10-17):
  816 impressions; by page `amd-rocm-llamacpp` 482, `quant-hub/qwen3-coder-30b-a3b` 48,
  `docker-ollama-gpu` 47, `m1-8gb-ollama-limits` 37, `8gb-gpu-starter-guide` 22, `/quant-hub/` 20,
  `/zh/cookbook/amd-rocm-llamacpp/` 16; by country US 137, UK 72, DE 64, CA 47 (China 2); desktop
  759 / mobile 52 / tablet 5. Daily impressions step from ~10 to 20–35 around 09-27 (no cause
  claimed). Recorded in CLAUDE.md beside the Cloudflare sample as a second audience; the earlier
  "Google indexing is the open question" reading is corrected — the site is indexed and cited.

### 2026-10-20 (vi) — Gemma 4 12B sized from real GGUF bytes

- Owner-pasted byte counts (tree size = CDN Content-Length): unsloth Q4_K_M 7,121,861,440 /
  Q8_0 12,669,647,680; bartowski Q4_K_M 7,662,533,088 / Q8_0 12,669,647,328.
- Q8_0 over the 11.91B decoder counted on 10-19 is exactly 8.51 bpw, so the main GGUF holds the
  decoder only: `params` 11.95 → 11.91 (the ~0.04B patch/audio embedders are the separate mmproj).
  Q4_K_M 4.85 (generic) → 4.78 from unsloth's file; bartowski's Q4_K_M is a different, larger file
  (5.15 bpw, +0.54 GB) — the description says so rather than averaging.
- `hfRepoMap` → `unsloth/gemma-4-12b-it-GGUF`: its filenames are `gemma-4-12b-it-<level>.gguf`, so
  the CLI now names the file instead of printing a placeholder.
- Q4_K_M @32K 8.64 → 8.50 GB, @128K 10.29 → 10.15. Re-ran `countModelsFitting()` over all 82 rows:
  no comfortable or tight count moved, so no guide numbers change.

### 2026-10-20 (v) — CLAUDE.md audience section rewritten from real traffic (docs only)

- Owner-supplied Cloudflare Web Analytics for 2026-10-11 → 10-18 (716 visits / 2,323 views) replace
  the 2026-08-08 "who shows up" hypothesis, which rested on single-digit volume and put
  non-standard-hardware guides on top. New reading: `/zh/tools/vram-calc/` ~36% of views, Bing China
  the main search source (cn.bing.com 190 of ~230), Google ~10, China ~350 visits, Windows desktop
  dominant, mobile deeper per visit. Choosing rule added: prefer the Chinese calculator path and
  16–24 GB Windows-card readers; a `/zh` bug outranks an equivalent English one.
- Open caveat recorded with it: ~17 views per visit on the zh calculator may be address-bar rewrites
  counted as views (unverified); the Singapore share likely includes the owner's own testing.

### 2026-10-20 (iv) — +1 model (112): North Mini Code 1.0 30B-A3B

- From the owner's paste of `CohereLabs/North-Mini-Code-1.0` (config.json, safetensors index,
  bartowski/unsloth file trees; huggingface.co is blocked here). Architecture `Cohere2MoeForCausalLM`
  → llama.cpp `cohere2moe` (PR #24260, merged 2026-06-13; the unsloth card's "not in stock llama.cpp"
  line is stale). `src/models/cohere2moe.cpp` @ b11748: `build_attn_inp_kv_iswa`, SWA standard.
- Shape: 49 layers, `layer_types` 13 full + 36 sliding (window 4096 → 4608 cells), 32 heads / 4 KV ×
  128, hidden 2048, 128 experts top-8 × 768, 1 dense lead layer × 3072, vocab 262,144. Context
  262144 from the model card ("256K"); config says 500000 — the description states both.
- params 30,484,303,872 = safetensors `total_parameters` = bartowski GGUF `total`; recount from the
  config ≈ 30.49B (experts 29.0B + attention 0.92B + embedding 0.54B). Active ~3.3B by the same count;
  the label keeps the vendor's A3B and no `activeParams` is typed (vendor-stated only).
- bpw from bartowski byte counts: Q3_K_M 3.73 (14,209,048,128), Q4_K_M 4.92 (18,744,024,640),
  Q8_0 8.51 (32,437,263,936); BF16 16.01 closes the chain. `hfRepoMap` → `bartowski/…-GGUF`, whose
  filenames are `<repo base>-<level>.gguf`, so the CLI names files directly (all < `SHARD_GB`).
- Sizes (`calcVRAM`): Q4_K_M 20.0 / 20.8 / 23.5 / 27.1 GB at 4K / 32K / 128K / 256K; Q3_K_M 15.3 @4K.
  Comfortable count +1 on every ≥ 20 GB card and ≥ 24 GB Mac; 16 GB cards tight +1 only (Q3_K_M at
  95%). Guide numbers re-run with `countModelsFitting()`: RX 7900 XTX 85 → 86, RTX 5090 89 → 90,
  RTX 4090 85 → 86, DGX Spark 97 → 98 / 101 → 102, M3 Max 48G 89 → 90, 16 GB "load at all"
  75 → 76; 12 GB / B580 / A770 / B570 / A750 unchanged; denominators 111 → 112; Q4_K_M ships
  "106 of the 112".

### 2026-10-20 (iii) — Runtime versions; North Mini Code waiting on its config

- llama.cpp b11748 (verbatim tag list). Ollama: v0.40.7 is still Pre-release (Latest v0.40.6);
  vLLM v0.32.0 and ExLlamaV3 v1.6.3 unchanged. No new open model in the 7-day window.
- **Cohere North Mini Code 1.0** (June, 30B-A3B coding MoE, Apache 2.0) — the gap-audit candidate
  from 10-19. llama.cpp master now has `LLM_ARCH_COHERE2MOE` (`cohere2moe`), and unsloth /
  bartowski / mradermacher GGUFs exist, so it is runnable. Not added: the transformers
  `configuration_cohere2_moe.py` defaults describe Command A+ (40 L, hidden 8192), not this model;
  secondary snippets of its `config.json` give 49 layers, 32 heads / 4 KV, every 4th layer full, but
  `sliding_window`, `head_dim`, `hidden_size` and the prefix-dense pattern are not reachable here
  (huggingface.co and ollama.com blocked), nor any GGUF byte count. Asked the owner for
  `config.json` + Q4_K_M / Q8_0 file sizes.

### 2026-10-20 (ii) — Public JSON: `/data/v1/models.json`, `/data/v1/gpus.json`

- New `lib/utils/data-export.ts` + two `force-static` route handlers under `app/data/v1/` (same
  pattern as `/llms.txt`): generated from `models` / `gpuDatabase` at build, so they cannot drift.
  114 KB / 22 KB, 111 models / 82 rows (incl. the 4 CPU RAM rows, flagged `cpuOnly`).
- Each file carries `license` (CC BY 4.0), `attribution`, `termsUrl`, `dataLastUpdated`, `count`,
  and a `notes` block defining every non-obvious field. Models: id, name, family, `paramsB`,
  `activeParamsB` (MoE only, via `activeParamsB()`), context, categories, status/supersededBy,
  `addedToIndex`, the `arch` fields the KV arithmetic reads (attention note text dropped),
  `referenceLevel` (`referenceQuant`), per-quant `bpw`, `weightsGB` = params × bpw / 8 (recomputed,
  not the typed `vramGB`), `confidence` (`quantConfidence`), `pplLossPercent` only where published,
  page `url` and a `calculatorUrl`. GPUs: type, `backend`, `vramGB`, `usableGB`
  (`usableCapacityGB`), `tightCeiling`, bandwidth/memType where stated, page `url` (all 193 URLs
  checked to exist in `out/`).
- Deliberately absent: `speedRTX4090` (mostly unmeasured; a bare number loses the Estimated tag).
- Linked from `/llms.txt`, `/benchmarks/` (plain `<a>` in both languages — one file, not a `/zh`
  route; the leak gate accepts it) and `/legal/` §10 (new sentence, page date → 2026-10-20, sitemap
  `LEGAL_LASTMOD` likewise). Not in the sitemap. `v1` = add fields, never rename or repurpose.

### 2026-10-20 — Compare tool: long context, Mac capacity, reference build

From an outside review (docx). Checked each claim against `out/` before acting:
- **Not reproduced:** "102 / 108 / 110 / 111 models on different pages" — every page in the export
  says 111 (home, Hub, `/about/`, both languages); the four figures match four past ship dates, so
  the reviewer's reader was serving snapshots of different ages. "Compare dropdown misses the
  October models" — `groupedModels()` covers all 111 and the exported `<select>` has Gemma 4 12B,
  Beam, Ling. "Footer Tools shows 4 items on some pages" — `/tools/feel/` is linked from every page
  checked (benchmarks, compare, wizard, zh home, cookbook).
- **Real, fixed (`lib/utils/compare.ts`, `components/tools/ModelCompare.tsx`):**
  - Context chips were 2K–16K, which hides exactly what the index's hybrid/MLA/SWA entries are
    about; now 4K / 8K / 32K / 128K / 256K (`aria-pressed` added). A side asked for more than its
    `contextLength` prints "beyond its N window" (zh too) and takes no winner — never a size past
    the window.
  - Found while there: the "fits your card" row called `getVerdict(est, gpu.vram)` — nameplate
    capacity, default tight ceiling, no format check. A 16 GB Mac judged Gemma 4 12B @256K (12.5 GB)
    green at 78%; it is 104% of the 12 GB usable — amber. Now `usableCapacityGB` + `tightCeiling` +
    `formatAllowed`, and the label names the usable figure. The caller duplicated the computation
    instead of calling the shared helpers — the pattern CLAUDE.md warns about.
  - `q4Quant()` was "Q4_K_M or `quants[0]`" under a label saying Q4_K_M — 8 models ship no Q4_K_M
    (Lightning Q4_0, Beam Q2_K…). Now `referenceQuant()`, with the level printed beside each size;
    the calculator links carry `quantLevelKey(referenceQuant)` instead of a hard `Q4_K_M`.
- **Declined:** EXL3 / MLX formats (0 models ship them here — the HQQ rule); GitHub benchmark
  intake (no public repo); CI that writes Hugging Face metadata into the data (unreviewed figures
  in the index); WebGPU GPU auto-detect (`GPUAdapterInfo` exposes vendor/architecture, not the
  card model or memory size, so it cannot pick a row honestly). A static JSON export of the CC BY
  data and community outreach are reasonable but the owner's call.

### 2026-10-19 (iii) — `/zh` Hub filters navigated to the English Hub

- **Bug (reader-reported, confirmed in a browser):** `QuantHubContent`'s `syncUrl` and `clearAll`
  called `router.replace('/quant-hub/?…')`. On `/zh/quant-hub/` that is a client navigation to the
  English route, and since language comes from the URL, any GPU chip, size, category or format
  filter flipped the page to English. The postbuild leak gate cannot see it — it reads hrefs in the
  exported HTML, and this is a runtime `router` call. Now both go through `localizeHref(…, lang)`.
  Re-tested: zh chip click → `/zh/quant-hub/?gpu=rtx4090`, `lang="zh-Hans"`; clear → `/zh/quant-hub/`;
  English unchanged. The other address-bar writers (calculator, compare, feel) already use
  `window.location.pathname`.
- **Model cards:** the speed box label is now `tok/s · 4090` (it is `speedRTX4090`; the only basis
  was a 10 px line above the stats, easy to read as the reader's own card). That line is now 11 px
  `slate-500`. Hardware tags are `hidden sm:flex` — near-identical on most cards; card height at
  390 px 369 → ~333.
- Not done from the same report: it described an existing "fits perfectly · N GB left" badge on
  Hub cards that appears only with `?gpu=` — no such badge exists in `ModelCard` or the exported
  HTML (checked with and without `?gpu=`). Its stacked-bar and mobile sticky-bar items were already
  shipped (10-19 (ii), 10-13).

### 2026-10-19 (ii) — Calculator: stacked memory bar

- New `components/tools/VramStackBar.tsx` under the forward result's breakdown rows: weights | KV |
  activations (| vision encoder) | free, scaled to `capacityGB(gpu, cards, extra)` — the same rig
  capacity the verdict uses (Macs at their 75% usable figure). Colours match the rows' icons, so the
  rows are the legend. Dashed tick at 88% = `getVerdict`'s green bound; overflow past the card is
  hatched, amber and worded as a spill to system RAM while total / capacity ≤ `tightCeiling(gpu)`,
  red and "over" beyond it (DGX Spark / Macs pass 1.0, so they never "spill").
- No card → composition only, scaled to the total, no "free" claim; a card whose backend cannot load
  the format (`rigFormatAllowed`) → composition only and says so, instead of a capacity it cannot use.
- `role="img"` + an `aria-label` listing every segment and the summary sentence. Checked in a browser:
  6 cases (green, tight-spill, red, Mac zh, no card, AWQ on a Mac), 390 px iframe scrollWidth 390,
  no console errors. Prompted by an outside suggestion list; the other items were already shipped
  or conflict with existing rules (no GitHub benchmark intake, no "sweet spot" badge, no service
  worker caching changing data).

### 2026-10-19 — +1 model (111): Gemma 4 12B (gap audit) · llama.cpp b11721 · vLLM v0.32.0

- **Gemma 4 12B Unified** (Google, released 2026-06-03, Apache 2.0) was never indexed: every daily
  patrol looks back ~7 days and it shipped in June. Found by the gap audit against current buying
  guides (it is the "runs on 16 GB" Gemma 4 most of them recommend).
- **Shape** from transformers `models/gemma4_unified/convert_gemma4_unified_weights.py`
  `_VARIANTS["gemma-4-12b"]` — the configuration file's defaults (hidden 2304, 30 layers) describe a
  small reference checkpoint, not the 12B. Hidden 3840, intermediate 15360, 48 layers =
  `["sliding_attention"] * 5 + ["full_attention"]` × 8, 16 heads, 8 KV × 256 on the sliding layers,
  `num_global_key_value_heads=1` × `global_head_dim` 512 on the full layers (`attention_k_eq_v`),
  window 1024 → 1536 cells (pad256(1024 + 512)), tied 262,144 vocab, `max_position_embeddings`
  262144.
- **Params 11.95B**, counted: embedding 1.007B + 40 sliding layers × 224.1M + 8 full × 241.8M =
  11.91B, plus ~0.04B of patch / audio embedders (no separate encoders — that is the "Unified") =
  the published 11.95B.
- **llama.cpp path checked in source:** `conversion/gemma.py` registers
  `Gemma4UnifiedForConditionalGeneration` as the existing `gemma4` arch; `src/models/gemma4.cpp`
  reuses K as V when a layer has no `v_proj` but still writes both to the cache, so the full layers
  are sized K + V, the same as the 31B. A community GGUF repo (unsloth) exists per search; no file
  byte count was reachable (huggingface.co blocked), so both rows use the generic bpw, `estimated`.
- **Sizes (`calcVRAM`, Q4_K_M):** 8.15 GB @4K, 8.64 @32K, 10.29 @128K, 12.49 @256K — green on every
  ≥ 10 GB discrete card and ≥ 16 GB Mac, tight (not comfortable) on 8 GB cards, red on 8 GB Macs;
  12 GB tight only at the full window. Q8_0 13.85 @4K (16 GB green at 4K, tight from 32K).
- **Guide counts re-run with `countModelsFitting()`:** every green card's comfortable count +1 and
  its tight count +1; 8 GB cards' tight count +1 only (no guide quotes it). Updated: RX 7900 XTX
  84 → 85, 16 GB 63 → 64 (and 74 → 75 load), 12 GB / B580 56 → 57 (58 → 59 load), A770 59 → 60,
  B570 48 → 49, RTX 5090 88 → 89, RTX 4090 84 → 85, DGX Spark 96 → 97 / 100 → 101, M3 Max 48G
  88 → 89; Q4_K_M "104 of the 110" → "105 of the 111"; AWQ 53 and EXL2 21 unchanged.
- **Runtimes:** llama.cpp b11721 (verbatim tag list); vLLM v0.32.0 (Latest, 10-18): "Python 3.10 is
  no longer supported; the minimum is Python 3.11" — every install snippet here already creates a
  3.12 venv; "Default CORS origins changed from `*` to none; set `--allowed-origins` for browser
  clients" — no command on this site depends on browser CORS. Ollama v0.40.7-rc0 skipped
  (pre-release); ExLlamaV3 still 1.6.3.
- **Not added:** Cohere North Mini Code (June, 30B-A3B coding MoE, Apache 2.0) — the other gap-audit
  find; its architecture and llama.cpp support are not checked yet, next patrol.

### 2026-10-18 (vi) — Muse Spark Open: licence terms on the model page

The owner forwarded a video summary (Skill MD). Checked against the index, its specs all agree: 816B / 256 experts / 8 active (~42B), 1M context, Muse Model License. Its "700 GB for NVFP4" is the NVFP4 checkpoint (~493 GB per The New Stack) plus inference workspace. That is a format this index does not track; the page sizes ggml-org's Q2_K GGUF, which needs ~319 GB at 4K and runs on one 512 GB Mac Studio.

Added to both descriptions, the three licence terms that multiple write-ups agree on (The New Stack, noze.it, orcarouter):
- the Hub repo is gated;
- products must show "Built with Muse Spark Open";
- companies with >$20M annual revenue need a separate agreement with Meta to offer it as a service.

Not added: the video's "18+ and identity verification" (no second source); benchmark figures and API-provider lists (outside the index).

### 2026-10-18 (v) — DeepSeek-V4.1-Flash-1017 checked and held back (docs only)

DeepSeek released V4.1-Flash-1017 on 10-17 (MIT, `deepseek-ai/DeepSeek-V4.1-Flash-1017`). The owner pulled the HF data, since huggingface.co is blocked here: the full `config.json`, `model.safetensors.index.json` and the API dtype breakdown, captured 2026-10-18 11:56 UTC. It is held back for three independent reasons. The earlier skips (10-06, 10-10: "config unreachable") no longer apply; these do.

**Re-check condition:** a GGUF exists *and* llama.cpp ships `deepseek_v41`. The config is already in hand, so only the GGUF file listing (paths + byte sizes) is needed then.

1. **No runtime.** `model_type` is `deepseek_v41` (`DeepseekV41ForCausalLM`), a new architecture, not the `deepseek4` that llama.cpp supports.
   - `convert_hf_to_gguf.py` only knows `DeepseekV4ForCausalLM`.
   - `src/models/deepseek4.cpp` throws on any compression ratio other than 0 / 4 / 128, while V4.1's `compress_ratios` use 0 / 1 / 2: 2 on layers 2–19, 1 on layers 20–39, 0 on layers 0–1 and the last three entries.
   - V4.1 also adds cross-layer KV sharing (`kv_source_layer_ids` 2/8/14/20), two engram lookup tables (`engram_num_embeddings` 384,006,168 / 384,016,682, layers 1 and 14) and three DSpark draft layers. All of these change memory sizing and none are in llama.cpp.
2. **No GGUF.** ggml-org and bartowski have only V4-Flash / V4-Flash-0731. `unsloth/DeepSeek-V4.1-Flash-1017-GGUF` exists but is empty (`usedStorage` 0, only README + .gitattributes; README: "WIP - quants and implementation will be posted soon").
3. **Sizes do not reconcile.** The API dtype counts (BF16 1.98B, F32 0.04B, F8_E4M3 204.0B, I8 557.2B; total 763.2B) come to ~765 GB, while `total_size` is 510.3 GB. The quant config says FP8 with `expert_dtype: fp4`, so the I8 count may be packed FP4 or may include the engram tables. Which it is decides both `params` and what is VRAM (cf. the lazily-read Qwen3.8-Flash-Next table), so nothing is entered until it is known.

Shape recorded for that day:
- 40 layers, hidden 5120, 64 heads, one shared KV head × 512 (rope 64), q_lora 1280, o_lora 1024 × 8 groups.
- 384 routed experts of 2304, 6 per token + 1 shared.
- sliding window 128; indexer 32 × 128, top-k 512.
- vocab 129280, 1,048,576 positions (YaRN ×16 over 65536).
- A vision tower: 32 layers, hidden 1024.

### 2026-10-18 (iv) — Measured speeds matched to the wrong model

`speedQuote()` matched matrix rows to models with a substring test (`stripped.includes(row)`). As a result "Nous Hermes 3 Llama 3.1 8B" took all five Llama 3.1 8B runs as **measured**: RTX 4090 GGUF 148 / EXL2 235, RTX 3090 EXL2 175, M3 Max 68, M2 Ultra 90. That is a different fine-tune that was never run here — the "match model before attributing a figure" rule.

A row now matches only the same normalised name, with a trailing "Instruct" dropped, or an entry in `ROW_ALIASES`. The table's one abbreviated row, `R1-Distill-Llama-8B` → DeepSeek-R1-Distill-Llama-8B, is listed there. Swept every card × model × level: the 15 remaining measured attributions are exactly the matrix rows. Hermes 3 falls back to the calibrated range or the ceiling. Calculator sweep (82,012 cases) and `check-measured-speed` unchanged.

### 2026-10-18 (iii) — `/tools/feel/` prerenders its tool

`SpeedFeel` read its URL with `useSearchParams()`, so in the static export the whole tool was its Suspense fallback ("Loading...") until the bundle ran — the CLAUDE.md `useSearchParams()` rule. It now uses `useUrlQuery()`: state starts on the defaults (RTX 4060 Ti 16G vs RTX 4090, Llama 3.1 8B Q4_K_M, 128), the query is applied after mount with unknown ids ignored, and the address-bar sync waits until the arriving query has been read (otherwise the defaults would overwrite an incoming link). URL sync is `history.replaceState`, like the calculator and compare tool, instead of `router.replace`. The page's `<Suspense>` wrapper is gone.

### 2026-10-18 (ii) — Speed player wired into the calculator and GPU pages

Owner asked to take two ideas from llmspeed.dev, which pitches itself as "test local LLM speed before buying" (the site itself is unreachable from here; known only from third-party write-ups).

- **Calculator.** Each forward result gets a link to `/tools/feel/` carrying `model`, `quant` (`FORMAT:LEVEL`, the key SpeedFeel reads), `left` (the reader's card) and `ctx`. The calculator context is snapped down to the tool's 128 / 4K / 32K by `feelContext()`. The link appears only when `streamTokS(speedQuote(...))` is defined on the reader's card; with no card picked it opens on the tool's defaults. On an RTX 4090 the right-hand card is the RTX 5090, because the tool's default right card is the 4090 itself.
- **GPU pages, same-budget block.** Up to three "{card} vs {sibling} ({model})" links.
- **GPU pages, step-up block.** One link: this card vs `nextStepUp()`'s card.
- **Model choice.** `playablePick(cards, fits, 4096)` takes the largest comfortably-fitting model on this page that streams on both cards. If none does (no tg128 row and no matrix measurement on one side), no link: a comparison of two bandwidth ceilings has nothing to play, and the tool deliberately does not animate a ceiling.
- **New helpers** in `lib/utils/speed-label.ts`: `feelContext`, `playablePick`, `feelHref`.

### 2026-10-18 — Runtime versions (daily patrol, run at 09:12 at the owner's request)

- **llama.cpp b11716**, from the verbatim tag list.
- **Ollama v0.40.6**, now Latest. Its notes: Windows orphaned-runner fix, and the `q2_0` GGUF tensor/file type; v0.40.7-rc0 is a pre-release and was skipped.
- **ExLlamaV3 1.6.3**, Latest on the releases page.
- **vLLM v0.31.0**, unchanged.
- **No model added.** The only new candidate, IBM's **Granite Switch 4.1** (10-15: Granite 4.1 8B/30B base + Decision/Guardian aLoRA + Granite Speech encoder behind one endpoint), lists transformers + vLLM and no GGUF, and the index already carries the newer Granite 4.2. Still pending: Mistral Large 4 (weights promised by month end) and Nemotron 3.5 Bolt E4B (due 10-23).
- **Build fix.** Owner commit `3d7bcc9` (per-card speed column, `/tools/feel/`) was pushed straight to main, and its build fails the postbuild description floor. The `/zh/tools/feel/` meta description is 90 width against the 100 minimum, so that deploy cannot have gone out. The Chinese description is now extended with what the tool actually does, side by side at each card's rate (the tool's own summary). The English route had no metadata at all (a client page) and inherited the site-wide default description; it now gets a `layout.tsx` with its own title and description, the same pattern as `/tools/vram-calc/`.

### 2026-10-17 (iv) — Calculator check; split-file download commands

The owner asked for a check of the calculator. Results:

- **Sweep:** 82,012 card × model × level × card-count cases through `levelTable` / `contextReach` / `offloadPlan` / `speedCeiling`, 0 faults. `check-measured-speed` still passes (9 rows, 0.99–1.31×).
- **Browser:** the browser scripts (forward / reverse / fine-tune / HF import / mixed rig / prefill / pin / launch / share card) all pass, with no console errors and a 390 px width.
- **Newest models in forward mode:** chips, sizes and download figures match their model pages for all eight: Ling, Beam, Lightning, Bolt, Granite 30B / 3B, Super VL and Muse. Bolt on a 24 GB card gets `-ngl 87`, which is correct: launch commands keep llama.cpp's 1 GiB-per-card margin, and 23.1 GB is over 24 − 1.

**Real bug: big builds downloaded nothing.** The llama.cpp command asked `hf download --include` for the exact `<repo>-<level>.gguf`. That is right for single files. Past ~50 GB, though, bartowski and unsloth split builds into `…-00001-of-0000N.gguf` parts, usually in a per-level folder, so the include matched nothing and `hf download` exited 0 having fetched nothing (llama.cpp then failed on a missing `-m`). The existing "point -m at the first shard" note could not help, because there was nothing to point at. The search-result evidence is that >50 GB builds are split; ggml-org, on the other hand, ships 70–130 GB single files (the owner's Super VL listing).

The fix in `lib/utils/cli.ts`:
- New `SHARD_GB = 48` and `ggufFileGB(model, level)`, which is params × bpw / 8, the calculator's download figure.
- Above the threshold, the download includes `*<base>-<level>*.gguf`, which matches a single file or its parts in any folder.
- `-m` resolves the first part with `find … | sort | head -1`, natively and (host-side) for Docker. Compose cannot run a shell, so it gets a visible `<first part: …-00001-of-NNNNN.gguf, or the single file>` placeholder.
- Smaller builds keep the exact filename.
- Affected: 11 mapped models at their larger levels (Llama 3.1 405B / 70B Q5_K_M, Llama 3.3 70B Q5_K_M, Qwen2.5 72B Q5_K_M, Llama 3.2 90B Vision, DBRX, Llama 4 Scout / Maverick, Qwen3 235B, Super VL, Ling).

**Ling-3.1-flash** now maps to its original weights (`inclusionAI/Ling-3.1-flash`). AtomicChat's files are named `AD-<level>` (Grok's own entry says so), so `<repo>-<level>` produced a filename that does not exist. The command now shows the placeholder and the "replace the repo and filename" note, as Beam and Muse already do.

**Not changed, unverified from here:**
- Qwen's official GGUF repos (`Qwen/Qwen2.5-*-GGUF`) are believed to use lowercase filenames, which a case-sensitive `--include` would miss.
- Whether Ollama's `hf.co/` pull handles split GGUFs.

Both need a real file listing; huggingface.co is blocked here.

### 2026-10-17 (iii) — +1 model (110): Beam 1.0 501B-A23B (Grok Bot model tracker, PR #10, updated onto main after #8)

Reflection AI published Beam's weights on 2026-10-16 under Apache 2.0 (waitlist-only when announced
10-05), so the morning patrol's "weights not out" was already stale. Read directly from huggingface.co:

- **Shape** (official `config.json`, `BeamForCausalLM`): hidden 5120, 52 layers, 48 heads / 8 KV × 128;
  `layer_types` makes every 6th layer full attention plus the last one → 9 full (NoPE) + 43 sliding,
  window 512; 3 leading dense layers (SwiGLU 20480), then 49 MoE layers with 256 experts of width 2560,
  8 per token (8 groups, top-4), no shared expert; per-layer attention gate (5120 × 6144); vocab 151936
  untied; 1,048,576 positions. Counted ≈501.3B / ≈22.7B active (card: 501B / 23B).
- **params** 501,267,612,352 = the Hub's safetensors total, and exactly the sum of the tensor headers
  in unsloth's 23-part BF16 GGUF.
- **Cache**: llama.cpp `beam` is on master (`src/models/beam.cpp`, iSWA, `LLAMA_SWA_TYPE_STANDARD`), so a
  window layer holds pad256(512 + 512) = 1024 cells, as for Muse Spark.
- **bpw** from file bytes: DevQuasar Q2_K (14 parts) 182,067,737,056 B → 2.91; unsloth Q8_0 (13 parts)
  532,794,735,998 B → 8.50 (on 8.5, so the count holds). Q2_K 190.9 GB @4K, 195.7 @128K, 230.3 @1M:
  green on the M5 Ultra 512G at every context, yellow on the 256G to 128K. Q8_0 556.9 GB fits nothing.
- **No 4-bit level**: unsloth ships only UD-* tiers (UD-Q4_K_XL 306,533,349,412 B → 4.89, ≈321 GB @4K),
  which is not Q4_K_M, so it is mentioned in the description and not filed as a level.
- `hfRepoMap` points at the original weights: every Beam GGUF is a multi-part file in a per-level folder.
- **Guide counts** (re-run with `countModelsFitting()` on top of main incl. Ling-3.1-flash, 109 → 110):
  only the M5 Ultras change (512G 104→105 comfortable / 108→109 tight, 256G 101→102 tight), which no
  guide quotes; denominators 109 → 110, and "ships Q4_K_M" is now 104 of 110 (Beam ships Q2_K / Q8_0).
  Homepage feed `todayFeed` id 21 (20 = Ling). Duplicate check before merge (owner request): no Beam /
  Reflection AI model on main or the live site under any id, name or HF repo; not in PR #8 or #9.
- Seen and held back: NVIDIA Nemotron-Labs Dory1.0-4B (10-16, looped nGPT; llama.cpp support is still
  an open PR, ggml-org/llama.cpp#30306), Tencent Hy-Memory-30B-A3B (10-15, a memory-writer model,
  community GGUFs only).

### 2026-10-17 (ii) — +1 model (109): Ling-3.1-flash (PR #8, updated onto main)

- **Model tracker (Grok Bot), draft PR:** inclusionAI (Ant Group) released **Ling-3.1-flash** weights on
  2026-10-13 (MIT). The morning patrol's "no open-weight release on 10-13/10-14" missed it; it is
  datacenter-sized, listed like MiMo-V2.6-Pro / DeepSeek-V3 so the calculator can say where it runs.
- **Shape read from the official `config.json`** (huggingface.co, 2026-10-15): `BailingMoeV3ForCausalLM`,
  `model_type` `bailing_hybrid` (llama.cpp `bailingmoe3`, b11571+ per AtomicChat's GGUF card). 72 layers:
  63 KDA (Kimi Delta Attention, fixed-size recurrent state) + 9 gated MLA, one per `layer_group_size` 8
  (layers 7, 15 … 71 carry `g_proj`) — the card's "63 KDA + 9 Gated MLA (7:1)". Hidden 4096, 64 heads;
  MLA `kv_lora_rank` 512 + `qk_rope_head_dim` 64 → `kvHeads 1 × headDim 288` as for DeepSeek-V3 / Kimi
  Linear, `attention.fullLayers: 9` (≈ 10 KB/token, matching AtomicChat's "about 10 KB per token").
  512 experts top-8 + 1 shared, first 4 layers dense; vocab 157184.
- **Context 262144** = `max_position_embeddings`, `rope_scaling: null`, and the GGUF's `context_length`.
  The card says "1M-token context window" without a scaling recipe; the description says so.
- `params` 563.95 = the GGUF's own tensor total (563,946,483,520). The Hub's safetensors total
  (572,120,680,768) includes the MTP layer 72, which the GGUF does not carry; card: 560B / 25B active.
- Q4_K_M 5.03 / Q8_0 8.52 bpw from AtomicChat's "AD" (dynamic) GGUF byte counts (354,394,733,920 /
  600,847,449,760); experts at the named type, attention/shared expert/router at q8_0 or higher. Both
  `estimated`; AtomicChat publishes KL divergence (0.01114 / 0.00503), not perplexity → no loss figure.
- Sizes: Q4_K_M 370.6 GB @4K, 370.9 @32K, 373.3 @256K; Q8_0 627.6 @4K. Red on every card in the index;
  tight (amber) on the M5 Ultra 512 (384 GB usable). Guide counts re-run with `countModelsFitting()` on
  top of main (108 → 109): no comfortable count moved; M5 Ultra 512 tight 107 → 108 (not quoted in any
  guide); every "of the 108" → "of the 109"; Q4_K_M coverage "103 of the 108" → "104 of the 109" (AWQ
  53 and the 79-model loss median unchanged). Added to the homepage feed (`todayFeed` id 20; id 18 was
  taken by Nemotron Bolt on main); `addedAt` / changelog date 2026-10-17, the day it ships. HF stats map
  to `AtomicChat/Ling-3.1-flash-GGUF`.
- **Duplicate check before merge (owner request):** no Ling / inclusionAI / bailing model on main or the
  live site under any id or name; not in PR #9 or #10.

### 2026-10-17 — Runtime versions (daily patrol)

- llama.cpp b11703 (verbatim tag list; v0.7.0 is still the Latest release). Ollama is still v0.40.5 Latest; v0.40.6-rc1 is a pre-release and was skipped. vLLM v0.31.0 and ExLlamaV3 1.6.2 are unchanged.
- No model added. Every open-weight release from the last ~7 days is already indexed: Muse Spark Open, Mellum2.1, the Nemotron 3.5 family and Granite 4.2.
  - Kolibri-1 is still waiting for a ggml-org or bartowski GGUF.
  - Still pending: Mistral Large 4 and Reflection Beam (weights not out), and Nemotron 3.5 Bolt E4B (due 10-23).
- No new consumer card found.

### 2026-10-16 (iv) — +3 models (108): Granite 4.2 30B, Granite 4.2 3B, Nemotron 3.5 Lightning 30B-A3B

The owner pasted the official `config.json`s and HF tree-API byte sizes for the candidates the patrols
had held back (huggingface.co is blocked here).

- **Granite 4.2 30B / 3B**: dense `GraniteForCausalLM`, no `layer_types`. The 30B has 64 layers, 32/8 heads × 128 and SwiGLU 32768. The 3B has 40 layers, 40/8 heads × 64 and SwiGLU 8192. Both use a 100352 vocab, untied. Counted from config: 29.277B / 3.660B, against IBM's BF16 GGUFs at 29.279B / 3.662B. bpw comes from IBM's own GGUF repo:
  - 30B: Q4_K_M 4.84, Q5_K_M 5.68, Q6_K 6.56, Q8_0 8.50.
  - 3B: Q4_K_M 4.90, Q5_K_M 5.71, Q8_0 8.50.

  30B Q4_K_M is 19.6 GB at 4K: comfortable on 24 GB to 8K, tight at 16K. 3B Q4_K_M is 2.7 GB. `hfRepoMap` points at IBM's `-GGUF` repos, whose filenames match what the CLI builds.
- **Nemotron 3.5 Lightning 30B-A3B**: `nemotron_h`, text only. 52 layers = 23 mamba + 23 moe + 6 attention, 2 KV × 128; 128 experts top-6 plus one shared expert. Counted 31.58B total / ~3.2B active, against ggml-org's BF16 GGUF at 31.59B. Q4_0 4.79 / Q8_0 8.51 bpw. Q4_0 is 19.8 GB at 4K and 20.6 GB at 128K: comfortable on 24 GB, tight only at the full 256K. The MTP draft file ships separately and is not in `params`.
- **Kolibri-1 still skipped**: only a community GGUF exists, and it needs a patched llama.cpp (`kolibri1`).
- **Guide counts**: cards with ≥24 GB gain 3 and smaller cards gain 1; the RX 7900 XT gains 1 comfortable / 3 tight. Updated: 7900 XTX 84, 16 GB 63, 12 GB 56/58, B580 56, A770 59 / B570 48 / A750 40, 4060 Ti 63/74, 5090 88 vs 4090 84, Spark 96/100, M3 Max 48 88.
- **Fixed in passing**:
  - The quantize guide said every GGUF model ships Q4_K_M; that has been false since MiMo, and is now 103 of 108.
  - The calculator's size-class intro now names the 4-bit fallback `referenceQuant` already used.
  - `todayFeed` had two entries with `id: 17`, which collided as React keys.
  - Model-page FAQ called a Q4_0 / Q4_K_S reference "the level most people run". That wording is now kept for Q4_K_M or native builds; otherwise it says the page is sized at that 4-bit build. Affects Super VL and Lightning.

### 2026-10-16 (iii) — +2 models (105): Nemotron 3.5 Bolt 74B-A9B, Super VL 120B-A12B

Unblocked by the owner, who read huggingface.co (blocked here) and pasted both official BF16
`config.json` files plus GGUF tree-API byte counts (CDN `Content-Length` spot-checked on their side).
- **Super VL** (`NemotronHForCausalLM`): 88 layers = 40 mamba / 40 moe / 8 attention, 2 KV × 128,
  512 experts × 2688 at a 1024 latent, 22 per token, 1 shared 5376, vocab 131072 untied, 1M context.
  Counted from the config: 120.67B total / 12.2B active; ggml-org BF16 GGUF 241,518,661,568 B =
  120.76B (`params`). ggml-org Q4_0 71,803,752,384 B → 4.76 bpw; Q8_0 128,472,993,728 B → 8.51 (on 8.5).
  Q4_0 75.1 GB @4K / 83.9 GB @1M → green on 128 GB Macs + Spark 128G, yellow on one 80 GB card.
- **Bolt** (`NemotronHPuzzleForCausalLM`, per-block `block_configs`): same 88-layer pattern and
  attention shape, 240–496 experts of width 1536–2560, 9 per token, 262144 context. Counted:
  74.04B / 9.05B active (card: 74B / 9B). Only build: NVIDIA's native 2-bit (modelopt mixed: experts
  + shared IQ2_XXS 2.0625, latent Q8_0), 22,018,326,528 B in both NVIDIA's 24GB GGUF and unsloth's
  IQ2_XXS → 2.38 bpw; the recipe predicts 21.77 GB (within 1%). 23.05 GB @4K = 96% of 24 GB →
  **tight**, not the comfortable fit NVIDIA's "24GB" name suggests; green from 32 GB / 48 GB Macs.
  No `pplLossPercent`: a BF16 Bolt exists, so the 2-bit is a quantization with no published loss
  (the 0.0 convention is only for models released *only* as quantized weights).
- Mamba-2 state (~4 MiB × 40 layers, fp32, ~0.17 GB) is fixed and left inside the 10% buffer, as for
  the other hybrids. Vision mmproj files are separate (0.97–1.73 GB).
- `IQ2_XXS` (2.06) added to `quantBPW` + `quantGroups` so the calculator can select it.
- `hfRepoMap` points at repos whose filenames were read (unsloth Bolt `…-IQ2_XXS.gguf`, ggml-org
  Super `…-Q4_0.gguf` / `…-Q8_0.gguf`), so `<repo>-<level>.gguf` gives real commands, not placeholders.
- `referenceQuant()` now tries Q4_K_S then Q4_0 after Q4_K_M, before `bestQuant`: Super VL (Q4_0 +
  Q8_0 only) was sized at Q8_0 and its page named a 256 GB Mac as the smallest machine. Swept all 105
  models: only Super VL and Muse Spark Open (now Q4_K_S, with the Q2_K fallback sentence) change.
- Guide counts re-run with a before/after sweep: 5090 84→85, Spark 64/128 92→93 / 95→97, M3 Max 48
  84→85; ≤ 24 GB comfortable counts unchanged (Bolt is tight there). Totals 103 → 105.

### 2026-10-16 (ii) — +1 model (103): Muse Spark Open 816B-A42B

Re-verified on the owner's request after the morning patrol wrongly skipped it "for size".
- **Shape, primary:** transformers `models/muse_spark/configuration_muse_spark.py` (defaults
  documented against `meta-models/Muse-Spark-Open-816B-A42B`, the only checkpoint): 62 layers, 8192
  hidden, 128 heads, 16 KV × 64, vocab 202,048 untied, 256 experts / 8 at a 4096 latent width,
  `sliding_window` 2048, full attention (NoPE) on every 4th layer counted back from the last →
  16 full + 46 sliding, 1,048,576 positions. llama.cpp `src/models/muse-spark.cpp`: iSWA cache,
  `LLAMA_SWA_TYPE_STANDARD` → 2560 cells per window layer (as Muse Glimmer).
- **Params reconcile two ways:** that shape is 815.8B (Meta: 816B); llama.cpp also loads a per-layer
  `attn_gate` (8192 × 8192 × 62 = 4.16B) → 820.0B, the figure ggml-org's GGUF shows. `params` = 820.
- **bpw from ggml-org's GGUF card** (search snippet; huggingface.co blocked): Q2_K 304 GB, Q4_K_S
  470 GB, Q8_0 872 GB, BF16 1.64 TB → 2.97 / 4.59 / 8.51 / 16.0. Q8_0 and BF16 on 8.5 / 16 confirm
  the count and decimal units; the Q2_K's 2.97 matches its stated mixed recipe (expert gate/up Q2_K,
  down Q3_K, latent/gate Q8_0 → computed 3.02). All `estimated`.
- **Sizes:** Q2_K 318.9 GB @4K, 327.4 @128K, 389 @1M (KV 0.7 / 8.5 / 64.5 GB). Green on the Mac M5
  Ultra 512G row (384 GiB usable), yellow on 4 × H100; Q4_K_S/Q8_0 fit nothing. No single-card count
  moves, so guide prose changed only its "N of the 102" totals (22 strings).
- CLI repo maps the original weights (split GGUF filenames not read) → command placeholder, like Glimmer.
- Model-page prose sized it at its Q8_0 reference (912 GB) and said "no card clears that … multi-GPU or
  CPU-offload", contradicting its own description. `modelExplainer()` now adds, only when nothing
  clears the reference level, the largest shipped level that does fit a card (here Q2_K on the 512 GB
  Mac), in section 1, the single-GPU FAQ and the "which quantization" FAQ (which had called the
  unrunnable Q8_0 "the level most people run"). Swept all 103 models: this is the only page that changes.
- **(Superseded by (iii): added once the owner supplied the config.) Still held then: Nemotron 3.5 Super VL 120B-A12B.** Neither transformers nor llama.cpp's converter fixes
  its layer layout (it reads `NemotronHForCausalLM` hybrid patterns from the checkpoint config); the
  Nemotron 3 Super tech report's 88 layers / 8 attention / 2 KV × 128 belong to the predecessor and no
  source says 3.5 VL keeps them; Q4-class sizes conflict (LM Studio ~70 GB vs Unsloth UD-Q4_K_XL 86.9 GB).

### 2026-10-16 — Runtime versions; llama-server default port is now 9931

- llama.cpp b11671 + release v0.7.0 (Latest). Verbatim from the release notes: "Server now listens on
  port 9931 by default instead of 8080" and "default listening port changed to 9931 (Docker images
  keep 8080 inside the container)". Scanned every `llama-server` block in the guides and the CLI
  generator: all pass `--port` explicitly, and no prose claims 8080 is the default — nothing to
  change beyond telling readers. Also new: `--moe-cache-mib` (GPU cache for host-offloaded experts).
- Ollama v0.40.5 (Latest; adds Nemotron 3.5 Super / Bolt). vLLM v0.31.0, ExLlamaV3 1.6.2 unchanged.
- **Held back: NVIDIA Nemotron 3.5 Bolt 74B-A9B** (10-15, built for 24 GB cards, llama.cpp v0.7.0
  supports it). Its block layout is a heterogeneous "Puzzle" `block_configs` in the checkpoint's own
  `config.json` (llama.cpp's `NemotronHPuzzleModel` reads it; nothing in the converter fixes the
  counts), and huggingface.co, unsloth.ai, lmstudio.ai, nvidia.com and the NVIDIA forums were all
  unreachable from here today. The only layer count found (8 attention of 88 blocks, ~8 KB/token)
  comes from a third-party calculator — not a source this site sizes from. Nemotron 3.5 Super VL
  120B-A12B and Meta's Muse Spark Open 816B-A42B (10-15) held back for the same reason.
  **Correction (same day): Muse Spark Open was first logged here as skipped "for size" — wrong.** At
  Q2_K (2.63 bpw) its weights are ~250 GiB, ~275 GiB with the buffer, which fits the Mac M5 Ultra
  512G row (384 GiB usable) and sits near the 4 × H100 limit; ggml-org ships Q2_K / Q4_K_S / Q8_0
  GGUFs (arch `muse-spark`) and llama.cpp supports it. MiMo-V2.6-Pro (1T) is already indexed, so size
  was never the bar. The real blocker is the same as Bolt's: layer/KV layout only from secondary
  write-ups (62 layers, 128 Q / 16 KV heads) and no reachable file listing. Added later the same day — see (ii) above.

### 2026-10-15 — Runtime versions; no model

- llama.cpp b11632 (tags page, verbatim), Ollama v0.40.4 (Latest; v0.40.5-rc0 is a pre-release,
  skipped), ExLlamaV3 1.6.2 (Latest), vLLM v0.31.0 unchanged. Ollama v0.40.4 notes: decision models via
  `ollama run`, reuse of verified manifests/loaded models, MLX-runner fixes.
- No model: no open-weight release on 10-13/10-14 found; Mistral Large 4 and Reflection Beam still
  have no weights on Hugging Face (both promised for end of October). Granite 4.2 30B considered for
  the gap audit and held back — its per-size layer count is not in any reachable source.
- No commits from Grok Bot since the 10-14 review.

### 2026-10-14 (iii) — Review of the Grok calculator PRs (#4–#7)

Tested the merged calculator work (measured speed, launch commands, reverse-mode reach, share card)
on the export in a headless browser plus the existing seven flows; build, postbuild gates and
`scripts/check-measured-speed.ts` pass. The `tg128` column was spot-checked against the scoreboards
(#15013: 4090 186.21, 5090 290.02, 3060 75.57, 3090 158.16, 4060 Ti 63.86, A100 190.88, P100 58.35,
Spark 57.21; #4167: M1 14.19, M3 Pro 30.65, M3 Max 66.31, M4 Max 83.06, M2 Ultra 88.64 — all exact)
and every row sits under its card's bandwidth ceiling. The share card writes a real 1200×630 PNG.
LFM2.5's bpw reconcile with its stated byte counts (4.848 / 8.509). Four faults fixed:

- **Calibrated speed extrapolated far outside its check set.** The linear bytes scaling printed
  ~1,381 tok/s for Qwen2.5 0.5B on a 4090 (and 835 for a 0.8B) with a "likely" range attached, while
  the 9 check rows are dense 7.6B–32.8B. `measuredSpeed` now declines outside `CALIBRATED_PARAMS_B`
  (7–33B), like it already did for MoE.
- **Speed sort put every row without a calibrated figure below the slowest row with one** — the
  30B-A3B MoE models (95 tok/s measured) sorted under dense 32B (36). It now ranks every row by the
  card's bandwidth ceiling (`rooflineTokS`, MoE via `moeRooflineTokS`): identical order among dense
  rows (the estimate is a constant × that ceiling on one card), and every row has a key. Known
  limit: the MoE bound over-ranks MoE a little (30B-A3B lands just above the 8B dense rows; measured
  95 vs 146).
- **`?all=1` was read but never written** — `syncUrl` dropped it on the next render, so the "every
  level" view could not be shared or survive a reload. Now written (and in the dependency list).
- **vLLM tab on hardware vLLM does not run** — Intel Arc, CPU rows and off-list Radeon cards got a
  vLLM AWQ command with a caveat. The tab now follows `formatAllowed()`, the site-wide rule, and is
  hidden when the answer is a CPU/GPU split (vLLM does not offload layers).

Not changed: command comments inside generated scripts are English in both trees — that is
`generateCLI`'s existing behaviour, not a regression from these PRs.

### 2026-10-14 (ii) — +1 model (102): LFM2.5 24B-A2B

- **Patrol follow-up:** Liquid AI released **LFM2.5-24B-A2B** on 2026-10-12 (LFM Open License v1.0 —
  free below $10M annual revenue). Not one of the "decision" models the morning patrol ruled out.
- **Shape read from the official `config.json`** (huggingface.co, 2026-10-14): `Lfm2MoeForCausalLM`
  (llama.cpp `lfm2moe`), 40 layers whose `layer_types` are 10 `full_attention` (GQA) + 30 `conv`
  (double-gated short convolution, `conv_L_cache` 3 — fixed state, not a growing cache); hidden 2048,
  32 heads / 8 KV heads → head_dim 64; 64 experts top-4 (`moe_intermediate_size` 1536), first 2 layers
  dense; vocab 128000, tied; `max_position_embeddings` 131072. Sized with `attention.fullLayers: 10`.
- `params` 23.97 = the Hub's safetensors total (23,971,585,280). Active 2.45B is the model card's figure;
  the label `24B-A2B` would parse as 2, so `activeParams` is set explicitly.
- Q4_K_M 4.85 / Q8_0 8.51 bpw from Liquid's own GGUF repo byte counts (14,526,258,464 / 25,493,732,640).
  Both `estimated`; no perplexity published, so no loss figure.
- Sizes: Q4_K_M 15.27 GB @4K, 15.87 @32K, 17.93 @128K; Q8_0 26.73 @4K. Green on every ≥ 20 GB card and
  24 GB+ Macs, amber (tight) on 16 GB. Guide counts re-run with `countModelsFitting()`: RTX 5090 83 → 84,
  4090 / 7900 XTX 80 → 81, M3 Max 48G 83 → 84, DGX Spark 64 / 128 91 / 94 → 92 / 95; 4060 Ti 16G
  "load at all" 72 → 73; 12 GB and 16 GB comfortable counts unchanged; every "of the 101" → "of the 102".
- Added to the homepage feed; HF stats map to `LiquidAI/LFM2.5-24B-A2B-GGUF`.

### 2026-10-14 — +1 model (101): Granite 4.2 8B; llama.cpp b11609

- **Patrol window (10-07 → 10-14):** no new open-weight model worth adding. Beam (Reflection) and
  Mistral Large 4 still have no downloadable weights (both promised for October); Kolibri-1 still
  needs a patched llama.cpp; Liquid's decision models are out of scope. Runtime: llama.cpp b11609
  (tags page, verbatim); Ollama v0.40.3 still Latest (v0.40.4 is a pre-release, skipped); vLLM v0.31.0
  and ExLlamaV3 1.6.1 unchanged.
- **Gap audit pick: IBM Granite 4.2 8B** (Aug 2026, Apache 2.0). Dense `GraniteForCausalLM`, which
  llama.cpp runs as `granite` (unlike Granite 4.0's hybrid Mamba). Shape from IBM's model card table:
  40 layers, 32 heads, 8 KV × 128, embedding 4096, MLP 12800, 131072 context. `params` 8.79 = that
  shape with a 100,352 vocab and untied embeddings; it reconciles with the Hub's "9B" and the 4.1 8B's
  8.8B, while tied embeddings (8.38) would not. The vocab is from a secondary page, so this is a
  reconciliation, not a read of `config.json` (huggingface.co is blocked here).
- Q4_K_M bpw 4.87 from a published file's exact byte count (5,347,917,888); other uploads run 5.10 GiB
  (official) to 5.54 GB (bartowski) — 4.98–5.04 bpw, so the row may read ~0.1 GB low. Q8_0 at the
  format's 8.5. Both `estimated`; no perplexity published, so no loss figure.
- Sizes: Q4_K_M 6.28 GB @4K (green on every 8 GB discrete card, yellow on 8 GB Macs), 11.09 @32K,
  27.59 @128K (full attention on all 40 layers). Every card ≥ 8 GB gains one comfortable fit; guide
  counts re-run (`delta` sweep over all 82 rows) and bumped. **The Intel Arc guide's zh FAQ still
  quoted 52 / 41 / 34 for A770 / B570 / A750 while the en said 57 / 46 / 38** — both now 58 / 47 / 39.
- Not superseding Granite 3.1 8B: same context (128K) and same level count, so `supersededDiffNote()`
  would only have its generic line.
- Wired into the 8 GB starter guide's `relatedModelIds` and the homepage feed.

### 2026-10-13 (i) — Re-check pass

- Full re-run: build + postbuild gates clean; the seven browser flows (search, HF import, fine-tune,
  mixed rig, prefill, mmproj/A-B/saved rigs, 390 px overflow on 7 URLs) pass; `/zh` calculator text
  scanned in six states — only model/card names in English. Changelog figures recomputed and
  unchanged (prefill 4.9 s / 40.7 s, serving 27/13/3, Mellum 8.59 / 10.45 GB).
- **Serving block named vLLM on hardware vLLM does not run on** (Mac, CPU, Intel Arc, ROCm cards off
  vLLM's list). It now says the server there is llama-server with `--parallel` slots, uses the
  memory-proportional capacity rather than vLLM's even split, and the mixed-card sentence appears
  only when extra cards are present.
- Mellum changelog line said "comfortably on a 10 or 12 GB card" next to its 128K figure; at 128K a
  10 GB card is `tight` (10.45 GB). Reworded: 12 GB even at 128K, 10 GB at shorter contexts.

### 2026-10-13 (h) — Calculator quality pass

- 390 px overflow check (iframe method) across forward / mixed rig / multimodal / reverse / fine-tune / MLA / imported custom: 0 elements past the viewport without a scroll container. First Load JS for the page 271 → 290 kB over the day's additions (CLI generator is 274).
- Serving capacity now uses **0.85**, the `--gpu-memory-utilization` in this site's own generated vLLM commands (`lib/utils/cli.ts`), instead of vLLM's 0.9 default — the page's "how close to reality" section already told readers 0.85, and the two numbers sat on the same page. 8B Q4_K_M on a 4090: 27 / 13 / 3.
- Tool-page copy: summary and both meta descriptions name the new capabilities; new explainer section "What else it answers" (with the sources for each); the formula section's activation buffer now covers the vision encoder.

### 2026-10-13 (g) — Calculator: vision encoder, A/B pin, saved machines

- **Vision encoder**: `CalcInput.extraGB` (fixed extra weights, inside the 10% buffer; `CalcResult.extraGB` only when given) threaded through `modelShape`/`levelTable` and `servingCapacity`. Shown for multimodal entries and custom models; empty = not counted, said so. "Read from GGUF repo" (only when the model's `hfRepoMap` repo ends in `-GGUF`) calls `mmprojFromHub` → `/api/models/{repo}?blobs=true`, picks the `mmproj*.gguf` f16 file (then bf16, then smallest). No per-model sizes typed — they were not verifiable here. URL `mmproj=`; download line adds it.
- **A/B pin**: snapshot of description + total + verdict + rig capacity; live delta shown. Not persisted.
- **Saved machines**: up to 5 rigs (`gpuId`, `cards`, `extra`) in `localStorage` key `qz-rigs`, read after mount (no hydration mismatch), every access in try/catch; unknown GPU ids dropped on read.
- Browser-tested at 390 px zh with a mocked file listing (Gemma 3 12B: 8.79 → 9.67 GB with the 0.80 GB f16 mmproj).

### 2026-10-13 (f) — Calculator: time to first token (prompt processing)

- Data: `lib/data/prefill.ts` — llama-bench `pp512`, Llama 2 7B Q4_0, full offload, no FA, from llama.cpp's own scoreboards: CUDA #15013, ROCm #15021, Vulkan #10879 (Intel Arc only — no SYCL board), Apple #4167 (Q4_0 column, build 8e672ef / Nov 2023; lower-core variant at each Mac row's bandwidth). Each set read twice; ± figures matched. 59 rows; cards without a scoreboard row (RTX 5060/5050/4070-family/4060/3080 Ti/3070-family, L40S, A100 40G, RX 7700 XT/6700 XT, M5 Macs) get **no** figure — nothing borrowed across chips, except where the row names the chip without its memory size (4060 Ti, 5060 Ti, 9060 XT, DGX Spark), noted per row. Odd community orderings (RX 7900 GRE < 7800 XT, Arc B580 < B570) kept as reported. `validate.ts` now fails on a prefill row for an unknown GPU id.
- Model: `lib/utils/prefill.ts` — rate = card pp512 × FLOPs(7B, 512) / FLOPs(model, N), FLOPs/token = 2 × active params + 4 × qDim × (full layers × N/2 + window layers × min(N/2, window)); mixed rigs add per-card time by memory share. MoE flagged as optimistic (routing). Shown under the verdict for the chosen context, with backend + discussion number.
- Checks: Llama 3.1 8B — 4090 @32K 4.9 s; M3 Pro @8K 40.7 s. Qwen3.6 27B on a 4090 @128K 64.7 s.
- Vision encoders (mmproj) **not added**: per-model file sizes are only on Hugging Face file listings (unreachable here); search turned up a figure for Gemma 3 (858 MB f16) and little else among the 23 multimodal entries. Not shipped rather than typed.

### 2026-10-13 (e) — Calculator: mixed cards, serving capacity, download size

- **Mixed cards**: `capacityGB(gpu, cards, extra)` + `rigDevices()` (`gpu-page.ts`); `verdictOn`/`levelTable`/`contextReach`/`offloadPlan` take `extra` (default `[]` → identical-card results unchanged, checked). Extra cards must `canStack` and share `backendFor` with the primary; rig ≤ `MAX_CARDS`. Format must load on every device (`rigFormatAllowed`). Speed: `rigSpeedCeiling` = 1 / Σ(share_i / tokS_i) with shares ∝ usable memory (llama.cpp layer split, cards take turns) — 2 × 3090 stays 23 tok/s for Llama 3.3 70B Q4_K_M, 3090 + 3060 gives 15.1. Offload uses the summed `--fit` budget and splits the GPU read time by share. Page says vLLM's tensor parallel splits evenly (smallest card limits). URL `extra=id,id`.
- **Serving capacity** (`servingCapacity`): (rig × 0.85 — the `--gpu-memory-utilization` this site's generated vLLM commands pass, changed from vLLM's 0.9 default the same day so the count matches the copied command — − weights × 1.1) ÷ (one request's KV at 4K/8K/32K × 1.1), capped at the model's window; labelled a floor (paged caches hold used tokens only). Mixed rigs use the even split (smallest card × count). Llama 3.1 8B Q4_K_M on a 4090: 27 / 13 / 3.
- **Download size**: params × bpw / 8 (equals the published file for file-derived bpw rows; Llama 3.3 70B Q4_K_M 42.8 GB vs bartowski 42.5), plus the Ollama v0.40.2 backup-copy note (from its release notes, checked 2026-10-10).

### 2026-10-13 (d) — Calculator: fine-tune mode (QLoRA / LoRA / full)

- `lib/utils/finetune.ts`, constants and sources: full FT mixed-precision AdamW **18 B/param** (6 weights + 8 Adam + 4 fp32 grads; 8-bit Adam → 12) — transformers `docs/source/en/model_memory_anatomy.md`; QLoRA base **4.127 bits** (NF4 4 + 0.5 bits block-64 constants − 0.373 saved by double quantization; QLoRA paper §3, via search — arxiv is blocked here), with embeddings and the output head 16-bit (`nn.Embedding` is not Linear; transformers `quantizers/base.py` `get_keys_to_not_convert` keeps the output embedding); LoRA adapters fp32 16 B/param, PEFT `all-linear` r·(in+out) per matrix, MLP width from config or derived from the parameter count; activations **34·s·b·h per layer** (Korthikanti et al., as in EleutherAI `cookbook/calc/calc_transformer_mem.py`, fused attention → no s² term), with checkpointing 2·s·b·h per layer + one recomputed layer; logits **10 B × tokens × vocab** (bf16 head output + `logits.float()` in transformers `loss/loss_utils.py` + fp32 grad); 10% buffer.
- Calibration (configs typed for the check only, not shipped): LoRA 16-bit at seq 2048, r 16 — Llama 8B 20.7–24.2 GB vs Unsloth's published 22; 14B 36–41 vs 33; 70B 154–160 vs 164. QLoRA comes out 1.5–2× Unsloth's minimums (8B 10.1 vs 6), which their docs attribute to their own offloading/chunking — the page says so rather than tuning a constant to match.
- Index models lack `hidden`/`vocab`: hidden falls back to heads × head size (labelled), vocab stays unknown until the reader clicks "read exact values from Hugging Face" (reuses `importFromHub` on the model's `hfRepoMap` repo, base-model fallback) or types it. **Without a vocab the total is shown as "≥ X" and no fit verdict is given** — a floor must not call a card big enough. MLA entries (cache-shape encoding, e.g. 1 × 288) get no width fallback at all. Verdict uses `usableCapacityGB` (single card; multi-card training is not additive, said on the page).
- Shareable: `mode=finetune&ft=&r=&opt=&seq=&mb=&gc=&hidden=&vocab=`. New FAQ on the tool page (in `FAQPage`). Browser-tested at 390 px zh with intercepted Hub responses.

### 2026-10-13 (c) — Calculator: import any Hugging Face repo

- `lib/utils/hf-import.ts`: `parseRepoInput` (org/name, hf.co / huggingface.co URLs incl. `/tree/main`, `hf download …` lines), `shapeFromConfig` (layers / KV heads / head dim, nested `text_config`-style configs, MLA → `kvHeads 1, headDim (kv_lora_rank + rope)/2`, `layer_types` full/sliding/linear counts, `full_attention_interval`, Gemma-3-style `sliding_window_pattern`, windows sized at llama.cpp's `pad256(window + 512)`; a `sliding_window` with no per-layer pattern is **not** applied and says so — upper bound; MoE expert counts reported), `importFromHub` (`/api/models/{repo}` → `safetensors.total` or `gguf.total` for params; `resolve/main/config.json`; a GGUF repo with no config falls back to `cardData.base_model`; gated → note, never a guess).
- **Validated offline** against the index's own hand-checked arch fields: Llama 3.1 8B, GPT-OSS 20B (12 + 12 / 768), Gemma 3 27B (10 + 52 / 1536), DeepSeek V3 (MLA 1 × 288), Qwen3.6 27B (16 full, linear rest), Mellum2.1 (7 + 21 / 1536), Qwen2.5 7B (`use_sliding_window: false` ignored) — all identical. Mocked-fetch tests cover GGUF→base, gated, 404, network failure.
- UI: "import" link under the model search (a pasted HF URL in the search box imports directly); import box in the custom panel; notes in the reader's language; "this model is in the index" chip via a reverse `hfRepoMap` lookup; editing layers by hand drops the imported attention shape. Share links carry the imported shape as numbers (`full`, `win`, `wt`, `mctx`, `repo`) — no re-fetch, so a link shows what the sender saw. Browser-tested with intercepted Hub responses (390 px, zh).
- **Not verified live**: this environment cannot reach huggingface.co, so real CORS/response shapes were not exercised. Hub files are fetched cross-origin by transformers.js in browsers, and every failure path degrades to "enter by hand"; still, check one ungated repo (e.g. `Qwen/Qwen3-8B`) and one GGUF repo on the live site after deploy.

### 2026-10-13 (b) — Calculator: search, one-tap starts, grouped card list, mobile result bar

- Traffic context: the calculator is the top page (zh ahead of en in browser page loads). It opened on two empty dropdowns — 100 models in one `<select>`, 82 cards ungrouped — and on a phone the answer sat ~1,500 px below the controls, so every context/level change hid it.
- **Model search** (`lib/utils/model-search.ts`, now also the Hub's matcher): name/family/id/size/categories/tags/formats/levels + alias map, extended with Chinese task and vendor words (千问/通义→qwen, 写代码/编程→code, 视觉/图像→multimodal, 小米→mimo, 谷歌→gemma …). Multi-word queries pass when every word matches ("qwen 27b" → Qwen3.6 27B, Qwen3.8 27B); a one-character word must be a whole word of the name ("gemma 4" no longer matches every Q4 build); punctuation-free matching only from 4 characters and keeps CJK (the old `[^a-z0-9]` strip turned "千问 27b" into "27b", which also matched "WizardLM-2 7B"). Ranked: whole-word name hit, then loose name hit, then tag-only; legacy last; newer first. Native `<select>` kept for keyboard/screen readers.
- **One-tap starts**: with a card set, chips are `homePicks(card, 'chat')` — the homepage/`/best/` ranking, so the surfaces cannot disagree; without one, the 4 newest non-legacy models that are green on a 24 GB card at 4K (MiMo-V2.6-Pro was otherwise the first suggestion). Popular cards come from `POPULAR_GPU_IDS`, moved to `lib/data/gpus.ts` and shared with the homepage's `PopularStarts`. Chips render in the static HTML.
- **Card lists grouped** by vendor line (`<optgroup>`; forward + reverse). Model/reverse-card `<label>`s now have `htmlFor`.
- **Mobile result bar**: `lg:hidden`, fixed bottom with `env(safe-area-inset-bottom)`, shown while the results panel is off-screen (IntersectionObserver), total + verdict for the profile card + a "Details" jump. Spacer keeps it off the footer. Verified at 390 px: no horizontal scroll, bar disappears once results are in view.
- `VRAM_CALC_EDITED` → 2026-10-13.

### 2026-10-13 — Daily patrol: +1 model (100): Mellum2.1 12B-A2.5B Thinking; llama.cpp b11577

- Source chain: transformers `models/mellum/configuration_mellum.py` (28 layers, hidden 2304, 32 heads / 4 KV × 128, sliding_window 1024, 64 experts / 8 routed, 131072 positions); llama.cpp `src/models/mellum.cpp` (arch `mellum`, `LLM_TYPE_12B_A2_5B` at 28 layers, `load_swa_pattern(ml, 4)` → 21 SWA + 7 full, standard SWA → 1536 cells). Config arithmetic 12.14B / ~2.4B active; JetBrains' GGUF repo BF16 24.3 GB → 12.15B, Q8_0 12.9 GB → 8.49 bpw, Q4_K_M 8.1 GB → 5.33 bpw (bartowski's is 8.82 GB). Released 2026-10-08, Apache 2.0. The repo's MXFP4_MOE build (7.0 GB) is omitted — `referenceQuant()` would treat an MXFP4 row as native. KL divergence published, not perplexity → no `pplLossPercent`. CLI placeholder (GGUF filenames unconfirmed).
- Sizes: Q4_K_M 8.6 GB @4K, 9.0 @32K, 10.5 @128K; Q8_0 13.6 @4K. Comfortable on 10/12 GB, not 8 GB. Every ≥10 GB card's count +1. Added to the 12 GB guide's `relatedModelIds`.
- Guide counts re-run per card, and several **pre-existing** errors fixed while doing it: the RTX 4060 Ti 16G guide said 51 comfortable / 60 loadable and its FAQ 52 (actual 60/70 before today, 61/71 now) — these sentences don't use the "N of the M models" form, so `guideModelCountProblems()` never saw them; zh text disagreed with en in three places (7900 XTX FAQ "56" vs 60 for 16 GB cards, 12 GB guide "能加载的共 51 个" vs 55, 16 GB-vs-12 GB FAQ "49" vs 53). The 4060 Ti FAQ's "slowest 16GB card" is a tie with the RX 7600 XT (288 GB/s) — now says so.
- Runtimes: llama.cpp b11577; Ollama v0.40.4 is a pre-release (skipped, v0.40.3 stays); vLLM v0.31.0, ExLlamaV3 v1.6.1 unchanged.

### 2026-10-12 (c) — Meta descriptions lengthened (Bing "too short"); format `hardwareReq` bilingual

- Bing Webmaster (owner screenshot): "many pages' meta descriptions are too short". Measured `out/**`: `/zh` median **79 characters** (all 239 under 120 width-equivalent of English, 85 under 70 chars, shortest 24 — `/zh/legal/`), because the 160-width budget counts CJK double and the zh templates were written to one sentence. EN median 127 chars, 13 under 100.
- `extendDescription(base, extras, lang)` (`lib/seo.ts`, replaces `padDescription`) appends computed facts in order while ≤160 width and until 140 (`DESCRIPTION_FLOOR`); an array entry is longest-first alternatives. `lib/utils/meta-description.ts` builds the three derived sets from the same functions the pages render: models (size at reference quant/4K, smallest comfortable card via `cardsFitting`, native context), GPUs (tight-only count, bandwidth), guides (`gpuPreset` card, up to 3 `relatedModelIds` names, `verifiedStack`, FAQ count). Hand-written static descriptions lengthened (zh about/legal/privacy/tools/gpu index/changelog/faq/best; en compare/privacy) — legal text checked against the page ("均为近似值").
- Result: `/zh` median 101 chars, min 102 width; EN min 106 width (404 excluded). Postbuild now also **fails under 100 width** (proven: a 6-width `/zh/legal/` description fails).
- Found on the way: `formats.ts` `hardwareReq` was English-only and printed on `/zh/formats/*` (description, page body, compare table, OG image) — now `{ en, zh }`. zh GPU description lacked a space after names that carry their size ("RTX 3080 10G在").
- `www` served 200 rather than a 301 to the apex (canonical tags already pointed at the apex; `_redirects` cannot match on host). The owner added a Cloudflare Redirect Rule (www → apex, 301, query kept) the same day — not verifiable from this environment, whose egress proxy refuses `quantized.uk`. `index.txt` requests are Next's client-navigation payloads that `LocalLink` prefetches in readers' browsers, not a text mirror being scraped — no change.

### 2026-10-12 (b) — +1 model (99): MiMo-V2.6-Pro (owner request)

- Sources (huggingface.co blocked; via search + GitHub): -RL `config.json` — 70 layers, 128 heads / 8 KV, `sliding_window` 128, `swa_head_dim` 192; model card QK 192 / V 128. 10 global + 60 SWA layers from secondary write-ups (the `hybrid_layer_pattern` array was truncated in every copy reached) — encoded as `fullLayers 10 / windowLayers 60 / windowTokens 768` (`mimo2` is `LLAMA_SWA_TYPE_STANDARD` → pad256(128+512)), `headDim 160` = mean of 192/128 (exact K+V bytes).
- llama.cpp: arch `mimo2` exists on master; V2.6 conversion merged 2026-09-22 (PR #29257, merge `bfd73a8`, no runtime change needed; MXFP4 experts repacked). ggml-org, AesSedai and kernelpool publish MXFP4 GGUFs.
- `params` 1022 from AesSedai's RL GGUF (537.99 GiB @ stated 4.52 bpw); kernelpool's repack is 557.1 GB (~4.36 bpw) — the larger file is used. One quant row (MXFP4, `pplLossPercent 0.0` as native weights, `estimated`); no Q4_K_M row, since that would be a re-quant nobody verified here. Context 1M = vendor figure as reported (no `max_position_embeddings` reachable).
- Fit: 603.8 GB @4K (weights 548.5 + 10% overhead), +50 GB cache at 1M. Fits **no** row: Mac Studio 512G → 384 usable, 4 × H100 80G → 320. Every per-card comfortable/tight count unchanged; guide totals 98 → 99. CLI maps the original repo (split-file names not derivable → placeholder). No speed figure.
- Model-page prose: the generated "which quantization" FAQ and "which build" section said "All 1 levels…" / "lowest loss" for a one-level model; both now branch on a single level (also fixes Qwen3.8 27B, the other one-row model).

### 2026-10-12 — Daily patrol: Ollama v0.40.3, llama.cpp b11559

- Tags/releases pages: Ollama **v0.40.3** (Latest, 10-11 — `ollama launch` warning fixes; background upgrades paused for *embedding* models only, so the v0.40.2 backup/extra-disk note still holds for chat models); llama.cpp **b11559**; vLLM v0.31.0 and ExLlamaV3 v1.6.1 unchanged.
- Skipped: Aleph Alpha Kolibri-1 (10-03, reported 78.1B / 3.46B-active MoE, FP8, Apache 2.0) — only secondary coverage reachable, and `src/llama-arch.cpp` on master has no Kolibri/Aleph arch, so no GGUF path for this site's readers; MiMo-V2.6-Pro (leaderboard mention, flagship-class); Mistral Large 4 (10-27) and Reflection Beam weights still pending.

### 2026-10-11 (b) — Daily patrol: llama.cpp b11552, ExLlamaV3 v1.6.1

- Tags/releases pages: llama.cpp **b11552**; ExLlamaV3 **v1.6.1** (Latest, 2026-10-10 — EXL3 still untracked, 0 models); Ollama v0.40.2 and vLLM v0.31.0 unchanged. No open-weight LLM release in the window (HF blog 10-09/10 posts are non-model; October tracker lists only 10-01–03 small specialised models, already assessed). Mistral Large 4 (10-27) and Reflection Beam weights still pending.

### 2026-10-11 — +3 small Qwen3.5 (98): 4B, 2B, 0.8B (owner OK'd the follow-up)

- Configs (via search): 4B — 32 layers (8 × [3 DeltaNet + 1 gated attention]), hidden 2560, inter 9216, 16 heads / 4 KV × 256, tied; 2B — from `Qwen3.5-2B-Base` (same architecture as instruct): 24 layers (6 full), hidden 2048, inter 6144, 8 heads / 2 KV × 256, tied; 0.8B — unsloth re-upload + community copy: 24 layers, hidden 1024, inter 3584, 2 KV × 256.
- Params from bartowski Q8_0: 4B 4.62 GB → 4.35B, 2B 2.08 GB → 1.96B; Q4_K_M bpw 5.54 / 5.71 (tied 248K vocab is a large share of a small model, kept wide). 0.8B: no file size reachable → vendor 0.8 + generic 4.85 / 8.5, `estimated`.
- Sizes @Q4_K_M 4K / 32K / 256K: 4B 3.3 / 4.3 / 12.0 GB; 2B 1.5 / 1.9 / 4.8; 0.8B 0.6 / 0.9 / 3.8. All original repos mapped (bartowski filenames for these sizes unconfirmed) → CLI placeholder.
- Every card's comfortable count +3 (RX 7900 XTX 78, 16 GB 60, 12 GB 53 / tight 55, B580 53, A770 56, B570 45, A750 38, RTX 5090 81, RTX 4090 78, M3 Max 48G 81, Spark 89 / 92); AWQ 53. `relatedModelIds`: 4B + 2B → M1 8 GB, CPU and VPS guides.
- Not done: superseding Qwen3 4B / 1.7B with these — it would move homepage picks and three guides that name Qwen3 4B; left for a deliberate quarterly pass.

### 2026-10-10 (c) — Gap audit: +3 Qwen models (95) — Qwen3.6 35B-A3B, Qwen3.6 27B, Qwen3.5 9B

- Prompted by "what else popular did we miss". Index vs 2026 buying guides, HF trending and Ollama's popularity notes: the whole Qwen3.5/3.6 generation was absent, though three Mac guides already named Qwen3.6/3.5 (Ollama's MLX list). Qwen3.8's lineup is only 27B, Flash-Next and a 2.4T flagship, so nothing newer covers these sizes.
- Configs (official `config.json` via search): 3.6-35B-A3B 40 layers / 2 KV × 256 / interval 4 (10 full) / 256 experts top-8 + shared; 3.6-27B 64 layers / hidden 5120 / inter 17408 / 4 KV × 256 / 16 full (= Qwen3.8 27B's measured layout); 3.5-9B 32 layers / hidden 4096 / inter 12288 / 4 KV × 256 / 8 full, untied, vocab 248320. llama.cpp `qwen35` / `qwen35moe`. Params from bartowski Q8_0 sizes at 8.5 bpw (37.81 / 29.12 / 9.80 GB → 35.59 / 27.41 / 9.22B — 9B also matches config arithmetic ~9.2B); bpw from the other files (35B Q4_K_M 5.01; 27B Q4_K_M/Q5_K_M 5.25/6.12; 9B Q4_K_M 5.35). 35B-A3B's 262K window is from the 3.5 config and a 3.6 draft model, not seen in the 3.6 main file.
- Verdicts: 35B-A3B Q4_K_M 23.4 GB @4K = 97% of 24 GB → **tight** (guides calling it the 24 GB pick omit the buffer — said on the page); 27B 19.1 / 21.0 GB @4K/32K comfortable on 24 GB; 9B 6.6 GB comfortable on 8 GB, 15.2 GB at 256K.
- Qwen3.6 27B not superseded by Qwen3.8 27B (same window and size → generic reason only). CLI: bartowski repos for the two 3.6 models (filename prefix `Qwen_Qwen3.6-…` seen in file URLs, which `ggufBase` derives); 9B maps the original repo (filename unconfirmed) → placeholder.
- Guide counts re-run per card: RX 7900 XTX 73→75, 16 GB 56→57, 12 GB 49→50 (tight 51→52), Arc B580 49→50 / A770 52→53 / B570 41→42 / A750 34→35, RTX 5090 75→78, RTX 4090 73→75, M3 Max 48G 75→78, Spark 64/128 83→86 / 86→89; AWQ 53. `relatedModelIds`: 9B → 8 GB + 12 GB guides; Qwen3.6 → RTX 5090 guide.
- Still not in, with reasons: Qwen3.5 4B/2B/0.8B, 27B, 35B-A3B, 122B-A10B (next batch — the 3.6 builds cover 27B/35B), LFM2-VL 3B (edge VLM, unchecked), DeepSeek-V4.1-Flash and GLM-5.3-Flash (8-GPU class), Xing4.0 29B-A4B / Kolibri-1 (provenance unclear).

### 2026-10-10 (b) — +1 model (92): Qwen3.8-Flash-Next (reader suggestion; skipped 10-07, re-checked)

- Skipped on 10-07 as "a layout no reachable config describes". Re-check found llama.cpp **does** support it — `qwen4exp`, PR #27742 merged 2026-08-27 (the earlier search looked for "qwen3.8"/"ngram" and missed the arch name). Official `config.json` (via search): 48 layers, hidden 2560, 24 heads / 2 KV × 256, `full_attention_interval` 4 → 12 attention + 36 Gated DeltaNet layers, 512 experts top-10 + 1 shared, 262144 positions, QSA indexer (4 × 128, 1 key head, budget 2048, ratio 4). Expert width 640 from a GGUF card (AtomicChat), not the official file — the trunk then counts ~124.4B against the stated 125B / 6B active.
- `src/models/qwen4exp.cpp`: memory is `llama_memory_hybrid_idx` — full KV on the 12 attention layers (QSA selects, it does not compress) + an indexer cache of raw|pooled key (2 × 128) per token per layer; encoded as `fullHeadDim: 320` (2048 + 512 bytes per layer per token), real head dim 256 in `headDim`. The 51B n-gram (PLE) table is `per_layer_tok_embd` with `TENSOR_READ_LAZY` (LAYER_INPUT → host/mmap), never VRAM, so **`params` = 125, excluding the table and the 4B MTP head** (separate GGUF) — a deliberate exception to "params is the total", recorded in CLAUDE.md. GGUFs bundle the table, so no file size isolates the trunk: generic 4.85 / 8.5 bpw, `estimated`. Q4_K_M 79.3 GB @4K, 87.4 GB @256K → comfortable on 128 GB Macs and the DGX Spark 128G (9 machines), nothing ≤ 32 GB.
- Guides: only DGX Spark 128G's count moved (85 → 86); Spark guide gains a table row (79.4 / 80.2 / 83.3 GB from `calcVRAM`), the "only the 128GB holds" FAQ names it, `relatedModelIds` + `updatedAt` 2026-10-10. CLI maps the original repo (Unsloth ships UD-* tiers only) → placeholder. Model meta description first sentence shortened (167 → within 160).

### 2026-10-10 — Daily patrol: runtime versions only (llama.cpp b11539, Ollama v0.40.2)

- Ollama **v0.40.2** is now Latest (was Pre-release yesterday). Release notes: models downloaded with earlier versions are upgraded in the background on first run, with the original kept as a backup until a future release removes it; no new models listed. Reader changelog notes the disk-space consequence. llama.cpp **b11539**; vLLM v0.31.0 and ExLlamaV3 v1.6.0 unchanged. Derived pages untouched (`sizingChangedAt` not bumped).
- Skipped: EmbeddingGemma 2 (embedding model, not text generation — outside the index), Nemotron 3 Diarization (speech), Qwen3.8 / DeepSeek-V4.1-Flash trending re-posts (already assessed), Mistral Large 4 (weights due 10-27, licence unannounced), Reflection Beam (weights still pending).

### 2026-10-09 — Daily patrol: +1 model (91) Muse Glimmer 30B; llama.cpp b11514, Ollama v0.40.1

- **Muse Glimmer 30B** (Meta, released 2026-08-10, Apache 2.0) — a catch-up, not a fresh release: never considered before, and squarely this site's reader (dense, built for one 24/32 GB card). Arch from transformers `configuration_muse_glimmer.py` (52 layers, hidden 6656, 32 heads / 2 KV × 128, inter 19968, vocab 202048 untied, 131072 positions, sliding_window 2048, full attention every 4th layer → 13 full + 39 window) plus llama.cpp `src/models/muse-glimmer.cpp`, whose per-layer attention gate (n_embd × 4096) the config does not show — with it the decoder is **27.85B**, matching Meta's "28B text decoder". iSWA cache with `load_swa_pattern(ml, 4)` → `windowTokens` pad256(2048+512) = 2560. bpw from file sizes: Meta's official Q4_K_M 16,756,683,904 B → 4.81; bartowski Q5_K_M / Q6_K / Q8_0 20.11 / 23.41 / 29.61 GB → 5.78 / 6.72 / **8.50** (Q8_0 confirms the count). Q4_K_M 17.7 GB @4K, 19.4 GB @128K (KV 1.7 GB; 6.5 GB without the window) — green on 24 GB. Vision mmproj (~1.4 GB) and DFlash drafter (~1.6 GB) not in `params` or sizes, stated on the page. No ppl, no speed. `hfRepoMap` → original `meta-models/Muse-Glimmer-30B`: Meta's GGUF filenames (`…-KQuant-17GB-Q4_K_M.gguf`) and bartowski's are not derivable by the CLI's `<repo>-<level>.gguf`, so the CLI shows its placeholder rather than a download that matches nothing. Linked from the RTX 5090 guide (`relatedModelIds`).
- Typed guide counts re-run per card, not just 90 → 91: RX 7900 XTX 72→73, RTX 4090 72→73, RTX 5090 74→75, M3 Max 48G 74→75, DGX Spark 82→83 / 84→85; 12 GB (49/51), 16 GB (56), Arc B580 (49) and AWQ (53) unchanged.
- Runtime: llama.cpp **b11514**, Ollama **v0.40.1** (Latest 10-07; v0.40.2 is Pre-release, skipped; no model-support changes in the notes), vLLM v0.31.0 and ExLlamaV3 v1.6.0 unchanged.
- Skipped: GLM-5.3-Flash (Aug 26, ~320B / 18B active — 8-GPU class, and not fresh), GLM 5.3 Fast (10-07, open weights unconfirmed), Mistral Large 4 and Reflection Beam (weights still pending), Kimi K3 (~2.8T).

### 2026-10-08 (e) — VRAM calculator, batch 2: multi-GPU, partial offload, MoE speed bound

- **Card count 1–4** (`cards` URL param; forward and reverse). `canStack` / `capacityGB` / `MAX_CARDS` live in `gpu-page.ts` beside `usableCapacityGB` (recommend.ts needs them; calc-insights re-exports). Only discrete types stack — apple, nvidia-unified and cpu stay one pool. Sized as llama.cpp's default `--split-mode layer` per `docs/multi-gpu.md` (contiguous layer slices proportional to memory, KV follows its layer, pipeline parallel: tokens go through the cards in turn), so capacity adds and the single-stream speed bound stays one card's bandwidth — said on the page. Verdict thresholds unchanged (12% green margin > 1 GiB `--fit` margin per device for ≤4 cards). vLLM named as `--tensor-parallel-size N`, not sized separately. Reverse mode on an RTX 3090: 195 → 216 → 230 configs at 1/2/4 cards.
- **Partial offload** (`offloadPlan`) when the verdict is red, discrete card, GGUF (or custom): whole layers costed at an even share of the estimate, card keeps `--fit`'s 1 GiB free, `-ngl N` printed, RAM needed for the rest, speed bound = GPU share / card bandwidth + CPU share / RAM bandwidth. RAM presets (`ram` param) are spec peaks: DDR4-3200 ×2 51.2, DDR5-5600 ×2 89.6, ×4 179.2 GB/s (rate × 8 B × channels). MoE note points at `--n-cpu-moe`. Example: Llama 3.3 70B Q4_K_M @8K on one 3090 → 38/80 layers, 24.9 GB RAM, ~3.9 tok/s.
- **MoE speed bound** (`moeRooflineTokS` in `roofline.ts`): bandwidth ÷ (weights × active/total), labelled approximate. New optional `QuantModel.activeParams` for the 10 models labelled only "… MoE" (vendor figures: OpenAI model card 3.6B / 5.1B, Mistral 12.9B and 41B, plus DBRX 36, DeepSeek V3/R1 37, Llama 4 17, GLM-4.5-Air 12 already stated in their descriptions); `-A3B` labels are parsed by `activeParamsB()`. `dataProblems()` now fails a MoE model with no active count (proved by deleting GPT-OSS 20B's), an active count above total, or `activeParams` on a dense model. Both measured MoE rows sit under the bound (Qwen3 30B-A3B 95 vs 583 on the 4090). GPU pages keep the dense-only `rooflineTokS`.
- Sweep: 67,252 model × level × card × card-count cases, 0 faults (reach never shrinks with more cards; non-stackable types ignore the count; offload only when it does not fit, never faster than all-GPU; Best fit still equals `fitsOnGpu`).
- **Found, not changed:** `rooflineTokS` divides decimal GB/s by binary GiB of weights, so every dense ceiling on the site is ~7% low; one measured row (Llama 3.1 8B EXL2 on the 4090, 235) sits 3% above its 228 bound. Correcting it moves 693 GPU-page sentences; the owner chose to keep it as is (2026-10-08).

### 2026-10-08 (d) — VRAM calculator, batch 1 of "best calculator on the web"

The calculator answered one question (how big). It now answers the next three a reader asks, all from `lib/utils/calc-insights.ts` — one module built only on `calcVRAM` / `getVerdict` / `usableCapacityGB` / `tightCeiling` / `formatAllowed`, so nothing can disagree with a GPU page:

- **Every level the model ships** (`levelTable`), sized at the reader's context/batch/KV type, verdict per row on their card (incl. "not on this backend"), clickable to select. "Best fit" = highest quality that is green — swept against `fitsOnGpu` at 4K: **82 cards × 90 models, 0 disagreements**.
- **Longest context on this card** (`contextReach`): binary search over `calcVRAM` itself (1K steps, capped at the model's window) for comfortable and tight; a button jumps to the largest preset inside it. Sweep: **50,439 model × level × card × KV-type cases, 0 faults** (each result green/non-red at itself and not at +1K).
- **Speed ceiling** on the reader's card (`speedCeiling` → `rooflineTokS`), dense models only, hidden when the model does not fit. `rooflineTokS`/`weightsGB` moved to `lib/utils/roofline.ts` so the calculator does not bundle the GPU-page prose generator (+13 kB → +3 kB first load); all 693 ceiling sentences on GPU pages byte-identical before/after.
- **KV cache type** f16 / q8_0 / q4_0 (`KV_CACHE_TYPES` in `vram.ts`, `kvBytesPerValue` on `CalcInput`, default 2 bytes so every other surface is unchanged). Sizes from ggml's block layouts (`ggml-common.h`: q8_0 = 34 B / 32 values, q4_0 = 18 B). Flags from source: llama.cpp `-ctk/-ctv` (`common/arg.cpp`); a quantized V cache needs Flash Attention, which `-fa auto` enables and which errors if forced off (`llama-context.cpp`); Ollama `OLLAMA_KV_CACHE_TYPE` + Flash Attention (`docs/faq.mdx`, whose q8_0/q4_0 quality wording is quoted, not ours). Non-GGUF formats get a note that other runtimes' cache options are unchecked. URL param `cache`; reverse mode honours it.
- **Card picker inside forward mode** (writes the shared profile) — the verdict used to need the navbar selector.
- A link naming a model without a level now opens at `referenceQuant()` (GPT-OSS at MXFP4, as its page sizes it); `selectModel`'s fallback uses the same.
- Tool explainer: KV formula states bytes per value; new FAQ "Should I quantize the KV cache?" (9.49 / 7.42 / 6.32 GB for Llama 3.1 8B Q4_K_M @32K, from `calcVRAM`). Sitemap gives `/tools/vram-calc/` its own edit date (`VRAM_CALC_EDITED`) instead of bumping `sizingChangedAt`.

Not done yet (next batches): multi-GPU split, partial CPU offload, an MoE active-parameter speed bound, sizing any Hugging Face repo from its `config.json`.

### 2026-10-08 (c) — VRAM calculator pass (highest-traffic page)

Operated `/tools/vram-calc/` (both languages, 1280/390 px) instead of reading it. Found and fixed:

- **Reverse-mode "Calculate" links were dead.** Each row links to the same page with `?mode=forward&model=…`; `useUrlQuery()` reads the query once after mount, so a client-side navigation changed the address bar and nothing else. Now an `onClick` (`openForward`) switches the state directly (href kept for new-tab/modifier clicks), carries `&gpu=`, and makes the browsed card the profile card so the forward verdict judges the same card.
- **Unknown `?gpu=` ids were kept** — reverse mode then printed "No models fit this GPU" about a card that does not exist. Ids not in `gpuDatabase` are ignored now.
- **"Smallest card" was file order** (RTX 5080 named for 16 GB) and the summary counted the 4 CPU-only RAM rows as cards (82). Now `bySmallestCard` (RTX 4060 Ti 16G), `!isCPU`, `GPU_COUNT` (78); the show-all list says "78 cards + 4 CPU-only RAM sizes".
- **No warning above a model's window** — `ctx > model.contextLength` now shows an amber note (en/zh).
- **Custom models weren't shareable** — `params`/`layers`/`kv`/`hd` now written by `syncUrl` and read on load.
- Dropdown printed "SmolLM3 3B (3B)" — `nameCarriesLabel()` moved to `lib/utils/model-meta.ts`, shared with `WeeklyUpdates`; sort chips gained `aria-pressed`; a missing perplexity read "PPL −—", now "PPL —".

Checked and fine: no console errors or horizontal overflow at 390 px (forward, reverse, DGX Spark/R9700/B70 rows). First-load JS (253 kB) is the shared layout's data, the same order as every other page — not a calculator problem. No sizing number changed, so `sizingChangedAt` is not bumped.

### 2026-10-08 (b) — Optimisation pass: honest sitemap dates for derived pages; 404 language link

Audit of the export (link graph excluding nav/footer, Playwright on 18 key pages at 1280 and 390 px,
`indexnow --dry-run`). Clean: no content page under 3 inbound links, no console or hydration errors,
no horizontal overflow. Found two faults:
- **IndexNow announced 354 of 460 URLs every deploy.** GPU, `/best/`, format, tool, FAQ and hub-index
  pages carried `dataLastUpdated`, and 63 model rows without `addedAt` fell back to it — so a daily
  patrol that only bumped a runtime version re-submitted most of the site. They now take the latest of
  every `addedAt` (models + GPUs) and a new `sizingChangedAt` in `meta.ts` (bump it only when sizing,
  arch fields, fit rules or page-prose generators change; `dataProblems()` rejects it past
  `dataLastUpdated`). Model pages use `max(addedAt, sizingChangedAt)`, `/cookbook/` the newest
  `articleModifiedAt`, `/benchmarks/` `runtimeVersions.checkedAt`. Home, `/changelog/`, `/about/`
  keep `dataLastUpdated` (their text does change). Perturbation: with today's two GPUs back-dated,
  a runtime-only day selects **8** URLs instead of 354.
- **404 language switcher linked `/zh/_not-found/`** (Next's internal path in the exported 404). 
  `mirrorPath()` now maps `/_not-found` and `/404` to the other tree's home.

### 2026-10-08 — Daily patrol: +2 32 GB workstation cards (78); ExLlamaV3 v1.6.0

`r9700` (Radeon AI PRO R9700 32G — amd.com product page: 32 GB GDDR6, 256-bit, 640 GB/s, RDNA 4) and
`arc-pro-b70` (Arc Pro B70 32G — intel.com spec page + datasheet: 32 GB GDDR6, 256-bit, 608 GB/s),
both `addedAt: '2026-10-08'`. R9700 is gfx1201 (the RX 9070 XT's chip); vLLM's `platforms/rocm.py`
names it (`0x7551: AMD_Radeon_R9700`) and ROCm's system-requirements table lists it, so
`vllmRocmSupported()` gains `R9700` → AWQ/GPTQ allowed. Fits @4K comfortable/tight: R9700 74/75,
B70 72/75 (AWQ-only fits lost on SYCL), RTX 5090 74/75 for reference. "Consumer/retail" filters in
`faq.ts` and `model-explainer.ts` now exclude `Arc Pro` by name (as `/^Radeon RX/` already excludes
Radeon PRO), so the vendor FAQ still names the A770 as Intel's largest retail card; the Arc FAQ
wording became "the largest consumer one". `guidesForGpu` gives R9700 the AMD guide, B70 the Arc
guide. GPU-page `<title>`s (EN + `/zh` mirror) now go through `fitTitle()` — the R9700's was 62 wide;
short names keep the ` | quantized.uk` suffix (the zh template gains a space before `|`). Arc Pro B65 (same 32 GB / 608 GB/s, fewer cores) not added — identical fit list, no new page
content. Runtime: llama.cpp b11480, ExLlamaV3 **v1.6.0** (2026-10-07, Latest; "preliminary ROCm
support (ROCm 10 only, gfx1100+)" — EXL3 still untracked), Ollama v0.40.1-rc0 is Pre-release (kept
v0.40.0), vLLM v0.31.0 unchanged. No new model weights in the window: Mistral Large 4 (announced
10-06, ~1T, weights due 10-27) and Reflection Beam (501B, weights "later this month") are API-only
so far — re-check when weights land.

### 2026-10-07 — Daily patrol: Ollama v0.40.0 promoted; Mac guides note MLX default

Ollama's release page now marks **v0.40.0** (tagged 2026-09-25) as **Latest** — it was Pre-release on
2026-10-06 and skipped then. Its notes: on Apple Silicon "model architectures supported by the MLX
runtime will automatically run on MLX", naming qwen3.8, gemma4, qwen3.6, qwen3.5 (plus decision and
embedding models). The notes give no MLX build sizes, no opt-out and nothing about `ollama ps`; the
docs (`gpu.mdx`, `macos.mdx`) still describe Metal only. So the three Mac guides
(`mac-ollama-setup`, `mac-m3-pro-limits`, `m1-8gb-ollama-limits`) gain one sentence in their first
section saying GGUF sizes are a guide, not exact, for those families under Ollama ≥ 0.40 — no MLX
figure invented; `updatedAt` → 2026-10-07, no `verifiedAt`. `runtimeVersions`: ollama v0.40.0,
llama.cpp b11458 (tags page; two `backup/…` branch tags above it ignored), vLLM v0.31.0 and
ExLlamaV3 v1.5.4 unchanged. Candidates skipped: Qwen3.8-Flash-Next (released 2026-08-26, 180B on
disk incl. 51B N-gram embeddings + MTP — a new layout no reachable config describes, and not fresh).

### 2026-10-06 — Daily patrol: runtime versions; no model or hardware added

Runtime versions from each project's GitHub tags/releases page (verbatim lists): llama.cpp **b11434**
(was b11390), vLLM **v0.31.0** (was v0.30.0; tag page: not pre-release, released 2026-10-05), Ollama
v0.35.1 unchanged (**v0.40.0 still Pre-release**, skipped), ExLlamaV3 v1.5.4 unchanged. llama.cpp also
tagged **v0.6.0** (2026-10-05) beside its `b` builds; its notes add a `/v1/systemone` server API for
"decision models" — the class Strands Decider 2B belongs to. That model stays out of the index (no
quantized builds, no text generation) until a GGUF and a runtime path exist; re-check then.
Candidates seen and skipped: DeepSeek-V4.1-Flash (Sept 10; 552B+ MoE, new encoder-decoder design —
sizing not derivable from a reachable config, and no constrained-hardware reader runs it), Mistral
Medium 3.5 (April, 128B dense, not fresh), Reflection Beam (announced 2026-10-05; size, licence and
weights not confirmable from any reachable source). The daily routine moved from a fresh session per
run to this session (the fresh session had no repo attached; the 2026-10-06 run produced no commit).

### 2026-10-05 (e) — Data licensed CC BY 4.0 (Search Console: Dataset missing `license`)

Search Console flagged the `/benchmarks/` `Dataset` JSON-LD (non-critical: field "license" missing).
The site owner chose **CC BY 4.0**. The `Dataset` block now carries
`license: https://creativecommons.org/licenses/by/4.0/`; `/legal/` gains section 10 "Data License"
(EN+ZH; scope = the site's own measurements, VRAM figures and tables — not weights, model cards, HF
counts or trademarks), old 10 → 11, page date 5 Oct 2026 and `LEGAL_LASTMOD` → 2026-10-05; the
benchmarks page shows a visible `rel="license"` line under its coverage note.

### 2026-10-05 (d) — Latest additions: no doubled size label

Model entries printed `paramLabel` under a name that already carried it ("SmolLM3 3B" / "3B · added
…"). `nameCarriesLabel()` in `WeeklyUpdates.tsx` drops it when the name contains the label as a whole
token (space, `(` or `-` before it): 67 + the distill names of 90 skip it; names whose label differs
(Mixtral 8x7B → "47B MoE", GPT-OSS 20B → "21B MoE") keep it. Hardware entries likewise drop the GB list when every name already ends in its capacity
("DGX Spark 128G"). Display-only; no reader changelog entry.

### 2026-10-05 (c) — Homepage: latest additions moved up, hardware included

`WeeklyUpdates` moved from fifth to directly under `HomeMatch`/`StatsBar` (before `PopularStarts`).
It now lists models **and** GPU rows via `latestEntries()` (`lib/utils/latest-additions.ts`, replaces
`latestAdditions` in `model-meta.ts`): `GPU.addedAt` is new and optional, filled for the 17 rows added
2026-10-02…05 from `git log -S` on `gpus.ts` (older rows omit it). Same-day rows of one `type` collapse
into one entry linking the first row's page; on a date tie hardware sorts first. NEW badge uses the
same `RECENCY_ANCHOR` / 45-day window as models. Current six: DGX Spark ×2, OLMo 3 7B, Arc ×4,
SmolLM3, ERNIE 4.5, RTX 5050 · 3060.

### 2026-10-05 (b) — NVIDIA DGX Spark 64G/128G (76 GPUs/machines) + guide (27 guides)

New GPU type `'nvidia-unified'` (backend `cuda`), rows `dgx-spark-128` / `dgx-spark-64`. Sources:
nvidia.com product page (128 GB unified LPDDR5X, 273 GB/s, 256-bit; 20-core Arm CPU) and nvidia.com
news (64 GB at $4,999 from Acer/ASUS/Dell/GIGABYTE/HP/MSI, on sale 2026-10-23); the 64 GB model's
identical 273 GB/s from The Register / HotHardware (blogs.nvidia.com, docs.nvidia.com and the
forums are blocked here). **Not `isUnified`** — that flag applies macOS's ~75% wired cap, which has
no counterpart on DGX OS, and NVIDIA publishes no GPU-usable fraction (its known-issues page says
`cudaMemGetInfo` under-reports allocatable memory, and `nvidia-smi` shows no memory-usage figure on
the iGPU). So capacity is the nameplate, and the change is at the other end: `tightCeiling(gpu)`
(`gpu-page.ts`) ends the 'tight' band at **100%** for this type instead of 105%, because there is no
host RAM behind the pool to spill into. `getVerdict` gained an optional third argument; every call
site that distinguishes yellow from red passes it. Effect: GPT-OSS 120B MXFP4 @4K (66.4 GB) is red on
the 64 GB Spark (would have been "tight" at 104%), matching the press-reported failure.
Fits @4K: 64G 82 comfortable / 83 tight, 128G 84 / 85 (RTX 5090: 74).
GPU-page FAQ: the "can it run the next model up" yellow answer said "loads with nothing else
running" — not on offer when the OS shares the pool; the pooled variant says "not reliably" and names
the native build when it is over the pool. **Latent bug fixed for every page:** the
card-versus-card FAQ opened "They hold the same models" whatever the two counts were (Spark 64 vs
M1 Max 64 = 82 vs 76); it now says so only when the counts match and names the cause (macOS cap, or
formats). Guide `dgx-spark-64gb-vs-128gb` (preset `dgx-spark-64` @8K; `guidesForGpu` scores the
other Spark 6, so both pages link it): table from `calcVRAM`, 70B roofline ~7 tok/s, setup facts from
Ollama `docs/gpu.mdx` (GB10 = CC 12.1), llama.cpp `ggml-cuda/CMakeLists.txt` (`121a-real` only with
CUDA ≥ 12.9) and `docs/docker.md` (`:server-cuda13` is arm64; `:server-cuda` is CUDA 12.8.1), and the
point that `--n-cpu-moe` saves nothing on a single pool. Not done: the CLI generator still emits
`:server-cuda` for every CUDA backend — it runs on GB10 via PTX JIT but without native kernels; making
the image follow the GPU needs the CLI to take a GPU, not a backend. `homePicks` unchanged for every
existing GPU. Pages: 229 EN + 228 ZH.

### 2026-10-05 — +1 model (90): OLMo 3 7B; OLMo 2 7B superseded

Row in `models-extra-12.ts`. Sources: AllenAI's OLMo-core `olmo3_7B` (= `olmo2_7B` = llama2_7B
shape: 32 layers, d 4096, 32 heads, **no GQA → 32 KV heads**, head_dim 128; SWA pattern
`[4096, 4096, 4096, -1]` → 24 window + 8 full layers); released config via web search (huggingface.co
and allenai.org are blocked here): `max_position_embeddings` 65536 = YaRN ×8 over 8192,
`sliding_window` 4096; llama.cpp loads it as `olmo2` with `load_swa_pattern(ml, 4)`, so
`windowTokens` = pad256(4096 + 512) = 4608. Q4_K_M: 6.8 GB @4K, 7.6 @8K, 10.9 @32K, 15.3 @64K
(all-full-attention would be 22.2 @32K, 39.8 @64K). `estimated`, no `pplLossPercent`.
OLMo 2 7B → `supersededBy: 'olmo-3-7b'`: same arch, so same size at 4K, context 4K → 64K
(`supersededDiffNote` context branch). `homePicks` over every GPU × use case: unchanged.
`guideModelCountProblems` fired on 6 guides (27 phrases) as designed; every quoted fit count was
recomputed (each comfortable count +1 — OLMo 3 clears every card ≥ 8 GB at 4K) rather than only the
total bumped. todayFeed: OLMo 3 in, Qwen3-VL 30B-A3B (Aug) out.

### 2026-10-04 (d) — Runtime versions re-checked

From each project's GitHub tags/releases page, read as a verbatim list: llama.cpp **b11390**
(was b11277), Ollama **v0.35.1** (was v0.35.0; **v0.40.0 is marked Pre-release and skipped**), vLLM
**v0.30.0** (unchanged, still marked Latest), ExLlamaV3 **v1.5.4** (2026-10-03). ExLlamaV2 still
v0.3.2 (2025-07-13). The releases-page summary claimed ExLlamaV2 was "not archived"; its README's
first line says "This project is archived for now" — the README is the source, wording unchanged.

**FAQ +2 (`lib/utils/faq.ts`):** `intel-format` and `nvidia-amd-intel`, every figure derived —
largest retail card per vendor (RTX 5090 / RX 7900 XTX / Arc A770 16G → 73 / 71 / 51 comfortable),
formats from `ALLOWED_FORMATS[backendFor()]` ∩ `SHIPPED_FORMATS`. The first draft said equal-VRAM
cards "fit exactly the same models"; running it showed A770 16G 51 vs RTX 5080 55 — the 4 extra are
all AWQ INT4 (Mistral Small 24B, Devstral, Magistral, Codestral). The answer now states that
comparison instead.

### 2026-10-04 (c) — RTX 5090 guide (26 guides)

The last consumer card without a guide. `rtx5090-32gb-what-to-run` (preset `rtx5090` @32K) leads
with the finding rather than the marketing: at 4K, 73 of 89 models fit comfortably vs 71 on a 24 GB
4090. The difference is context — Qwen3 32B Q4_K_M @8K 22.9 GB (comfortable here, tight on 24 GB),
Gemma 4 31B @32K 23.5 GB (98% of a 4090), Qwen3.8 27B @128K 26.0 GB (no 24 GB card) — and the
bandwidth ceiling (1,792 vs 1,008 GB/s; Qwen3 32B ≤95, Gemma 3 27B ≤114 tok/s, roofline only).
Llama 3.3 70B Q4_K_M @8K 47.5 GB stated as not fitting. Blackwell stack note: CUDA 12.8 is the first
toolkit with sm_120 / RTX 50 support (NVIDIA 12.8 release notes, checked 2026-10-04). Figure gate
proven by perturbation. `seoTitle` added (63 wide). Cards without a guide: 7 → 6, all datacentre.

### 2026-10-04 (b) — 12GB GPU guide (25 guides)

`guidesForGpu()` showed seven 12 GB CUDA cards (3060 12G, 4070/Super/Ti, 5070, 3080 12G/Ti) with no
guide at all — the 8 GB and 16 GB tiers each had one. New `12gb-gpu-what-to-run` (preset `rtx3060`
@8K): fit table at Q4_K_M 8K/16K/32K from `calcVRAM` (Qwen3 14B 10.0 GB @4K comfortable → 10.7 @8K
tight → 12.1 @16K out; Gemma 3 12B 10.4 @32K still comfortable thanks to SWA; Mistral Nemo 13.2 @32K
out), counts 48 comfortable / 50 tight of 89, per-card roofline ceilings (76–193 tok/s for Qwen3 8B),
Ollama + llama.cpp (`-ngl all -c`) commands, Windows Sysmem Fallback check, 3 FAQs (14B on 12 GB;
3060 12G vs 4060 Ti 16G — 48 vs 55 comfortable, 360 vs 288 GB/s; GPT-OSS 20B 12.8 GB → `--n-cpu-moe`).
Cards without a guide: 14 → 7 (32 GB RTX 5090 and the datacentre rows).

### 2026-10-04 — Intel Arc guide (24 guides); GPU pages link their guides

**`intel-arc-llamacpp`** (`cookbook-extra-2.ts`, preset `arc-b580` @8K): SYCL build and checks from
llama.cpp `docs/backend/SYCL.md` (render/video groups, oneAPI at `/opt/intel/oneapi`, `GGML_SYCL=ON`
+ `icx/icpx` + `GGML_SYCL_F16`, `sycl-ls` / `llama-ls-sycl-device`, the `detect 1 SYCL GPUs` line,
JIT first-run slowness, `ONEAPI_DEVICE_SELECTOR`, Windows prebuilt `bin-win-sycl-x64` needing no
oneAPI); Ollama route from `docs/gpu.mdx` (Vulkan on by default, `setcap cap_perfmon+ep` for VRAM
data, `GGML_VK_VISIBLE_DEVICES`). Sizes from `calcVRAM` at Q4_K_M @8K: Qwen3 8B 6.4 GB, Gemma 3 12B
8.8, Qwen3 14B 10.7 (89% of a B580 — tight, stated). Speeds are `rooflineTokS` ceilings, labelled as
such. No `verifiedAt`. `guideFigureProblems` proven to cover it by perturbation (6.4 → 7.4 fails).
`seoTitle` added (title was 61 wide).

**GPU pages linked no guide at all** — the RX 7900 XTX page did not link the AMD guide whose
`gpuPreset` is that card. `guidesForGpu()` (`guide-references.ts`) reverses `gpuPreset`: exact card
(10), same non-CUDA backend (6), same-VRAM CUDA card (3); top 3, titles localized. 64 of 78
hardware rows now carry a guide section; the 14 without are CUDA capacities no guide targets
(32 GB, datacentre). Two dead `gpuPage.guidesTitle` strings removed.

### 2026-10-03 (s) — Intel Arc as a hardware class; native llama.cpp build follows the backend

**New GPU type `'intel'`, backend `'sycl'`.** Four cards from intel.com product specification
pages (2026-10-03): Arc B580 12 GB / 456 GB/s, B570 10 GB / 380, A770 16 GB / 560, A750 8 GB / 512,
all GDDR6. `ALLOWED_FORMATS.sycl = ['GGUF']`: llama.cpp's `docs/backend/SYCL.md` lists A770, A750
and B580 as verified; Ollama reaches Arc through Vulkan (`docs/gpu.mdx`, on by default). vLLM has an
XPU backend, but which quantized formats it serves on consumer Arc was not checked, so nothing beyond
GGUF is claimed. Fit counts at 4K (comfortable): B580 48, B570 40, A770 51, A750 33 — all GGUF.

Touched everywhere `type` is read: `backendFor`, `gpu-explainer` (an Intel bottleneck paragraph),
`GpuIndexContent` (group + label), `HomeMatch` (picker group), format wizard (`HardwareType`
`'intel'`, GGUF scoring, `llama.cpp (SYCL) / Ollama (Vulkan)` runtime; 9 priority × use-case combos
all return GGUF), FAQ/model-explainer "consumer/retail card" filters, the CLI tool FAQ.
`homePicks` for the existing 74 hardware rows: identical before/after.

**CLI generator.** Containers: `--device /dev/dri` only (not `/dev/kfd`, which is AMD's — Docker
refuses a missing device), llama.cpp image `:server-intel` (`docs/docker.md` tag list), Ollama the
default image with a Vulkan note. **Native Linux llama.cpp build was CUDA for every backend** — an
AMD reader got `-DGGML_CUDA=ON` (stops at CMake without nvcc) and a CPU-only reader was told to install
a CUDA toolkit. `linuxBuild(backend)` now emits HIP (`docs/build.md`, `GPU_TARGETS=<gfx-target>` left
as a visible placeholder with the `rocminfo` hint), SYCL (`setvars.sh` + `icx/icpx`), plain CPU, or
CUDA. Sweep: 4 frameworks × 4 envs × 5 backends × 2 langs = 160 combos, 0 wrong-language notes,
no NVIDIA/kfd lines on Intel containers, every native llama.cpp build carries its backend's flag.

### 2026-10-03 (r) — Quarterly supersede: Gemma 2 ×3, Mistral 7B v0.3

| Legacy | → Successor | Context | Q4_K_M `vramGB` |
|---|---|---|---|
| Gemma 2 2B | Gemma 4 E2B | 8K → 128K | 2.0 → 2.82 |
| Gemma 2 9B | Gemma 4 E4B | 8K → 128K | 6.5 → 4.56 |
| Gemma 2 27B | Gemma 3 27B | 8K → 128K | 18.5 → 16.2 |
| Mistral 7B v0.3 | Ministral 3 8B | 32K → 256K | 5.2 → 5.2 |

Rules applied: same maker; `supersededDiffNote()` must land on its context branch (never the generic
"still gets builds" line, which nobody here can verify); the successor must fit the hardware the
legacy model fit. That last check changed one pick: Gemma 2 9B first pointed at Gemma 3 12B, whose
8.8 GB would have told an 8 GB-card reader to "prefer" a model their card cannot hold comfortably —
switched to Gemma 4 E4B. **Deliberately not superseded:** Llama 3.1 70B → 3.3 70B and Phi-3.5 mini →
Phi-4-mini (same context and quant count, so the only available reason is the unverifiable generic
line); Phi-3 medium → Phi-4 (16K < 131K context); Qwen2.5 → Qwen3 (41K < 131K).
`homePicks` swept over every GPU × use case before and after: 654 picks, identical — none of the
four held a recommendation.

### 2026-10-03 (q) — Homepage picks + share card catch up

- `todayFeed` (`lib/data/models.ts`): ERNIE 4.5 21B-A3B and SmolLM3 3B added at the top (both
  Q4_K_M, which each ships); the two oldest August entries (Magistral Small 1.2, Seed-OSS 36B)
  dropped so the board stays at 13. `quantizer` is the weights' publisher (`baidu`,
  `HuggingFaceTB`), the same convention as the Google/Z.ai/Moonshot rows — no GGUF publisher was
  verifiable (huggingface.co is blocked here).
- `public/og.svg` / `og.png`: "79+ Models" → "85+ Models" (a floor that stays true for a few
  batches), and the **HQQ badge removed** — the index ships 0 HQQ models, the same fault fixed on
  the hero badges on 2026-08-23 but left in the share card. The checked-in `og.png` was also not a
  render of the current `og.svg` (older layout); re-rendered with `headless_shell` (§10) — the full
  `chrome --headless` reserves ~87 px of the window and left a black band at the bottom.

### 2026-10-03 (p) — RSS changelog items get headlines

`lib/feed/build.ts` used each changelog entry's full text (often 500+ characters) as the item
`<title>`, so feed readers listing titles on one line cut every item mid-sentence. `headline()` now
takes the first sentence (EN `.!?` before whitespace, ZH `。！？`), trimmed at a word boundary past
110 / 60 characters with an ellipsis; the full entry stays in `<description>`. The item `<link>`
pointed at `/#changelog` (the homepage's collapsed block) and now points at `/changelog/` (or
`/zh/changelog/`). The guid is unchanged, so existing subscribers see no duplicate items.

### 2026-10-03 (o) — +2 models (89): SmolLM3 3B, ERNIE 4.5 21B-A3B; guide model-count gate

New pack `lib/data/models-extra-12.ts`, both full attention on every layer (no new sizing shape):
- **SmolLM3 3B** (`smollm3-3b`) — transformers `configuration_smollm3.py`: 36 layers, hidden 2048,
  16 / 4 KV heads (head_dim 128), intermediate 11008, vocab 128256 tied → 3.08B by count. Context
  65536 from Hugging Face's own `smollm3.md` (trained 4K→32K→64K; 128K "using YaRN" only), not the
  transformers default 32768. NoPE every 4th layer does not change the cache. Q4_K_M 2.26 GB @4K,
  4.43 @32K, 6.90 @64K (86% of 8 GB).
- **ERNIE 4.5 21B-A3B** (`ernie-4.5-21b-a3b`) — `configuration_ernie4_5_moe.py`: 28 layers, hidden
  2560, 20 / 4 KV heads (128), 64 routed experts top-6 + 2 shared (width 1536), layer 0 dense
  (12288), vocab 103424 tied, 131072 positions → 21.8B total / ~3B active by count. Q4_K_M 14.05 GB
  @4K (87.8% of 16 GB — on the comfortable line), 15.74 @32K (tight), 21.51 @128K. First draft of
  its description said "fits 16 GB with room for context" — corrected before shipping.
- Both archs confirmed in llama.cpp `src/llama-arch.cpp`. Repo ids for `hfRepoMap` taken from
  transformers' model docs (`HuggingFaceTB/SmolLM3-3B`, `baidu/ERNIE-4.5-21B-A3B-PT`). No GGUF
  size reachable → generic bpw, rows `estimated`, no `pplLossPercent`, no speed.
- **Typed counts in guides went stale** with this batch, and one was already two batches old
  ("71 of the 81 models" in `mac-m3-pro-limits`'s FAQ). Recomputed: RX 7900 XTX 71 / RX 7800 XT 55
  comfortable, M3 Max 48G 73 (largest still Kimi Linear at 30.4 GB), AWQ 53 of 89.
  New gate `guideModelCountProblems()` in `validate.ts`: any guide sentence naming "N of the M
  models" / "the M models here|in this index" / "本索引|本站 M 个模型" fails the build unless
  M = `models.length`. Proven by perturbation (88 → 2 failures). Fit counts inside those sentences
  are not checked — re-run them when it fires.
- `og.svg` still says "79+ Models" — true, so not re-rendered.
- **RSS never showed a new model since August:** `lib/feed/build.ts` took `models.filter(addedAt)
  .slice(0, 20)` in *file order*, i.e. the first 20 dated entries of the early packs; every batch
  from `models-extra-8` on was cut. Now sorted by `addedAt` descending (both feeds verified in
  `out/`: SmolLM3, ERNIE, Gemma 4 lead). Same fault class as the 2026-09-23 "latest additions" fix.

### 2026-10-03 (n) — Site-wide sweep: format cards vs the index's own data; radar removed

After the nine-guide batch, the same fault classes were swept across the CLI, tool content, FAQ,
model/GPU explainers and `lib/data/formats.ts`. Command patterns came back clean (one inline ROCm
`uv pip` mention gained "in a venv"). The format cards did not:
- **AWQ "Best accuracy at 4-bit" contradicted the index.** Paired over the 53 models shipping both
  AWQ INT4 and GGUF Q4_K_M: AWQ's `pplLossPercent` is higher on **53 of 53** (median +1.1 pp) and its
  `bpw` lower on 53 of 53 (median −0.85, ratio 0.825). Card now states that trade-off; "NVIDIA only"
  (contradicting its own `hardwareReq`) and the unmeasured "blazing fast / excellent batch
  throughput" replaced with the measured 218 tok/s row and what vLLM actually does; AutoAWQ
  deprecation noted.
- **GPTQ "Lower accuracy than AWQ":** zero models ship both — no basis; removed and said so. AutoGPTQ
  README: "unmaintained — we suggest using GPTQModel"; framework line updated.
- **HQQ "Impressive / Excellent 2-bit quality":** 0 HQQ models in the index and HQQ's own README only
  headlines "no calibration data"; quality claims removed.
- **Format radar removed** (`FormatRadar.tsx`, `FormatRadarLazy.tsx`, `formatRadarData`,
  `t.home.radar` en+zh): six axes of hand-typed 0–100 scores with no source, presented with no
  caveat — the same fault as the removed "GGUF 89%" heat score — and its "Accuracy/bit" axis ranked
  AWQ (80) over GGUF (75), opposite to every paired row. The heat *ranking* stays. Recharts remains
  for `BenchCharts` only.
- FAQ "GGUF or AWQ" named NVIDIA alone; now includes vLLM-ROCm Radeon cards.

### 2026-10-03 (m) — Nginx proxy guide: `http2 on;` broke stock Ubuntu Nginx

- **Config that would not load:** the server block used `http2 on;`. Checked in Nginx source
  (`nginx/nginx` on GitHub; nginx.org is blocked here): `src/http/v2/ngx_http_v2_module.c` has only
  the `$http2` variable at `release-1.24.0` and gains the `http2` directive at `release-1.25.1`.
  Ubuntu's packages (packages.ubuntu.com) are 1.18.0 on 22.04 and 1.24.0 on 24.04, so `nginx -t`
  rejects it as an unknown directive. Now `listen 443 ssl http2;`, which master still accepts with a
  deprecation warning (`ngx_http_core_module.c`), with a comment saying so.
- `limit_req_zone` / `map` labelled as http-context (conf.d), the `location` as server-context: the
  snippet mixed both levels without saying which goes where.
- FAQ said "Ollama, llama.cpp and vLLM ship with no authentication". llama-server documents
  `--api-key` (`tools/server/README.md`) and vLLM has `--api-key`; none *requires* auth by default,
  Ollama has no key option. Wording corrected in both languages. `updatedAt` 2026-10-03.
- This closes the batch of nine guides last checked 2026-09-12; every guide now has an
  `updatedAt` of 2026-10-02 or later.

### 2026-10-03 (l) — Qwen Coder 32B / 4090 guide: per-context verdicts, the long-context option

All figures from `calcVRAM` on each model's own row (and passed by `guideFigureProblems()`):
- **Stack line vs the numbers:** `verifiedStack` read "4K–16K context" for GGUF *or* AWQ, but GGUF
  Q4_K_M is 21.7 / 22.8 / 25.0 GB at 4K / 8K / 16K (90 / 95 / **104%**). AWQ INT4 is 18.1 / 19.2 /
  21.4 / 25.8 GB at 4K / 8K / 16K / 32K (75 / 80 / 89 / 107%). The guide now gives every band.
- **Unearned ranking:** the description said "the best open coding model that fits in 24GB" — the
  site runs no coding benchmarks. Rewritten as a fit question.
- **Long-context option added:** Qwen3-Coder 30B-A3B (in the index) — Q4_K_M 19.7 GB @4K (82%),
  22.6 @32K (94%); AWQ 16.4 @4K, 19.2 @32K (80%, comfortable). No AWQ repo name is given for it
  (could not confirm which publisher ships one): a visible `<placeholder>` instead. No speed claim:
  no measured row; MoE ceiling described qualitatively.
- EXL2 3.5bpw build (16.0 GB @4K) acknowledged with the archived-runtime caveat. vLLM commands gain
  `--host 127.0.0.1` (vLLM binds all interfaces by default) and the Linux/WSL2 note; the "check it
  ran on the GPU" step adds `ollama ps`. 44 tok/s re-confirmed as `matrixData`'s llama.cpp Q4_K_M row
  for base Qwen2.5 32B; ceiling 1008/18.7 ≈ 54 stated. `relatedModelIds` + `qwen3-coder-30b-a3b`.

### 2026-10-03 (k) — VPS llama.cpp guide: thread contradiction, unverified plan, real memory

- **Self-contradiction:** the prose said "set the thread count to your physical core count" and the
  command passed `-t $(nproc)` (vCPUs — hyperthreads on many plans). Dropped `-t`: llama.cpp's
  default is `common_cpu_get_num_math()` = physical cores (source read for the 2026-10-03 (j) ship).
  `lscpu` check for `Thread(s) per core` added. The CLI tool takes the reader's own `-t` value, so
  it was left alone.
- **Unverifiable provider claim removed:** "~€15–25/month for an 8-core 16–32 GB instance (Hetzner
  CX32-class)". The plan naming did not obviously match the stated size and neither price nor spec
  could be checked from here (provider sites blocked) — removed, FAQ reworded to "a budget 16 GB VPS".
- **Memory now from `calcVRAM`:** Llama 3.1 8B Q4_K_M = 6.19 GB @8K, 9.49 @32K, 22.69 @128K — the
  guide had only "4.6 GB of weights … room past 8K", silently implying the trained window fits 16 GB.
- Speed check added (`llama-bench`, `tg128`) — the section claimed to "confirm both" start-up and
  speed but only checked start-up. Build prerequisites re-checked against `docs/build.md` (OpenSSL
  optional, not needed with a reverse proxy). `updatedAt` 2026-10-03, no `verifiedAt`.

### 2026-10-03 (j) — Quantize-your-own-GGUF + CPU inference guides vs llama.cpp master

Read from `ggml-org/llama.cpp` master: `tools/quantize/README.md`, `tools/imatrix/README.md`,
`tools/cli/README.md`, `tools/completion/README.md`, `tools/llama-bench/README.md`,
`convert_hf_to_gguf.py`, `docs/build.md`, `common/common.cpp`.
- **`llama-cli` is now the chat tool** (one-shot raw completion moved to `llama-completion
  -no-cnv`). `llama-cli -p … -n 64` answers and then waits for input; the quantize guide's check now
  passes `-st` ("will not be interactive if first turn is predefined with --prompt"), which also
  exercises the chat template — the failure that check exists to catch. `--perf` defaults to false,
  so the CPU guide's "look for prompt eval time / eval time at the end" no longer printed anything;
  it now uses `llama-bench` (`pp512` vs `tg128` rows, `-t 4,8,16` sweep).
- **imatrix:** `-o my-model.imatrix` wrote the *legacy* format (any non-`.gguf` extension does);
  now `-o my-model.imatrix.gguf`, plus `-ngl 99` from the README's example.
- **Conversion:** `--outtype f16` → `bf16` (the README's own example; `auto`, the default, picks the
  highest-fidelity 16-bit type). Note added that newer archs need `pip install -U transformers`
  (README: requirements pin transformers 4; Gemma 4 needs 5). `convert.py` confirmed absent (legacy
  script lives at `examples/convert_legacy_llama.py`); GGUF-my-repo "syncs every 6 hours" is the
  quantize README's own statement — kept.
- **Threads:** `-t` unset → `common_cpu_get_num_math()` = physical cores, performance cores only on
  hybrid x86 Linux; the guide no longer hardcodes `-t 8`, and points to the
  `system_info: n_threads` log line. BLAS claim re-confirmed verbatim in `docs/build.md`.
- Q4_K_M claims recomputed: all 87 GGUF models ship it; median loss 2.9% over the 79 reporting it
  (sample size now stated). Both guides `updatedAt` 2026-10-03, no `verifiedAt`.

### 2026-10-03 (i) — vLLM guides + CLI against vLLM V1 source

Read from `vllm-project/vllm` main (raw.githubusercontent): `vllm/v1/core/sched/scheduler.py`,
`vllm/v1/metrics/loggers.py`, `vllm/config/scheduler.py`, `docs/getting_started/quickstart.md`,
`docs/features/quantization/auto_awq.md`.
- **Stale failure signature:** both guides (and this repo's CLAUDE.md) said KV pressure shows up as a
  warning naming `PreemptionMode.RECOMPUTE`. That was the V0 engine; `vllm/core/scheduler.py` is gone
  and `vllm/engine/llm_engine.py` is an alias for the V1 engine, whose scheduler logs no preemption
  warning. V1 reports it in the periodic `LoggingStatLogger` line (`… Running: N reqs, Waiting: N
  reqs, Preemptions: N, GPU KV cache usage: X%`, the `Preemptions` part only when > 0) and the
  `vllm:num_preemptions` counter. 4 passages rewritten in both languages; the old name is kept only
  as "older guides quote…".
- **Install could not run as written:** `uv pip install` needs a virtual environment; the quickstart
  creates one with `uv venv --python 3.12 --seed`. Added to `rtx4090-vllm-api` and to the CLI's
  CUDA native path (`lib/utils/cli.ts`; the ROCm path already had it). Python range 3.10–3.13
  stated. CLI swept: 128 framework × env × backend × lang combos, 0 problems.
- Chunked prefill is on by default (`enable_chunked_prefill: bool = True`); the
  `max_num_batched_tokens < max_model_len` start-up error applies only when it is turned off —
  wording now says so.
- AutoAWQ marked deprecated in vLLM's docs (→ `llm-compressor`); FAQ says so, existing checkpoints
  still load. Stale "53 of the 81" → 53 of 87 (recounted).
- Both guides `updatedAt` 2026-10-03; no `verifiedAt` (no GPU here).

### 2026-10-03 (h) — Docker + Ollama guide: AMD, the missing toolkit step, a misattributed speed

Checked against Ollama's `docs/docker.mdx` (main) and NVIDIA's container-toolkit sample workload
(`NVIDIA/cloud-native-docs` `container-toolkit/sample-workload.md`):
- **Misattributed measurement:** the guide said 218 tok/s "is what this index measured for this
  exact model and quant on that card, in Ollama". The only 218 row in `benchmarks.ts` is **vLLM AWQ
  INT4**; the GGUF Q4_K_M row on the RTX 4090 is **llama.cpp, 148**. 218 survives only as the
  bandwidth roofline (1008 / 4.6 GB), labelled as such; 148 cited as the measured figure. The FAQ
  repeated the same claim — fixed. "No measurable overhead" (here and in `docker-llm-compose`)
  softened to an expectation: no container-vs-native run exists in the index.
- **Missing step:** `sudo nvidia-ctk runtime configure --runtime=docker` + Docker restart after
  installing the toolkit (`docker.mdx`). Verify command is now NVIDIA's own
  `docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi` (no CUDA image tag to rot).
- **AMD added:** `ollama/ollama:rocm` with `/dev/kfd` + `/dev/dri`; the default image bundles
  Vulkan (used when the devices are reachable); SELinux `container_use_devices=1` from
  `gpu.mdx`; macOS containers cannot reach the Apple GPU. Title now "NVIDIA or AMD", tags + `AMD`.
- 4 FAQs (new: AMD in Docker). `docker-ollama-gpu` and `docker-llm-compose` `updatedAt` → 2026-10-03;
  no `verifiedAt` (not run).

### 2026-10-03 (g) — Windows Ollama guide: AMD works; PowerShell-safe API calls

Checked against Ollama's own docs on `main` (`docs/windows.mdx`, `docs/gpu.mdx`, `docs/faq.mdx`,
fetched via raw.githubusercontent):
- **Wrong claim removed:** the guide's description said "AMD is CPU-only for now". The Windows app
  supports Radeon: ROCm (needs a ROCm v7 / HIP7 driver) on RX 7900 XTX/XT/GRE, 7800 XT, 7700 XT,
  7600 XT, 7600 + W7x00; Vulkan enabled by default for other cards (`gpu.mdx`), the documented
  fallback for RX 6000 that may not expose ROCm 7 on Windows drivers (`windows.mdx` note);
  `GGML_VK_VISIBLE_DEVICES` when a mixed iGPU/dGPU system picks the iGPU.
- Requirements now Windows 10 22H2+ and NVIDIA driver ≥ 551.61 (was "Windows 11").
- API examples used `curl -d` in a PowerShell block; in Windows PowerShell 5.1 `curl` aliases
  `Invoke-WebRequest`, so they fail. Now `Invoke-RestMethod` (the docs' own example uses
  `Invoke-WebRequest -Body`), with a `curl.exe` note.
- `ollama ps` sample gained the `ID` column (docs: NAME ID SIZE PROCESSOR UNTIL); default context
  4096 and 5-minute keep-alive cited from `faq.mdx`; `server.log` under `%LOCALAPPDATA%\Ollama`
  as the AMD check. 4 FAQs (new: "Does Ollama on Windows use an AMD Radeon GPU?"); `AMD` tag added
  (model-page links to the guide unchanged: still 1 model page, checked in `out/`).
- `amd-rocm-llamacpp` ROCm-vs-Vulkan FAQ gains one sentence pointing Windows readers at Ollama's
  Windows app. No other site copy claimed AMD-on-Windows was CPU-only (grepped).
- Same PowerShell sweep over every guide code block: `llamacpp-windows-cuda` ran `llama-server.exe`
  with `^` continuations in a `powershell` block — cmd syntax, so PowerShell would have started the
  server with no flags; now one line (works in both). `wsl2-ollama-gpu`'s Windows-side check is
  `curl.exe`. Both guides' `updatedAt` → 2026-10-03.
- Not run (no Windows/GPU here) — `updatedAt` 2026-10-03, no `verifiedAt`.

### 2026-10-03 (f) — One contact address: `zjy@quantized.uk`

- Site owner's own address `zjy@quantized.uk` is now **the only** contact address:
  `FEEDBACK_EMAIL` (`lib/seo.ts`) changed from `hello@quantized.uk`, which was typed into the site
  by an earlier session and never confirmed to receive mail (MX/routing could not be checked from
  here — DNS-over-HTTPS is blocked). One constant, so Footer, 404, run-feedback mailto,
  `MaintainerNote`, JSON-LD `contactPoint` and `/llms.txt` (now built from the constant) all follow.
- A first version of this ship added a separate `MAINTAINER_EMAIL` beside `hello@`; collapsed into
  the one constant the same day. `/about/`'s "Who maintains this?" card keeps a direct line
  (`about.maintainerContact`, en + zh). Maintainer still unnamed — an address is not a `Person`.

### 2026-10-03 (e) — AMD ROCm guide: FAQs; `LLAMA_HIPBLAS` wording

- **3 FAQs** on `amd-rocm-llamacpp` (the last high-traffic guide without them): ROCm vs Vulkan
  (Vulkan needs no ROCm; `HSA_OVERRIDE_GFX_VERSION` is unsupported on Windows per llama.cpp
  `docs/build.md`; no speed verdict — no Radeon measurements), AWQ/GPTQ only via vLLM ROCm on the
  cards `vllmRocmSupported()` names, EXL2 never; 24 GB vs 16 GB Radeon (69 vs 53 comfortable fits
  at 4K via `countModelsFitting`; Qwen3 30B-A3B Q4_K_M @8K 20.2 GB = 84% of 24 GB; GPT-OSS 20B
  MXFP4 @8K 12.9 GB) — all figures from `calcVRAM`, passed by `guideFigureProblems()`.
- **Correction:** the guide said CMake ignores the old `LLAMA_HIPBLAS` silently. It is not in
  llama.cpp's `llama_option_depr` list (top-level `CMakeLists.txt`, checked today), so it is not
  forwarded like `LLAMA_CUDA`, but CMake does report it under "Manually-specified variables were not
  used". Outcome unchanged (CPU-only build); wording fixed in the build step and in Common problems.
- `updatedAt` → 2026-10-03; still no `verifiedAt` (no Radeon here).

### 2026-10-03 (d) — GPT-OSS guide checked against llama.cpp's gpt-oss guide

Source: ggml-org/llama.cpp discussion #15396 (fetched verbatim): recommended commands
`llama-server -hf ggml-org/gpt-oss-20b-GGUF --ctx-size 0 --jinja -ub 2048 -b 2048`; `--n-cpu-moe N`
("keep as many MoE layers as necessary on the CPU"), RTX 2060 8GB example `--n-cpu-moe 16`; reasoning
effort via `--chat-template-kwargs '{"reasoning_effort": "high"}'`; "OpenAI recommends temperature=1.0
and top_p=1.0" / "Do not use repetition penalties"; RTX 4090 llama-bench tg128 221.95, pp2048 8022;
RTX 3060 12GB "67 tok/sec initial" with offloading. Guide: 8GB `--n-cpu-moe` example added; the
unsourced "Needs ~64GB system RAM. Expect single-digit tok/s" (120B on 24GB) removed — no speed given;
the 20B command's comment now states 32K is 13.5 GB here / 15.5 GB by llama.cpp's table and that the
official `--ctx-size 0 -ub 2048` form needs ~18 GB; failure table "bigger than ~12.8GB" → 11.3 GiB and a
sampling row added; `--host 127.0.0.1` on the 120B command. 3 FAQs (8/12GB cards, 4090 speed —
attributed to llama.cpp's devs, sampling).

### 2026-10-03 (c) — GPT-OSS effective bpw; guide figures gated against the calculator

**GPT-OSS** MXFP4 rows used `bpw: 4.25` — MXFP4's rate, which applies only to the MoE expert tensors
(OpenAI README: "MXFP4 quantization of the MoE weights"; llama.cpp `conversion/gpt_oss.py` repacks
only the expert tensors). llama.cpp's own guide (ggml-org/llama.cpp discussion #15396) gives the
GGUF files as 11.27 GiB (20B) and 59.02 GiB (120B) → effective 4.63 / 4.34 bpw. Cross-check: a
tensor-by-tensor count from transformers `GptOssConfig` reproduces the parameter totals exactly
(20.91B / 116.83B; 1.80B / 2.13B non-expert). 20B @4K 11.7 → 12.8 GB; 14 verdicts change (12 GB
cards and 16 GB Macs tight → over; M3 Pro 18G comfortable → tight); comfortable counts unchanged.
The same guide lists totals of 14.9 / 15.5 / 17.9 GB at 8K / 32K / 131K — higher than `calcVRAM`
(12.9 / 13.5 / 16.0) because it counts compute buffers in full; the GPT-OSS guide now prints both and
calls the calculator a lower bound rather than adding a model-specific fudge. Its "Q4_K_M overstates
by ~14%" line (true only against 4.25) is gone. Q8_0/Q4_K_M GPT-OSS rows untouched (no source).

**`guideFigureProblems()`** in `lib/data/validate.ts` (runs in `assertDataConsistent()`): any guide
sentence or table row naming a model + quant level + context + GB figure must match `calcVRAM` total
or weights within 0.3 GB. Strict single-sentence matching keeps false positives out (a paragraph-level
variant mis-paired "288 GB/s" and a Q2_K figure). Proven by perturbation (restoring the Mac row's old
11.8 fails the build). A broader one-off scan also fixed: RTX 4060 Ti guide 11.7 → 12.8; Mac setup
guide "48GB M3 Max runs 71 of 81 … GLM-4.5-Air at 37.2 GB" — the 37.2 was Q2_K and over the 36 GB
usable budget; now 71 of 87, largest Kimi Linear 48B-A3B at 30.4 GB. Mac M3 Pro guide GPT-OSS row
11.8 → 12.9 (tight).

### 2026-10-03 (b) — 8GB starter guide re-run against the calculator

Every row re-derived with `calcVRAM`: Phi-4 Mini 2.9 → 3.0 GB and Qwen3 4B Q6_K 4.1 → 4.0 GB (arch
fixes of 2026-09-30), Llama 3.1 8B Q4_K_M @16K 7.1 → 7.3 GB = 91% — the site's `tight` band, so the
row said "fits, little margin" against its own threshold; "16K costs ~2GB" → 1.7GB. Added Gemma 4
E4B (4.9 GB) and Qwen3-VL 8B (6.2 GB) as the image-capable fits; `gemma-4-e4b` added to
`relatedModelIds`. AWQ suggestion now says vLLM is Linux-only (vLLM `installation/gpu.md`: "does not
support Windows natively"). Offload snippet updated for llama.cpp's default `-ngl auto` + `--fit`;
`ollama ps` sample gains ID and drops a size that was another model's figure. 3 FAQs; `updatedAt`
2026-10-03.

### 2026-10-03 — Mac M3 Pro guide: partial offload exists; bandwidth ceilings; shared `isMoE()`

- **Wrong claim fixed**: the guide said "Metal has no partial-offload equivalent — a model that does
  not fit fails or swaps rather than splitting". Ollama `server/sched.go` has an explicit
  `metal_partial_offload` path (predicted VRAM > available on a Metal device) and `discover/` sizes
  the GPU from Metal's `recommendedMaxWorkingSetSize`; `cmd/cmd.go` prints the split as
  `%d%%/%d%% CPU/GPU`. Guide now says the split is the over-limit signal; `ollama ps` sample gains the
  ID column (Ollama `faq.mdx`).
- **Speed**: ceilings from `rooflineTokS()` on the `m3-pro-18` row (150 GB/s): 8B 32, 14B 18, 32B 8
  tok/s — stated as upper bounds; no M3 Pro rows in `matrixData`. Qwen3 30B-A3B added to the 36GB
  section (20.1 GB @8K = 75% of 27 GB, comfortable) with no number, since the roofline does not apply
  to MoE. All sizes re-run through `calcVRAM` (unchanged). 3 FAQs; `updatedAt` 2026-10-03.
- **`isMoE()`** (`lib/utils/model-meta.ts`) replaces three copies. `rooflineTokS` used `/A\d/` and
  treated the 10 `… MoE`-labelled models (Mixtral, DBRX, Llama 4, DeepSeek V3/R1, Mistral Large 3,
  GPT-OSS ×2, GLM-4.5-Air) as dense — latent: the GPU pages compute the ceiling only for a dense
  reference model, so a visible-text diff of all 140 GPU pages showed 0 changes.

### 2026-10-02 (j) — EXL2's runtime is archived; CLI ExLlamaV2 commands were invented; `huggingface-cli` is gone

Sources: ExLlamaV2 `README.md` ("This project is archived for now"; README run commands
`test_inference.py`, `examples/chat.py -m … -mode … -gs auto`; `-l` from `model_init.py`; repo has no
`exllamav2/server/__main__.py` and no Dockerfile); TabbyAPI `README.md` (official server for
ExLlamaV3; supported model types EXL3 + FP16/BF16), `pyproject.toml` (depends on `exllamav3` only),
`docs/01.-Getting-Started.md`, `config_sample.yml` (`network.host` 127.0.0.1, port 5000,
`disable_auth: false`), `docker/docker-compose.yml` (`shm_size: "8g"`), `common/auth.py`
(`x-api-key` / `Authorization: Bearer`), tags page (no tags or releases); text-generation-webui
README (ExLlamav3 loaders only); huggingface_hub `setup.py` (console_scripts `hf` only — no
`huggingface-cli`; no `cli` extra) and `docs/source/en/guides/cli.md`.

- **CLI ExLlamaV2 output** printed `python -m exllamav2.server … -host 0.0.0.0` and
  `ghcr.io/turboderp/exllamav2:latest` — neither exists. Now: clone + `pip install .`,
  `hf download <repo> --revision <bpw>bpw` (EXL2 bitrates are branches; the old `--include
  "*4.65bpw*"` matched nothing), `python examples/chat.py -m … -mode <template> -l <ctx> -gs auto`
  with `exllamaMode()` picking the template from the model name (unknown → `chatml` + a note to run
  `-modes`). Docker/Compose say there is no image instead of inventing one. Swept 128 outputs (4
  frameworks × 4 envs × 4 backends × 2 langs): 0 `huggingface-cli`, 0 invented commands, 0
  non-loopback ports, 0 English notes in `zh`.
- **`huggingface-cli` → `hf download`** and `huggingface_hub[cli]` → `huggingface_hub` in the CLI and
  4 guide code blocks; the tool page FAQ names the rename.
- **Format wizard**: EXL2 −15 with an "archived" reason on NVIDIA, and −40 more for `api`. Sweep:
  `nvidia/speed/api` EXL2 75 → AWQ 70 wins; `nvidia/speed/chat|code` EXL2 still first (60 vs 55 —
  the measured speed advantage is real); `quality` second place EXL2 → GPTQ.
- **EXL2 format entry**: description/strengths/weaknesses state the archive; `framework`
  `'ExLlamaV2 · TabbyAPI'` → `'ExLlamaV2'` (TabbyAPI no longer reads EXL2; guide matching splits on
  `·`, so the TabbyAPI guide no longer maps to EXL2).
- **Guides**: `tabbyapi-exllama-server` rewritten for TabbyAPI-on-EXL3 (title/description/tags
  overridden, slug kept, `relatedModelIds: []` — the index has no EXL3 builds, so no size or speed
  figure is given); `exllama-rtx4090-setup` gains the status, clone-not-just-pip (examples live in the
  repo), `-mode llama3` for Llama 3.1 (`llama` is the Llama 1/2 template), and a count-free GGUF
  line (said "81 of 81"); `deepseek-r1-exl2-vs-gguf` gains the status line. Model explainer and tool
  page FAQ updated. CLI zh note told readers to pick "macOS Terminal" while the zh UI says "macOS 终端".

### 2026-10-02 (i) — Dual-GPU guide vs current llama.cpp; old-flag claim corrected; CLI ports on loopback

**Dual-GPU guide** re-checked against llama.cpp `docs/multi-gpu.md`, `common/arg.cpp`,
`common/common.h`: `-ngl` defaults to `auto` and `--fit` defaults **on** with a 1 GiB margin per
device (`fit_params_target`), adjusting only unset args; `n_ctx` 0 = trained context (128K for Llama
3.3), cut by fit down to `fit_params_min_ctx` 4096; `--tensor-split` optional (default proportional
to memory); split modes `layer` (default) / `row` (deprecated) / `tensor` (experimental: needs flash
attention, unquantized KV, no auto-fit). Guide now passes `-ngl all -c 4096`, drops the needless
`--tensor-split 1,1`, adds `--list-devices`, a split-mode section with no speed claim (not measured),
and 3 FAQs. Figures re-run through `calcVRAM` (unchanged: 46.1 / 47.5 GB). The guide suggested
Q3_K_M "which the model index prints per level" — Llama 3.3 70B ships no Q3_K_M here; now stated
as the calculator's generic rate (38.4 GB @8K, 37.1 GB @4K for a 24+16 GB pair = 93%, tight).

**Old CMake flag claim was wrong, site-wide.** llama.cpp `CMakeLists.txt` `llama_option_depr`:
`LLAMA_CUBLAS` → `FATAL_ERROR`, `LLAMA_CUDA` → `WARNING` and sets `GGML_CUDA` ON. The site said the
old names were "silently ignored" and gave a CPU-only build (tool page FAQ, the Windows CUDA guide
×3, the dual-GPU guide, a `cli.ts` comment, CLAUDE.md). What does give a CPU-only build is no flag or
a misspelt one, which CMake reports only under "Manually-specified variables were not used".

**CLI exposure.** Every Docker `-p` / Compose `ports:` mapping was bare (`8080:8080`), which
publishes on all host interfaces (Docker's iptables rules also bypass ufw) — the code comment
claimed the mapping limited exposure. Now `127.0.0.1:` on all 9 mappings (incl. Open WebUI) plus an
`exposureNote` on every container output. Native `vllm serve` had no `--host` (vLLM's default is
`None` = all interfaces) → `--host 127.0.0.1`; native Ollama printed `OLLAMA_HOST=0.0.0.0:<port>
ollama serve` → loopback, and on 11434 (where the installer's service / the macOS app already
listens) a commented stop-first hint instead of a second server. Swept 96 framework × env × backend
× lang outputs: 0 non-loopback mappings, 0 native `0.0.0.0`. GPT-OSS guide's `--host 0.0.0.0` →
`127.0.0.1`. ExLlamaV2 CLI output still binds 0.0.0.0 — it is being replaced (its `python -m
exllamav2.server` and image do not exist; next ship).

### 2026-10-02 (h) — WSL2 + Ollama guide re-checked against current docs

Sources: MicrosoftDocs/WSL `wsl-config.md` (`memory` default "50% of total memory on Windows";
`[boot] systemd` default `false`; `sparseVhd` applies to newly created VHDs; `networkingMode`
nat/mirrored/bridged-deprecated), `networking.md` (LAN access in NAT mode needs `netsh interface
portproxy`; mirrored mode, Windows 11 22H2+, connects WSL directly to the LAN); NVIDIA CUDA on WSL
user guide via search on nvidia.com (driver stubbed as libcuda.so; do not install a Linux driver; the
`cuda` / `cuda-drivers` meta-packages install one, use `cuda-toolkit-12-x` only); Ollama `faq.mdx`
(`ollama ps` columns NAME ID SIZE PROCESSOR UNTIL; default context 4096), `scripts/install.sh` (WSL2
branch installs no driver, prints "Nvidia GPU detected."; warns "systemd is not running" and starts
no service). Corrections: the guide said a 0.0.0.0-bound server in WSL is LAN-reachable — false in
default NAT, true in mirrored mode; `ollama ps` sample lacked ID. Additions: cuda meta-package
pitfall, systemd step, sparseVhd caveat, example model qwen2.5:7b → qwen3:8b with its size from
`calcVRAM` (5.8 GB at 4K, Q4_K_M), `gpuPreset.ctx` 8192 → 4096 to match Ollama's default, 3 FAQs
(one says the site has not measured WSL-vs-native and gives no number). `updatedAt` 2026-10-02, no
`verifiedAt` — a documentation check, not a run.

### 2026-10-02 (g) — +2 models (87): Gemma 4 E2B, E4B; wizard AMD wording

Configs from transformers `convert_gemma4_weights.py` `_VARIANTS` (E2B: hidden 1536, 35 layers,
pattern 4 sliding + 1 full, 8 heads, 1 KV head, `num_kv_shared_layers` 20, double-wide MLP on shared
layers; E4B: hidden 2560, 42 layers, 5:1, 2 KV heads, 18 shared) and `configuration_gemma4.py`
defaults (head_dim 256, global_head_dim 512, sliding_window 512, max_position 131072, PLE 262,144 ×
layers × 256; `attention_k_eq_v` false, so global layers keep the same KV-head count). llama.cpp:
`reuse` callback for GEMMA4 allocates no cache for layers ≥ `n_layer_kv_from_start`; window cells
pad256(512 + 512) = 1024. So E2B caches 3 full + 12 SWA layers, E4B 4 full + 20 SWA. Parameter count
by layer: E2B 4.647B text (2.298B without PLE — matches the vendor's "2.3B effective"), E4B 7.518B;
both + encoders reconcile with the vendor's 5.1B / 8B. `per_layer_token_embd` is a LAYER_INPUT tensor
(CPU-resident in llama.cpp), so `params` = total and the description states the ~1.3 / 1.6 GB of VRAM
that saves at Q4 on a discrete card — conservative rather than a new field threaded through every
`calcVRAM` call. Q4_K_M at 4K / 128K: E2B 3.0 / 3.8 GB, E4B 4.9 / 7.0 GB; both comfortable on the
smallest card here (8 GB). Sizes `estimated` (no GGUF file size reachable). E4B added to Editor's
Picks. Format wizard: the AMD AWQ/GPTQ reason now names vLLM's supported cards; GPTQ runtime label
no longer says "partial ROCm".

### 2026-10-02 (f) — AMD: AWQ/GPTQ only on vLLM-supported cards; GPTQ was wrongly CUDA-only

`formatAllowed()` let every AMD row load AWQ, but on ROCm AWQ and GPTQ are vLLM-only and vLLM's
ROCm requirements list only gfx90a/942/950, gfx1100/1101 (RX 7900/7800/7700, PRO W7900),
gfx1200/1201 (RX 9000) and Ryzen AI MAX. `vllmRocmSupported()` moved from `cli.ts` to
`gpu-page.ts` (one copy, the CLI imports it) and now gates AWQ/GPTQ on ROCm. **GPTQ added to
`ALLOWED_FORMATS.rocm`**: vLLM's source lists `gptq` in `RocmPlatform.supported_quantization` and
`CMakeLists.txt` builds `gptq/q_gemm.cu` for HIP (AWQ runs via Triton, forced on in
`verify_quantization`). vLLM's docs chart (`features/quantization/README.md`) still marks both ❌
for AMD — it contradicts the code, and the code was taken as the authority. ExLlamaV2's README has
no ROCm path, so EXL2 stays CUDA-only. Measured (`fitsOnGpu`, comfortable/tight at 4K):
RX 6800 XT / 6900 XT / 7600 XT 51/57 → 47/54, RX 6700 XT 45/47 → 45/46, MI100 69/70 → 67/70;
RX 7900 XTX 66 → 67 and RX 9060 XT 8G 33 → 34 (a GPTQ pick). Also fixed in the GPU-page FAQ
"Can <card> run <next model up>?": it sized the smallest build in *any* format and, if that was
AWQ/EXL2, answered "that format doesn't run here — check for GGUF" on 15 EN pages for models that
do ship GGUF; it now sizes the smallest build the card can load. FAQ `amd-format`, the AMD guide,
the GPTQ `hardwareReq` and the calculator's mismatch line updated to match.

### 2026-10-02 (e) — CLI vLLM: ROCm image and install, current entrypoint, supported-card check

Sources: vLLM `docs/getting_started/installation/gpu.rocm.inc.md` (official `vllm/vllm-openai-rocm`
image — AMD's `rocm/vllm` is deprecated — run with `--group-add=video --cap-add=SYS_PTRACE
--security-opt seccomp=unconfined --device /dev/kfd --device /dev/dri --ipc=host`; supported GPUs
MI200s, MI300/350, RX 7900 series gfx1100/1101, RX 9000 gfx1200/1201, Ryzen AI MAX),
`docs/getting_started/quickstart.md` (`uv pip install vllm --torch-backend=auto`; AMD: `uv venv
--python 3.12 --seed` + `--extra-index-url https://wheels.vllm.ai/rocm/`; `vllm serve <repo>`),
`docs/deployment/docker.md` (`--ipc=host`). The native command still printed `pip install vllm` and
`python -m vllm.entrypoints.openai.api_server`, contradicting the site's own 2026-09-12 vLLM guide.
`vllmRocmSupported(gpuName)` (new `gpuName` option) flags Radeon cards off vLLM's list — RX 6000
(gfx1030), RX 7600 XT (gfx1102), MI100 (gfx908) — with a note; Mac/CPU get a note too. Compose
gains `ipc: host` and, on ROCm, `devices`/`group_add`/`cap_add`/`security_opt`. Sweep: 584 notes, 0
wrong-language; every vLLM compose parses as YAML.

### 2026-10-02 (d) — CLI container commands follow the GPU backend; notes bilingual

`generateCLI` gains `backend` (`backendFor()` of the hardware-profile GPU, default `cuda`) and `lang`.
llama.cpp and Ollama `docker`/`compose`: CUDA → `:server-cuda` / `ollama/ollama` + `--gpus all` /
`deploy.resources` NVIDIA reservation; ROCm → `:server-rocm` / `ollama/ollama:rocm` + `--device
/dev/kfd --device /dev/dri` (Ollama `docs/docker.mdx`; llama.cpp `docs/docker.md` lists the
`-rocm` images); Metal/CPU → CPU images, no GPU flags, and on Metal a note that Docker on macOS cannot
reach the GPU. The Ollama compose template had its NVIDIA block commented out, so every Ollama compose
user ran on CPU. All 16 backend × framework × env container outputs swept; every compose parses as YAML.
vLLM/ExLlamaV2 container commands stay CUDA (both say so in their notes).

Notes were English-only on `/zh` (a standing bilingual-rule violation): every note now goes through
`L(lang, en, zh)`. Sweep over 1,368 notes (2 langs × 4 frameworks × 4 envs × 4 backends × 3 repo
shapes): 0 in the wrong language.

### 2026-10-02 (c) — AMD ROCm guide re-checked; CLI Docker commands were CPU-only

Monthly guide re-check (documentation check, not a run — no `verifiedAt`): `amd-rocm-llamacpp` against
llama.cpp `docs/build.md` (HIP) and `ggml/src/ggml-hip/CMakeLists.txt`. Build block now the documented
`HIPCXX="$(hipconfig -l)/clang" HIP_PATH="$(hipconfig -R)" cmake -S . -B build -DGGML_HIP=ON
-DGPU_TARGETS=…`; `AMDGPU_TARGETS` is still forwarded and `hipcc` as compiler still works but warns
"legacy" — both said in the text. `FATAL_ERROR "At least ROCM/HIP V6.1 is required"` → stack line and
prerequisites say ROCm 6.1+. Windows: docs now carry a Windows HIP build, and `HSA_OVERRIDE_GFX_VERSION`
is "not supported on Windows" — the old "Windows is experimental, use Vulkan" claim replaced with that.

Offload log: `LLAMA_LOG_INFO("%s: offloaded %d/%d layers to GPU", __func__ …)` inside
`llama_model_base::load_tensors` → `load_tensors: offloaded …`, not `llm_load_tensors:` (AMD and
`dual-gpu-70b-llamacpp` guides, the latter `updatedAt` 2026-10-02). Repo URL `ggerganov/llama.cpp` →
`ggml-org/llama.cpp` in three guide sources and `lib/utils/cli.ts`.

**Bug:** `generateCLI` docker/compose emitted `ghcr.io/ggerganov/llama.cpp:server` with `--gpus all
-ngl` — per `docs/docker.md` `:server` is the CPU-only image, so the container ran on CPU silently.
Now `ghcr.io/ggml-org/llama.cpp:server-cuda`; the compose `deploy.resources` GPU reservation is
uncommented (the CUDA image needs it); a note names `:server` (CPU) and `:server-rocm` (AMD).

### 2026-10-02 (b) — Six Macs: M4 16G/24G, M2 16G, M1 8G/16G, M1 Max 64G

64 → 70 GPU/Mac rows. Sources via web search restricted to apple.com (spec pages, Support tech specs,
Newsroom): M4 16 GB configurable to 24/32 GB at 120 GB/s; M2 100 GB/s, "50 percent more than M1", up
to 24 GB; M1 8 GB configurable to 16 GB; M1 Max up to 64 GB at 400 GB/s, "nearly 6x that of M1". Apple
never states the M1's own figure: both comparisons put it at 66.7–68 GB/s, entered as 68 with a
`bandwidthNote` on the page. `memType` omitted on all six — not in the sources read. Comfortable fits
at 4K (75% usable): M4 24G 52 / 85, M4 16G / M2 16G / M1 16G 45, M1 8G 18, M1 Max 64G 71.
`m1-8gb-ollama-limits`: `gpuPreset` `m3-8` → `m1-8`; the "no M1 entry, here is the substitute" section
and FAQ rewritten around the real M1 row; `updatedAt` 2026-10-02.

### 2026-10-02 — Five budget cards: RTX 3060 12G, RTX 5050, RX 7600 XT, RX 9060 XT 16G/8G

59 → 64 GPU/Mac rows (68 with the CPU rows), +10 pages. Sources, read through web search restricted
to nvidia.com / amd.com because every spec site (Wikipedia, TechPowerUp, the vendor pages directly)
is blocked here; each bandwidth is cross-checked as bus width × data rate from the same pages:
RTX 3060 12 GB GDDR6, 192-bit × 15 Gbps = 360 GB/s; RX 7600 XT 16 GB GDDR6, 128-bit × 18 Gbps = 288;
RX 9060 XT 16 GB / 8 GB GDDR6, 128-bit × 20 Gbps = 320 (both). RTX 5050: 8 GB GDDR6, 128-bit — no
data rate in the results, so `bandwidth` is omitted and its page says "bandwidth not listed".
Comfortable fits at 4K: RTX 3060 45 / 85, RX 7600 XT and 9060 XT 16G 51, RTX 5050 34, 9060 XT 8G 33.
Supersedes the 2026-09-11 note that left the RTX 5050 and RX 9060 XT out as unconfirmed.

### 2026-10-01 — Gemma 4 26B-A4B and 31B; per-layer-type KV head layout

`lib/data/models-extra-11.ts` (85 models at the time). Sources: transformers
`models/gemma4/convert_gemma4_weights.py` `_VARIANTS` (per-size layers, heads, KV heads, global KV
heads, `attention_k_eq_v`, `sliding_window=1024`, `max_position_embeddings=262_144`),
`_DEFAULT_LAYER_TYPES` = 5 sliding : 1 full, `head_dim` 256 / `global_head_dim` 512
(`configuration_gemma4.py`); llama.cpp `src/models/gemma4.cpp` confirms layer counts (30 → 26B-A4B,
60 → 31B), an iSWA cache, and that K and V are both cached even under `k_eq_v` (V is normed, not
roped). vLLM's recipe yaml pins 131072 as a serving default; the config value is 262144.

Params counted layer by layer from those configs (text decoder; the vision tower is a separate mmproj
in llama.cpp): 31B → 30.70B; 26B-A4B → 25.23B total / 3.81B active — matching the vendor's 31B and
26B/4B labels once the vision tower is added.

`ModelArch.attention` gains `fullKvHeads` / `fullHeadDim`: Gemma 4's global layers use 4 × 512 (31B)
or 2 × 512 (26B-A4B) against 16 × 256 / 8 × 256 on window layers. `calcVRAM` sizes full layers with
them when set; every existing model omits them and is unchanged. Q4_K_M: 26B-A4B 17.0 GB @32K,
21.8 GB @256K; 31B 21.1 GB @4K, 23.5 @32K, 31.7 @128K (a conventional 60-layer cache would be ~120 GB
at 128K). E2B/E4B (KV shared across 18–20 layers, per-layer embeddings) and the 12B "unified" model
deliberately not added. Quant rows `estimated` (no GGUF size reachable).

### 2026-09-30 (j) — IndexNow on production deploys

`scripts/indexnow.mjs` runs last in `postbuild` (after the export gate passes). On a Cloudflare
Pages production build (`CF_PAGES_BRANCH === 'main'`) it submits to `api.indexnow.org` every sitemap
URL whose `lastmod` is within one day of the build's UTC date — the pages changed by the ship being
deployed (320 of 400 on a data ship; 0 two days later with no ship). The ±1 day covers ship dates
written in UTC+8 local time while Cloudflare builds in UTC — an exact-date match missed any push
before 08:00 Beijing time. Key: `public/1ff374a1f4ca010beaf5f65b4eb3b8f8.txt`.
It first fetches the key file from the live site and skips if it is not served yet (the first deploy
after this change cannot submit — the next one does). Never fails the build. `--dry-run` prints the
selection; `--all` / `INDEXNOW_ALL=1` submits every URL. Not exercised end-to-end from the agent
environment (quantized.uk and api.indexnow.org are both unreachable here): check the Cloudflare
build log for the `indexnow:` line after the next data ship.

### 2026-09-30 (i) — Public changelog rewritten for readers

14 entries in `lib/data/meta.ts` (2026-08-18, 2026-09-12 → 09-21) read as internal post-mortems —
QTZ ticket ids, function names, "the audit said", 1,000–2,300 characters each — and they render on
`/changelog/`, both RSS feeds and the homepage. Rewritten to what changed for the reader, keeping
every fact and figure as of its date; the engineering detail already lives in this section. `out/`
changelog pages and feeds: 0 `QTZ-` ids, 0 "audit"/"审计".

### 2026-09-30 (h) — Every speed states its source

`components/ui/ConfidenceTag.tsx` renders `quantConfidence()` ("Estimated" / "Community", nothing for
measured) beside `speedRTX4090` on the Hub card, `HomeMatch`, the calculator's fit list and the GPU
page table — previously only the model detail table said. Legend rewritten: "Estimated = formula"
was wrong for speeds, which are not computed; it now says "not run here". Compare tool: the speed row
passed `Math.max(... ?? 0)`, so a model with no speed entered as 0 and lost; now `undefined` (→ "—",
no winner), basis `measured` / `unverified` (new `RowBasis` values) instead of "published", and a
winner only when both sides are measured. `ModelCard` context used `/1000` (131K, 1049K) — now
`contextLabel()`.

### 2026-09-30 (g) — "GPUs" counts exclude the CPU rows; Command R release ambiguity stated

`GPU_COUNT` (`lib/seo.ts`) is now `gpuDatabase.filter(g => !g.isCPU).length` (59) with
`CPU_ROW_COUNT` (4) beside it. Every surface whose copy says "GPUs"/"cards"/"显卡" uses it — homepage
stat, FAQ intro, `/best/`, `/benchmarks/`, 404, tools index, `/gpu/` title, `llms.txt` (now "59 GPUs
and Macs plus 4 CPU-only RAM sizes"). List lengths that must equal the rendered rows keep
`gpuDatabase.length`: the `/gpu/` `ItemList`, the calculator's "All {total} cards", `CoverageSection`.
`command-r-35b`: which release it is was never recorded; transformers' `CohereConfig` (v01) is full
MHA (64 KV heads, 8× the 8-head sizing). The 08-2024 config could not be read. Arch left, source
comment added, description tells the reader both figures (5 GB vs 40 GB at 32K).

### 2026-09-30 (f) — Llama 4 chunked attention

llama.cpp `src/models/llama4.cpp` sets `LLAMA_SWA_TYPE_CHUNKED`, `n_swa = 8192`, pattern 4 (3 chunked :
1 full) unless the GGUF sets the window to 0; transformers' `Llama4TextConfig` marks every 4th layer
full. Scout and Maverick now `fullLayers 12 / windowLayers 36 / windowTokens 8704` (the iSWA
allocation, 8192 + 512). Scout Q4_K_M: 95.5 → 77.0 GB at 128K; KV at 10M 1,920 → 481 GB.
Swept the rest of the index against `src/models/*.cpp`: Phi-3 SWA is disabled in llama.cpp (full
cache is right), OLMo 2 / Qwen2 / Qwen3 / Llama / Mistral 3 / GLM / Granite / InternLM2 / Seed-OSS
have none.

`contextLabel()` now prints millions as `M` (`1M`, `10M`) — six model pages read "1024K" / "10240K".

### 2026-09-30 (e) — Architectures checked against configs; sliding-window attention sized as llama.cpp stores it

Sources reachable from here: `mlc-ai/mlc-llm` `python/mlc_llm/model/model_preset.py` (verbatim
`config.json`s for ~60 checkpoints), `google-deepmind/gemma` `gemma/gm/nn/_gemma.py` (layer counts,
heads, window per Gemma size), llama.cpp `src/models/{gemma2,gemma3,openai-moe}.cpp` and
`src/llama-kv-cache-iswa.cpp`.

**Sliding window (8 models).** llama.cpp builds an iSWA cache for these archs and, with `swa_full`
false by default, sizes SWA layers at `pad256(min(ctx, n_swa + n_ubatch))` cells. So `windowTokens`
is the *allocated* span with the default 512 ubatch, not the bare window:

| Model | full / window layers | window → allocated |
|---|---|---|
| Gemma 2 2B / 9B / 27B | 13/13 · 21/21 · 23/23 | 4096 → 4608 |
| Gemma 3 4B / 12B / 27B | 5/29 · 8/40 · 10/52 (pattern 6) | 1024 → 1536 |
| GPT-OSS 20B / 120B | 12/12 · 18/18 | 128 → 768 |

Gemma 3 27B Q4_K_M: 34.4 → 20.8 GB at 32K, 85.6 → 29.0 GB at 128K. GPT-OSS 20B MXFP4 at 131K:
18.2 → 14.9 GB. GPU pages size at 4K, so fit lists barely move (Gemma 3 27B 30 → 31 cards).

**Wrong fields.** Qwen2.5 3B `28 layers / 4 KV` → `36 / 2` (cache ÷1.56). Phi-4-mini `32 × 96` →
`24 × 128` (cache ×1.33). Gemma 3 12B `headDim 240` → `256`. Gemma 2 27B `16 × 256 / 8 KV` →
`32 × 128 / 16 KV` (same cache). WizardLM-2 7B carried Qwen2.5-7B's `7.62B` and shape; it is a
Mistral-7B fine-tune (its own description said so) → `7.24B`, `32 / 8 KV`.

Not changed, unverifiable from here: StarCoder2 15B KV heads, StableLM 2 12B head size, and which
Command R release `command-r-35b` is (v01 is MHA with 64 KV heads; 08-2024 is GQA with 8).

Guides re-derived: `gpt-oss-mxfp4-local` (KV 0.2 / 0.8 / 3.0 GB), `mac-m3-pro-limits` (GPT-OSS 20B
11.8 GB), `rtx4060ti-what-to-run` (51 / 60 fits — already stale before this change — 11.7 GB,
83%). `dataProblems()` now also rejects an attention split larger than the layer count, or window
layers with no `windowTokens`.

### 2026-09-30 (d) — `speedRTX4090` rows that cannot be RTX 4090 figures; Jamba sized as 52B

A sweep of every `speedRTX4090` against the card itself: **43 rows** sat on builds with
`vramGB > 24` (Llama 3.1 70B Q4_K_M, 43.5 GB, at "38 tok/s"; DeepSeek-V3 at 385 GB, "4 tok/s") and
**4 dense EXL2 rows** (Qwen2.5 14B, Mistral Small 24B, Devstral Small 1.1, Magistral Small 1.2) ran
17–22% over the `bandwidth / (params × bpw / 8)` ceiling. All 47 removed, not adjusted.
`dataProblems()` (`lib/data/validate.ts`) now rejects both — proven by perturbation. MoE rows are
exempt from the roofline by `paramLabel` (`-A\d` / `MoE`); DeepSeek-V2-Lite and Coder-V2-Lite were
labelled `16B` and are now `16B-A2.4B`, DBRX `132B MoE`.

`modelExplainer` printed "the fastest level measured here" / 本站实测 on all 83 pages; it now asks
`quantConfidence()` and says "an estimate" for the 73 models outside `MEASURED_MODEL_IDS`.

**Jamba 1.5 Mini** was `params: 12` — the active count typed as the total. `JambaConfig` (32 layers,
16 experts on alternate layers, hidden 4096, FFN 14336) reproduces 51.6B / 12.1B; transformers' docs
say 52B. Now `52B-A12B`, Q4_K_M 31.5 GB, `attention.fullLayers: 4` (attn period 8, offset 4), speeds
dropped. GPU pages listing it: 62 → 19.

**Mistral Large 3** is MLA (llama.cpp `MistralMoeModel(DeepseekV2Model)`, vLLM
`MistralLarge3ForCausalLM(DeepseekV3ForCausalLM)`), but layer count and `kv_lora_rank` are in
`params.json` on huggingface.co (blocked) — and Mistral Small 4 uses rank 256, not DeepSeek's 512, so
the shape cannot be copied. Arch left as-is with a source comment; the description calls the 256K
cache figure an upper bound (~69 GB on the unsourced layout vs ~8.6 GB at 32K).

### 2026-09-30 (c) — DeepSeek MLA entries sized as current llama.cpp caches them

`deepseek-v3`, `deepseek-r1` (61 layers, 128 heads) and `deepseek-v2-lite`, `deepseek-coder-v2-lite`
(27 layers, 16 heads) were encoded as conventional attention (`kvHeads 8/16 × headDim 128`), which
is neither real case. llama.cpp (`src/models/deepseek2.cpp`): a GGUF carrying the MLA key lengths
and split `attn_k_b`/`attn_v_b` caches 576 values per token per layer; a legacy file with unsplit
`attn_kv_b` caches full K/V — `n_head × (nope+rope) + n_head × v` = 5,120 (Lite) / 40,960 (V3).
At 32K: Lite 0.95 GB MLA / 8.4 GB legacy / 6.75 GB as previously sized; V3 2.1 / 152 / 7.6 GB.
Now `kvHeads: 1, headDim: 288` (current converter, consistent with GLM-4.7-Flash / Kimi Linear),
and each description states the legacy figure and the tensor names that distinguish the two.
Downstream: Lite models newly comfortable on RTX 3080 10G and Mac M3 16G; Apple `/best/` code
pick StarCoder2 15B → DeepSeek-Coder-V2-Lite. Mistral Large 3 is not touched — its attention type
was not verified here.

### 2026-09-30 (b) — +2 models (83): GLM-4.7-Flash, Kimi Linear 48B-A3B

New `lib/data/models-extra-10.ts`. Selection: the newest families in transformers' toctree
(checked on raw.githubusercontent) filtered to what one card or one Mac runs — Hy4-Preview (780B),
GLM-5.x (744B), Step-3.7-Flash (198B) excluded as beyond single-machine hardware; Qwen4-Exp (no
released sizes in its docs) and Granite SWA 2B (no primary source for context length or instruct
status) excluded as unverifiable.

- **GLM-4.7-Flash** — 29.94B computed from `Glm4MoeLiteConfig` (vendor: 30B-A3B), 47 layers, MLA,
  128K context per the zai-org/GLM-4.5 README, MIT. llama.cpp: `Glm4MoeLiteModel(DeepseekV2Model)`.
- **Kimi Linear 48B-A3B Instruct** — 48B per the MoonshotAI/Kimi-Linear README (own estimate
  49.1B), 1M context, `attention.fullLayers: 7` of 27 (README 3:1 ratio and "up to 75%" cache cut;
  transformers' fallback rule of 6 would be 78%). llama.cpp: `kimi-linear` arch.
- **MLA sizing:** llama.cpp stores only a 576-value K per token per MLA layer (`has_v = !is_mla`,
  `src/llama-kv-cache.cpp`), encoded as `kvHeads: 1, headDim: 288` (documented on `ModelArch`).
- **No GGUF sizes available** (huggingface.co, ollama.com, docs.unsloth.ai blocked): Q4_K_M/Q8_0 at
  the generic 4.85/8.5 bpw, `confidence: 'estimated'`. Prose checked against `calcVRAM`: Kimi at Q4
  is 95% of an RTX 5090 (tight) and 85% of a 48 GB Mac (comfortable) — the description says so.
- Wired through `hf-repos.mjs`, `todayFeed`, `meta.ts`; `assertDataConsistent()` passes.
- **Not fixed, flagged:** the older DeepSeek-family entries (V3, R1, V2-Lite, Coder-V2-Lite) are
  MLA models encoded as conventional attention, which overstates their KV cache 3.6–7×. Whether their
  common GGUFs use llama.cpp's MLA cache depends on when they were converted — needs checking first.

### 2026-09-30 — `runtimeVersions` re-checked

`checkedAt` 2026-09-15 → 2026-09-30, read from each project's GitHub releases/tags page (the API is
blocked from this environment for repos outside the session; the pages were read via fetch):
llama.cpp b10978 → **b11277** (tags page, verbatim), vLLM v0.29.0 → **v0.30.0** (marked Latest),
Ollama v0.34.1 → **v0.35.0** (Latest; v0.35.1 and a v0.40.0 are pre-releases, skipped),
ExLlamaV2 unchanged at 0.3.2, ExLlamaV3 v1.5.0 → v1.5.3 in the note. One fetch summary reported
llama.cpp's latest release as "v0.5.0", which contradicts the project's tag scheme — the tags list
was used instead. Methodology (measured-on) versions untouched, per the history rule.

### 2026-09-29 (d) — Tool breadcrumbs include the Tools hub

Re-crawled `out/` for the "no content page under 3 inbound" target (excluding hrefs on >90% of
pages): only `/tools/` (2) and `/zh/tools/` (1) were under it — none of the four tool pages linked
back to their hub. Their breadcrumbs now carry a `Tools → /tools/` level (the `BreadcrumbList`
follows, localized): 6 and 5 inbound.

### 2026-09-29 (c) — Structured-data gate (build only, no visible change)

Audited all 1,509 JSON-LD blocks across 397 pages: 0 faults — every page-level entity's
`inLanguage` matches its tree, its `url` equals the page's canonical, `/zh` breadcrumbs stay in
`/zh`, `ItemList.numberOfItems` equals the list emitted, and every `FAQPage` question appears in the
visible text. The same checks now run in `scripts/localize-export.mjs` and fail the build (proven by
injecting a wrong `inLanguage` and an inflated `numberOfItems`). `WebSite`/`Organization` are exempt
from the language/url rules — they describe the site, not the page, and declare both languages.

### 2026-09-29 (b) — `<title>` width gate

All English titles were already within 60 characters; 31 Chinese ones were over 60 display width
(CJK = 2). New `fitTitle(title)` (`lib/seo.ts`) appends ` | quantized.uk` only when the result fits,
used by the `/zh` model, guide and `/best/[tier]` routes; the `/zh` home, format and tools titles were
shortened by hand and `（2026）` dropped from `/zh/best/`. `scripts/localize-export.mjs` now fails
on any exported title over 60 width or shared by two pages (proven by injecting a long title).

### 2026-09-29 — Build-time consistency gates (QTZ-110)

- **`lib/data/validate.ts`** — `dataProblems()` / `assertDataConsistent()`, called from
  `app/sitemap.ts` so every `next build` runs it and fails with the list of problems. Checks: unique
  model/GPU ids and GPU slugs, dot-free slugs; every `supersededBy` exists, is not self, is not itself
  superseded; every quant level is selectable in the calculator (`quantBPW` + `quantGroups` via
  `quantLevelKey`); every `todayFeed` model and level exists; every guide `gpuPreset.gpuId` and
  `relatedModelIds` entry exists; every `hfRepoMap` key is a model id. Verified by perturbation —
  four injected faults each reported, and a real build with a bad `todayFeed` level exits 1.
- **`scripts/localize-export.mjs`** gains a meta-description gate: every exported page has one,
  it is unique, and its display width (CJK = 2) is ≤ 160.

### 2026-09-26 (h) — Calculator readable without JavaScript (QTZ-123)

`/tools/vram-calc/` shipped ~1,270 words of explainer in its static HTML, but the calculator itself
was an inert `<select>` before hydration — no figures for a no-JS reader or a crawler. New
`sizeClassReference()` (`lib/utils/vram-reference.ts`) + `VramQuickReference`: one row per
`GPU_PAGE_BUCKETS` class (superseded models excluded) with the 4K and 32K range at each model's
`referenceQuant`, and `cardsFitting` for the smallest card holding the class's largest model. The
32K range skips models whose `contextLength` is under 32K (Gemma 2 2B otherwise reported 15.6 GB
at a context it cannot use); Phi-3.5 Mini's 15.6 GB at 32K is real — `kvHeads: 32`, no GQA.

### 2026-09-26 (g) — Meta descriptions fit the results page (QTZ-122)

Measured all 397 exported pages by display width (CJK = 2): 92 EN and 12 ZH descriptions exceeded
~160, including all 63 English GPU pages. New in `lib/seo.ts`: `displayWidth`, `fitDescription`
(keeps whole sentences within `DESCRIPTION_BUDGET = 160`; applied inside `pageMetadata()`,
`modelPageDescription()` and the cookbook routes) and `padDescription` (appends a computed size
sentence to a model description under 100 wide). Single-sentence templates that the fitter cannot
shorten were rewritten: `/best/`, `/best/[tier]/`, `/formats/[slug]/` (both kinds), `/faq/`,
`/tools/`, `/benchmarks/`, `/changelog/`, `/quant-hub/`. `gpuPageDescription` dropped its trailing
sentence, now skips superseded models for "largest" (RTX 4060 named Stable LM 2 12B) and prints the
full level key (`GPTQ INT4`, not `INT4`). `formats.ts` AWQ `hardwareReq` now includes AMD via vLLM
ROCm, matching `formatAllowed`. Result: 0 of 397 over budget, 0 duplicates.

### 2026-09-26 (f) — Guides show their dates; sitemap stops ignoring `updatedAt` (QTZ-114)

`articleModifiedAt(article)` (`lib/utils/article-dates.ts`) = latest of `publishedAt`, `updatedAt`,
`verifiedAt`. It now feeds three places that each had their own rule: the visible byline in
`ArticleView` (new: "Published … · updated …" as `<time dateTime>`), JSON-LD `dateModified`
(was `updatedAt ?? verifiedAt`), and `app/sitemap.ts` (was `verifiedAt ?? publishedAt`, which
ignored `updatedAt` — the 17 guides rewritten in `cookbook-rewrites.ts` reported 2025 lastmods).
Checked on all 23 built guides: the visible modified date equals `dateModified`.

### 2026-09-26 (e) — Heat Index is an order, not a percentage (QTZ-113)

`QuantFormat.heatPercent` had no reproducible source ("HF GGUF share and community discussion
volume") yet was printed as `89%` with a proportional bar on `/formats/` and as an "Adoption
estimate" row on every `/formats/<a>-vs-<b>/` page, directly above the measured "Models in this
index" row. `FormatHeatmap` now renders an ordered list with no numbers; the pair-page row and its
`formatCompare.rowAdoption` key are gone. `heatPercent` stays in `formats.ts` as the editorial sort
key only. The audit's other QTZ-113 asks (MXFP4/EXL3/MLX sections) are not done: MXFP4 is already a
GGUF level, and EXL3/MLX have 0 models in the index — a section for them is the HQQ mistake.

### 2026-09-26 (d) — Editor's Picks derive size and card (QTZ-109)

`todayFeed` (`lib/data/models.ts`) is now `{ id, type, modelId, level, note, quantizer }`; the typed
`format`, size-in-`detail` and `hardware` fields are gone. `TodayBoard` computes size with
`sizeAt(model, quant.bpw, REF_CONTEXT)` and the card with `cardsFitting(...)[0]` — the model page's
own functions. Of 8 picks, the typed card was tight rather than comfortable on one (Magistral Small
1.2, 15.6 GB on a 16 GB card), not a `gpuDatabase` name on four, and every typed size was the
published file figure rather than the 4K estimate the model page quotes.

### 2026-09-26 (c) — Fit counts name their level (QTZ-107)

Audited every surface that prints a per-card model count against `countModelsFitting` /
`fitsOnGpu`: the values agree (RTX 4060 Ti 16G = 52 comfortable / 61 tight on the GPU page, homepage,
GPU index, share image and `/best/`; Hub chips show the tight count and say so). Two surfaces printed
the comfortable count with no level — `home.popular.fitCount` ("52 models fit") and the GPU index
(`52/81`, now `gpuPage.indexFitCount`). Both now read "fit comfortably".

### 2026-09-26 (b) — Speeds name their card (QTZ-105)

`QuantVariant.speedRTX4090` is the only per-quant speed field, and three surfaces printed it without
saying so: the fit tables on every `/gpu/*` page (header `gpuPage.tableSpeed` was just "tok/s"),
the VRAM calculator's per-card result list, and — already labelled, left alone — Hub cards
(`refConfig`), model detail, compare and homepage picks. Header is now "tok/s on RTX 4090";
`gpuPage.speedColumnNote` follows the measured-runs paragraph on every GPU page except `rtx4090`;
the calculator uses `calc.speedOn4090`. The "Measured on this card" table keeps a bare "tok/s" —
those rows are that card's own `matrixData`.

### 2026-09-26 — Model pages: native reference quant, honest "smallest card" (QTZ-103)

- **`referenceQuant(quants)`** (`lib/utils/quality.ts`) is now the one choice of "the level a model
  page sizes against": the native release (`isNativeQuant` — `MXFP4` today) when there is one, else
  GGUF Q4_K_M, else `bestQuant`. It replaces four hand-copied lookups in `modelExplainer`,
  `modelPlacement`, `ModelCard` and `ModelDetail`. GPT-OSS 20B/120B were described as MXFP4 and sized
  at Q4_K_M on the same page. The compare tool's common-level row and the roofline reference keep
  Q4_K_M on purpose (cross-model basis).
- **`bySmallestCard`** (`model-explainer.ts`): nameplate VRAM, then retail before
  workstation/datacentre, then lowest bandwidth. Previously ties went to database order, so
  gpt-oss-20b's "smallest card" was an RTX 5080 and Qwen3 32B's was an Instinct MI100. The text now
  names the size and the number of cards sharing it. Fit and spare memory still use
  `usableCapacityGB`.
- `cardsFitting` excludes `isCPU` rows and counts against GPU rows (59), not all 63 — four 70B-class
  pages named "64 GB RAM (CPU)" as the smallest card.
- `modelPlacement` "just misses" = the two smallest `overBy`, not the last two red cards by capacity.
- MoE detection in `modelExplainer` matched only `-A3B`-style labels; `NNB MoE` labels (8 models)
  never got the resident-experts note (4 → 13 model pages).

### 2026-09-23 (b) — Untranslated chrome on `/zh` (QTZ-119 + one it missed)

`Footer.tsx` hardcoded `'Navigate'` / `'Ecosystem'` as section titles — now `t.footer.navigate` /
`t.footer.ecosystem` (站内导航 / 生态工具). Found while scanning all 198 `/zh` pages for English-only
text nodes: `GuideReferences` ("read next" row on every guide) rendered `a.title` regardless of
language, so Chinese guides linked to their neighbours by English title — now `titleZh` on `/zh`.
Also `calc.batch` in `zh` was `'Batch Size'` and the calculator's `Full` precision chip was a raw
`quantGroups` key; both localized (`calc.fullPrecision`). Remaining English on `/zh` is proper nouns
(model, vendor and product names) and the language switcher's own "English" label.

### 2026-09-23 — "Latest additions" block; recency anchored to the data, not the clock

`components/home/WeeklyUpdates.tsx` showed `models.filter(isRecentModel).slice(0, 6)` — file order,
45-day window measured from `Date.now()`. By 2026-09-23 that was 2 models, heading "This week's
updates", and it would have emptied around late October. It now shows `latestAdditions(models, 6)`
(`lib/utils/model-meta.ts`, newest `addedAt` first, never empty) under "Latest additions" / 「最近收录」,
with the NEW badge kept conditional on `isRecentModel`.

`isRecentModel`'s default reference time is now `RECENCY_ANCHOR = Date.parse(dataLastUpdated)`.
With `Date.now()`, the static HTML (rendered at build) and the client hydration (rendered at visit)
disagreed whenever a model aged out of the window in between — a text mismatch (React #418/#425)
on the homepage, every Hub card and the recency filter. This is a deterministic hydration-error
cause, independent of the Cloudflare email-obfuscation mitigation from 2026-09-21 (a). Measured:
Hub NEW badges = 10 (the 2026-08-07, 08-08 and 09-11 batches), homepage block = the same six newest.

### 2026-09-21 (c) — QTZ-101 (small half): two more legacy models tagged `superseded`

Mixtral 8x7B Instruct → `qwen3-30b-a3b` (context 32K→40K, Q4 28.5GB→19GB, faster, lower measured
quality loss) and Stable LM 2 12B Chat → `falcon-3-10b` (context 4K→32K, smaller, faster). Both
reasons come from `supersededDiffNote()`'s real field comparison, not a template phrase; both pages
stay `index, follow` and keep their numbers — only `homePicks`/`/best/` stop naming them first pick.

QTZ-101's other proposal — a cross-model `qualityScore` fed by an external public leaderboard —
is **not** part of this; it needs the site owner to pick a trusted source and is a separate,
bigger task.

Two other audit candidates were checked and deliberately left untagged: DeepSeek-V2-Lite Chat
still carries a 163,840-token context and an 11GB Q4 footprint nothing else in its class beats,
and its only same-family relative in the index (`deepseek-coder-v2-lite`) is a code-specialised
sibling, not a generational upgrade — tagging it "superseded" by a shorter-context model would
repeat the exact mistake the Command R 35B pick made in an earlier batch (see 2026-06-26 entry
below / CLAUDE.md's "Superseding models" section). Falcon 3 10B Instruct was the only genuine
successor candidate found, which is why it was used for Stable LM instead of also being tagged
itself.

### 2026-09-21 (b) — QTZ-100 + QTZ-106: format-vs-backend and Mac unified memory, fixed everywhere

The two foundational bugs flagged (but deliberately not fixed) in batch 1 earlier today. Both lived
in `fitsOnGpu()` (`lib/utils/gpu-page.ts`) — the single function nearly every recommendation on the
site runs through — **and separately** in the interactive VRAM calculator, which called its own
`getRecommendations()` (`lib/utils/recommend.ts`) with a bare vram number, never a GPU, so it shared
neither bug's symptom on `/gpu/*` pages nor, until this pass, either fix.

**QTZ-100 — format-vs-backend.** `fitsOnGpu` picked whichever quant a model shipped with the lowest
quality loss, from any of GGUF/AWQ/EXL2/GPTQ/HQQ, with zero awareness of whether the target GPU's
backend (CUDA/ROCm/Metal/CPU) can load that format at all. A Mac, CPU, or AMD GPU page could end up
recommending AWQ, GPTQ, or EXL2 — formats none of those backends can run, full stop, for anything
but AWQ-on-AMD.

- New `Backend` type + `backendFor(gpu)` (derived from the existing `type` field — no new data to
  keep in sync across 63 rows) and `ALLOWED_FORMATS: Record<Backend, format[]>` in `gpu-page.ts`.
- **The allowlist is not a flat "GGUF only outside CUDA" table** — it matches this site's own
  already-published answer to "which format runs on an AMD card?" (`lib/utils/faq.ts`,
  `amd-format`): vLLM ships official ROCm wheels, so AWQ is not excluded on AMD, only EXL2 and GPTQ
  (confirmed CUDA-only). Getting this from the FAQ rather than re-deriving it from scratch is the
  reason the two didn't end up contradicting each other.
- Threaded through every function that decides what to recommend or list as fitting:
  `fitsOnGpu`, `countModelsFitting` (`gpu-page.ts`), `cardsFitting` (`model-explainer.ts`, now takes
  a `format` argument), `modelPlacement`'s `candidateCards` (`model-placement.ts`), `bestPage`'s
  near-miss and context-ladder loops (`best-page.ts`), the GPU-page FAQ generator's "can this card
  run the next model up" question (`gpu-explainer.ts` — now states plainly when format, not size, is
  the blocker), `/faq/`'s 70B question (`faq.ts`), and a format page's "smallest card that ships
  this" line (`format-page.ts`).
- **The VRAM calculator itself never went through any of this** — `getRecommendations` took
  `gpuVram: number`, not a `GPU`, so it had no way to know a target lacked CUDA. Changed its
  signature to take the `GPU` object; all 3 callers (`VRAMCalculator.tsx`'s reverse mode,
  `QuantHubContent.tsx`'s GPU filter ×2) updated. Forward mode gained a check it never had at all:
  selecting an AWQ/EXL2/GPTQ quant against a Mac/CPU/AMD-incompatible hardware profile now shows an
  explicit "doesn't run on this backend" message instead of a size-based green/yellow/red verdict
  that had nothing to do with why it would actually fail.

**QTZ-106 — Mac unified memory sized at full nameplate.** `gpus.ts` marks Apple entries
`isUnified: true`; nothing downstream ever used it. A Mac page's own copy already said "the GPU's
share of unified memory, not the number on the box" while the fit/verdict math used the full number
regardless.

- Checked the specific fraction before shipping it, rather than taking the audit's proposed
  size-tiered 67%/75% split on faith: community measurements of macOS's *default* `iogpu.wired_limit_mb`
  cap (before anyone raises it) cluster around **75%** fairly consistently across machine sizes (~75%
  measured on a 128 GB Studio, ~78% on a 32 GB M2 Max) — one flat fraction, not a tier break the
  audit's own number had no independent support for.
- `MAC_UNIFIED_USABLE_FRACTION = 0.75` and `usableCapacityGB(gpu)` in `gpu-page.ts`; every sizing
  call site above uses it in place of raw `gpu.vram` (which stays what's *displayed* as the card's
  real spec — this is a usable-capacity ceiling for the fit math, not a different hardware fact).
  `best-page.ts`'s synthetic `tierCard()` already carried `isUnified` through from a real Apple
  entry, so its Apple-ladder loop needed no separate change once `fitsOnGpu` was fixed.
- The calculator's "your card" panel now shows the usable figure consistently everywhere it draws a
  bar or states a spare/needed number (never nameplate next to a usable-capacity verdict — that's
  the identical "two numbers, pick one" fault this file already argues against elsewhere), with a
  small explicit "X G usable of Y G unified" note when the profile is a Mac.

**Measured, not asserted**: a Mac M3 16G now shows 44 of 81 models fitting comfortably, down from
parity with a real 16GB CUDA card (52) — verified by grepping the actual `out/**` build output, the
same standard as every other claim in this file, not by reading the source and assuming it works.

Verified: `npx tsc --noEmit` and `npm run lint` clean; full build + postbuild gate pass (398 pages);
confirmed in the built HTML that Mac/CPU pages show zero AWQ/EXL2/GPTQ recommendations (only the
site-wide `knowsAbout` schema keyword list mentions the names) and that AMD pages still correctly
recommend AWQ; confirmed the GPU-page FAQ now states "Not in AWQ INT4 — that format doesn't run on
this card's backend" instead of silently comparing sizes on Mac and CPU pages.

### 2026-09-21 (a) — Second audit (2026-09-21 doc), batch 1: zero-risk fixes

A new, independently-conducted live audit (real browser, `fetch` + `DOMParser` against the served
HTML, cross-checked against HF/GitHub/vendor pages) turned up 24 findings. Spot-checked the highest-
impact P0 claims directly against this codebase rather than trusting the document, and the check
rate was high — most held up. Two are genuinely foundational (tracked as follow-ups, not yet fixed):

- **The recommendation engine never checks whether a quant's format can run on the target GPU's
  backend.** `fitsOnGpu()` (`lib/utils/gpu-page.ts`) picks whichever quant has the lowest quality
  loss among everything that fits in VRAM, from *any* format the model ships — GGUF, AWQ, EXL2,
  GPTQ, with zero awareness that AWQ/EXL2/GPTQ need CUDA. `homePicks`, `/best/`, and every GPU page
  call this function, so a Mac, CPU, or AMD page can end up recommending a format that will not run
  there at all. Confirmed by reading the function; not yet fixed — this needs a `backend` field on
  `GPU` and a format allowlist per backend, a real change to the core recommendation path, not a
  one-line fix.
- **Mac unified memory is never reduced for macOS's own overhead.** `gpus.ts` marks Apple entries
  `isUnified: true` but nothing in `vram.ts` or `gpu-page.ts` ever multiplies by a usable fraction —
  the page's own copy says "the GPU's share of unified memory, not the number on the box" while the
  calculation uses the full number. Confirmed by reading the code; not yet fixed.
- **A batch of old models were never tagged `status: 'superseded'`** (Mixtral 8x7B, Stable LM 2 12B,
  DeepSeek-V2-Lite Chat, Falcon 3 10B confirmed missing the field), so `homePicks`'s "largest that
  fits" ranking can still land on a 2023/2024 model purely because nobody flagged it. The exclusion
  mechanism itself works; the data just isn't tagged. Not yet fixed.

**What this pass actually shipped** — four low-risk, independently-verified fixes:

- **A GPU that doesn't exist.** Two homepage Editor's Picks entries (`lib/data/models.ts`) hand-typed
  `hardware: 'RTX 4070 Ti 16G'` — there is no such card. The 16GB variant is the RTX 4070 Ti *Super*;
  the 4070 Ti itself is 12GB. Both fixed to the real name.
- **A stale hardcoded count.** `/about/` (`lib/i18n/translations.ts`) still read "A searchable index
  of 79+ models" as literal text, unrelated to `MODEL_COUNT` used everywhere else. Changed to a
  `{n}` placeholder substituted from `MODEL_COUNT` at render time (`app/about/page.tsx`), the same
  pattern already used for `{date}` on the same page.
- **Two Footer links pointing at old GitHub orgs.** `llama.cpp` still linked `ggerganov/llama.cpp`
  (now `ggml-org/llama.cpp`) and `ExLlamaV2` still linked `turboderp/exllamav2` (now
  `turboderp-org/exllamav2`) — both orgs already correctly named elsewhere in this repo's own
  changelog, just never carried into the Footer's link list.
- **A plausible cause of a real console error.** The audit's browser caught React hydration errors
  (#418/#425 — text content mismatch) on every page load. The likely cause: the site's contact
  address rendered as bare visible text in the Footer (on every page) and in two feedback panels —
  exactly the pattern Cloudflare's Email Address Obfuscation rewrites at the edge, which would make
  the HTML the browser actually receives differ from what the statically-exported React bundle
  expects to hydrate against. New `components/ui/EmailOffGuard.tsx` wraps every text rendering of
  the address in Cloudflare's own documented `<!--email_off-->` escape comment, emitted via
  `dangerouslySetInnerHTML` on inert siblings (not a wrapping element — the actual anchors keep
  their `onClick` analytics handler unchanged). **This is a best-effort mitigation, not a confirmed
  fix**: this environment cannot load the live, Cloudflare-fronted site to check whether it actually
  clears the console error. Disabling Scrape Shield → Email Address Obfuscation in the Cloudflare
  dashboard remains the more certain fix and needs the site owner to do it.

Also fixed as a drive-by (same class of bug as the two Footer links, already known-correct from
earlier work): nothing else — deliberately did not touch the `Navigate`/`Ecosystem` footer section
titles left untranslated on `/zh/` (a real, separate finding from the same audit), to keep this pass
to exactly the zero-risk batch that was asked for.

Verified: `npx tsc --noEmit` and `npm run lint` clean; full build + postbuild gate pass (398 pages);
grepped `out/**` directly (not the source) for every fixed string to confirm it actually left the
export — this is the same discipline this file already argues for: a green build proves the export
is self-consistent, never that a specific claim in a report was true or that a specific edit landed.

### 2026-09-15 — Live re-check: QTZ-008 was never actually deployed, runtime versions re-verified

A prior "complete" report for QTZ-008 (homepage hero rewrite) did not survive contact with the live
site. **The lesson generalizes: a build gate proves the export is internally consistent — it says
nothing about whether a given piece of work actually reached `out/`, because that depends on whether
the source file was ever edited, not on whether the build succeeds.** Verified this time by reading
the rendered `out/index.html` directly rather than trusting an earlier status:

- **QTZ-008 was not deployed.** Live H1 was still the pre-audit "Find the right local LLM for your
  hardware.", the primary CTA still said "Explore Models" pointing at the unfiltered 81-model
  `/quant-hub/` list (not the hardware-grouped `/gpu/` the H1's question actually answers), and
  `app/layout.tsx` still emitted `<meta name="keywords">`. All three fixed: new H1 "Will it fit on
  your card?" (Chinese re-drafted as "这张显卡，到底能跑多大模型？", not translated), CTA now "Find
  models for my GPU" → `/gpu/`, a new tertiary link to the 8GB starter guide for first-time readers,
  `keywords` removed. Verified at 390px in both languages: no horizontal overflow, CTA renders.
- **`runtimeVersions.current` re-verified against the projects' own GitHub release pages** (real
  fetches, not memory): llama.cpp b10760 → **b10978**, Ollama v0.33.2 → **v0.34.1**; vLLM's recorded
  v0.29.0 was still accurate. **Found in the process**: ExLlamaV2 has had no release since
  2025-07-13 — the maintainer's active project moved to a separate repository, ExLlamaV3 (v1.5.0),
  whose own README describes a genuinely new quantization format, EXL3 (a QTIP variant), not an EXL2
  version bump. Recorded as a fact in the benchmarks methodology note. **Not** added as a tracked
  format — zero indexed models ship EXL3, and a zero-inventory format row is the HQQ mistake with a
  new name (see the Format vocabularies rule in `CLAUDE.md`). Whether to eventually index EXL3
  builds is a real, separate content decision, flagged rather than acted on.
- **One claim did not hold up on inspection**: a reported "homepage shows 79, Hub/GPU pages show 81"
  count mismatch is not a regression. `81` is `MODEL_COUNT` (total models); `79` is
  `getSiteStats().q4SampleSize` (how many of those 81 have published a Q4_K_M perplexity figure) —
  a different, correctly-computed, dynamically-rendered number that happens to sit close to the
  total. Confirmed via `Object.entries`/template substitution in the source, not by re-reading intent.
- **Two referenced artifacts do not exist**: `scripts/audit-site.mjs` and
  `data/incoming-architecture.json` were not found anywhere in this repository, nor in the task book
  on file. Nothing was fabricated to stand in for either — a request to add ~10 new 2026 model
  families "using architecture data already collected in [a file that isn't there]" was not acted on;
  see `lib/data/meta.ts`'s changelog entry for the full breakdown of what was verified true, false, or
  unconfirmable in the request that prompted this pass.

### 2026-09-14 (e) — Audit P2: QTZ-033 audited — mostly already done, one real FAQ gap closed, +2 verified GPUs

**QTZ-033** asks whether the Chinese edition actually serves Chinese search intent, now that QTZ-002
gives it a crawlable entry point. Checked the audit's own list of example queries against the current
`/zh` implementation rather than assuming stale earlier-session claims still held:

- **Metadata templates, FAQ questions and hardware phrasing were already re-drafted for Chinese
  search intent**, not machine-translated, from earlier ships this changelog already records —
  `/zh/gpu/{card}/`'s title is already `{显卡} 能跑哪些大模型？`, `/zh/best/{tier}/`'s is already
  `{显存}能跑的最好的本地大模型（2026）`, and `lib/utils/faq.ts`'s Chinese half is a genuine
  re-draft (own file comment: "re-drafted, not translated") covering 7 of the audit's 8 suggested
  questions almost verbatim (`4060Ti 16G 能跑什么` → the 16GB-card question; `Q4 掉点严重吗` →
  `quality-4bit`; `GGUF 和 AWQ 有什么区别` → `gguf-or-awq`; etc).
- **One real gap**: no FAQ entry answered "32G 内存纯 CPU 跑大模型现实吗" despite the index already
  carrying a `32 GB RAM (CPU)` GPU-database row and a `cpu-inference-optimization` guide preset to
  it. Added, computed from that same row via `countModelsFitting` — states the model count that fits
  by capacity, and is explicit that speed is *not* stated, because system-RAM bandwidth depends on
  the reader's own DIMM/channel configuration and this index does not publish a guessed number the
  way it does a GPU's vendor spec.
- **+2 verified GPUs**: Tesla P40 24G (346 GB/s, GDDR5) and Tesla P100 16G (732 GB/s, HBM2) — real,
  budget used-hardware cards the audit flagged as popular in the Chinese local-LLM resale market.
  Both are NVIDIA's own published specs, unchanged since release, so they clear this repo's "confirm
  before adding" bar. Filed under the existing shared `nvidia-pro` group (61→63 GPUs) rather than
  building Chinese-only pages — English-speaking home-lab builders buy these same cards, and the
  codebase has no locale-scoped-page mechanism to build safely in one pass.
- **Deliberately not added**: the audit's suggested "modified RTX 2080 Ti 22G". It is not a vendor
  product — the 22GB comes from third-party VRAM-chip swaps of inconsistent quality, and its
  bandwidth would be inferred from the unmodified die rather than a spec sheet number. This repo's
  own rule against a card whose VRAM is a guess applies even though the underlying GPU die is real;
  a wrong number here generates a whole GPU landing page of wrong numbers.

Verified: `npx tsc --noEmit` and `npm run lint` clean; full build + postbuild gate pass (398 pages,
up 4 from the two new GPUs × two languages); both new GPU pages return correct localized titles;
`GPU_COUNT` (63) and every dependent count updated with no manual edits, confirming it is genuinely
derived; the new FAQ question renders on both `/faq/` and `/zh/faq/`; new cards appear in the VRAM
calculator dropdown and format wizard with no crashes.

### 2026-09-14 (d) — Audit P2: QTZ-026 complete — per-page share-card images, and two site-wide Twitter-card bugs found along the way

**QTZ-026.** GPU, model (`/quant-hub/[modelId]`), guide (`/cookbook/[slug]`), `/best/[tier]` and
format (`/formats/[slug]`) pages now render their own social share-card image at build time — 5 page
types × 2 languages — instead of every page on the site sharing one generic `/og.png`. Mechanism:

- `lib/og/render.tsx` — one `renderOgImage({eyebrow, title, stats, footer})` shared by all 10
  `opengraph-image.tsx` files (Next's file-convention route), using `ImageResponse` from `next/og`
  with no custom font (its default renders Chinese correctly with zero extra config, and avoids a
  build-time font fetch). Long titles get a 3-tier responsive font size plus an explicit
  `width: '100%'` on the title container — Satori's flex layout collapses to a text node's *natural*
  width with no explicit width, and the longest guide title (56 chars) would overflow the 1200px
  canvas without it.
- Each generator reuses the site's own data functions (`countModelsFitting`, `homePicks`,
  `bestQuant`, `sizeAt`, `cardsFitting`, `readingMinutes`, `bestPage`, `headToHead`,
  `modelsWithFormat`) — never a second, hand-rolled computation — so a share card cannot state a
  number the page itself disagrees with. GPU pages use `homePicks(gpu,'chat')[0]` for "top pick",
  not `fitsOnGpu`, specifically to exclude superseded models (QTZ-029) from the card too.
- `pageOgImage(path, alt)` (`lib/seo.ts`) builds `{url, width, height, alt, type}` manually rather
  than relying on Next's auto-injection, because auto-injection only fires when no ancestor metadata
  already sets `openGraph.images` — and nearly every page here hand-writes that field already, for a
  real, per-instance `alt` string the file-level static `alt` export cannot express.

**Two bugs found building this, both worse than the feature itself, both invisible from reading
`generateMetadata` — only visible in the rendered HTML:**

1. **`export const runtime = 'edge'` on an `opengraph-image.tsx` is silently incompatible with
   `output: 'export'`.** It makes Next treat the route as Dynamic; a Dynamic route in a static
   export is dropped — the build exits 0, the file is simply never written, nothing in the build log
   says so. Confirmed by a controlled test (added the line, rebuilt, watched the file disappear;
   removed it, rebuilt, watched a valid PNG appear). None of the 10 files here set it.
2. **Every page's `twitter:title`/`twitter:description` showed the same generic site tagline,
   including the homepage's own.** `og:title`/`og:description` were already correctly per-page
   everywhere — but `app/layout.tsx`'s root `metadata.twitter` and a second copy inside
   `pageMetadata()` (`lib/seo.ts`, used by `/quant-hub/layout.tsx`, `/cookbook/layout.tsx` and ~25
   other pages) both hardcoded a `title`/`description` that outranks a page's own `openGraph` values
   whenever the page itself never sets a `twitter` object — which is every page on this site. Fixed
   by deleting the hardcoded `title`/`description`/`images` in both places: an unset `twitter` field
   falls back to that same metadata level's `openGraph` equivalent, which is what makes the two-level
   layout chain (root → `/quant-hub/layout.tsx` → leaf page) resolve to the leaf's own text instead
   of stopping at the nearer ancestor. Verified by walking `out/**`: `og:title`/`twitter:title` and
   `og:description`/`twitter:description` now match on the homepage, a model page, a guide, a
   `/best/` tier, a format pair, a GPU page, and a plain page with no custom OG image (`/about/`,
   correctly still on `/og.png` for both).
- `public/_headers` added: the generated file is named `opengraph-image` with **no extension**, so
  a static host (Cloudflare Pages included) has nothing to infer a MIME type from and would serve it
  as `application/octet-stream` without an explicit rule — a type several social-card validators
  will not sniff past. One `Content-Type: image/png` line per route (`*` here matches one path
  segment, never across `/`, so each depth needs its own line).
- `og:image:type` was also missing from every manually-built `pageOgImage()` (Next's auto-injection
  adds it; a hand-built object does not unless told to) — added `type: 'image/png'` to the helper.

Verified: `npx tsc --noEmit` and `npm run lint` clean; full `npm run build` + postbuild gate pass
(394 pages, all internal links end in `/`, no Chinese-tree leaks); `file` on 6 sampled generated
images confirms real 1200×630 PNGs; a manual crawl of 8 pages across every affected type plus one
unaffected type confirms `og:`/`twitter:` title, description and image now agree everywhere, in
both languages.

### 2026-09-14 (c) — Audit P2: QTZ-032 investigated — not reproducible in this environment, one step left

**QTZ-032** is explicitly a "reproduce first, decide whether to fix" item: the audit observed, in its
own preview panel, a mobile homepage where a programmatic `scrollTo` left `scrollTop` stuck near 800
regardless of the target, and flagged three possible causes without prescribing a fix. Investigated
each **before writing any code**, per the item's own instruction:

1. **Mobile-menu scroll lock left uncleaned** — does not apply. `Navbar.tsx`'s mobile menu is a
   plain conditionally-rendered `absolute` panel; there is no `overflow: hidden` or `position: fixed`
   ever applied to `<body>` for it to leave behind.
2. **`#changelog` anchor covered by the fixed nav** — already handled. `DataChangelog.tsx` carries
   `scroll-mt-28` (7rem, well past the 56px nav height); `ArticleView.tsx`'s section anchors carry
   the same class.
3. **Custom `scrollRestoration` conflicting with something** — no such code exists anywhere in the
   repo; the site relies on Next's default.

With none of the three present, reproduced the audit's actual scenario in a fresh headless
environment instead of trusting the source read: a real mobile viewport (390×844, touch-enabled,
iOS Safari UA), a genuine wheel-scroll gesture (not just `scrollTo`), and then a plain
`scrollTo(0, document.documentElement.scrollHeight)`. Both reached the footer correctly — the
`scrollTo` landed exactly at the bottom, the opposite of what the audit's panel showed. This matches
the audit's own leading theory (a preview-tool artifact, not a site defect) rather than either of
the other two. The homepage's two `<select>` elements were also confirmed present and populated
(62 and 83 real options) in that same run — not proof of iOS Safari usability specifically, but
evidence there is no rendering fault to explain one.

**What this cannot close on its own:** the audit's acceptance bar requires confirmation "on iOS
Safari and Android Chrome, real device" — hardware this agent environment does not have. That one
check is the site owner's to do; a one-minute scroll-to-footer on an actual phone, matching what
the automated run already shows, is what finishes this item.

### 2026-09-14 (b) — Audit P2: QTZ-031 complete — benchmarks page states its own coverage

**QTZ-031.** `/benchmarks/` was 251 words carrying the site's most distinctive asset (real
measurements) with no statement of how much of the index that actually covers. Three real problems,
fixed:

- **Coverage was unstated.** The page now opens by naming it: `{r} runs across {c} cards, out of
  {m} in the GPU index` — 16 runs / 4 cards / 61 total, all three derived (`lib/utils/bench-coverage.ts`)
  from `measuredRowsFor()`, the same function `/gpu/{card}/` pages already use to say "no benchmark
  runs recorded here." One source, so the two counts cannot drift apart.
- **New "What is and is not covered" section** (`CoverageSection.tsx`): which cards, how many runs
  each (RTX 4090 ×13, RTX 3090/M3 Max/M2 Ultra ×1 each), what the other 57 cards use instead (the
  calculator's own formula — not a second, hidden measurement), and four things never tested here
  at all (multi-GPU beyond the dual-3090 guide, batch > 1, prefill speed, quality beyond perplexity).
- **The methodology panel was collapsed by default**, which in a static export means `{open && ...}`
  never rendered any of it into the exported HTML — invisible to every crawler and to the word count
  this very acceptance bar checks. Opened by default (still collapsible for a returning reader) and
  expanded into throughput / perplexity / VRAM / hardware sections. Every field this index genuinely
  never recorded — measurement technique (samples, mean vs. median, warm-up), the VRAM measurement
  tool, per-machine CPU/RAM/OS, run dates — reads **"not recorded,"** not a plausible invented value.
  `promptLen`/`genLen`/`baselinePpl` were pulled out of free-text `notes` into real fields on
  `benchmarkMethodology` (`lib/data/meta.ts`) rather than typed twice.
- **A `Dataset` schema** names exactly the three variables the matrix table renders (`tokens per
  second`, `VRAM usage (GB)`, `perplexity retained (%)`) — nothing claimed that isn't in the table.
- **The meta description was actively wrong**: it named the RTX 4060 Ti as measured. That card's
  rows were removed in an earlier audit pass (a roofline check showed they exceeded its real
  bandwidth — see the `CLAUDE.md` roofline rule) and the description was never updated to match.
  Fixed to name only the four cards this page has real runs for.

**Not done, stated rather than faked:** the audit also asks for measured rows on 3 new 2026-era
models. That needs a GPU this agent environment does not have — adding a row without one would be
exactly the invented-measurement fault this ship spent its effort removing.

Regression: `npx tsc --noEmit` clean, `npm run lint` clean, 0/6 overflow combinations, 0 contrast
failures on both language pages, `Dataset` JSON-LD parses and matches the rendered table.

### 2026-09-14 — Audit P2: QTZ-034 complete — Organization schema, honestly incomplete where it must be

**QTZ-034.** The site-wide `Organization` block (`components/seo/JsonLd.tsx`) carried only `name`,
`url` and a `logo`. Added:

- `description` — one sentence on what the site actually is.
- `knowsAbout` — the real subject areas (GGUF, AWQ, EXL2, GPTQ, llama.cpp, vLLM, Ollama,
  ExLlamaV2, local inference, VRAM, Apple Silicon). The audit's own example list included NVFP4;
  left out here since `CLAUDE.md` already establishes zero models in this index ship it, and
  `knowsAbout` sitting next to `formats tracked` invites exactly the conflation that rule exists
  to prevent.
- `contactPoint` — the one real inbox (`FEEDBACK_EMAIL`, `lib/seo.ts`), `contactType: "editorial
  corrections"` (accurate — this is how the site's own corrections actually arrive),
  `availableLanguage: ["en", "zh-Hans"]`.
- `foundingDate` — derived from the earliest date in `changelog`, to month precision, not typed in.
  Grows correctly if an older entry is ever backfilled.

**Deliberately absent: `founder` and `sameAs`.** The audit's own template names both, but:

- `/about/` describes an intentionally unnamed indie maintainer ("built by someone who actually
  does it," no name given) — there is no real `Person` to cite, and inventing one to fill a schema
  field is the same fault this codebase already refuses elsewhere (no fabricated reviewer identity,
  no invented author byline).
- This site's own stated privacy posture is **no public source repo** — there is no real GitHub,
  Hugging Face or social account to point `sameAs` at. The audit's own implementation notes say the
  same thing: "if no such account exists, leave the field empty or omit it — do not fill in URLs
  that don't exist." Followed literally rather than working around it.

A schema entity is not more credible for citing an identity that does not exist. This is the same
discipline the site already applies to a model's missing `pplLossPercent` or an unconfirmed GPU
bandwidth, turned on the site's own metadata.

Validated: `out/index.html`'s `Organization` block parses as valid JSON with every field a real
schema.org `Organization` property (no typos, no `@type` mismatches).

### 2026-09-13 (c) — Audit P2: QTZ-030 complete — a 404 page that guesses intent, verified not assumed

**QTZ-030.** The 404 page was ~20 words and four static links (`Home`, `Quant Hub`, `Cookbook`,
`VRAM Calculator`) on a site with 393 pages whose URL structure is highly guessable
(`/quant-hub/{slug}/`, `/gpu/{slug}/`). Rewritten (`components/layout/NotFoundContent.tsx`):

- **Shows the path that actually 404'd** — read from `window.location.pathname` on mount (a static
  export's `not-found.tsx` has no server request context; the pre-hydration render leaves this
  blank so it doesn't cause a hydration mismatch).
- **Fuzzy match against every real slug.** `notFoundSuggestions()` (`lib/utils/not-found.ts`) runs
  edit distance between the URL's last segment and every model/GPU/guide slug in the index —
  `/quant-hub/qwen3-8/` correctly surfaces "Qwen3 8B Instruct." Language only changes the label
  shown (guide titles); slugs themselves aren't translated, so the match itself is language-blind.
- **A real search form** into `/quant-hub/?q=`, same accessible-form pattern as the Hub's own box.
- **Six section entry points with live counts** (`Models ({models.length})`, `GPUs
  ({gpuDatabase.length})`, `Best by VRAM`, `Tools`, `Guides ({articles.length})`, `FAQ`) instead of
  four hardcoded links — nothing here needs updating when the index grows.
- A footer line to the one email address on the site (now `FEEDBACK_EMAIL` in `lib/seo.ts`, shared
  with `Footer.tsx` instead of a second hardcoded copy) for the one case that actually is a bug: an
  internal link that itself points at a 404.

**Verified, not assumed, the one thing that actually matters for a 404 page.** A static export's
`not-found.tsx` has no server to guarantee an HTTP 404 status — Cloudflare Pages (like any static
host) only returns one if it falls back to `404.html` with that status code rather than rewriting to
a 200 SPA shell. Simulated that exact fallback behavior locally (serve the real file when one
exists, otherwise `out/404.html` with a genuine 404 status) and confirmed with a headless browser:
the status code really is 404 for both `/unknown/` and `/zh/unknown/`, and the Chinese path renders
the Chinese page — `<html lang>` becomes `zh-Hans`, the H1 becomes "页面未找到" — because
`usePathname()` reads the real browser address bar on hydration, independent of which single static
`404.html` file the host happened to serve. `robots: { index: false, follow: true }` was already in
place from an earlier ship; this change only replaces what sits under it.

Regression: `npx tsc --noEmit` clean, `npm run lint` clean, 0/6 page×width overflow combinations at
390px on both language 404 pages, the one contrast finding on the "404" numeral is the pre-existing
`.text-gradient` false positive documented elsewhere in this changelog.

### 2026-09-13 (b) — Audit P2: QTZ-029 complete — legacy model banners, and a real recommendation bug

**QTZ-029.** 12 models the audit judged legacy (superseded by a same-generation successor, dropped
by their vendor, or with no active community quantization) now carry the same "prefer something
else today" treatment 5 of them already had, reusing the existing `status: 'superseded'` +
`supersededBy` mechanism rather than inventing a third state — the two-value system already meant
exactly this:

| Legacy | Points to | Real reason (checked, not templated) |
|---|---|---|
| Zephyr 7B Beta, WizardLM-2 7B, OpenChat 3.6 8B, Aya 23 8B, InternLM2 7B | `qwen3-8b` | longer context / more quant levels |
| SOLAR 10.7B, Yi 1.5 34B | `qwen3-14b` / `qwen3-32b` | longer context |
| InternLM2 20B | `gpt-oss-20b` | 4× longer context |
| DBRX Instruct | `glm-4.5-air` | longer context, more quant levels |
| Jamba 1.5 Mini | `ministral-3-8b` | same context, more quant levels (2 → 3) |
| StarCoder2 15B | `qwen2.5-coder-7b` | 8× longer context, more formats |
| Command R 35B | `qwen3-8-27b` | 2× longer context |

Every `supersededBy` target was picked from models actually in the index today, by size class and
category, then **checked against real fields** before writing a reason — the first pass would have
called Command R 35B's replacement an upgrade on "longer context" when its actual context is
*shorter* (131K → 41K on the first candidate); the successor was changed to one that is genuinely
longer (262K) rather than shipping a false claim. `supersededDiffNote()` (`lib/utils/model-meta.ts`)
tries context length, falls back to quant-level count, and only reaches a generic "still gets new
builds" line when neither number favours the newer model — which turned out not to be needed for
any of the 12 once the successors were checked.

**On the page:** the amber banner now states the real reason and links straight into
`/tools/compare/?a={legacy}&b={successor}` with both models pre-filled (`ModelDetail.tsx`). Meta
description gets a `Legacy model. ` / `过时型号。` prefix (`modelPageDescription()`). The Hub
(`/quant-hub/`) now hides all 13 superseded models (the 12 plus the pre-existing Qwen2-VL-7B) by
default — an untouched page reads "all 68 models," not "68 of 81" with nothing explaining the gap —
behind a `Show 13 legacy models` toggle that's a real URL param (`?legacy=show`, wired through
`hub-url.ts` the same way every other Hub filter is). **No `noindex`** anywhere: legacy pages still
return 200 and stay in the sitemap; hiding is a Hub-listing decision, not a deindexing one.

**Running `homePicks` across all 61 GPUs × 4 use cases (not just reading it) found a real bug this
ship also fixes, not just the one the audit named.** `homePicks` — the function behind the homepage
hero *and* every `/best/` tier, per the existing "one ranking implementation" rule — had never been
told a model could be off the table. Qwen2-VL-7B (superseded since the 2026-08-08 batch) held the
`multimodal` recommendation on **34 of 61 cards**, and the moment this batch marked DBRX Instruct and
StarCoder2 15B legacy, they immediately started winning the `code` slot on several high-VRAM cards
too. `homePicks()` now filters `isSuperseded()` out of its candidate pool before ranking. `fitsOnGpu`
itself is untouched — a legacy model still correctly appears on its own GPU page's "what fits" list,
which is a different, honest question from "what should you run."

Regression: `npx tsc --noEmit` clean, `npm run lint` clean, full build + postbuild gates pass,
0/18 page×width overflow combinations on `/quant-hub/`, a legacy model page, and `/best/24gb-vram/`.

### 2026-09-13 — Audit P2: QTZ-027 + QTZ-028 complete — sitemap `lastmod`/priority, robots.txt AI policy

**QTZ-027 (sitemap).** Every URL in `app/sitemap.ts` used to carry `dataLastUpdated` regardless of
whether that page's own content had changed — a sitemap-wide uniform `lastmod` is a signal crawlers
learn to discount, the same fault class as a uniform meta description. Now:

- Model pages use their own `addedAt`; guides use `verifiedAt` (falling back to `publishedAt`) —
  unchanged from before, but now sitting alongside pages that previously shared their date for no
  reason.
- **`/legal/` and `/privacy/` get their real last-edited date (2026-08-18, from `git log`)**, not
  `dataLastUpdated` — these are hand-written pages that do not move with a data ship, and claiming
  otherwise makes every rebuild look like a content change that never happened.
- **`priority`/`changefreq` follow a stated tier** instead of three flat values shared across
  unrelated page types: `/` at 1.0/weekly, the three hub indexes (`/quant-hub/`, `/gpu/`, `/best/`)
  at 0.9/weekly, model and GPU pages and `/best/{tier}/` at 0.8/monthly-or-weekly, content indexes
  and format pages at 0.7/monthly, guides at 0.6/monthly, `/changelog/` at 0.5/weekly, `/about/` at
  0.4/monthly, `/legal/` and `/privacy/` at 0.2/yearly.
- Checked the audit's specific "328 vs 329 URL count" discrepancy claim against the actual codebase:
  no hardcoded page count exists anywhere to reconcile against the sitemap's real count, so that
  particular claim did not reproduce — noted rather than "fixed."
- 392 URLs total (well under the 500-URL threshold the audit sets for splitting into a sitemap
  index), 18 distinct `lastmod` values, valid XML.

**QTZ-028 (robots.txt).** `app/robots.ts` (the typed Next.js metadata-route convention) could not
express the comment lines the audit's acceptance criteria require, so it is now a static
`public/robots.txt` instead — content is fully static, so a build-time route added nothing. Changes:

- Dropped the non-standard `Host:` directive (Yandex-only; canonical tags already handle the
  www/non-www question for engines that matter here).
- Added an explicit comment pointing at `/llms.txt` (the audit's suggested second line, pointing at
  a `/llms-full.txt`, was dropped — that file does not exist on this site, and a robots.txt comment
  linking to a 404 is a broken reference, not a nicety).
- **Explicitly welcomes the crawlers this site's GEO approach depends on** — a decision made by the
  site owner (allow, not block, both training and retrieval crawlers) rather than defaulted to
  silently. Names checked against each vendor's current documentation rather than a remembered
  list: OpenAI's `GPTBot` (training) / `OAI-SearchBot` (search) / `ChatGPT-User` (user-triggered);
  Anthropic's `ClaudeBot` (training) / `Claude-User` (user-triggered) / `Claude-SearchBot` (search);
  `PerplexityBot` (Perplexity's own docs: retrieval only, not training) / `Perplexity-User`;
  `Google-Extended` and `Applebot-Extended` (both are robots.txt control tokens, not separate
  crawlers with their own request signature); plus `CCBot` and `Bingbot`, already covered by
  `User-agent: *` but listed for the same reason the audit gave — an explicit welcome rather than a
  silent default.
- **No `Disallow: /*?*`** — that would also block the VRAM calculator's and Hub's shareable
  filter/query links, which `noindex, follow` (via `QueryNoindex`) already handles correctly.
- `/robots.txt` still serves as `text/plain` (a static `.txt` file under Cloudflare Pages).

### 2026-09-12 (e) — Audit P2: QTZ-025 complete — title lengths, and five templates the audit missed

**The audit named two templates; a walk over `out/**` found seven.** QTZ-025 flagged 33 pages with
`<title>` over 60 characters, concentrated in model pages and cookbook guides. Checking against the
actual export (not the audit's estimate) found **63** at build time — the index has grown since the
audit ran, and the same fault also showed up, unflagged, on the homepage, all six `/best/` tiers,
`/formats/`, all four single-format pages, and `/tools/`, `/faq/`, `/changelog/`.

**The two data-driven templates:**

- **Model pages** (`{name} — Quant Variants & VRAM | quantized.uk`, up to 70 chars on 29 models) now
  use `modelPageTitle()` (`lib/seo.ts`) — a two-tier fallback: the full title, or a shorter one when
  that runs long. Checked against all 81 models: the short tier alone clears every one, so no model
  needs a data-level `shortName` after all.
- **Cookbook guides** (`{title} | quantized.uk Cookbook`, up to 80 chars) drop the `Cookbook` suffix
  (22 characters, zero SERP value) via `articlePageTitle()`. One guide's real title still ran past 60
  on its own (`gpt-oss-mxfp4-local`); it gets a new optional `Article.seoTitle` field — a shorter
  `<title>` tag only, so the visible H1 keeps promising what the guide actually covers. **No runtime
  ellipsis truncation anywhere** — every long title either fits a tier or gets an authored
  `seoTitle`.

**The five static templates** (homepage, `/best/[tier]`, `/formats/` index + single-format pages,
`/tools/`, `/faq/`, `/changelog/`) were hand-shortened, keeping the load-bearing keywords (format
names, VRAM, model counts) and dropping filler (`in 2026`, `what it is, what reads it, what it
costs` → `runtime, cost, VRAM`).

**`/about/` was 20 characters and said nothing** (`About | quantized.uk`) — now `About quantized.uk
— who maintains it | quantized.uk`, matching the audit's own suggested pattern.

Site-wide after the fix, across all 393 exported pages: **0 titles over 60 characters, 0 titles
under 20** (one deliberate exception: `/zh/privacy/` at 19 — Chinese conveys the same meaning in far
fewer characters, and the audit's floor is a Latin-script SERP-truncation concern, not a per-language
rule), **0 duplicate titles**.

### 2026-09-12 (d) — Audit P1: QTZ-024 complete — retention surface, and the RSS gap it exposed

**All 24 P1 audit items are now closed.** QTZ-024's problem statement: the site's only user action
anywhere was a feedback `mailto:` — nothing told a returning reader that the index changes every
few weeks, even though `/feed.xml` and `/changelog/` already existed and worked.

**Shipped:**

- **Footer "Stay current" column**, on all 164(+) pages via the shared `Footer` component: RSS
  (`/feed.xml`, described as no email / no tracking) and Changelog (`/changelog/`), plus a
  "found a wrong number?" line into the same feedback address.
- **A one-line freshness note** (`components/layout/PageFreshnessNote.tsx`) on every model and GPU
  page: "this page's figures change when the model or the runtime does," `dataLastUpdated`, and the
  RSS link — the reason to come back sits next to the numbers that will have moved.
- **No email newsletter** — deliberately. `/privacy/` and `/about/` both make "no tracking, no
  account" a stated trust asset for this audience; a mailing list would contradict it, and RSS
  already covers a geek-first readership without the GDPR surface.

**Checking, not assuming, found the real bug.** The audit's own acceptance criterion — "confirm RSS
autodiscovery is on every page, not just the homepage" — did not hold. Four templates build their
own metadata by hand instead of going through `pageMetadata()`: `app/quant-hub/[modelId]/page.tsx`,
`app/cookbook/[slug]/page.tsx`, and their `app/zh/**` mirrors. None of the four spread in
`feedAlternates()`, so roughly 200 of the site's highest-traffic pages — every model detail page and
every cookbook guide, in both languages — had a working feed with no `<link rel="alternate"
type="application/rss+xml">` pointing at it. A reader (or feed reader / browser extension) landing
on any of those pages had no way to discover the feed except typing the URL from memory. Fixed by
spreading `feedAlternates(path)` into each file's hand-built `alternates` object, the same fix the
existing CLAUDE.md convention already prescribes for `languages`.

`/feed.xml` itself needed no change — it already emits real `pubDate` / `guid` / `link` /
`description` on both changelog and recent-model entries (`lib/feed/build.ts`), and already outputs
model entries alongside changelog ones, which the audit had flagged as a common failure mode
elsewhere. Checked against the file, not assumed from the audit's description of a typical site.

### 2026-09-12 (c) — Audit P1: QTZ-023 complete (batch 3 of 3)

**The final seven:** `qwen-coder-32b-single-4090`, `deepseek-r1-exl2-vs-gguf`, `quantize-own-model-gguf`,
`cpu-inference-optimization`, `m1-8gb-ollama-limits`, `docker-ollama-gpu`, `llama-vps-llamacpp`.
1,464–1,759 words EN / 1,269–1,645 Chinese characters, up from 218–364.

**QTZ-023 is now fully closed.** All 23 cookbook guides: **1,464–1,824 words**, every one carrying
the *what you need first · steps · check it actually ran on the GPU · what the numbers should look
like · when it does not work* structure plus 3 FAQs (42 questions in this batch, 102 site-wide, all
present in the visible text). No guide reports a fictional "1 min read" any longer; none carries an
unearned `verifiedAt`.

**Three real content faults, not just thinness:**

- **`cpu-inference-optimization` was titled "OpenBLAS Tuning" and implied it speeds up chat.**
  llama.cpp's own build docs state BLAS acceleration helps prompt processing above batch size 32 and
  **does not affect generation speed at all**. The guide's own "~12 tok/s Hetzner / ~15 tok/s AWS"
  figures were unsourced — no CPU row exists anywhere in `matrixData`. Both are corrected: the
  guide now separates prefill from decode, states what BLAS actually buys, and gives a computable
  method (system RAM bandwidth ÷ weight size) instead of a number nobody measured.
- **`qwen-coder-32b-single-4090` called GGUF Q4_K_M "the sweet spot" on a 24GB card.** Run through
  this site's own `calcVRAM`: 21.7 GB at 4K context is **90% of the card — tight, not comfortable**
  by this site's own threshold. AWQ INT4 (18.1 GB, 75%) is the actually-comfortable pick, with the
  trade named explicitly: headroom versus the simpler GGUF/Ollama path.
- **`deepseek-r1-exl2-vs-gguf` claimed "~35% faster" with a GGUF figure ("~95 tok/s") nobody
  measured.** The EXL2 figure (128 tok/s) matches this index's own `matrixData` row; the GGUF one
  is now gone, replaced by the roofline the two nearly-identical file sizes actually imply (a few
  percent, not 35%).

**One honest gap stated rather than papered over.** `gpuDatabase` has no M1 or M2 base-chip
row — only M2 Max/Ultra — so `m1-8gb-ollama-limits` used the Mac M3 8G entry as a capacity
stand-in (capacity is generation-independent; 8GB is 8GB) and says so directly, including that the
M3 entry's 100 GB/s overstates the original M1's ~68 GB/s while roughly matching the M2 base chip.

**Verified from the projects' current docs, not memory:** `convert_hf_to_gguf.py` and
`llama-quantize` (the audit's specific complaint about `convert.py` did not reproduce — the data
already had the right names, so that guide was expanded rather than corrected); the imatrix
workflow via `llama-imatrix`; `llama.cpp`'s BLAS scope; and Ollama's `OLLAMA_NUM_PARALLEL` /
`OLLAMA_MAX_LOADED_MODELS` / `OLLAMA_KEEP_ALIVE` env vars from source.

Regression: 1,346 text nodes checked for contrast, **0 below AA**; **0/18** page×width combinations
with horizontal overflow.


### 2026-09-12 (b) — Audit P1: QTZ-023 (batch 2 of 3)

**The five server-side guides:** `vllm-awq-production`, `rtx4090-vllm-api`, `exllama-rtx4090-setup`,
`tabbyapi-exllama-server`, `nginx-llm-api-proxy`. 1,483–1,633 words EN / 1,263–1,490 Chinese
characters, up from 218–300.

**The audit predicted vLLM had moved on, and it had — further than expected.** Checked against
`vllm-project/vllm`'s current `docs/getting_started/quickstart.md`:

- Both guides taught `python -m vllm.entrypoints.openai.api_server`. The documented entrypoint is
  the **`vllm serve`** CLI. (The old form still appears on one page — inside an FAQ answer saying
  it is obsolete.)
- Install was `pip install vllm --extra-index-url .../cu121`; it is now
  `uv pip install vllm --torch-backend=auto`, which resolves the torch build from the installed
  driver.
- The docs also confirm official **ROCm wheels** and Intel XPU / TPU backends — the "vLLM is
  CUDA-only" claim this site corrected in September was wrong in the other direction too.
- Real failure-mode material: the preemption warning naming `PreemptionMode.RECOMPUTE`, and the
  start-up crash when `max_num_batched_tokens < max_model_len` with chunked prefill disabled.

**Two more things the check found:**

- **ExLlamaV2 moved to `turboderp-org/exllamav2`**, and the current example passes `-gs auto` rather
  than hand-written per-GPU gigabyte figures.
- **TabbyAPI's README states it is "a hobby project made for a small amount of users… not meant to
  run on production servers."** That is now the first thing its guide says. The maintainers' own
  assessment outranks anything this site could add, and a guide that omits it is selling something.

**An invented number removed.** `rtx4090-vllm-api` claimed "~220 tok/s (batch=1), ~1400 tok/s
(batch=8)". The batch-1 figure is consistent with this index's own measurement (218 tok/s for
Llama 3.1 8B AWQ under vLLM on a 4090); **the batch-8 figure was measured by nobody here**. The
guides now cite only the runs the index holds — including 235 tok/s for ExLlamaV2 at EXL2 4.65bpw
on a 4090 and 175 on a 3090 — and state that batched throughput is not something this site has
measured rather than quoting someone else's multiple.

Every memory figure again comes from `calcVRAM`: Qwen2.5 7B at AWQ INT4 is 3.6 GB of weights and
4.2 GB at 4K, 5.9 GB at 32K — which is what makes `--max-model-len` the first knob to turn.

Regression: 1,179 text nodes checked for contrast, **0 below AA**; **0/18** page×width combinations
with horizontal overflow, including the nginx config block at 390px.

**Remaining: 7 guides in batch 3.**


### 2026-09-12 — Audit P1: QTZ-023 (batch 1 of 3)

**17 of 23 guides were under 365 words of body**, measured directly rather than taken from the
audit: `quantize-own-model-gguf` had **14 words**, `vllm-awq-production` 16, `llamacpp-windows-cuda`
18 — under titles promising a full setup guide. The six rewritten on 2026-09-08 sit at 448–655.

**Batch 1 — the five with the widest beginner intent:** `rtx4060ti-what-to-run`, `mac-ollama-setup`,
`docker-llm-compose`, `windows-ollama-native`, `llamacpp-windows-cuda`. Rendered body went from
~780 words (mostly template chrome) to **1,587–1,753 words EN / 1,313–1,514 Chinese characters**,
against the benchmark guide's 1,824. Reading time, derived, went from "1 min" to 3–5.

Structure follows the six: **What you need first · the steps · Check it actually ran on the GPU ·
What the numbers should look like · When it does not work**, plus three FAQs per guide emitted as
`FAQPage` from the same array the page renders (30 questions, all present in the visible text).

**What the rewrites are allowed to claim.** Every memory figure is read off `calcVRAM` on the
model's own row before the prose was written — the 8GB guide once ran ~2GB high and the Mac guide
told 18GB readers a 14B "needs 36GB+" when it needs 11.0, and *both carried a `verifiedAt`*.
Commands were checked against the projects' current documentation (llama.cpp `docs/build.md`,
Ollama `docs/api.md`), which is a **documentation check, not a run**: there is no GPU here, so the
`verifiedAt: '2026-07-22'` all seventeen still carried is **removed**, not refreshed, and
`updatedAt` records the rewrite. `verifiedStack` survives — it says what the guide is written
against, which is still true.

**Material that came out of checking rather than from memory:**

- `GGML_CUDA=ON`, not `LLAMA_CUDA` — CMake ignores an unknown `-D` silently, so the old name yields
  a clean, successful, **CPU-only** build whose only symptom is being slow.
- The binaries are `llama-server.exe` / `llama-cli.exe`; `server.exe` and `main.exe` are gone.
- `CMAKE_CUDA_ARCHITECTURES` (86 = Ampere, 89 = Ada, 120 = Blackwell) cuts Windows build time.
- **System Memory Fallback**, on by default in the NVIDIA control panel on Windows, spills VRAM into
  system RAM instead of failing — turning "does not fit" into "inexplicably slow". It appears in
  three of the five guides because it explains three different symptoms.
- `ollama ps` reports placement per loaded model in a `PROCESSOR` column, which is the only usable
  GPU check on a Mac: unified memory means there is no separate VRAM figure to watch climb.

`Article` gained `faqs?`, and `cookbook-rewrites.ts` merges rewritten content over the originals by
id — keeping each batch reviewable on its own instead of as a diff buried in the data files.

Regression: 1,224 text nodes checked for contrast, **0 below AA**; **0/18** page×width combinations
with horizontal overflow, including the 30-line compose file at 390px.

**Remaining: 12 guides in batches 2 and 3.**


### 2026-09-11 (m) — Audit P1: QTZ-022

**Measured the graph first.** A crawl of the exported English tree (197 pages), excluding the 14
URLs that appear on >90% of pages (the nav and footer):

| | inbound min | median | pages < 3 | outbound (non-template) |
|---|---|---|---|---|
| model (81) | 5 | 63 | 0 | **7–9** |
| gpu (61) | **1** | 4 | **8** | 37–82 |
| format (8) | **1** | 3 | **4** | 4–84 |
| cookbook (23) | 2 | 6 | 1 | **3–8** |

The audit's own numbers predated the `/best/` and single-format ships, so they were re-derived
rather than quoted. Two real faults survived: a model page emitted 7–9 links — to similar models and
guides, never to a format page, a hardware page or a recommendation — and the format pages had one
inbound link each, from `/formats/`.

**`ModelPlacement` ("Where this model fits")** — 81 pages × 2 languages. The five cheapest cards
that clear the model, the ones where it is tight, the two it *just* misses and by how much, the
formats it ships in, the comparison pages covering those formats, any `/best/` tier it is a pick on,
and the two tool deep-links. 11–25 outbound per page.

**`GuideReferences` ("What this guide uses")** — the hardware, the models, the format, the matching
`/best/` tier and what to read next, all from fields the guide already carries. Guides went from
3–8 outbound to 5–16.

**Result: no content page is reachable from fewer than three others.**

| | inbound min | median | pages < 3 |
|---|---|---|---|
| model | 5 | 63 | 0 |
| gpu | **3** | 11 | **0** |
| format | **7** | **25** | **0** |
| cookbook | **3** | 8 | **0** |
| best | 6 | 15 | 0 |

23,985 internal anchors, **0** using "here" / "this page" / "点击这里".

**Three bugs, each found by re-measuring rather than by reading:**

- **`modelPlacement` sized against `bestQuant`** — Q8_0 for most models, so the card list started at
  12 GB while every other surface on the site sizes at Q4_K_M. The module would have contradicted
  the GPU page it linked to. Now the same reference `modelExplainer` uses.
- **The guide format row was derived from its models' formats**, and most models ship GGUF, AWQ and
  EXL2 — so fifteen guides printed the same three formats regardless of subject. It now matches the
  runtime the guide names (title, id, `verifiedStack`) against each format's `framework`, flattening
  punctuation on both sides because the slug says `llamacpp` and the data says `llama.cpp`.
  `exllama-rtx4090-setup` → EXL2, `vllm-awq-production` → AWQ/GPTQ, `mac-ollama-setup` → GGUF.
- **`windows-ollama-native` stayed at two inbound through three attempted fixes.** The relatedness
  score is asymmetric — a guide with `relatedModelIds` and a `gpuPreset` earns 4 and 3 points from
  its peers, an infrastructure guide can only earn title-word points — so it named three neighbours
  and was named by none. Orphans are now adopted by their **top two** neighbours, and adopted entries
  are appended **after** the list cap: two orphans both chose `docker-llm-compose` as a host, the
  first filled its fourth slot and the second was silently sliced away.

Also: the GPU "same budget" section only rendered when a same-*type* sibling existed, so a Mac M5
Pro 64G never showed its system-RAM counterpart — which was the only inbound link the CPU pages
could get. Regression: 1,960 text nodes checked for contrast, **0 below AA**; **0/18** page×width
combinations with horizontal overflow.


### 2026-09-11 (l) — Audit P1: QTZ-020

**The site had the data to answer "best local LLM for 16GB" and no page that did it.**
`/gpu/{card}/` answered "what fits" with a list; `/quant-hub/` answered "what exists" with another.
The query is a **recommendation**, and it was going to blogs with no measurements.

**7 pages × 2 languages = 14**, 1,117–1,364 words each: `/best/` plus `8gb-vram`, `12gb-vram`,
`16gb-vram`, `24gb-vram`, `32gb-vram` and `mac-apple-silicon`. Tiers are the capacities the index
has several cards at — 10 GB and 20 GB have one card each and would be a page about one product.

Each tier page carries: the answer in the first sentence, a picks table (use case, model, quant,
VRAM, headroom, published loss, and a derived "why"), **Cards this applies to**, **What does not
fit**, **Pushing context**, and 3–4 FAQs with `FAQPage` + `ItemList`.

**One ranking implementation.** The picks come from `homePicks` — the same function behind the
homepage hero — so a tier page and the homepage cannot recommend different models for the same card.
Verified by perturbation: raising one model's `params` from 24 to 40 moved the 16GB general pick
from Mistral Small 24B to Devstral Small 1.1 and dropped the fit count 52 → 51.

**What "best" is allowed to mean.** This index runs no task benchmarks, so it cannot say which model
is smarter and every page says so: best = the largest model in its category that clears the card
with headroom, at the highest-quality quant that still fits.

**Two bugs caught before shipping:**

- **The Apple page computed its picks against 512 GB.** `tierCard()` returned `tier.cards[0]`, and
  the first Apple entry is a Mac Studio — so the picks came back as a 675B model needing 429 GB
  while the same page's context ladder used the declared 36 GB tier. One page, two capacities.
  `tier.vram` now wins.
- **Identical picks repeated as separate rows.** A model tagged both `general` and `code` is
  honestly the answer to both, but printing it twice looked like a bug and wasted a third of the
  table. A row now carries every use case it wins (`General · Coding`).

**49 new inbound links to the GPU pages** per language (6+8+12+3+2+18 cards named across the tiers) —
the thinnest internal linking on the site. Reachable from four places: the homepage task column,
the `/gpu/` index, every GPU detail page's short-answer block, and the footer. The audit's
suggestion to hand-write 18 "why" sentences was declined — a sentence a human types once and nobody
recomputes is what `readTime` was, so the "why" is conditional on real facts instead (largest that
fits, only one in its category, whether a perplexity figure exists, whether it survives 32K).

Also caught: the single-format pages and `/best/` both needed adding to `sitemap.ts`; 372 → **392**
URLs. Regression: 1,652 text nodes checked for contrast, **0 below AA**; **0/24** page×width
combinations with horizontal overflow.


### 2026-09-11 (k) — Audit P1: QTZ-018

**Reproduced first, and the audit's premise was half wrong.** It reported that the `SearchAction`
every page emits promises `/quant-hub/?q={term}` and that "the interface probably does not work".
Measured in a browser: `?q=qwen` returns **24 of 81** cards, `?recency=recent` returns 10,
`?size=70B%2B` returns 15, and the canonical on every one already points at `/quant-hub/`. The
deep-link interface works; it is honoured after hydration by `useUrlQuery()`.

**What was actually missing** was the markup. The control was a bare
`<input type="search" id="hub-search">` with **no `name`** and **no `<form>`** — so nothing could
submit it without JavaScript, and nothing reading the HTML could discover the interface the schema
advertises. It is now `<form role="search" action="/quant-hub/" method="get">` with `name="q"`, a
real `<label>`, and hidden inputs carrying the other active filters so submitting a search does not
silently clear the size or format chip. The action is language-aware (`/zh/quant-hub/` in the
Chinese tree). Verified with JavaScript disabled: the form is present and submits.

**One acceptance criterion cannot be met and is not claimed.** "`?q=qwen` returns pre-filtered HTML
with JS disabled" requires a server to render per query; this is `output: 'export'` and one document
serves every query string. The static answer is the form — a working, shareable, crawlable URL that
the page then filters on mount.

**Search matched three fields.** Name, family and id only, so "coding", "vision", "gguf", "7b" and
"awq" each returned zero of 81 — reasonable things to type into a box on a quantization index. It
now searches size, categories, hardware tags, formats and quant levels too, strips punctuation
(`qwen3.8` → 2 models), and carries a small alias map because **the words people type are not the
values the data uses**: `coding` → `code` (0 → **36 models**), `vision` → `multimodal`,
`apple` → `mac`.

**Empty results used to be a sentence and a "clear filters" button** — telling the reader they were
wrong and offering them the start again. Now four suggestions drawn from the index, so every one
returns something (verified: clicking one goes 0 → 9 models, in both languages).

**Filtered URLs: `noindex, follow`.** All filters are URL params, which is what makes a result set
shareable and also what could generate a combinatorial supply of near-duplicates. `QueryNoindex`
rewrites the existing robots tag when — and only when — the URL carries a param the page reads.
Verified: `/quant-hub/` keeps `index, follow` and every filtered URL reports exactly one
`noindex, follow`. Deliberately **not** `Disallow: /*?*` in robots.txt: a disallowed URL is never
fetched, so its links are never followed, and it would catch the calculator's share links too.

Regression: 3,889 text nodes checked for contrast, **0 below AA**; **0/12** page×width combinations
with horizontal overflow; at 390px the focused search box sits 683px below a navbar ending at 56px.


### 2026-09-11 (j) — Audit P1: QTZ-019

**`/faq/` was a 404**, and only the four tool pages carried `FAQPage`. This was the largest single
gap for AI engines: the site holds the data to answer "how much VRAM does a 7B need" precisely, and
had it only as a calculator input — never as a question with a self-contained answer.

`lib/utils/faq.ts` + `/faq/` + `/zh/faq/`: **24 questions in 5 groups**, 2,805 words EN / 3,302
Chinese characters, `FAQPage` with all 24 (48 across both trees, every one present in the visible
text). Each answer ends in an internal link — **39 per page**.

**Computed, not written.** Every figure comes from the index, so the FAQ cannot drift from the
calculator the way the cookbook guides did. Verified by perturbation: changing one model row's
`bpw` from 4.85 to 6.50 moved the 7B sizing answer (5.1 → 6.7 GB) *and* the GGUF effective-rate
range (4.1–4.9 → 4.1–6.5) in the same edit.

**Where the index cannot answer, it says so.** Three questions are answered with a limit rather than
a number: whether quantization hurts coding more than chat (every quality figure here is perplexity
on WikiText-2, which is not a coding benchmark), whether an official QAT build beats a community one
(true in mechanism, but this index records no publisher per quant — the QTZ-015 gap), and Q5 vs Q4
where a model publishes only one of the two.

**Faults found while writing it:**

- **The Q5-vs-Q4 answer compared two medians drawn from different populations** — 79 models report
  Q4_K_M, 16 report Q5_K_M, and they are not the same 16. Subtracting one median from the other
  describes the two groups, not the two levels; it is the old homepage "average accuracy" fault in a
  new place. Now **paired**: only the 16 models publishing both, median delta 1.5 points for ~17%
  more file.
- **"Best GPU" returned a Radeon PRO W7900.** Filtering on `type` alone treats workstation and
  Instinct cards as consumer; "what should I buy" now excludes them by name and answers RTX 5090.
- **The Mac answer counted models and called them formats** — "removes 74 of the format choices" was
  53 AWQ + 21 EXL2 models. It now says three of the four tracked formats are unavailable.

**Also caught:** `/tools/` and `/changelog/` shipped as real pages on 2026-09-11 and were never added
to `sitemap.ts` — two pages the sitemap did not mention. Added with `/faq/`.

The homepage gets four of the questions as a visible block and **deliberately no `FAQPage` of its
own**: the same question as structured data at two URLs is a duplicate-entity problem, not double
coverage. `/faq/` owns the schema.

Regression: 1,520 text nodes checked for contrast, **0 below AA**; **0/15** page×width combinations
with horizontal overflow. `<details>` rather than a JS accordion, so the answers are in the exported
HTML with the bundle blocked.


### 2026-09-11 (i) — Audit P1: QTZ-015 (the half the data supports)

**"What is AWQ" had no page.** `/formats/` compared formats against each other and six pair pages
compared two at a time; nothing explained *one*. The 53 models shipping AWQ had no shared parent,
so no link ran from a format to the models that carry it.

`lib/utils/format-page.ts` + `FormatSingleContent` generate one page per format in
`SHIPPED_FORMATS` — **8 pages** (4 × EN/ZH), 979–1,821 words each, all derived:

- *What it is* — `formats.ts` prose plus the index's own coverage and level list.
- *What reads it* — framework, hardware, strengths and weaknesses from the format row.
- *What it costs* — the index's 8B-class model for that format, priced at its **own** `bpw`,
  broken into weights / KV / activations, with the smallest card that clears it.
- *Levels in this index* — count, bpw range and median published loss **with sample size**, dash
  where nobody published one.
- *Models that ship it* — the full list, linked. **159 new format → model links** per language.
- *FAQ* — 3–4 questions, `FAQPage` from the same call, all 28 present in the visible text.

**What was deliberately not built.** The task asked for NVFP4 and FP8/W4A16 pages and for MXFP4 as a
fifth tracked format:

- **NVFP4 / FP8** — no model in this index ships either. A page about a format the Hub returns zero
  results for is the HQQ mistake with a new name. They become pages the day a model ships one.
- **MXFP4 is not a container format.** GPT-OSS's native 4-bit weights are distributed *as GGUF* and
  are stored that way here (`format: 'GGUF', level: 'MXFP4'`, 2 models). Promoting it to a format
  would misdescribe the data and make "4 formats tracked" wrong. It is surfaced instead as a section
  on the GGUF page: released at 4 bits rather than converted down, no FP16 original to measure a
  loss against, and re-quantizing it costs quality for no memory saving.
- **`quantSource` / `quantPublisher` (official QAT vs community PTQ) is blocked, not skipped.** It is
  the strongest differentiator in the audit and it needs per-**quant** repo attribution.
  `hfRepoMap` holds one repo per *model* (46 bartowski, 20 Qwen, 4 mistralai …) and README §9
  already records that 14 of those point at the original weights rather than a quant conversion.
  Backfilling ~300 quant rows from it would be inventing attribution. It needs a real per-quant repo
  source, which `huggingface.co` being blocked by the egress proxy currently prevents.

**One route, two page kinds.** Next allows a single dynamic segment per level and `/formats/gguf/`
sits beside `/formats/gguf-vs-awq/`, so `app/formats/[slug]/` (renamed from `[pair]`) dispatches:
a slug is a pair if `pairBySlug` knows it, a format otherwise. Format ids contain no `-vs-`, so the
two vocabularies cannot collide.

**Caught in verification:** `app/sitemap.ts` mapped `formatPairs` only, so the 8 new pages were
absent from the sitemap — the failure mode of two page kinds sharing one route. Now both are
listed; 364 → **372** URLs.

Regression: 2,384 text nodes checked for contrast, **0 below AA**; **0/30** page×width combinations
with horizontal overflow.


### 2026-09-11 (h) — Audit P1: QTZ-014

**Two pages with an intersection of zero.** `/formats/awq-vs-gptq/` and `/formats/exl2-vs-gptq/`
each compared formats that **no model in the index ships together** — GPTQ is on 4 of 81, and not
one of those 4 also has an AWQ or EXL2 build. With nothing in common there is no row to put side by
side, so both pages spent ~650 words restating two editorial descriptions next to each other, with
one inbound link apiece.

**Derived, not deleted by hand.** `formatPairs` now filters on `overlapCount(pair) > 0`, and
`mergedPairs` carries the excluded ones with a target chosen by data: the best-supported surviving
page about the pair's **rarer** format, which resolves both to `/formats/gguf-vs-gptq/`. If a model
ever ships both AWQ and GPTQ the pair becomes a page again with no code change. Six consumers
(static params, sitemap, `/llms.txt` count, the index cards, the tools index) all read
`formatPairs`, so 6 pairs → 4 propagated everywhere with no edit.

**The redirect mechanism the audit proposed does not work here.** `next.config.js` `redirects()`
requires a Next server; under `output: 'export'` it is silently inert — it would have looked done
and done nothing. Cloudflare Pages reads `_redirects` from the build root, so that is where the four
rules live (EN + ZH, 301).

**`_redirects` is hand-written while the pages are derived, so the postbuild gates it.** Each rule is
checked from both ends: the source must **not** be an exported page (otherwise the real file shadows
the redirect and it can never fire) and the target **must** be one (otherwise it redirects into a
404). Verified failing: adding `/formats/gguf-vs-awq/ → /formats/nope/` exits 1 and names both
faults; the real table exits 0 with "4 redirects check out".

**The question survives the page.** "AWQ or GPTQ" is a real query — the answer is just that nobody
faces the choice for a given model. `/formats/gguf-vs-gptq/` now carries an `AWQ vs GPTQ, EXL2 vs
GPTQ` section saying exactly that, with the counts, and a verdict (AWQ on both counts, on
activation-aware quantization and first-class vLLM/TGI support; EXL2 for variable bit-width on a
single NVIDIA GPU). 743 → **919 words EN / 717 Chinese characters**. The section renders only where
`mergedPairs` points, so it cannot appear on a page that is not a redirect target.

Export: 374 → **370 pages**. No residual link to either removed URL anywhere in `out/`, and neither
appears in `sitemap.xml`.


### 2026-09-11 (g) — Audit P1: QTZ-012

**61 GPU pages, one page.** The fit list is a function of VRAM and nothing else, so every 16 GB
card returned byte-identical rows. Naming the siblings (2026-09-08) was honest but did not touch
the cause: **the page said nothing about the card**.

**What was missing was a spec.** `GPU` now carries `bandwidth` (GB/s) and `memType`, filled for all
57 discrete cards from vendor specifications and launch reviews — RTX 50 / 40 / 30, Radeon RDNA 4 /
3 / 2, Instinct and Radeon PRO, the A100 / H100 / L40S / A40, and every M2–M5 Mac tier. The four
CPU entries are deliberately left without one: system bandwidth is a property of the reader's DIMMs
and channel count, not of "64 GB of RAM".

`gpuExplainer()` (`lib/utils/gpu-explainer.ts`) builds a decision block and four questions per page:

- **Biggest that fits** / **Room to grow** — from `fitsOnGpu`, so they cannot disagree with the list below.
- **Speed ceiling** — `bandwidth / weightsGB`. Token generation reads the whole weight set once per
  token, so this is a hard roofline: an 8B at Q4_K_M is 4.6 GB of weights, giving **62 tok/s on a
  288 GB/s RTX 4060 Ti 16G and 159 on a 736 GB/s RTX 4080 Super** — same capacity, same models, a
  2.6× difference the old pages could not express. Labelled as arithmetic on two published numbers,
  never as a measurement.
- **The wall you will hit** — branches on hardware class: bandwidth (a same-capacity card is ≥1.5×
  faster), the GPU's share of unified memory on Apple, ROCm backend coverage on AMD, what the index
  has 4-bit builds for at the top end, capacity otherwise. 38 distinct openings across 61 cards.

**The roofline found a fault in our own data.** Three `matrixData` rows attributed to an RTX 4060 Ti
16G claim speeds that card cannot reach: 78 tok/s on a 4.87 GB Q4_K_M Llama 3.1 8B requires
380 GB/s, the EXL2 row's 98 tok/s requires 458, the Qwen2.5 7B row's 82 requires 379 — against a
**288 GB/s** specification, and no real run reaches even 100% of peak. They were also the only
hardware in the table `dataSources.benchmarks` never listed. **Removed, not corrected** — nobody
here ran a 4060 Ti, and a number invented to look plausible is the thing that file exists to avoid.
Every remaining row sits under its own card's roofline (the 4090's fastest dense row is 71% of peak).

**MoE is excluded from the roofline.** The index's own Qwen3 30B-A3B run measures 95 tok/s where the
dense arithmetic says 57 — correct for a model that reads one router's worth of experts per token,
and a broken-looking ceiling if quoted. `rooflineTokS()` declines rather than guessing at an active
parameter count the data model does not carry.

Also: `article()` resolves "a" vs "an" for all 61 names (an RTX, a Radeon, an Instinct, a Mac), which
is why the page title had been dodging the article since these pages shipped.

**Result:** median GPU page body **674 → 1,958 words**; `FAQPage` on **122 / 122** pages with all 478
questions present in the visible text; mean 5-gram Jaccard **0.462**, worst pair 0.952 (RX 9070 vs
9070 XT — identical capacity *and* identical bandwidth, so for this site's purposes they are the same
card). Regression: 4,927 text nodes checked for contrast, **0 below AA**; **0/30** page×width
combinations with horizontal overflow.


### 2026-09-11 (f) — Audit P1: QTZ-013

**`/formats/` was 65 words** — the thinnest page on the site, on the site's own subject, and the
only internal route to the six `/formats/<a>-vs-<b>/` comparisons. It rendered a heading, one
sentence, and six link cards.

`lib/utils/format-overview.ts` counts the page instead of writing it. Per format: how many of the
81 models ship it (`modelsWithFormat`), the **median published perplexity loss** over that format's
4-bit-class quants (`bpw <= 5`, `pplLossPercent !== undefined`) with the sample size printed beside
it, and the quant levels this index actually carries, most common first.

| Format | Models | Median loss | Sample |
|--------|--------|-------------|--------|
| GGUF | 81 / 81 | 3.0% | n=99 |
| AWQ | 53 / 81 | 4.0% | — |
| EXL2 | 21 / 81 | 2.3% | — |
| GPTQ | 4 / 81 | 4.8% | — |
| HQQ | **0 / 81** | none published | — |

**The HQQ row is the point of doing this from data.** `formats.ts` documents HQQ as editorial
reference; no model in the index ships it. The table prints `0 / 81` and a note saying it is
reference material, not something the Hub will return — which is the inverse of the mistake the
homepage made when it badged HQQ as a tracked format (§9, 2026-08-23).

The audit's proposed table also carried **NVFP4** and **Official QAT** rows with `{n} of {N}` counts.
Neither exists in this index, so neither was added: a count of zero for a format the site does not
track is not information, it is the HQQ mistake with a new name.

Formats with no published perplexity anywhere show a dash. A median over an empty set is not 0%.

**Result:** 65 → **917 words EN / 571 Chinese characters**, a decision section that names the four
shipped formats with their counts, and the six comparison cards kept under their own heading.
Regression after the change: 1,682 text nodes checked for contrast, 0 below AA; 0/24 page×width
combinations with horizontal overflow.


### 2026-09-11 (e) — Audit P1: QTZ-011 and QTZ-016

**QTZ-011 — 81 model pages were a table and almost nothing else.** Median body **219 words**, 27
pages under 210. Two consequences, and the second is the one that matters: a row reading
`GGUF Q4_K_M 4.85 5.8 GB 2.8% 142 tok/s` cannot answer "will Qwen3 8B run on a 12GB card", so
neither a skimming reader nor an AI assistant gets anything out of the page.

`modelExplainer()` generates three sections and three questions **from that model's own row** — the
same principle as `tool-content.ts`, except 81 pages cannot be hand-written so every sentence is
derived: what it costs at 4K broken into weights / KV / activations, the smallest card in the index
that clears it and how many do, what 32K adds and what the native window would cost, which formats
and levels exist, and which build to fetch.

**Derived, therefore varied.** The sentences are conditional on facts that differ per model — the
smallest fitting card, how many fit, how many formats it ships, MoE or dense, hybrid attention or
not, whether a perplexity figure or a measured speed exists at all. Measured afterwards on a 30-page
sample: mean 5-gram Jaccard **0.500**, worst pair **0.755** (`deepseek-coder-v2-lite` vs
`deepseek-v2-lite` — the same architecture at the same size). For comparison the GPU pages' worst
pair is 0.956. Median body **219 → 1,143 words**; 0 pages under 210.

`FAQPage` schema on **162 of 162** model pages (was 0), built from the same `modelExplainer()` call
that renders the visible FAQ, so the questions a crawler sees are the ones a reader sees. Structured
data audited afterwards across the whole export: **0 problems**.

**QTZ-016 — guides were not declaring when they changed.** `dateModified` was emitted only from
`verifiedAt`, and removing five unearned `verifiedAt` values earlier today had therefore removed
those pages' only modification date — a guide that had just been corrected looked, to a crawler,
older than one nobody had touched. That was my regression. `Article.updatedAt` is a separate claim
(content changed) from `verifiedAt` (commands re-run); `dateModified` prefers the first. **22 of 23
guides** now carry one.

`about` and `mentions` come from `gpuPreset` and `relatedModelIds` — fields the guides already use
for their own links, so the entities cannot describe something the page never names. Only 7 guides
had those fields, so 12 more were wired from **what each guide's body actually mentions**; the four
that name no model or card (nginx proxy, generic Windows and quantize guides) still get nothing.
Entity markup 7 → **17 `about` / 18 `mentions`**, and all **81 models now have related guides**,
because `guideLinksForModel()` reverses the same wiring.

`author` stays an Organization. The audit asks for a Person for E-E-A-T, but no maintainer name is
published anywhere on this site, and inventing one is inventing an author.

No regression: 1,559 text nodes 0 below WCAG AA, 0 horizontal overflows across 24 combinations.


### 2026-09-11 (d) — Audit QTZ-005: the hardware database reaches the current generation

Until today the newest NVIDIA consumer card in `gpus.ts` was the **RTX 4090, from 2022**. The site's
entire premise is "what fits your card", and it could not answer that for anything two generations
newer — "what can an RTX 5090 run", "how much does an M5 Max hold" returned nothing.

Unlike the model index, this needed no architecture data: `GPU` carries `{ id, name, vram, type }`
and **only `vram` feeds the sizing math**. Capacities verified 2026-09-11 against vendor and press
specifications; nothing else is claimed, because nothing else was checked and nothing else changes
what fits.

**18 cards added, 43 → 61:**

| Family | Added |
|---|---|
| NVIDIA Blackwell | RTX 5090 (32GB), 5080 (16), 5070 Ti (16), 5070 (12), 5060 Ti 16G, 5060 Ti 8G, 5060 (8) |
| AMD RDNA 4 | RX 9070 XT (16), RX 9070 (16) |
| Apple M5 | M5 Ultra 512G / 256G, M5 Max 128G, M5 Pro 64G, M5 32G |
| Apple M4 | M4 Max 128G / 36G, M4 Pro 48G / 24G |

Deliberately left out: the **RTX 5050**, whose capacity the sources called "expected" rather than
confirmed, and the **RX 9060 XT**, which none of the results I could reach specified. A card whose
VRAM is a guess produces a page of guesses.

Two capacities are genuinely new to the database — **256GB and 512GB** (Mac Studio M5 Ultra) — and
they change what the site can express: the 512GB entry is the first that fits all 81 models,
including the 675B Mistral Large 3.

Every one of these pages says **"No benchmark runs in this index were recorded on a \<card\>"**,
because none were. The `measuredRowsFor()` work from earlier today is what makes that automatic
rather than something to remember.

`GPU_COUNT` joins `MODEL_COUNT` in `lib/seo.ts` — the GPU count had been typed into five more
strings, the same drift the model count had. The homepage's popular-cards row now mixes
generations; it was entirely pre-2025.

373 pages, up from 337. GPU meta descriptions stay **62 distinct out of 62** per language.
No regression: 3,672 text nodes 0 below WCAG AA, 0 horizontal overflows across 24 combinations.


### 2026-09-11 (c) — Audit QTZ-003(part) / 004 / 006 / 007 / 008 / 009 / 010

The data-independent half of the audit — everything that did not need model
specifications I cannot source.

**QTZ-010 — 36 of 43 GPU pages shared nine descriptions.** The template
interpolated only `gpu.vram`, so every 16GB card shipped a byte-identical meta
description. `gpuPageDescription()` now names the card and the largest model it
actually runs, both of which vary per page. Measured after: **44 pages, 44
distinct descriptions, 0 duplicate groups**, in both languages. It also
suppresses the capacity parenthetical when the name already carries it — "16 GB
RAM (CPU) (16GB)" was the first draft.

**QTZ-009 — `/tools/` was a 404** while four tool pages lived under it, and the
nav linked four destinations out of a site with 43 GPU pages and 6 format
comparisons. `/tools/` and `/zh/tools/` now exist, built from the same
`tool-content.ts` the tool pages render so the index cannot describe a tool that
has changed; `/gpu/` joins the main nav and `/formats/` the tools menu.

**QTZ-007 — the homepage printed the same changelog entry three times**: the
hero pill, "This week's updates", and the changelog block. Partly my own doing
from the P1-01 restructure. `/changelog/` is now a real page (another of the
audit's 404s), the hero pill carries a date and a link instead of truncated
prose, "This week's updates" keeps the models and drops the notes, and the
homepage block is a pointer. **Three renderings → one**, with `id="changelog"`
still on the homepage because `/feed.xml`, the About page and external links all
target it.

**QTZ-008 — the homepage title was `quantized.uk — AI Quantization
Intelligence`**: brand first, and a phrase nobody searches. Now
"What LLM can my GPU run? — VRAM calculator and 81-model index", matching the
`<h1>` that has asked that question since P1-01.

**QTZ-003 (the half that needed no new data) — counts are computed now.**
`MODEL_COUNT` in `lib/seo.ts` derives from `models.length`; the six places that
hardcoded the number no longer do. `public/llms.txt` became
`app/llms.txt/route.ts`, generated like `feed.xml` — it was advertising "79+"
while the index held 81, on the one file whose whole audience is machines
reading the site's claims about itself. It now also states how the numbers are
produced.

**QTZ-004 — the date beside a NEW badge read as a release date.** It is
`addedAt`, when this index picked the model up, and several of those models
shipped a year earlier. It reads "added 2026-08-07" now, and the badge carries a
title explaining what it means.

**QTZ-006 — the methodology block advertised `llama.cpp b4000+, vLLM 0.6.x,
Ollama 0.3.x`**, two major generations behind. **Not fixed by bumping the
numbers:** that block records the stack the benchmarks were actually run on, and
editing it to look current would claim runs on releases that did not exist when
they were made. Both are shown instead — the measured stack, and
`runtimeVersions` with what the projects are at today (llama.cpp b10760,
vLLM v0.29.0, Ollama v0.33.2, checked 2026-09-11) plus a note that speed figures
move with the runtime. `checkedAt` is only to be updated when actually
re-checked.

No regression: 3,191 text nodes across 10 pages, 0 below WCAG AA; 0 horizontal
overflows across 30 page × width combinations; all three build gates green.
337 pages, up from 333.


### 2026-09-11 (b) — 2026 architectures: the calculator was wrong before any model was added

The audit's third P0 was "the model index is 10–12 months stale". Adding models turned out to be
blocked by something underneath it: **the VRAM formula could not represent a 2026 model at all.**

`calcVRAM` assumed every layer keeps a KV cache that grows with context. Qwen3.8-27B has 64 layers
of which **16** run full attention — `Qwen3NextConfig.__post_init__` in `transformers` builds the
list as `"linear_attention" if (i + 1) % full_attention_interval else "full_attention"`, and this
model ships `full_attention_interval: 4`. The other 48 layers hold a fixed Gated DeltaNet recurrent
state that does not scale with context. Sizing all 64 the old way overstates the cache **fourfold**:

| context | old formula | counting the 16 | published measurement |
|---|---|---|---|
| 8K | 2.00 GB | 0.50 GB | 0.5 GB |
| 32K | 8.00 GB | 2.00 GB | 2.0 GB |
| 262K | 64.00 GB | 16.00 GB | 16.4 GB |

`ModelArch.attention` now carries `fullLayers` / `windowLayers` / `windowTokens`, which also
expresses Gemma 4's 5:1 sliding-window stack. Omitting it means "every layer, full cache", so all
**888** existing model × quant × context combinations return byte-identical results — verified, not
assumed.

**`pplLossPercent` became optional.** It was required, and nobody publishes a per-level perplexity
sweep for these releases. The choice was to invent numbers or to let the column be empty, and an
invented figure would not have sat quietly in a table — it feeds `fitsOnGpu`, the homepage picks,
the hub cards and the compare rows. `qualityRank()` (`lib/utils/quality.ts`) sorts by the published
loss when there is one and falls back to bits-per-weight when there is not, so a real measurement
never loses a tie to a fallback; `formatLoss()` prints an em dash. Verified behaviour-identical for
all 79 existing models. The homepage stat still reads "median across 79 models" while the index
holds 81 — the two new entries are honestly outside the sample.

**Two models added, both sourced rather than recalled.** huggingface.co is blocked by this
environment's egress proxy, so architecture came from `huggingface/transformers`'
`configuration_*.py` on raw.githubusercontent.com (reachable, and authoritative — each carries its
family's reference-checkpoint defaults), and every number was then checked against a published
measurement:

- **Ministral 3 8B Instruct** — `Ministral3Config` gives 34 layers, 32 heads, 8 KV heads, head_dim
  128, `sliding_window: None`. Parameters computed from that config come to 8.49B; Mistral's own
  GGUF sizes imply 16.02 bits per weight at BF16, which is 16 to within rounding. Three independent
  routes agreeing is why this entry exists.
- **Qwen3.8 27B** — architecture above, `bpw` derived from the published 15.33 GiB Q4_K_M.

**What was deliberately not added**, and why, because the audit lists far more: Gemma 4 needs a
per-group `head_dim` (512 on global layers, 256 on sliding) and I could not find a KV measurement to
validate it against — the two figures I did find were quoted at different quantizations and
contradict each other. Ministral 3 14B has clean file sizes (Q8_0 at 14.4 GB implies 13.55B
parameters, landing on 8.50 bpw exactly) but no sourceable layer count. GLM-5.x, Kimi K3 and
DeepSeek-V4 have neither. Entering any of them would mean inventing the `arch` fields that drive
every VRAM figure on the site — the same failure class as the 8GB guide that ran 2GB high.

The unblock is network access: with huggingface.co reachable, `config.json` for each model is one
request and the rest of the batch is mechanical.


### 2026-09-11 — Audit task book QTZ-001 / QTZ-002: two crawling faults

An external audit of the live site (2026-09-11) reported both; both reproduced locally before any
change was made.

**QTZ-001 — 2,101 internal links were redirecting.** `trailingSlash: true` makes every canonical
and every exported directory end in a slash, but `next/link` disagreed: its
`normalizePathTrailingSlash` applies `/\.[^/]+\/?$/` and treats *any* last path segment containing
a dot as a filename, stripping the slash back off. Every model id carrying a version number hit it —
`llama-3.1-8b`, `qwen2.5-7b`, `phi-3.5-mini`. Measured in the export: **46 URLs, 2,101 link
instances**, and all 46 had a dot in the last segment — a 100% correlation with the mechanism, not a
scattering of typos. The audit's 27 named model pages each had **zero** direct internal links to
their own canonical URL.

This footgun was already documented here for GPU slugs — `gpuSlug()` is deliberately dot-free — and
had simply never been applied to model ids, which are not ours to rename.

Fixed with **`skipTrailingSlashRedirect: true`** in `next.config.js`, which is the public switch
behind that normalisation (`define-env-plugin` maps it straight to
`process.env.__NEXT_MANUAL_TRAILING_SLASH`). With `output: 'export'` there is no Next server, so
"skip the redirect" costs nothing — Cloudflare still serves the 308 for anyone arriving without the
slash. The trade is that Next no longer *adds* a missing slash either, which immediately exposed
seven bare hrefs in the Navbar (`/quant-hub`, `/benchmarks`, `/cookbook`, all four `/tools/*`) that
had been silently corrected until now. Those are explicit again.

**QTZ-002 — the Chinese tree had no way in.** The language switcher was
`<button onClick={toggleLang}>`: the English tree contained **zero** `<a href="/zh…">`, so 164
Chinese pages were discoverable only through the sitemap and hreflang. A crawler does not click.
It is now a real anchor using the existing `mirrorPath()`, marked `rel="alternate"` with an
`hreflang` matching the head, plus a second one in the Footer — which is on all 164 pages of each
tree, so that one element is 164 inbound links per direction.

Deliberately a bare `next/link`, never `LocalLink`: localizing this particular href would rewrite it
back into the tree the reader is already in.

**Two new build gates**, because both faults were invisible in review and obvious in the export:

- Every internal href must end in `/` — 330 pages checked, fails the build otherwise.
- The existing leak gate now matches whole `<a>` tags rather than bare hrefs, so it can exempt the
  one legitimate cross-language link (`rel="alternate"` + `hreflang`) while still catching a shared
  component that forgot `LocalLink`. Without that it fired 328 false positives the moment the
  switcher started working.

Verified in a browser: 0 no-trailing-slash links on `/`, `/quant-hub/`, `/gpu/rtx-4090/`, `/zh/`,
`/zh/quant-hub/`; 2 crawlable cross-language anchors per page in both directions with `hreflang`
matching the head; and the switcher lands on the matching page — `/quant-hub/qwen3-8b/` →
`/zh/quant-hub/qwen3-8b/` rendering `lang="zh-Hans"`, not the homepage. All 27 named model pages now
have direct canonical inbound links (6–18 each).


### 2026-09-08 (f) — Task book P2: search, feedback, and a measured performance baseline

**Audited before changing anything.** Canonical and hreflang are correct on all 328 indexable pages
(the earlier "328 missing hreflang" reading was my own case-sensitive regex — Next emits `hrefLang`,
which HTML parses case-insensitively). The sitemap and the export agree exactly, no `www` URLs
anywhere, and `/404/` correctly carries `noindex` and no canonical. Filter and compare permutations
need no indexing policy of their own: a static export serves `/quant-hub/?gpu=x` from
`/quant-hub/index.html`, whose canonical is the clean URL, so every permutation already consolidates.

**Structured data was describing a page that did not exist.** `ItemList` on the GPU pages set
`numberOfItems` to the full fit count while emitting only the first 30 items — `numberOfItems: 73`
above 30 entries. The page renders every fit, so the list now emits every fit. Audited across all
329 exported pages afterwards: **0 problems** — no `AggregateRating` or `Review` anywhere (nothing
fabricates a rating or a reviewer identity), `inLanguage` and `url` follow the page's own language,
every `FAQPage` question appears in the visible text, and no breadcrumb crosses languages.

**43 GPU pages were near-copies.** Measured with 5-gram Jaccard across the exported text:
`rtx-4070` vs `rtx-4070-super` was **0.971**, mean 0.493 across all pairs. The cause is not
laziness — the fit list is a function of VRAM, so every 12 GB card of a type returns the same list.
Each page now states that explicitly and links its same-budget siblings, and says whether the card
has measured benchmark runs behind it (four of 43 do; the other 39 say plainly that every figure is
calculated). **This moved the worst pair from 0.971 to 0.956 and the mean from 0.493 to 0.484** —
the model table dominates the page, so the overlap is inherent. Reported rather than dressed up.

`measuredRowsFor()` needed a fussy match: a prefix match attributed the RTX 4060 Ti 16G's three runs
to a plain RTX 4060, and dropping capacity would have handed the 16G card's numbers to the 8G one.
Both the model name and the capacity have to agree; all five hardware strings in `matrixData` now
resolve to exactly one card.

**Copying a command is not success.** `RunFeedback` asks afterwards instead, on every guide and on
the CLI generator once there is a command to run. "It ran" records one anonymous count; "I hit a
problem" shows the reader the **exact text** of the correction email before their mail client opens
— page, guide, and the configuration already visible in the UI, nothing else. The homepage
correction entry works the same way. No account, no list, no backend.

**Performance: baseline first, and it is a lab baseline.** No field data — Cloudflare RUM is not
reachable from here, so nothing below is a P75 of real users.

| Lab (Chromium, 4× CPU throttle + Slow 4G on mobile) | FCP | LCP | CLS |
|---|---|---|---|
| Homepage, mobile | 1536 ms | 1536 ms | 0.000 |
| Quant Hub, mobile | 1456 ms | 1456 ms | 0.000 |
| Homepage, desktop | 212 ms | 212 ms | 0.000 |

Nothing is near the reference bounds (LCP ≤2.5 s, CLS ≤0.1), so no speculative optimisation was
made. One correction to an earlier entry: the 2026-08-23 note recorded First Load JS of **169 kB**
for the homepage; it is **202 kB** today, because the homepage now runs the hardware picker and the
measured-cases table. Moving `measuredRowsFor` out of `gpu-page.ts` — it dragged the whole benchmark
matrix into every page that only wanted a fit count — took `/quant-hub` 168 → 166 kB and `/gpu`
142 → 140 kB. Recharts is absent from every page's static chunk graph, as intended.

Re-verified after all of the above: 3,047 text nodes across 8 pages, 0 below WCAG AA; 0 horizontal
overflows across 24 page × width combinations.

**Not done: P3 (商业化准备).** It requires the maintainer's real identity, service capabilities and
customer cases. Inventing any of those is exactly what the task book forbids, so it stays blocked
pending real information.


### 2026-09-08 (e) — Task book §9 verification matrix

Ran the matrix against the built export in a browser rather than reasoning about it. Eight of ten
rows passed as built, including the one the P0 work was for: the hub says "60 of 79 models fit this
GPU" with "counts models that load at 4K with no headroom (up to 105%)" underneath, and the GPU page
says "51 of 79 fit comfortably (≤88%)" — two different questions, each naming its rule. Context
4K → 16K moves the estimate for dense, MoE and multimodal models alike and keeps `ctx` in the URL.
Commands emit a real repo id and filename, `--host 127.0.0.1`, `GGML_*` flags, and a visible
placeholder when the repo is not derivable. `/zh` keeps its language through pages, guides, tool
params and `feed.xml`. The wizard recommends GGUF with a ROCm or Metal runtime for AMD and Apple and
never CUDA-only EXL2. Provenance markers (measured / estimated / community) are present on dense,
MoE and multimodal model pages.

Two rows failed, both fixed:

- **Switching the model kept the previous model's quant level.** Llama 3.1 8B at `EXL2 4.65bpw`,
  switch to GPT-OSS 20B — which ships MXFP4, Q8_0 and Q4_K_M and nothing else — and EXL2 stayed
  selected, sizing a file that does not exist from the generic bits-per-weight table. `selectModel()`
  now snaps to a level the model ships (Q4_K_M where available, else its best-quality quant), and a
  level the index has no build for renders an "estimate only" notice naming the levels that do
  exist. The generic vocabulary stays selectable on purpose; only the silent carry-over was wrong.
- **Forward mode deleted `gpu` from its own URL.** `syncUrl` runs on every render and rewrites the
  address bar, and its forward branch never wrote `gpu` — which was harmless while the param did
  nothing in that mode, and became a data-loss bug the moment (d) made it drive the verdict. Opening
  a link with a card stripped it within a second.

Two apparent failures were the probe, not the site: a 400ms settle was too short for URL params in
the `/zh` tree, and the CLI generator emits placeholders when no model is selected.


### 2026-09-08 (d) — Task book P1-04 / P1-05: guides that agree with the tools, and text you can read

**P1-04 — the guides were contradicting the calculator.** The 8GB starter guide is the site's
top-traffic page and every VRAM figure in it was roughly 2GB high: it listed Llama 3.1 8B Q4_K_M at
"~7.7 GB @ 4K" where `calcVRAM` returns 5.64, and told 8GB readers that a 14B needed Q3 while
citing a `Q3_K_M` level the index does not carry for that model. `mac-m3-pro-limits` was worse in
the discouraging direction — "Qwen2.5 14B Q4_K_M (needs 36GB+)" against an actual 11.0GB, so an
18GB reader was told to skip a model their machine runs comfortably — and it never mentioned the
Metal wired-memory ceiling (~75% of RAM), which is the number that actually decides the answer on a
Mac. `dual-gpu-70b-llamacpp` called 46GB-of-48 "tight but workable" (it is the amber band) and
documented `--tensor-split 24,24` as if the arguments were gigabytes; they are proportions.

Four guides rewritten from the index — 8GB, WSL2, AMD ROCm, dual-GPU, Mac M3 Pro — each to the
structure the task book asks for: who it is for, prerequisites, the commands, **how to tell it
actually ran on the GPU**, what to do when it does not fit, common problems, next steps. Corrections
worth naming: "Ollama auto-picks a quant for your VRAM" is false (a bare tag is that tag's default
build on any card; what Ollama picks is the layer split); installing an NVIDIA driver *inside* WSL
breaks the passthrough the Windows driver provides; `GGML_HIP=ON`, because CMake ignores the
retired `LLAMA_HIPBLAS` silently and hands you a CPU-only binary; `--host 127.0.0.1`, since
`llama-server` has no authentication.

**`readTime` was fiction on 22 of 23 guides** — 5 to 12 minutes claimed for bodies of 14 to 75
words. The field is deleted from the type and from every entry; `readingMinutes()` derives it from
the article, per language (200 wpm English, 400 cpm Chinese by CJK character count, code by the
line). The honest numbers are mostly 1 minute, which is the actual state of the cookbook.

**"Verified stack" split from "last verified".** They were one badge behind `verifiedAt &&
verifiedStack`, so rewriting a guide forced a choice between dropping useful information and
claiming a re-run that did not happen. The stack line now renders on its own as *Written against*
with a plain "not re-run since it was last edited" note; the cyan verified styling and the date
appear only when there is a date to stand behind. This environment has no GPU, so the five
rewritten guides carry the first and not the second.

**P1-05 — contrast, semantics, motion.** Tailwind's `slate-600` is 2.5:1 on `#0a0a0f`, and it was
carrying most of the site's explanatory text: methodology lines, data sources, dates, the changelog
disclaimer. `slate-500` was 4.0. Both are raised in `tailwind.config.ts` — one place rather than
202 class names — to 4.60 and 5.92 against the glass surface, with `slate-700` at 3.11 for
decorative use only; the four places it was carrying real text moved up. Two hardcoded colours
failed as text and were split rather than flattened: formats and frameworks now carry a `textColor`
beside `color`, so GGUF's violet stays saturated in the charts and legible as a label.

Measured, not asserted: **3,175 text nodes across 11 pages, 0 below WCAG AA.**

Also: filter chips, mode toggles, quant and framework chips gained `aria-pressed` (a violet
background was the only "selected" signal); `:focus-visible` gives a real focus ring where
components had set `outline-none`; `prefers-reduced-motion` now applies to everything rather than
to the two hero classes it happened to name — verified under `reducedMotion: 'reduce'` that the h1
still paints at full opacity, which is why the rule zeroes durations instead of using
`animation: none` on a `both`-filled keyframe. The benchmark charts now ship a table of the same
figures **in the static HTML** — the tables live outside `BenchCharts`, because that component is
`ssr: false` and anything inside it exists only for readers already running the chart bundle.
Context lengths go through one `contextLabel()` helper (three call sites had diverged; 6000 tokens
rendered "5.859375K" in one and "6K" in another) and the preset chips carry the exact token count
as their accessible name.

No horizontal overflow at 390 / 768 / 1280 across nine pages, both languages.


### 2026-09-08 (c) — Task book P1-01: the homepage starts with your hardware

The homepage led with "Quantize Everything." and then showed the site's inventory. Nothing on the
first screen asked the reader anything, and nothing answered the question they arrived with. It is
now ordered as that question arrives:

1. **Hero** — "Find the right local LLM for your hardware" / 「你的电脑，能跑什么大模型？」. The old
   headline survives as a tagline; it is still the line on the OG image. The hero is no longer
   `min-h-[70vh]`, because the panel below it is the actual entry point.
2. **`HomeMatch`** — GPU picker (seeded from and written back to the shared config) × use-case
   picker, and three picks. With nothing chosen it shows an **Example** card rather than going
   blank, so the shape of the answer is visible before committing to an input.
3. **`PopularStarts` + `JobPaths`** — eight cards weighted towards constrained and non-NVIDIA
   setups, each with its `comfortable` fit count, plus four task-filtered hub views.
4. **`StatsBar` + `MeasuredCases`** — six rows of the benchmark matrix spanning hardware classes,
   with the methodology line and the source under them.
5. **`WeeklyUpdates` + `TodayBoard`** — latest three changelog lines, recent models, RSS.
6. **`MaintainerNote`** — what "estimated" means here and where to send a correction.

**The obvious pick criteria were the wrong ones.** `homePicks` first ranked by "most headroom left"
and "highest tok/s" — both of which rank the *smallest* model in the index first, so a 24 GB RTX 4090
got the same 0.5B model as an 8 GB 4060 Ti. The picker looked like it was ignoring its own input
because on two of three cards it was. Ranking by size against a VRAM-derived ceiling is what makes
the answer move when the hardware moves: `capable` (largest that fits), `headroom` (largest inside
60% of the card), `fastest` (highest measured tok/s — still a small model, and the card says so).
Verified across all 43 GPUs × 3 use cases: 124/129 return three distinct picks, five return two,
none exceeds the card's VRAM, 16 distinct trios.

**Two defects the deep links exposed, both fixed at the source rather than in the link:**

- `?gpu=` did nothing in the calculator's forward mode. Forward mode has no GPU dropdown of its own
  — it judges against the card in the navbar profile — so `setSelectedGpuId` wrote to state nothing
  in that mode reads. A shared link carrying a card landed on a page that computed a size and then
  declined to say whether it fit. The URL param now writes through to the shared profile.
- The index stores AWQ's level as bare `INT4`; `vram.ts` keys it `AWQ INT4`. Passing `quant.level`
  straight into a link made the calculator miss the model's own bpw, fall back to the generic 4.85,
  and call "fits comfortably" on the homepage "marginal" one click later. Links now go through
  `quantLevelKey()`.

Verified in a browser: the three deep links from a 4060 Ti 16G now report 2.8 / 7.7 / 15.4 GB spare
against the homepage's 13.2 / 8.3 / 0.6 GB used of 16 — the same numbers — and all three say "fits
comfortably", as the homepage claimed.

**Moved, not deleted.** The format heat index and the six-axis radar are editorial context about
formats, not evidence about hardware; they now sit on `/formats/` beside the pairwise comparisons.
The full changelog stays on the homepage, collapsed to five entries with a disclosure — `#changelog`
is linked from the hero pill, the About page and off-site, so moving it to its own route would have
broken every one of those.

No horizontal overflow at 390 / 768 / 1280 on `/`, `/zh/`, `/formats/`, `/zh/formats/`,
`/tools/vram-calc/`, `/gpu/`, `/quant-hub/`.


### 2026-09-08 (b) — Task book P1-02 / P1-03: one configuration across the tools

**P1-02 — shared configuration state.** The calculator, CLI generator and compare tool each asked
for the same model, quant level and context independently, so moving between them meant answering
the same questions again. The existing `HardwareProfileProvider` (GPU id in `localStorage`) was
**grown rather than replaced**: it now carries `{ gpuId, modelId, quantLevel, contextLen }` under a
new key, migrating the old bare-string value on first read.

Precedence is **URL > stored config > default** everywhere. A shared link has to win over whatever
the recipient happens to have saved, or the link shows something other than what the sender saw.
Stored ids are sanitised on read — a model or GPU removed from the index between visits degrades to
"not set" rather than silently producing a result for something else.

Verified in a browser, not by inspection: loading
`/tools/vram-calc/?model=qwen2.5-32b&quant=Q5_K_M&ctx=16384` writes the config, and
`/tools/cli-gen/` **with no URL parameters** then opens on `qwen2.5-32b` and generates its command.

**P1-03 — results that lead somewhere.** The calculator's estimate panel now carries the two exits
the task book asks for — *generate the launch command for this configuration* and *guides for this
model* — and when a model does not fit the reader's own card it states what to change and the number
that change produces ("halving the context to 8K brings the estimate to X GB"), rather than only
reporting failure.

Fields are added as a tool needs them. System RAM, runtime and OS are **not** in the shared config
because nothing reads them yet; adding unused fields would be inventing a contract.

**Still open from the task book:** P1-01 (homepage task-first restructure), P1-04 (tutorial
verification — including the 8GB guide's unexplained 7.7 GB figure), P1-05 (accessibility pass),
P2, P3.

### 2026-09-08 — Second external task book: P0 (correctness and traceability)

Each item was reproduced against the repo before any change; two turned out to be defects this
project introduced in the previous round.

**P0-01 — the compare tool's VRAM row ignored the context control.** `Q4_K_M VRAM` read
`quant.vramGB`, a fixed published figure, while only the GPU-fit row called `calcVRAM(contextLen)`.
Switching 4K → 16K moved the calculator link and nothing else — beside copy *this project wrote last
round* claiming VRAM was computed at the chosen context. Rows now carry an explicit `basis`:
**estimated** (recomputed by the calculator's own function, moves with the control), **published**
(fixed, from the release), **spec** (a property of the model). Verified: 2K/4K/8K/16K give
5.36 / 5.64 / 6.19 / 7.29 GB while the published row stays 5.7 GB.

**P0-05 — the "6:1, 8B wins" scoreboard is gone.** It counted row wins where memory appeared twice
(min VRAM *and* Q4_K_M VRAM), this site's own indexing appeared twice (format count, variant count),
and **fewer parameters counted as a win** — so an 8B "beat" a 70B on arithmetic that measured our
data file. Rows now only carry a winner where one side being higher or lower is an advantage on that
axis; there is no aggregate. Choosing between two models needs task benchmarks this site does not
run, and the page says so.

**P0-04 — model cards combined three configurations.** `min(vramGB)` beside `max(speed)` beside the
lowest-perplexity level, presented as one card: 3.2 GB *and* 235 tok/s *and* Q8_0, none of which are
simultaneously available. The stats row is now one named configuration, printed above it:
**Q4_K_M · RTX 4090 · batch 1**.

**P0-03 — the two "models that fit" counts disagreed (60 vs 51 on a 4060 Ti 16G).** Reproduced: the
Hub chips counted green *and* amber, the hardware pages green only. Neither was wrong; neither said
which rule it used. Both now call `countModelsFitting(gpu, level)` with a named level, the chips are
labelled *incl. tight fits*, and the hardware page states the remainder explicitly — "a further 9
models load but with no headroom to spare".

**P0-06 — generated commands.** The local llama.cpp server bound `0.0.0.0`, publishing an
unauthenticated inference endpoint on every interface for anyone who ran the copy-paste command;
it now binds `127.0.0.1`, with a note on what to change to expose it deliberately. The download step
installs the CLI it then calls. A health check and expected output were added. **The claim that vLLM
is CUDA-only was simply wrong** — vLLM ships official ROCm builds; the wizard and the tool copy said
otherwise (this project wrote that claim last round). Corrected to name the real constraint: AWQ and
GPTQ kernel coverage on Radeon is narrower and moves between releases, which is why GGUF stays the
recommended default there. ExLlamaV2 *is* CUDA-only and still says so.

**P0-07 — bilingual consistency.** `todayFeed[].detail` was a bare string, so "vision on 12GB" sat
in the middle of the Chinese homepage; it is now `{ en, zh }` like every other reader-facing field.
The visible RSS link on `/zh/` pointed at the English feed while the page head advertised
`/zh/feed.xml` — the link gate skips asset-looking paths, so it never caught it.

**P0-02 — units.** The calculator computes in GiB (`1024³`) and labels "GB", matching how GPU
vendors and `nvidia-smi` label VRAM. The tool copy said "converted to GiB" while the UI said GB,
implying a conversion that does not exist. Now stated once, correctly, with no conversion claimed.

**Not addressed in this round:** P1-01 … P1-05 (homepage task-first restructure, cross-page config
state, tutorial verification, accessibility pass), P2, P3. The 8GB tutorial's 7.7 GB figure
(P0-02's third example) still needs its measurement conditions recorded before it can be reconciled
— it is a tutorial-authored number with no structured config behind it.

### 2026-09-01 (h) — External audit round 7: format comparisons, and the audit list is done

**P2-2 — "X vs Y" pages.** Six comparisons at `/formats/<a>-vs-<b>/` plus an index, mirrored in
Chinese: 336 pages total, sitemap 328 URLs.

The generic half of these pages writes itself from `formats.ts` — hardware support, runtime,
strengths, trade-offs, adoption estimate. The half worth building is the other one: **the models
that publish weights in both formats**. There the two rows describe the *same* model, so comparing
their perplexity loss is a measurement rather than an opinion. GGUF vs AWQ has 53 such models, GGUF
vs EXL2 has 21.

Two decisions carried over from earlier rounds:

- **Pairs are generated from `SHIPPED_FORMATS`, not from `formats.ts`.** HQQ is documented but no
  model uses it, so `gguf-vs-hqq` would be a comparison page with an empty right-hand column —
  the same mistake as the Hub chip that matched zero models. Four shipped formats give six pairs.
- **`awq-vs-gptq` and `exl2-vs-gptq` have no models in common.** Rather than pad them, those pages
  print *"No model in this index ships both formats… the comparison above is editorial"* and stop.
  A page that admits the limit of its own evidence is worth more than one that hides it.

**This closes the audit list.** Everything in `quantized.uk 优化实施清单` is either done or recorded
with a reason:

| | |
|---|---|
| Done | P0-1, P0-2, P0-3, P0-4, P1-2, P1-3, P1-4, P1-5, P2-1, P2-2, P3-1 … P3-9 |
| Not fixed, reason recorded | **P1-6** — `next/link` strips the trailing slash from dotted segments; every workaround costs more than the one redirect hop (2026-09-01 c) |
| Needs live data | **P1-1** — the LCP cause found in the markup is fixed (2026-08-23); whether P75 now clears 2.5s can only be read from Cloudflare RUM after a few days of traffic |

### 2026-09-01 (g) — External audit round 6: answering instead of listing

**P3-8 — the hardware verdict was 43 bars of almost-all-green.** High ink, low answer. The panel now
leads with the fact the reader came for — *"fits comfortably on 16 of 43 cards — smallest is the
Instinct MI100 32G"* — because "the cheapest card that runs this" is the question behind the list.
If a hardware profile is set, that card gets its own verdict with a one-line consequence (how much
headroom, or what to lower). The full 43 stay behind a `<details>`, collapsed.

**P3-5 — 79 options in data-entry order.** The model dropdowns in the calculator, CLI generator and
compare tool listed every model in the order it was added to the data files, which carries no
meaning to a reader. They are now grouped by parameter bucket via native `<optgroup>` and sorted by
name inside each group.

> Native `<optgroup>` over a custom combobox on purpose. The audit suggested a searchable listbox;
> a native select keeps keyboard behaviour, screen-reader semantics and the platform pickers on iOS
> and Android — all of which a hand-rolled listbox must reimplement and usually gets wrong — and
> type-to-jump already works in it. This is the 80% at a fraction of the risk; a real combobox
> remains open if browsing 79 grouped options still proves slow.

**Verified:** summary line renders with the right count and smallest card, `<details>` present and
collapsed by default with all 43 rows inside, 5 `<optgroup>` elements in the calculator and CLI
generator (10 in compare, which has two selects), 54 page × width combinations show no horizontal
overflow.

**Still open:** P1-1 remainder, P2-2 (format comparison pages).

### 2026-09-01 (f) — External audit round 5: 43 GPUs that were only ever a filter

**P2-1 — a page per GPU.** The audit called this the largest single growth opportunity, and it was
right for a specific reason: the data was already complete. 43 cards with VRAM, vendor and type
existed only as a *filter parameter* on the Hub and the calculator — never as a destination. "What
can an RTX 4060 Ti 16G run" is a query with obvious intent and low competition, and answering it
required no new data at all.

`/gpu/<slug>/` and `/zh/gpu/<slug>/` now exist for all 43, plus an index at `/gpu/`. Each page:

- names the card and how many of the 79 indexed models fit it comfortably;
- lists them grouped by size bucket, each row showing the **best quant that still fits**, the
  estimated VRAM and the remaining headroom;
- explains how the list was built (the calculator's green threshold — at most 88% of the card, so
  every row has real headroom rather than only just fitting);
- links into the calculator prefilled for that card, and to the next card up with how many more
  models it unlocks;
- carries `ItemList` schema, its own title/description/canonical and a full hreflang pair.

**Derived, not authored.** `lib/utils/gpu-page.ts` reuses `calcVRAM` and `getVerdict`, so a landing
page and the calculator's reverse mode cannot disagree — verified as an equality, not an
eyeball: 51 models on both sides for a 4060 Ti 16G, zero difference. Adding a GPU to `gpus.ts` now
adds two pages by itself.

**Two details worth recording:**

- Slugs are generated dot-free (`rtx-4060-ti-16g`, `mac-m3-max-48g`) specifically to sidestep the
  `next/link` trailing-slash behaviour documented in the 2026-09-01 (c) entry.
- The English title was going to read *"What LLMs can a RTX 4060 Ti 16G run?"* — wrong article, on
  43 pages. Rather than write a pronunciation rule for "an RTX / a Radeon / an A100", the phrase
  leads with the card instead: **"RTX 4060 Ti 16G — what LLMs can it run?"**, which is also closer
  to what a reader types.

**Build:** 232 → **322 pages**; sitemap 226 → 314 URLs; `/zh` gate 157/157; 54 page × width
combinations show no horizontal overflow. The index is linked from the footer so none of the 88 new
pages is an orphan.

**Still open:** P1-1 remainder, P2-2 (format comparison pages), P3-5 (searchable model dropdown),
P3-8 (GPU verdict density).

### 2026-09-01 (e) — External audit round 4: the tool pages had nothing to read

**P1-4 — four pages, one `h1` each, no body text.** `/tools/vram-calc/` and its three siblings were
bare interactive widgets: nothing for a search engine to rank on terms like "LLM VRAM calculator"
(the audit's point — among the highest-volume queries in this niche), and nothing for a first-time
reader to calibrate the numbers against.

Each page now carries 2–3 explanatory sections and a visible FAQ, in both languages, with
`SoftwareApplication` and `FAQPage` schema. The copy is written **from the code that runs** — the
three terms in `calcVRAM`, the `ggufRepoId` gate in `cli.ts`, the elimination logic in
`format-wizard.ts` — so the prose cannot drift away from the tool it describes. Content lives in
`lib/data/tool-content.ts` as `{ en, zh }` pairs like every other reader-facing field; rendering and
schema are in `components/tools/ToolExplainer.tsx`.

The FAQ is rendered visibly on purpose: Google requires FAQPage markup to correspond to content the
reader can actually see.

What the pages now say, in short: the VRAM page derives the three terms of the estimate, explains
why grouped-query attention decides the shape of the KV-cache curve, and states the gap against a
real file (4.62 GB estimated vs bartowski's 4.58 GiB); the CLI page explains why a display name is
not an identifier and why `LLAMA_*` build flags silently produce a CPU-only binary; the wizard page
explains that quant levels belong to exactly one format; the compare page warns that perplexity is
only comparable within a model family.

**Verified:** `h2` count per page 4 / 4 / 4 / 3 (audit asked for ≥3), FAQPage and
SoftwareApplication present on all eight pages across both trees, 66 page × width combinations show
no horizontal overflow.

**Still open:** P1-1 remainder, P2-1/P2-2 (GPU and format landing pages), P3-5 (searchable model
dropdown), P3-8 (GPU verdict density).

### 2026-09-01 (d) — External audit round 3: an unreadable chart, and a scare that wasn't

**P3-1 — the speed chart said almost nothing.** Its x-axis was derived from `hardware` alone, so 13
of 18 bars read "RTX 4090" and the screen never named the model or framework each bar measured — the
two dimensions that actually vary. A custom two-line tick now labels every bar **model over
hardware**, and a colour key underneath states what the bar colours have always encoded (the
framework), which nothing on the page had ever said.

> **A false alarm worth recording.** Mid-fix the screenshots showed no bars at all, on my build *and*
> on the deployed baseline. It looked like a serious pre-existing bug. Probing the SVG found all 18
> `recharts-bar-rectangle` nodes present — my first selector was simply wrong, and the bars were
> invisible only because Recharts' entrance animation does not advance under headless virtual time.
> Not a bug. `isAnimationActive={false}` was set anyway: the chart is already lazy-loaded
> (`ssr: false`), so animating it from zero a second time only delays the numbers, and it makes the
> render deterministic for the screenshot checks this repo depends on.

**P3-4 — tap targets.** `Browse recent models`, `RSS`, `Full changelog`, `View All` were 16px tall;
the language toggle 26px, logo 28px, hamburger 30px. All now clear 44px, using padding cancelled by
matching negative margin so nothing moves visually. Measured at 390px: every named target is
44–46px.

**Not in this round:** P1-1 remainder, P1-4 (tool-page copy + FAQPage), P2-1/P2-2 (GPU and format
landing pages), P3-5 (searchable model dropdown), P3-8 (GPU verdict density).

### 2026-09-01 (c) — External audit round 2: the one number that could not defend itself

**P3-2 — `98.4% Avg Accuracy Retained` measured the wrong thing.** It averaged
`100 - min(pplLoss)` across models, and the minimum landed on a different level for each: Q4_K_M for
31 models, Q8_0 for 18, Q5_K_M for 13, EXL2 for 6, MXFP4 for 2. Averaging those is averaging
incomparable rows — the figure tracked *which levels the index happens to contain* and would move if
a Q8_0 row were added to any model. It sat on the homepage beside three honest inventory counts.

Replaced with a figure that states its basis: **97.1% retained at Q4_K_M**, the median across all 79
models (every model ships that level, and it is the one most readers actually run), with the
**1.4–5.2%** spread printed underneath. `getSiteStats()` now returns `q4Retention`, `q4SampleSize`
and `q4Range` so the number cannot be shown without its context.

**P0-4 — data-layer i18n.** UI strings were translated; data fields never entered the i18n path, so
the entire notes column of `/zh/benchmarks/` was English. `MatrixRow.notes` is now `{ en, zh }` like
every other reader-facing field in `lib/data`. Chinese content on that page went from ~4% to 25% of
its text.

**P1-5 — `WebSite.potentialAction`.** The Hub's `?q=` filter is a real search endpoint, so the
`SearchAction` is a claim the site can honour rather than boilerplate. `Organization` gained a
`logo`.

**P1-6 — investigated, deliberately not fixed.** With `trailingSlash: true`, `next/link` strips the
trailing slash from any href whose last segment contains a dot, so 50 model URLs like
`/quant-hub/qwen2.5-7b` render without one and cost a 301. Passing an object href looked like it
worked — the leak report showed slashed URLs — but every slashed id in that sample was simply
dot-free; `glm-4.5-air` was still bare. Object hrefs go through the same normalisation, so the
change was reverted rather than left in as complexity that fixes nothing. The remaining options are
worse than one redirect hop: renaming ids breaks every existing URL, and dropping to plain `<a>`
gives up client-side navigation across the whole site. **Accepted as-is.**

> The failed attempt was caught by the `/zh` link gate, not by review: object hrefs bypass
> `localizeHref`, so the experiment pointed Chinese pages at English URLs and the build refused it.

### 2026-09-01 (b) — External audit round 1: the model index was never in the HTML

Working from an external review (`quantized.uk 优化实施清单`, 2026-09-01). Every claim was
reproduced against the build before being acted on; two turned out larger than reported.

**P0-2 — `/quant-hub/` shipped no content.** The static page was 29.8 KB with **zero headings and
zero model names**: the index of all 79 models, the site's most valuable page, was blank to crawlers
and to anyone without JavaScript. Root cause was `useSearchParams()`, which opts its whole subtree
out of prerendering in a static export — Next renders the Suspense fallback (`Loading…`) and nothing
else. Replaced with `useUrlQuery()` (`lib/hooks/useUrlQuery.ts`), which reads the query after mount:
the page prerenders unfiltered and JS refines it. **29.8 KB → 275 KB, 0 → 80 headings (1 `h1` + 79
`h3`)**, and `?recency=recent` still narrows to 12 cards after hydration. The same hook fixed the
VRAM calculator and compare tool, which were client-only for the same reason.

**P0-1 — the calculator answered before it was asked.** With no model selected, `showForwardResult`
explicitly allowed `selectedModelId === ''`, so the panel fell through to the custom-model defaults
(7B / 32 layers / 8 kvHeads) and presented **4.98 GB plus a green verdict on all 43 GPUs** as though
it were an answer. Now shows the placeholder that already existed.

**P0-3 — `/` was the one page with no hreflang.** It inherited root-layout metadata, which sets
`canonical` but no `languages`, while `/zh/` pointed back at it. A one-way pair reads as duplicate
content rather than a translation. The homepage now has its own metadata.

**P1-2 — the 404 canonicalised to the homepage**, and reused its title, telling crawlers a missing
page *is* `/`. `not-found.tsx` is now a server component with its own metadata (`alternates: {}`
clears the inherited canonical rather than self-referencing a URL that does not exist).

**P1-3 — RSS existed but was unfindable.** No autodiscovery link anywhere, `/rss.xml` 404, and
Chinese readers were pushed to an English feed. Feed generation moved to `lib/feed/build.ts` and is
now bilingual: `/zh/feed.xml` carries Chinese entries pointing at Chinese URLs, `/rss.xml` serves the
alias (a static export cannot redirect; the channel's `atom:self` still names `/feed.xml`), and
`feedAlternates()` puts the discovery tag on every page, per tree.

**P3 fixes:** context presets read `2K / 4K / 128K` instead of `2.048K / 131.072K` (they are token
counts — the divisor is 1024, not 1000); the CLI generator's no-model fallback no longer offers
`AWQ INT4` / `EXL2 4.65bpw` under llama.cpp (the per-model branches were already correct — same
class as the format-wizard bug); Hub search input has an `aria-label`; the benchmarks table has a
caption.

**Larger than reported:** P1-6 (trailing slash) is not one link on the homepage — **50 distinct
model URLs** across both trees, appearing hundreds of times, render without one. Cause: Next's
`trailingSlash` normalisation skips a path whose last segment contains a dot, so every model id like
`qwen2.5-7b` loses the slash the source code supplies. Not yet fixed — see below.

**Not in this round:** P0-4 (data-layer i18n), P1-1 remainder, P1-4 (tool-page copy + FAQPage),
P1-5, P1-6, P2-1/P2-2 (GPU and format landing pages), P3-1/2/4/5/8.

### 2026-09-01 — The LCP ship never reached the site's own changelog

`992168e` (the LCP fix) updated `README.md` and `CLAUDE.md` but not
`lib/data/meta.ts`, so it never appeared in Weekly updates, `?recency=recent` or `/feed.xml` — the
three surfaces §"Content cadence" names as the ones every ship must reach. This is the identical
miss the 2026-08-20 entry was written about, repeated three ships later: a rule in CLAUDE.md was not
enough to prevent it.

A side effect worth noting for anyone verifying a deploy: because that commit changed no dated
content, the site kept reporting **2026-08-23** afterwards. The date on the page proves the
*format/wizard* batch is live; it says nothing about later commits. To check whether the LCP fix
specifically is deployed, look at the `<h1>` — it must carry no inline `opacity:0`.

Fixed: entry added (en + zh), `dataLastUpdated` → 2026-09-01.

**New build gate — missing `zh` translations.** `translations[lang]` is typed as
`typeof translations.en`, so a key present in `en` and missing in `zh` type-checks fine and renders
the literal string **"undefined"** to Chinese readers. Nothing in `next build`, `next lint` or code
review catches it; it is only visible in the exported markup, which is where it is now checked.
`scripts/localize-export.mjs` fails the build if any `out/zh/**` page renders `undefined` as text.
Inline `<script>` blocks are stripped first — minified React payloads contain the token legitimately.

Verified against three shapes a missing translation actually takes (`undefined` alone, embedded
mid-sentence, and leading a phrase) and against normal Chinese copy for false positives.

> Honest limitation: this gate would **not** have caught the miss above. It catches a translation
> that is absent, not a ship that forgot to write a changelog entry at all. Nothing automatic
> catches the latter — it stays a discipline item.

### 2026-08-23 (c) — The LCP element shipped invisible (LCP P75 3.1s on a static site)

Cloudflare RUM (24h, bots excluded) reported **LCP P50 2,148ms / P75 3,108ms**. P75 is the figure
Google grades Core Web Vitals on, and 3.1s is "needs improvement" — on a site whose entire premise
is prerendered static HTML.

The cause was in the markup, not the network. The homepage `<h1>` — the LCP element — was a
`motion.h1` with `initial={{ opacity: 0, y: 16 }}`, so framer-motion serialised that initial state
into the export:

```html
<h1 class="..." style="opacity:0;transform:translateY(16px)">
```

The largest text on the page could not paint until the bundle downloaded, React hydrated and
framer-motion ran its 0.05s delay plus 0.45s animation. Four elements shipped that way; with
JavaScript disabled the hero stayed blank permanently.

Replaced with CSS keyframes in `globals.css`. Two classes, because the distinction matters:

- **`.hero-lift`** for the LCP element — animates `transform` only, so it is never invisible and
  never a non-candidate for LCP.
- **`.hero-rise`** for the smaller supporting elements, with staggered `animation-delay`.

Both are disabled under `prefers-reduced-motion`, which is what `useReducedMotion()` was doing.

`framer-motion` was imported by exactly one file, so it is now removed from the dependency tree
entirely: **homepage First Load JS 202 kB → 169 kB (−33 kB)**. Verified by rendering the export with
`--disable-javascript`: the hero — headline, subtitle, both CTAs, format badges — paints in full.

**The rule this leaves behind:** never drive the entrance of above-the-fold content from JS in a
static export. `initial={{ opacity: 0 }}` on anything above the fold is a self-inflicted LCP
regression that no amount of caching or CDN tuning can fix.

**Traffic note (24h, single-digit volume — a hint, not a finding):** two of the top five URLs were
`/zh` pages, and `/tools/cli-gen/` was #1 — the tool whose output was unrunnable until 2026-08-20.

### 2026-08-23 (b) — Format surfaces stop advertising something the index cannot show

The 2026-08-20 batch derived the Hub's format chips from the data, which dropped `HQQ` (zero of 79
models ship it). It did not touch the other three places that name formats, so the site started
contradicting itself: the homepage hero badged **HQQ**, the stats bar counted **5 formats tracked**,
and the format wizard could recommend HQQ — all of them walking a reader into a Hub with no HQQ
filter and no HQQ results.

`SHIPPED_FORMATS` moved to `lib/utils/model-meta.ts` (a neutral module — it was in `hub-url.ts`,
which imports a component type) and is now the single source for every format vocabulary:

- **Hero badges** derive from it, with colours read from `formats.ts` instead of a second hardcoded
  copy of the palette.
- **`getSiteStats().formatCount`** counts formats with at least one indexed model. It sits beside
  "models indexed" and "GPUs in database", so it has to be an inventory count.
- **Format wizard** only scores formats the index can show.

HQQ stays documented in `lib/data/formats.ts` and in the Format Heat Index — that is an editorial
adoption estimate, which is reference content, not an inventory claim. The two must not be conflated.

**Format wizard, two further defects found by running it across every hardware × priority
combination rather than reading it:**

- `recommendQuant` fell through to the GGUF level `Q4_K_M` for *every* format whenever priority was
  `ease` — the common path. Readers were told to fetch "EXL2 · Q4_K_M" and "AWQ · Q4_K_M", levels
  that exist in neither format. Quant levels are now per-format vocabularies.
- `recommendFramework` keyed off hardware before format, so an AMD reader saw
  **"EXL2 → Ollama / llama.cpp (ROCm)"** printed directly beside that row's own reason,
  *"ExLlamaV2 is CUDA-only — EXL2 will not run on ROCm at all"*. The runtime now follows the format;
  hardware only decides which GGUF runtime to name.

**Cadence:** `dataLastUpdated` → 2026-08-23, with the layout fix and both of the above added to the
changelog so Weekly updates, `?recency=recent` and `/feed.xml` reflect them.

### 2026-08-23 — Homepage layout: two stacked overlaps, and the hero clipped on phones

Reported from a screenshot of the live site, reproduced in headless Chromium at 1440px, so none of
this was a photo artifact.

**Two negative margins overlapping each other.** `StatsBar` carried `-mt-8 relative z-10`, from when
it sat directly under the hero and was meant to straddle its bottom edge. `JobPaths` was inserted
between the two in the 2026-06-26 ship and the margin was never revisited, so the stats card spent
that time painted on top of the job-path cards, covering all three descriptions. `JobPaths` had its
own `-mt-2`, which slid it under the hero's absolutely-positioned fade strip (`bottom-0 h-16`) —
absolutely-positioned boxes paint above a later *static* sibling, so 8px of opaque gradient sliced
the "START HERE" label in half. Both negative margins removed; the section order (job paths before
stats) is deliberate and unchanged.

**The hero was clipped on every phone.** The changelog pill is capped at `max-w-md` (448px), wider
than a phone viewport. The hero is a flex container, and its content div is a flex item with the
default `min-width: auto`, which refuses to shrink below min-content — so the block sized to 480px
inside a 385px viewport and `overflow-hidden` on the section silently cut the right-hand side off:
the *VRAM Calculator* CTA and the format badges were partly unreachable. Fixed with `w-full min-w-0`
on the flex item and `max-w-full sm:max-w-md` on the pill.

**Navbar overflowed at the `md` breakpoint.** The compact GPU `<select>` had no `w-full`, so it
sized to its widest option ("Radeon PRO W7900 48G", 239px) and ignored the `max-w-[9.5rem]` cap on
its wrapper, pushing itself and the language toggle past the right edge at 768px. Added `w-full`,
plus `whitespace-nowrap` on the nav links and toggle and a narrower cap at `md`, so the bar stays on
one line instead of wrapping "Quant Hub" and "中文" onto two.

**Page-level horizontal scroll at 320px** on `/tools/compare/` (a non-wrapping button row) and
`/benchmarks/` (a `w-72` chart skeleton). Both now shrink.

Verified by sweeping **14 pages × 9 viewport widths (126 combinations)** in headless Chromium and
asserting `documentElement.scrollWidth === clientWidth` on each: clean everywhere. Tables and code
blocks that legitimately scroll inside their own `overflow-x: auto` container were checked for a
scrollable ancestor and left alone — they are the correct pattern, not overflow.

### 2026-08-20 — The CLI generator emitted commands that could not run

Four of the tool's five outputs were broken, each in a way that looks fine on screen. The generator
only ever received the model's **display name**, so everything downstream was a guess:

| Framework | Was emitted | Why it fails |
|---|---|---|
| vLLM | `--model Llama 3.1 8B Instruct` | three stray argv entries; server never starts |
| Ollama | `ollama pull llama-3.1-8b-instruct` | library tags are curated (`qwen2.5:7b`) — this 404s |
| llama.cpp | `huggingface-cli download <repo-id>` | unresolved placeholder, while `hfRepoMap` held the real repo |
| llama.cpp | `--include "Llama-3.1-8B-Instruct-Q4_K_M.gguf"` | real file is `Meta-…`; `--include` matches nothing and exits 0 |

`generateCLI` now takes `hfRepo` from `hfRepoMap`, derives the GGUF filename from the repo name
(the actual convention: `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` ships
`Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf`), and Ollama runs the GGUF straight from Hugging Face
(`ollama run hf.co/<repo>:<QUANT>`), which works for every mapped model and pins the quant.

**The trap in that fix:** `hfRepoMap` exists to source download/like stats, so for **14 of 79
models** it points at the original weights (`openai/gpt-oss-20b`, `deepseek-ai/DeepSeek-R1`), not a
GGUF conversion. Feeding those to a GGUF command reproduces exactly the failure being fixed, so
`ggufRepoId()` only accepts a repo ending in `-GGUF`; the rest fall back to a visible placeholder
plus a note. vLLM and ExLlamaV2 keep placeholders on purpose — vLLM serves FP16/AWQ/GPTQ, not the
GGUF repos this site maps, and EXL2 repos are per-model and not derivable.

**Stale llama.cpp build flags.** `LLAMA_CUDA` / `LLAMA_METAL` / `LLAMA_BLAS` were renamed to
`GGML_*` long before the b4000-series this site targets; CMake silently ignores the old names and
produces a **CPU-only build that appears to work** — the worst failure mode for a copy-paste
command. Fixed in the generator and in the two guides that carried it (`llama-vps-llamacpp`,
`llamacpp-windows-cuda`). The repo's own AMD guide already used `GGML_HIP`, so the codebase was
inconsistent with itself. Also `-j$(nproc)` on the macOS path — `nproc` is GNU coreutils and does
not exist on a stock macOS; now `-j$(sysctl -n hw.ncpu)`.

> **`verifiedAt` was deliberately not bumped** on the two edited guides. This was a desk
> correction, not a stack re-run on real hardware — bumping the date is the one thing that would
> have made the badge dishonest.

**Hub filters:**

- `HQQ` was a hardcoded filter chip matching **zero of 79 models** — a filter whose only possible
  outcome was an empty result set. Format chips are now derived from the data
  (`SHIPPED_FORMATS` in `lib/utils/hub-url.ts`), so the vocabulary cannot drift from it again.
- `hubShareUrl()` hardcoded `/quant-hub/`, so a Chinese reader copying their filter link handed a
  friend an English URL. It now shares the page the reader is on. Same class of leak as a bare
  `next/link`, but in a clipboard string — invisible to the postbuild markup gate.

**Cadence:** `dataLastUpdated` was 12 days stale and the changelog stopped at 2026-08-08, so
neither the `/zh` ship nor the audit before it reached Weekly updates, the Hub recency filter, or
`/feed.xml` — the three surfaces that are supposed to reflect every ship. Bumped to 2026-08-20 with
four entries covering both.

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

**`og.png` (1200×630)** — use the headless shell, not `chrome --headless`: the latter's
`--window-size` includes ~87 px the page never gets, leaving a black band at the bottom.

```bash
S=/tmp/og; mkdir -p $S; cp public/og.svg $S/
echo '<!doctype html><style>*{margin:0}html,body{width:1200px;height:630px;overflow:hidden}img{display:block;width:1200px;height:630px}</style><img src="file:///tmp/og/og.svg">' > $S/wrap.html
/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell --no-sandbox --hide-scrollbars \
  --virtual-time-budget=3000 --window-size=1200,630 --screenshot=public/og.png file://$S/wrap.html
```

Favicons under ~48px render blank in this Chromium, so the favicon is served as the SVG
(`/icon.svg`) with the PNGs as fallback — all declared in `metadata.icons`.
