# CLAUDE.md — working agreement for this repo

Guidance for any Claude/AI session working on **quantized.uk**. Keep this file short;
`README.md` is the detailed source of truth (architecture, schemas, deployment).

## ⚠️ Documentation discipline (non-negotiable)

**Every change must update the docs in the same commit.** Do not treat docs as a separate task.

- **`README.md`** — for any user-visible feature, new page/tool, data-model change, new
  dependency, build/deploy change, or new convention: add a **Changelog** entry at the top of
  §9 and update the affected section (Project Structure, Data Schemas, etc.).
- **`CLAUDE.md`** (this file) — update whenever a **convention, workflow, command, or footgun**
  changes (e.g. new required env var, a new "always do X" rule, a changed branch/deploy step).
- A commit that changes behaviour but touches neither doc is **incomplete**. Before committing,
  ask: "does the README changelog reflect this? did any rule here change?"
- Keep both accurate over comprehensive — fix stale facts (counts, file lists) when you notice them.

## What this is

Next.js 14 **static-export** site (`output: 'export'`). No backend, no DB, no runtime API — all
content is hardcoded TypeScript in `lib/data/`. Deployed on Cloudflare **Pages**.

**Live snapshot (2026-08-20):**

| Surface | Notes |
|--------|--------|
| Models | **81** in index (`models-extra` … `models-extra-9`) |
| Cookbook | **23** guides; 5 rewritten in full, reading time derived, `verifiedStack` shown with or without a `verifiedAt` date |
| Hub | Filters: size / category / hardware / format / **recency** (`?recency=recent`) |
| Home | Hardware+task picker → 3 matched models, popular cards, measured sample, weekly updates, collapsed changelog |
| Feed | `/feed.xml` — RSS of changelog + recent models |
| Tools | VRAM (**61** GPUs incl. AMD RDNA 4, Blackwell, M4/M5), CLI, format wizard, compare |
| i18n | **English `/` + Chinese `/zh/**`** — 232 pages, hreflang-paired, Chinese baked into static HTML |
| Privacy | No public repo link on site pages; feedback `hello@quantized.uk` in Footer |

## Commands

```bash
npm run dev      # local dev → http://localhost:3000
npm run build    # type-check + lint + static export → out/   (gate before every commit)
npm run lint
```

`build` runs a `prebuild` HF-stats fetch that fails gracefully offline (merge keeps prior
stats on 401). **No `HF_TOKEN` required** — zero-config deploy; gated HF repos simply skip.

`build` also runs a `postbuild` pass (`scripts/localize-export.mjs`) over `out/`: it patches
`<html lang>` for the `/zh` tree, and **exits non-zero if any Chinese page links into the English
tree or renders the literal text `undefined`** (a key present in `en` but missing in `zh`
type-checks fine and ships "undefined" to Chinese readers). Unlike `prebuild`, this one is a real gate — a failure means a broken export, not a
flaky network. Never "fix" it by removing the postbuild hook.

## Conventions (must follow)

- **Bilingual:** every UI string goes in **both** `en` and `zh` in `lib/i18n/translations.ts`.
  A missing `zh` renders `undefined` in the Chinese UI (the build now gates on that).
  **Reader-facing *data* fields count too** — translating only `translations.ts` left the whole
  notes column of `/zh/benchmarks/` in English. Any string in `lib/data/**` that a reader sees is
  `{ en, zh }`, like `description` on models and `notes` on `MatrixRow`.
- **Language comes from the URL.** English at `/`, Chinese at `/zh/**`. `LanguageProvider` reads
  `usePathname()`; there is no `localStorage` language any more. This is deliberate — it is what
  puts Chinese text into the static HTML so it can be indexed.
  - **Adding a page means adding two**: the English route *and* an `app/zh/**` mirror that
    re-exports it with Chinese metadata and `path: '/zh/...'`. A missing mirror silently 404s
    every Chinese reader who clicks through to it.
  - **Link with `@/components/i18n/LocalLink`, never bare `next/link`**, in anything rendered
    inside both trees — a bare href throws Chinese readers back to English. This applies to
    **page files too**, not just `components/` — that is exactly how 23 guide links leaked.
    `npm run build` now fails on any such leak (`scripts/localize-export.mjs`); trust the gate,
    not your reading of the diff.
  - **Anything language-dependent that a server component emits needs an explicit `lang` prop.**
    The `/zh` mirrors re-export the English component, so it cannot read `usePathname()`. JSON-LD
    is the one that bites: headline, description, `url` and `inLanguage` must follow the reader,
    or a Chinese page advertises the English URL its own canonical tag disowns
    (see `app/quant-hub/[modelId]/page.tsx`, `app/cookbook/[slug]/page.tsx`).
  - **Never compare a raw `usePathname()` against an English href** — it is `/zh/...` for half the
    site. Run it through `toEnPath()` first (this silently killed every nav highlight in the
    Chinese tree).
  - hreflang comes free from `pageMetadata()`; hand-rolled `alternates` (the two dynamic English
    routes) must pass `languages: languageAlternates(path)` explicitly, and `openGraph` needs
    `...ogLocale(path)`. **Same rule for `feedAlternates(path)`** — the four hand-rolled files
    (`app/quant-hub/[modelId]/page.tsx`, `app/cookbook/[slug]/page.tsx`, both `/zh` mirrors) had
    `languages` but not this, so ~200 model/guide pages across both languages had a working
    `/feed.xml` with no RSS autodiscovery `<link>` pointing at it — only pages that go through
    `pageMetadata()` got it for free.
- **`useSearchParams()` empties the page in a static export.** Next cannot know the query at build
  time, so the whole subtree renders as its Suspense fallback and ships **no content** — that is how
  `/quant-hub/` spent its life as a 30 KB document with zero headings and zero of the 79 model
  names. Use `useUrlQuery()` (`lib/hooks/useUrlQuery.ts`), which reads the query after mount: the
  page prerenders unfiltered and JS refines it. Check any new query-driven page with
  `grep -c '<h3' out/<path>/index.html`.
- **Static-export only:** no request-time fetching, no `next/image` opt.
  Dynamic routes become static via `generateStaticParams()`.
  **Allowed exception:** route handlers that are **fully static**
  (`export const dynamic = 'force-static'`) e.g. `app/feed.xml/route.ts` for RSS.
- **Data-driven:** add content in `lib/data/*.ts` (satisfy `lib/data/types.ts`).
- **`Array.from(new Set(...))`**, never `[...new Set(...)]` (bundler target won't down-level it).
- **Fonts via `next/font` only** (self-hosted; Tailwind reads `--font-inter`/`--font-mono`).
  Never add a Google Fonts `@import`/`<link>` — it's render-blocking and double-loads.
- **Never animate above-the-fold content from JS.** In a static export, `initial={{ opacity: 0 }}`
  is serialised into the HTML, so the element ships invisible and cannot paint until the bundle
  hydrates. The homepage `<h1>` did exactly this and cost **LCP P75 3.1s** (Google grades CWV at
  P75; 2.5s is the "good" bound). Use the CSS classes in `globals.css`: `.hero-lift` for an LCP
  element (transform only — never invisible), `.hero-rise` for supporting elements. Check with
  `--disable-javascript`: above-the-fold content must render in full. framer-motion is **not** a
  dependency any more — do not reintroduce it for an entrance animation.
- **Recharts must be lazy** — import chart components via `next/dynamic` (`ssr: false` + a
  skeleton), never statically from a page (see `FormatRadarLazy`, `BenchCharts`).
- **OG image is `/og.png`** (rendered from master `og.svg`, README §10 recipe) — social
  platforms don't render SVG `og:image`; re-render the PNG whenever `og.svg` changes.
- **Every internal href ends in `/` — and the build checks.** `trailingSlash: true` is not enough:
  `next/link` treats any last path segment containing a dot as a filename and strips the slash
  (`/\.[^/]+\/?$/` in `normalizePathTrailingSlash`), which silently hit every versioned model id —
  `llama-3.1-8b`, `qwen2.5-7b` — for 2,101 redirecting links across 46 URLs. `next.config.js` now
  sets **`skipTrailingSlashRedirect: true`**, the public switch for that normalisation. Consequence
  to remember: Next no longer *adds* a missing slash either, so write it yourself. The postbuild gate
  fails the build on any bare internal href.
- **The language switcher must be an `<a href>`, and it is the one link that must not be
  `LocalLink`.** It was a `<button onClick={toggleLang}>`, so the English tree had zero
  `<a href="/zh…">` and 164 Chinese pages had no crawlable inbound link at all. Use `mirrorPath()`
  with a bare `next/link`, `rel="alternate"` and an `hreflang` matching the head — localizing this
  href would point it back into the tree the reader is already in. The leak gate matches whole
  `<a>` tags so it can exempt exactly this link; keep both attributes or it will be flagged.
- **Negative margins are a maintenance hazard here.** `-mt-*` on a section only stays correct while
  the section above it never changes. Two of them had silently gone wrong: `StatsBar`'s `-mt-8`
  (meant to straddle the hero) overlapped `JobPaths` once that was inserted between them. Also note
  an absolutely-positioned box paints **above** a later static sibling, so pulling a section up into
  the hero's `bottom-0` fade strip clips it. Prefer normal spacing.
- **Check narrow widths in a fixed-width iframe, not `--window-size`.** Headless Chromium enforces a
  minimum window width and then crops the screenshot, which fakes an overflow that isn't there (and
  hides real ones). Load the page in a 390px iframe and read `documentElement.scrollWidth` instead.
  A table or code block whose `right` exceeds the viewport is fine **if** it has an
  `overflow-x: auto` ancestor — check for one before "fixing" it.
- **Contrast is a palette decision, not a per-component one.** Tailwind's stock `slate-600` is
  **2.5:1** on this background and was carrying most of the site's explanatory text. The dim end of
  the ramp is overridden in `tailwind.config.ts` (`slate` 500/600/700 → 5.92 / 4.60 / 3.11 against
  the glass surface); fix contrast there, not by rewriting class names. `slate-700` is for
  decoration only — if it is carrying words, move the usage to `slate-600`. A raw hex applied to
  text needs its own accessible variant: `QuantFormat` and the CLI framework list carry `textColor`
  beside `color` so charts keep the saturated brand value. Verify by walking the DOM in a browser
  and computing the ratio against each node's *painted* background — the current baseline is
  **3,175 text nodes across 11 pages, 0 below AA**, so any new failure is something you added.
- **A toggle needs `aria-pressed`.** Filter chips, mode switches and quant/framework chips signalled
  "selected" with a violet background and nothing else.
- **A chart's text equivalent must live outside the lazy chart component.** `BenchCharts` and
  `FormatRadarLazy` are `ssr: false`; a table placed inside one exists only after hydration, for
  readers already running Recharts. `BenchDataTables` renders from the page instead, so the figures
  are in the exported HTML.
- **Structured data must describe the page that exists.** `ItemList` on the GPU pages claimed
  `numberOfItems: 73` while emitting 30. Audit with a walk over `out/**` after any schema change:
  counts match the emitted list, `inLanguage`/`url` follow the page's language, FAQ questions appear
  in the visible text. There is deliberately no `AggregateRating` or `Review` anywhere — the site has
  no ratings to report, and inventing a reviewer identity is not on the table.
- **Derived pages are similar by nature; say so rather than hiding it.** The GPU fit list is a
  function of VRAM, so same-tier cards return the same list (`rtx-4070` vs `rtx-4070-super` were
  0.971 by 5-gram Jaccard). `sameBudgetCards()` names the siblings on the page and links them; that
  is honest and useful, but it only moved the worst pair to 0.956 — do not claim it solves
  duplication.
- **A copy is not a success.** `CLI Copy` records a copy. `Run Outcome` is the only event that says
  anything about a run, and only a person clicking "It ran" produces it. Any prefilled `mailto:`
  shows the reader its exact body first (`RunFeedback`) — never send a setup the reader has not seen.
- **PWA safe areas:** the app is installable (iOS Add to Home Screen, standalone). Respect
  `env(safe-area-inset-*)` — top handled by Navbar + `<main>`, bottom/sides by `body` in
  `globals.css`. Test any top-bar / full-height change against the notch.
- **PowerShell:** use `npm.cmd`, `Set-Location` before commands; avoid Unix-only chaining.

## Model data model (cadence fields)

Shared types: `lib/data/types.ts`. Helpers: `lib/utils/model-meta.ts`.

| Field | Where | Purpose |
|-------|--------|---------|
| `status?: 'active' \| 'superseded'` | `QuantModel` | Mark legacy models (still listed) |
| `supersededBy?: string` | `QuantModel` | Preferred replacement model `id` |
| `addedAt?: string` | `QuantModel` | `YYYY-MM-DD` — powers Hub **Recently added** (default window **45 days**) |
| `confidence?: 'measured' \| 'estimated' \| 'community'` | `QuantVariant` | Optional; UI defaults via `quantConfidence()` |
| `verifiedAt` / `verifiedStack` | `Article` (cookbook) | Stack re-check banner on article pages |
| `gpuPreset?: { gpuId, ctx? }` | `Article` (cookbook) | Prefills the reverse VRAM lookup; `gpuId` must exist in `gpus.ts` |
| `relatedModelIds?: string[]` | `Article` (cookbook) | Renders hub links in `GuideNextSteps` |

**Identifiers vs display names (CLI generator)** — `model.name` is for humans. Commands need real
identifiers: pass `hfRepo` from `hfRepoMap`, and gate it through `ggufRepoId()` before using it in
a GGUF command — **14 of 79 entries map the original weights, not a GGUF conversion**, because
that map's job is HF stats. When the right repo isn't derivable (vLLM needs FP16/AWQ/GPTQ, EXL2
repos are per-model), emit a visible `<placeholder>`: an obvious placeholder beats a plausible
wrong answer. Same rule for llama.cpp build flags — they are `GGML_*`, never `LLAMA_*`; CMake
ignores the old names and silently produces a CPU-only build.

**A displayed number must state its basis, and one row must not mix two.** The compare tool had a
VRAM row fed by a fixed published figure sitting under copy that promised it tracked the context
control — so the control appeared broken. Rows now carry `basis: 'estimated' | 'published' | 'spec'`
(`lib/utils/compare.ts`). Same rule for cards: `min(vramGB)` beside `max(speed)` describes two
different quantizations and is not a configuration anyone can run.

**Never aggregate incomparable rows into a verdict.** The compare page counted row wins and declared
"8B wins 6:1" — memory counted twice, this site's own indexing counted twice, fewer parameters
treated as an advantage. If the site cannot run task benchmarks, it cannot say which model is
better; it can only show each axis with its conditions.

**Two counts of "what fits" are allowed; two unexplained counts are not.** `countModelsFitting(gpu,
level)` in `gpu-page.ts` is the single implementation — `'comfortable'` (≤88%, the green verdict)
and `'tight'` (≤105%). Every surface must name the level it is showing.

**A derived number must name its basis.** The homepage stat bar sits beside three inventory counts,
so anything computed has to say what it is computed over. `98.4% avg accuracy` averaged
`100 - min(pplLoss)` across models — silently mixing Q4_K_M for 31 models, Q8_0 for 18, Q5_K_M for
13 — so it tracked the shape of the index, not quantization, and moved whenever a level was added.
Replaced with one named level (`Q4_K_M`, which all 79 models ship), a median, and the range printed
under it. If a number cannot state its basis in one line, it does not belong on the homepage.

**Format vocabularies come from the data** — `SHIPPED_FORMATS` in `lib/utils/model-meta.ts` is the
single source: Hub chips, hero badges, the "formats tracked" stat and the format wizard all derive
from it. Hand-typed lists drift, and they drift *separately* — fixing only the Hub left the homepage
badging `HQQ` and counting 5 formats while the Hub offered 4. `formats.ts` documents one more format
than the index ships; that is editorial reference content (the Heat Index is an adoption estimate),
**not** an inventory count. Never conflate the two.
The `/formats/` hub table is counted by `lib/utils/format-overview.ts` for the same reason — it prints
HQQ as **0 / 81** with a line saying it is reference material, rather than omitting the row or
implying availability. Do not add a row for a format the index does not carry (the audit proposed
NVFP4 and "Official QAT"); a zero count for something the site does not track is the HQQ mistake
with a new name. A format with no published perplexity anywhere shows a dash — a median over an
empty set is not 0%.

**Per-format vocabularies don't share a fallback** — quant levels belong to one format only. The
wizard's `recommendQuant` fell through to `Q4_K_M` for every format, telling readers to fetch
"EXL2 · Q4_K_M". Likewise a recommended runtime must follow the **format**, not the hardware, or the
row contradicts its own reason text (EXL2 recommended with a ROCm runtime).

**Run the tools, don't read them.** Both wizard bugs survived review and were obvious the moment the
function was called across every hardware × priority combination. Same for the CLI generator.

**A recommendation that ignores its input is worse than no recommendation.** `homePicks` originally
ranked by "most headroom left" and "highest tok/s" — both of which put the *smallest* model in the
index first, so a 24 GB RTX 4090 and an 8 GB 4060 Ti got the same 0.5B answer. Any criterion that is
monotonic in model size will do this. Rank against a **ceiling derived from the reader's VRAM**
(largest that fits; largest inside 60% of the card) so the answer moves when the hardware moves, and
sweep all 43 GPUs × every use case before believing it — the degenerate case was invisible in one
spot-check and obvious in the sweep.

**Changing the model must re-check the quant level.** The calculator's level chips come from the
generic `quantGroups` vocabulary, not from the model's own `quants` — which is deliberate ("what
would this cost at Q2_K" is a fair question) but means a level survives a model change. Llama 3.1 8B
at `EXL2 4.65bpw` → GPT-OSS 20B (MXFP4 / Q8_0 / Q4_K_M only) left EXL2 selected and priced a file
nobody has published, from the generic table. `selectModel()` snaps to a shipped level, and
`levelNotShipped` labels anything the index has no build for.

**`syncUrl` rewrites the address bar on every render**, so a param it does not write is not merely
absent from a copied link — it is *deleted from the link the reader arrived on*. Forward mode
omitted `gpu`, which stopped mattering the moment `?gpu=` began driving the forward-mode verdict.
When you make a param meaningful, add it to `syncUrl` in the same change.

**Two vocabularies for one quant level.** `lib/data/**` stores `{ format: 'AWQ', level: 'INT4' }`;
`lib/utils/vram.ts` keys the same thing `'AWQ INT4'`. Any link or handoff carrying a quant level must
go through **`quantLevelKey()`** (`lib/utils/recommend.ts`) — passing `quant.level` raw makes the
calculator miss the model's own `bpw`, silently fall back to the generic `?? 4.85`, and contradict
the page that sent the reader there.

**A URL param is only real if the mode that reads it exists.** `?gpu=` on the VRAM calculator set
local state that only *reverse* mode renders; forward mode judges against the navbar hardware
profile, so a shared link carrying a card produced a size with no verdict. When adding a param,
follow it to the component that actually reads it in the mode the link opens.

**Adding models**

1. Prefer `lib/data/models-extra-8.ts` (or new `models-extra-N.ts` + import in `models.ts`).
2. Set `addedAt` to today when shipping a freshness batch.
3. Wire `hfRepoMap` in **`lib/data/hf-repos.mjs` only** (single source; `hf-repos.ts` re-exports).
4. Update `todayFeed` in `models.ts` if it should appear on the homepage picks.
5. Bump `dataLastUpdated` + top `changelog` entry in `lib/data/meta.ts`.
6. Counts need no edit — `MODEL_COUNT` and `/llms.txt` derive from `models.length`.

**Superseding models** — set `status: 'superseded'` + `supersededBy`; do **not** delete (keeps
links/SEO). Card + detail show amber “Prefer {name}”.

**Measured confidence** — models in the site-side benchmark set (see `MEASURED_MODEL_IDS` in
`model-meta.ts`) with `speedRTX4090` default to **measured**; otherwise **estimated** unless
`confidence` is set explicitly.

**Natively-quantized weights** (e.g. GPT-OSS ships as MXFP4) — the released checkpoint *is* the
quantized one, so set `pplLossPercent: 0.0` on that row and say why in `description`. Don't invent
a loss figure against an FP16 original that was never published. Use the vendor's own name as
`level` (`'MXFP4'`); `level` is a free string, only `format` is a union.
**Also add the level to `quantBPW` + `quantGroups` in `lib/utils/vram.ts`** — a level missing from
those tables cannot be *selected* in the calculator at all, and custom-model sizing falls through
to the `?? 4.85` default. (The CLI generator is fine; it derives levels from `model.quants`.)
Missing entries are easy to miss by eye — `EXL2 3.5bpw` sat unlisted while six model rows used it.

Since 2026-08-18 the calculator prefers **the model's own `quant.bpw`** over the generic table
whenever the selected model actually ships the selected level, so per-model reality wins and the
forward/reverse modes agree. The table is still what custom (non-indexed) models are sized with,
so keep it honest — and keep a model row's `bpw` honest too, because it is now what the reader
sees.

**Never set `verifiedAt` you didn't earn** — it means "commands re-checked on this date". Agent
environments here have no GPU and no HF network access, so most stacks can't actually be run. An
unverified guide simply omits the field; back-dating or copying a sibling's date silently degrades
the badge on all 23 guides. **`verifiedStack` is a separate claim** and survives on its own: it says
what the guide is *written against*, and `ArticleView` renders it as "Written against" with a
not-re-run note when there is no date. So a rewrite keeps the stack line and drops the date — you
never have to choose between deleting useful information and claiming a run that did not happen.

**A guide that contradicts the calculator is worse than no guide.** Every VRAM number in prose must
come from `calcVRAM` on the model's own row, not from memory: the 8GB starter guide — the
top-traffic page — spent its life ~2GB high, and `mac-m3-pro-limits` told 18GB readers a 14B "needs
36GB+" when it needs 11.0. Both had `verifiedAt`. Before editing a guide, run the numbers it cites;
before adding one, check the level you are citing actually exists in that model's `quants`.

**Derived, not typed.** `readTime` was hand-written and fiction on 22 of 23 guides (5–12 minutes for
14–75 words). It is gone; `readingMinutes(article, lang)` computes it. Any field a human types once
and nobody recomputes will drift — prefer a helper over a column.

**2026 models do not all cache attention the same way.** `calcVRAM` assumed every layer keeps a
growing KV cache. Qwen3.8-27B runs 16 of 64 layers on full attention (`full_attention_interval: 4`
in `Qwen3NextConfig`), the rest on Gated DeltaNet with a fixed recurrent state — the old arithmetic
overstated its cache 4× (8.0 GB vs a measured 2.0 GB at 32K). Set `ModelArch.attention`
(`fullLayers` / `windowLayers` / `windowTokens`) for any hybrid or sliding-window model; omitting it
keeps the classic all-layers behaviour, which is what every pre-2026 entry relies on. **Validate a
new attention shape against a published KV measurement before trusting it** — that is how the 16 was
confirmed, at three separate context lengths.

**`pplLossPercent` is optional, and a missing one must stay missing.** Most 2026 releases ship
weights and GGUF conversions with no per-level perplexity sweep. Sort with `qualityRank()` and
display with `formatLoss()` (`lib/utils/quality.ts`) — never default to a number, because this
column feeds `fitsOnGpu`, the homepage picks and the compare rows, and an invented value propagates
into all of them. `lib/stats.ts` prints the sample size beside the median for exactly this reason.

**huggingface.co is blocked by the egress proxy; `raw.githubusercontent.com` is not.** For
architecture, read `huggingface/transformers`'s `src/transformers/models/<family>/configuration_*.py`
— it carries each family's reference-checkpoint defaults and the real layer-type construction.
`docs/source/en/_toctree.yml` lists every family transformers knows. Cross-check parameter counts
against published GGUF file sizes: a Q8_0 landing on ~8.5 bpw or a BF16 on ~16.0 confirms the whole
chain, and a figure that will not reconcile is a figure not to ship.

**A published rate implies a bandwidth — check it before believing a benchmark row.** Token
generation reads the whole weight set once per token, so `bandwidth / weightsGB` is a hard ceiling
on tok/s, and `rooflineTokS()` (`lib/utils/gpu-explainer.ts`) is what the GPU pages quote. Running
it over `matrixData` found three rows claiming 78–98 tok/s on a **288 GB/s** RTX 4060 Ti, which
needs 380–458 GB/s. They were removed, not adjusted — an invented plausible number is worse than a
missing one. Two exemptions the check must respect: **MoE** models read only their active experts
(Qwen3 30B-A3B measures 95 against a dense roofline of 57 — correct, not a fault), and a row within
a few percent of the ceiling is inside the error of `params × bpw` versus the real file size.

**`/formats/[slug]/` serves two page kinds.** A slug is a pair when `pairBySlug` knows it and a
single format otherwise — Next allows one dynamic segment per level and `/formats/gguf/` sits beside
`/formats/gguf-vs-awq/`. Adding one kind and forgetting the other is the failure mode: the single-
format pages shipped absent from `sitemap.ts`, which mapped `formatPairs` alone. Touch both.

**`MXFP4` is a GGUF level, not a format.** GPT-OSS's native 4-bit weights are distributed *as GGUF*
and stored that way (`format: 'GGUF', level: 'MXFP4'`). Promoting it to a fifth tracked format would
misdescribe the data and falsify the "formats tracked" count; it belongs on the GGUF page. The same
reasoning keeps **NVFP4** and **FP8/W4A16** out entirely — zero models ship them here.

**Per-quant publisher attribution (`official QAT` vs community PTQ) is not derivable today.**
`hfRepoMap` holds one repo per *model* and 14 entries point at the original weights, not a quant
conversion — backfilling ~300 quant rows from it would invent attribution. It needs a real per-quant
repo source; `huggingface.co` is blocked by the egress proxy. Leave the field out rather than
half-populate it.

**A search box that a schema advertises must be a `<form>` with a `name`.** Every page emits a
`SearchAction` for `/quant-hub/?q=`; the control was a bare input with neither, so nothing could
submit it without JS and nothing reading the markup could find the interface. Hidden inputs carry
the other active filters, and `action` goes through `localizeHref` or the Chinese tree submits into
the English one. A static export cannot return pre-filtered HTML per query — one document serves
every query string — so the form plus `useUrlQuery()` is the whole mechanism; do not accept a task
asking for server-rendered filtered markup here.

**The words readers type are not the values the data uses.** Hub search matched name/family/id only,
so "coding", "vision", "gguf" and "7b" each returned zero of 81. It now searches size, categories,
hardware tags, formats and levels, strips punctuation, and keeps a small alias map
(`coding`→`code` alone went 0 → 36 models). Extend the aliases, not the data vocabulary.

**Filtered Hub URLs are `noindex, follow`, never `Disallow`.** `QueryNoindex` rewrites the robots tag
only when the URL carries a param the page reads — it must never be able to fire on the bare
`/quant-hub/`, which would deindex the Hub. robots.txt stays open: a disallowed URL is never
fetched, so its links are never followed, and `Disallow: /*?*` would also catch the calculator's
share links.

**`/best/` recommends; `/gpu/` lists. They must never disagree.** The tier picks come from
`homePicks` — the same function behind the homepage hero — so there is one ranking implementation
for the whole site. "Best" means the largest model in its category that clears the card with
headroom, at the highest-quality quant that fits; this index runs no task benchmarks, and every page
says so rather than implying a quality ranking. Verify a change by perturbation (move one model's
`params`, watch the pick and the fit count move), not by reading.

**A tier's capacity is `tier.vram`, never `cards[0].vram`.** The Apple page computed its picks
against the first Apple entry — a 512 GB Mac Studio — and recommended a 675B model needing 429 GB
while the same page's context ladder used the declared 36 GB. One page, two capacities.

**Internal links are computed from relationships, never listed.** `ModelPlacement`
(`model-placement.ts`) and `GuideReferences` (`guide-references.ts`) join models ↔ hardware ↔
formats ↔ `/best/` ↔ guides out of data the site already holds, so the graph cannot rot. Measure
before and after by crawling `out/`, excluding hrefs present on >90% of pages (that is the nav and
footer, and it hides everything): the target is **no content page under 3 inbound**, and anchor text
is always the target's own name — never "here" or "this page".

**A module that sizes a model must use the same quant the rest of the site does.** `modelPlacement`
first used `bestQuant` (Q8_0 for most models) and listed a card set starting 4 GB above what the GPU
page it links to shows. GGUF Q4_K_M when the model ships it, `bestQuant` otherwise — the same
reference `modelExplainer` uses.

**A guide's format comes from the runtime it names, not from its models' formats.** Most models ship
GGUF, AWQ and EXL2, so deriving it from them printed the same three formats on fifteen guides. Match
the guide's title/id/`verifiedStack` against each format's `framework`, flattening punctuation on
both sides (`llamacpp` vs `llama.cpp`).

**Relatedness scores are asymmetric, so orphans need adopting.** A guide carrying `relatedModelIds`
and a `gpuPreset` outscores an infrastructure guide that can only match on title words, so
`windows-ollama-native` named three neighbours and was named by none. Orphans are adopted by their
top **two** neighbours, and adopted entries are appended **after** any list cap — the first fix
adopted into one host, the second was silently truncated by `.slice(0, 4)`.

**Rewritten guides live in `cookbook-rewrites.ts`, merged over the originals by id.** 17 of 23
guides were under 365 words of body; they are being rewritten in batches against the structure the
six 2026-09-08 rewrites set — *what you need first · steps · **check it actually ran on the GPU** ·
what the numbers should look like · when it does not work* — plus three `faqs` rendered from the
same array the route emits as `FAQPage`. A rewrite **removes** the unearned `verifiedAt` and sets
`updatedAt`; checking commands against a project's current docs is a documentation check, not a run.

Material worth reusing, verified from the projects' own docs rather than memory: the llama.cpp build
switch is `GGML_CUDA=ON` (CMake ignores an unknown `-D`, so `LLAMA_CUDA` yields a successful
CPU-only build); the binaries are `llama-server` / `llama-cli`, not `server` / `main`; Windows's
**System Memory Fallback** silently spills VRAM into system RAM, turning an OOM into a mysteriously
slow model; and `ollama ps`'s `PROCESSOR` column is the only usable GPU check on a Mac, where
unified memory leaves no separate VRAM figure to watch.

**A GPU database gap forces an honest substitution, stated in the text.** `gpuDatabase` has no
M1 or M2 base-chip row (only M2 Max/Ultra), so `m1-8gb-ollama-limits` sizes against the Mac M3 8G
entry for capacity and says so — 8GB is 8GB regardless of generation, but bandwidth is not (M3: 100
GB/s; M1 base: ~68 GB/s; M2 base: ~100 GB/s). Never silently borrow a different card's row without
naming the substitution and where it breaks.

**A quoted verdict must match `calcVRAM`'s own threshold, checked, not assumed.** A guide called
GGUF Q4_K_M "the sweet spot" for a 32B model on a 24GB card; run through the calculator it is 90% of
the card — this site's own `tight`, not `comfortable`. Run the number before writing "fits" or
"comfortable" into prose, the same rule as the VRAM-guide fault from 2026-09-08.

**Server-stack commands go stale faster than anything else here.** Verified 2026-09-12 against the
projects' own docs: vLLM's entrypoint is **`vllm serve`** (not `python -m
vllm.entrypoints.openai.api_server`) and it installs with `uv pip install vllm --torch-backend=auto`;
it ships official **ROCm** wheels plus XPU/TPU backends. ExLlamaV2 now lives at
**`turboderp-org/exllamav2`** and its example passes `-gs auto`. **TabbyAPI's own README says it is
a hobby project "not meant to run on production servers"** — quote the maintainers rather than
softening it. vLLM's real failure signature is a preemption warning naming
`PreemptionMode.RECOMPUTE`, which is KV-cache pressure: shorten `--max-model-len` before raising
`--gpu-memory-utilization`.

**Quote only throughput this index measured.** `rtx4090-vllm-api` claimed "~1400 tok/s (batch=8)",
which nobody here ran; its batch-1 figure happened to match the index's own 218 tok/s row. Cite
`matrixData` or say the site has not measured it — batched throughput especially, since that is the
number every vendor benchmark inflates.

**The FAQ is computed, and a question it cannot answer must say so.** `lib/utils/faq.ts` renders
every figure from the index, so `/faq/` cannot drift from the calculator — verify with a
perturbation (change one `bpw`, watch the answers move) rather than by reading. Three answers
deliberately state a limit instead of a number; keep them that way unless the data arrives.
`FAQPage` lives on `/faq/` **only** — the homepage block is visible content with no schema, because
the same question as structured data at two URLs is a duplicate entity, not extra coverage.

**Two medians are not a comparison unless they cover the same models.** The Q5-vs-Q4 answer
subtracted a median over the 79 models reporting Q4_K_M from one over the 16 reporting Q5_K_M —
different populations, so the difference described the groups, not the levels. Pair first, then take
the median of the per-model deltas. This is the homepage "average accuracy" fault in a new place;
expect it wherever two optional fields are aggregated side by side.

**"Consumer GPU" is not `type`.** `type: 'amd'` also covers the Radeon PRO W7900 and Instinct MI100,
so "the largest consumer card" returned a workstation card. Filter on the name (`/^Radeon RX/`)
alongside `nvidia-consumer` when the question is "what should I buy".

**Adding a route means touching three places** — the route, its `/zh` mirror, and `app/sitemap.ts`.
`/tools/` and `/changelog/` shipped as pages and sat outside the sitemap until `/faq/` was added.

**Redirects live in `public/_redirects`, never in `next.config.js`.** `redirects()` needs a Next
server and is **silently inert** in a static export — it looks done and does nothing. Cloudflare
Pages reads `_redirects` from the build root. The file is hand-written while the pages are derived,
so the postbuild gates every rule from both ends: the source must not still be an exported page (a
real file shadows the redirect) and the target must be one (or it redirects into a 404).

**A comparison page needs something in common to compare.** `formatPairs` only generates a pair when
at least one model ships both formats; `awq-vs-gptq` and `exl2-vs-gptq` had an intersection of
exactly zero and were ~650 words of two descriptions side by side. `mergedPairs` keeps the dropped
pair with a data-chosen redirect target, and the surviving page answers the merged question in its
own section — the query is real even when the comparison is not. Both are derived, so a model
shipping both formats brings the page back with no code change.

**Adding a GPU costs one line and needs only its VRAM** — but a verified `bandwidth` is what makes
its page differ from its same-capacity siblings. `GPU` carries `{ id, name, vram, type, bandwidth?, memType? }`
and only `vram` reaches the sizing math, so a card is addable the moment its capacity is confirmed —
no architecture, no benchmarks. Do confirm it: a card whose VRAM is a guess generates a whole page
of guesses, which is why the RTX 5050 and RX 9060 XT are still absent. Keep `gpuSlug()` dot-free,
and expect the page to say "no benchmark runs recorded on this card" unless `matrixData` has a row
whose hardware string resolves to it.

**Page prose for a set of 80+ pages is generated, not written — and must vary with the data.**
`modelExplainer()` (`lib/utils/model-explainer.ts`) builds each model page's sections and FAQ from
that model's own row. Write the sentences as conditionals on real facts (smallest fitting card,
format count, MoE, hybrid attention, whether a perplexity or speed figure exists), never as one
template with a name substituted, and measure the result: the model pages sit at mean 0.500 5-gram
Jaccard, worst pair 0.755. The visible FAQ and the `FAQPage` schema come from the **same call**, so
they cannot diverge.

**`updatedAt` and `verifiedAt` are different claims.** `verifiedAt` = commands re-run; `updatedAt` =
content changed. `dateModified` prefers `updatedAt`. Removing an unearned `verifiedAt` used to strip
the page's only modification date, which made a freshly corrected guide look staler than an
untouched one — set `updatedAt` when you rewrite a guide.

**Counts come from the data, never from a string.** `MODEL_COUNT` (`lib/seo.ts`) derives from
`models.length`, and `app/llms.txt/route.ts` is generated like `feed.xml`. The number used to be
typed into six files and `public/llms.txt`, so a model batch meant editing six strings and
forgetting one left the site advertising a count it no longer had. Step 6 of "Adding models" is
therefore gone — there is nothing left to refresh by hand.

**A derived page's meta description must vary as much as the page does.** The GPU template
interpolated only `gpu.vram`, so 36 of 43 pages shared nine descriptions. `gpuPageDescription()`
names the card and its largest fitting model. After any template change, walk `out/**` and count
distinct descriptions against page count — they should match.

**`addedAt` is when *this index* picked a model up, not when the model shipped.** Printed bare
beside a NEW badge it reads as a release date, and several entries were released a year before
indexing. Always render it through `t.hub.model.addedOn` ("added {date}").

**The methodology block records history, not the present.** `benchmarkMethodology.frameworks` is the
stack those numbers were measured on — editing it to look current would claim runs on releases that
did not exist at the time. `runtimeVersions` in `meta.ts` carries what the projects are at today,
shown beside it, with its own `checkedAt`; bump that only when you actually re-check the projects'
release pages.

**`arch` is not decoration** — `layers` / `kvHeads` / `headDim` feed the VRAM calculator's KV-cache
math. Check them against the real `config.json` before shipping a model; GPT-OSS's `headDim: 64`
(vs the usual 128) halves its KV footprint and a copy-pasted 128 would silently overstate it.

## Content cadence (product priority)

**Who actually shows up (2026-08-08, weak signal — treat as hypothesis, not fact).** The first
traffic snapshot put the homepage plus four cookbook guides in the top five:
`amd-rocm-llamacpp`, `wsl2-ollama-gpu`, `dual-gpu-70b-llamacpp`, `mac-m3-pro-limits`. All four are
**non-standard-hardware** guides; no single-NVIDIA-card guide made the list. Volume was single
digits, so do not over-fit — but when choosing between two equally "newsworthy" models, prefer the
one a constrained reader can actually run (AMD / Windows / Apple silicon / multi-GPU / CPU offload)
over the 400B flagship. Re-check this against real numbers before treating it as settled.

**Serve that audience in the tools, not just the content.** AMD was the clearest example: an AMD
guide was the #2 page while `gpuDatabase` had zero Radeon entries and the format wizard steered
AMD users to CUDA-only EXL2. Before adding another guide for a hardware class, check that the
VRAM calculator, `GPU['type']`, `HardwareType` in `lib/utils/format-wizard.ts`, and
`FormatWizard.tsx`'s type mapping all actually know that hardware exists.

**Model-facing changes are a four-step path, not one step.** A visitor goes
*home → model detail → VRAM calculator → cookbook guide*. Shipping a model into only the first two
leaves the calculator giving wrong numbers (see the MXFP4 gap) and the guide missing. Verify all
four before calling a model batch done.
The path runs backwards too: guides are where the traffic lands, so a guide should carry
`gpuPreset` + `relatedModelIds` (see `components/cookbook/GuideNextSteps.tsx`) to send readers into
the hub and the reverse VRAM lookup.
The hub direction is automatic: `guideLinksForModel()` reverses `relatedModelIds` and falls back to
a `hardwareTag → guides` map, so wiring a guide's `relatedModelIds` also populates
`ModelGuides` on every model it names — one edit, both directions. Set `gpuPreset` only when one real GPU id represents the
guide's hardware — leave it off for multi-GPU guides rather than faking a combined card.

With real traffic, **freshness > new tools**. Suggested rhythm:

| Cadence | Action |
|---------|--------|
| Weekly | Refresh `todayFeed` + one `changelog` line; bump `dataLastUpdated` |
| Biweekly | +1–3 real flagship models with `addedAt` |
| Monthly | Re-verify 1 high-traffic cookbook (`verifiedAt` / `verifiedStack`) |
| Quarterly | Supersede more legacy models; trim noise |

**A ship is not done when the code is right.** `lib/data/meta.ts` is part of the change, not
paperwork after it: a commit that alters behaviour but leaves `dataLastUpdated` and `changelog`
untouched is invisible on the site's own three cadence surfaces, and leaves the "last updated" date
pointing at an older ship — which then misleads anyone verifying a deploy. This has now been missed
twice; check `git show --stat` for `lib/data/meta.ts` before calling a batch complete.

Home **Weekly updates** (`components/home/WeeklyUpdates.tsx`) + Hub `?recency=recent` +
`/feed.xml` are the three surfaces that should reflect every cadence ship.

**GPU landing pages are derived, not authored** — `lib/utils/gpu-page.ts` turns `gpuDatabase` +
`models` into 61 pages per language. `fitsOnGpu()` reuses `calcVRAM`/`getVerdict`, so a page and the
calculator's reverse mode return the same set (verified: 51 = 51 for a 4060 Ti 16G). Adding a GPU to
`gpus.ts` adds two pages automatically; nothing else to write. Slugs come from `gpuSlug()` and are
deliberately **dot-free** — `next/link` strips the trailing slash from any path whose last segment
contains a dot.

## Key paths agents touch often

```
lib/data/types.ts           # QuantModel / QuantVariant / Article fields
lib/data/models.ts          # concat packs + todayFeed
lib/data/models-extra-*.ts  # model packs (currently through extra-8)
lib/data/meta.ts            # dataLastUpdated + changelog
lib/data/hf-repos.mjs       # HF stats map (ONLY place to edit repos)
lib/utils/model-meta.ts     # isRecentModel, quantConfidence, RECENT_DAYS
lib/utils/hub-url.ts        # shareable Hub filters incl. recency
lib/i18n/translations.ts    # en + zh always
app/feed.xml/route.ts       # RSS (force-static)
components/home/HomeMatch.tsx     # homepage hardware × use-case picker
lib/utils/home-picks.ts          # the three picks behind it
components/home/WeeklyUpdates.tsx
components/home/JobPaths.tsx
```

## Git & deploy

- Work on `main` (small fixes) or an agent feature branch if isolated.
- **Pushing to `main` auto-deploys** via Cloudflare Pages (build `npm run build`, output `out`).
- Always `git push origin main`; on `fetch first` rejection, `git pull --rebase origin main`,
  resolve conflicts, continue rebase, push again.
- Don't open a PR unless asked.
- **Do not put** private GitHub org/user links on public site pages (Footer / About / live copy).
  Repo may exist for deploy; site privacy posture is “no public source repo”.

## Deploy footguns (full list in README §6)

Cloudflare **Pages** not Workers · output dir `out` not `.next` · Next.js ≥ 14.2.35 ·
if a deploy command is forced, use `true` (not `done`). · No required env vars for build
(optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` defaults to `quantized.uk` in code).

## Icons & OG

Master app mark is `public/icon.svg`; regenerate PNGs with the bundled Chromium recipe in
README §10 (this env has no ImageMagick/sharp). Update all sizes together after editing the SVG.
Also keep `public/favicon.svg` in sync when the mark changes.

**OG:** master text lives in `public/og.svg`; ship `public/og.png` for social (platforms ignore SVG).
After changing model-count copy in `og.svg`, re-render PNG via README §10 so shares stay accurate.

## Recent ships (summary for context)

| When | Commit theme |
|------|----------------|
| 2026-09-08 | **Shared config across tools** — `HardwareProfileProvider` grew from a GPU id into `{ gpuId, modelId, quantLevel, contextLen }`; precedence is **URL > stored > default**, stored ids sanitised on read |
| 2026-09-08 | **Every number states its basis** — compare rows labelled estimated/published/spec (the VRAM row ignored the context control); "6:1 wins" scoreboard removed; cards show one named config; fit counts share `countModelsFitting` and name their rule |
| 2026-09-08 | **Command safety + a wrong claim** — local server binds `127.0.0.1` not `0.0.0.0`; download installs its own CLI; **vLLM is not CUDA-only** (official ROCm builds) — that claim was ours and was wrong |
| 2026-09-11 | **Model pages explain themselves (QTZ-011/016)** — 81 pages were 219-word tables; `modelExplainer()` derives 3 sections + 3 FAQs per model (median 1,143 words, `FAQPage` on 162/162). Guides declare `updatedAt` and their real model/hardware entities |
| 2026-09-11 | **Current-generation hardware (QTZ-005)** — newest consumer card was the 2022 RTX 4090; +18 cards (43→61): Blackwell, RDNA 4, M4/M5 including 256/512GB Mac Studio. Capacities verified, RTX 5050 and RX 9060 XT left out as unconfirmed. `GPU_COUNT` now derived |
| 2026-09-11 | **Findability (QTZ-003p/004/006/007/008/009/010)** — 36 of 43 GPU pages shared nine meta descriptions; `/tools/` and `/changelog/` were 404s; the nav linked 4 of ~340 pages; the homepage printed one changelog entry three times; counts were hardcoded in six files; methodology advertised runtimes two generations old |
| 2026-09-11 | **2026 architectures** — the VRAM formula could not represent a hybrid-attention model at all (4× overstated KV on Qwen3.8); `ModelArch.attention` added and validated against measurements at three contexts, all 888 existing combinations unchanged. `pplLossPercent` optional so an unpublished figure is a dash, not a guess. +2 models (81) |
| 2026-09-11 | **Two crawling faults (QTZ-001/002)** — `next/link` stripped the trailing slash from every dotted model id (2,101 redirecting links, 27 pages with no canonical inbound link); the language switcher was a `<button>`, leaving 164 Chinese pages with no crawlable entry. Both now gated in postbuild |
| 2026-09-08 | **Search + feedback (P2)** — GPU pages name their measured runs and same-budget siblings (43 pages were 0.97 similar); `ItemList` claimed 73 items while emitting 30; "did it actually run?" replaces treating a copy as success; lab perf baseline recorded, no field data available |
| 2026-09-08 | **Guides vs the calculator** — 8GB guide ran ~2GB high and Mac guide told 18GB readers a 14B "needs 36GB+" (it needs 11.0); five guides rewritten from the index. `readTime` was fiction on 22/23, now derived. Contrast: `slate-600` was 2.5:1 — palette raised, 3,175 text nodes now pass AA |
| 2026-09-08 | **Homepage answers first** — hero asks for your card and your task, then names the largest model that fits, one with room to grow, and the fastest. Pick criteria that were monotonic in model size gave a 4090 the same 0.5B answer as an 8G card; `?gpu=` did nothing in the calculator's forward mode; raw `quant.level` broke the calculator's bpw lookup |
| 2026-09-01 | **Format comparison pages** — 6 pairs × 2 languages from `SHIPPED_FORMATS`; the measurable half is the models shipping both formats (GGUF/AWQ: 53). Pairs with none say so |
| 2026-09-01 | **Calculator answers, not lists** — 43 verdict bars → one sentence + your card + collapsed detail; model dropdowns grouped by size (`<optgroup>`, not a custom combobox) |
| 2026-09-01 | **GPU landing pages** — 43 cards × 2 languages (`/gpu/rtx-4060-ti-16g/`), derived from `gpuDatabase` + the model index, no new data; 232 → 322 pages |
| 2026-09-01 | **Tool pages** — all four had one `h1` and no prose; now 2–3 explainer sections + visible FAQ with `FAQPage`/`SoftwareApplication` schema, copy written from the code in `lib/data/tool-content.ts` |
| 2026-09-01 | **Chart + touch targets** — speed chart labelled 13 of 18 bars "RTX 4090"; now model-over-hardware with a framework colour key. Recharts animation off (headless screenshots can't advance it — a missing bar is an artifact, not a bug). Tap targets ≥44px |
| 2026-09-01 | **Honest numbers** — homepage stat now names its level (Q4_K_M median, 97.1%, with spread) instead of averaging incomparable rows; benchmark notes translated; `SearchAction` added |
| 2026-09-01 | **Hub was invisible** — `useSearchParams` kept all 79 model cards out of the static HTML; `useUrlQuery()` instead (30 KB → 275 KB, 0 → 80 headings). Also: calculator no longer answers before a model is picked, `/` had no hreflang, 404 canonicalised to the homepage, `/zh/feed.xml` + `/rss.xml` added |
| 2026-09-01 | **Cadence miss** — the LCP ship updated the docs but not `lib/data/meta.ts`, so it never reached Weekly/RSS/recency; build now also gates on `undefined` rendering in `/zh` |
| 2026-08-23 | **LCP** — homepage `<h1>` shipped as `opacity:0` (framer-motion `initial`), so the LCP text waited on hydration; CSS keyframes instead, framer-motion dropped, First Load JS 202→169 kB |
| 2026-08-23 | **Format surfaces** — hero badges / `formats tracked` / wizard now derive from `SHIPPED_FORMATS` (HQQ was advertised with 0 models); wizard emitted `EXL2 · Q4_K_M` and recommended ROCm for CUDA-only EXL2 |
| 2026-08-23 | **Homepage layout** — `StatsBar` `-mt-8` overlapped the job-path cards; hero clipped on phones (flex `min-width:auto` + `max-w-md` pill); navbar overflowed at `md`; 126 page×width combos now assert no horizontal scroll |
| 2026-08-20 | **CLI generator was emitting unrunnable commands** — display name used as repo id/Ollama tag/filename; now `hfRepo` + `ggufRepoId()` gate; `GGML_*` build flags; `sysctl -n hw.ncpu` on macOS |
| 2026-08-20 | **Hub filters** — format chips derived from data (`HQQ` matched 0 models); share URL keeps the reader's language |
| 2026-08-20 | **Cadence** — `dataLastUpdated` → 2026-08-20; changelog caught up (`/zh` ship + audit had never reached Weekly/RSS/recency) |
| 2026-08-18 | **`/zh` audit** — `<html lang>` patched at export (113 pages), 5 page files still on bare `next/link` (23 guide links leaked), JSON-LD/breadcrumbs localized, nav highlight fixed; build now gates on link leaks |
| 2026-08-18 | **Calculator correctness** — `EXL2 3.5bpw` added to `vram.ts`; forward mode uses model-measured bpw (GPT-OSS Q8_0 was overstated 67%) |
| 2026-08-08 | **Chinese edition indexable** — `/zh/**` mirror (232 pages), URL-driven i18n, `LocalLink`, hreflang + sitemap alternates |
| 2026-08-08 | **AMD first-class** — 10 Radeon GPUs added (43 total); format wizard stopped recommending CUDA-only EXL2 to AMD; guides route into tools via `gpuPreset`/`relatedModelIds` |
| 2026-08-08 | **Traffic-informed batch** — +4 models → 79 (`extra-8`): Qwen3-VL 8B / 30B-A3B, Magistral Small 1.2, Seed-OSS 36B; Qwen2-VL superseded. Picked for constrained hardware, not release news |
| 2026-08-08 | **GPT-OSS follow-through** — `gpt-oss-mxfp4-local` guide (23); MXFP4 added to VRAM calculator (Q4_K_M had overstated GPT-OSS weights ~14%) |
| 2026-08-07 | **MoE freshness batch** — +4 models → 75 (`extra-7`): GPT-OSS 20B/120B native MXFP4, GLM-4.5-Air, Devstral Small 1.1; feed + counts + og.png |
| 2026-07-22 | **Cadence pack A+B+C** — +4 models → 71; superseded tags; confidence column; Hub recent; weekly block; RSS; cookbook verified stack |
| 2026-06-26 | Real-traffic UX — job paths, mobile GPU profile, honest format heat, feedback email, Plausible events |
| 2026-06-26 | Model packs — Qwen3 MoE/32B, DeepSeek-V3/R1, Mistral Large 3, GLM-4, etc. |
| Earlier | PWA, safe areas, self-hosted fonts, lazy charts, OG PNG, QA fixes (≤3B filter, CLI quant sync, HF merge) |

Prefer **continuing the cadence** (data + labels + verified guides) over inventing a fifth tool.
