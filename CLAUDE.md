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
| Models | **79** in index (`models-extra` … `models-extra-8`) |
| Cookbook | **23** guides; key ones carry `verifiedAt` + `verifiedStack`, 7 carry `gpuPreset`/`relatedModelIds` |
| Hub | Filters: size / category / hardware / format / **recency** (`?recency=recent`) |
| Home | Job paths, weekly updates block, data freshness line, honest format heat |
| Feed | `/feed.xml` — RSS of changelog + recent models |
| Tools | VRAM (43 GPUs incl. **AMD**), CLI, format wizard (NVIDIA/AMD/Mac/CPU), compare |
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
    `...ogLocale(path)`.
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

**Per-format vocabularies don't share a fallback** — quant levels belong to one format only. The
wizard's `recommendQuant` fell through to `Q4_K_M` for every format, telling readers to fetch
"EXL2 · Q4_K_M". Likewise a recommended runtime must follow the **format**, not the hardware, or the
row contradicts its own reason text (EXL2 recommended with a ROCm runtime).

**Run the tools, don't read them.** Both wizard bugs survived review and were obvious the moment the
function was called across every hardware × priority combination. Same for the CLI generator.

**Adding models**

1. Prefer `lib/data/models-extra-8.ts` (or new `models-extra-N.ts` + import in `models.ts`).
2. Set `addedAt` to today when shipping a freshness batch.
3. Wire `hfRepoMap` in **`lib/data/hf-repos.mjs` only** (single source; `hf-repos.ts` re-exports).
4. Update `todayFeed` in `models.ts` if it should appear on the homepage picks.
5. Bump `dataLastUpdated` + top `changelog` entry in `lib/data/meta.ts`.
6. Refresh SEO copy that hardcodes model counts (`lib/seo.ts`, layouts, `public/llms.txt`).

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
the badge on all 23 guides. Same rule for `verifiedStack`.

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
