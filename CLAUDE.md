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

**Live snapshot (2026-10-16):**

| Surface | Notes |
|--------|--------|
| Models | **110** in index (`models-extra` … `models-extra-12`) |
| Cookbook | **27** guides, all rewritten with 3–4 FAQs each, reading time derived, `verifiedStack` shown with or without a `verifiedAt` date |
| Hub | Filters: size / category / hardware / format / **recency** (`?recency=recent`) |
| Home | Hardware+task picker → 3 matched models, popular cards, measured sample, weekly updates, collapsed changelog |
| Feed | `/feed.xml` — RSS of changelog + recent models |
| Tools | VRAM (**78** GPUs/Macs/DGX Spark + 4 CPU-only RAM rows, incl. AMD RDNA 4 + Radeon AI PRO R9700, Intel Arc + Arc Pro B70, Blackwell, DGX Spark, M4/M5, Pascal datacentre), CLI, format wizard, compare |
| i18n | **English `/` + Chinese `/zh/**`** — 483 pages (242 EN + 241 ZH), hreflang-paired, Chinese baked into static HTML |
| Privacy | No public repo link on site pages; one contact address `zjy@quantized.uk` (`FEEDBACK_EMAIL`) in Footer, `/about/`, 404, JSON-LD |

## Commands

```bash
npm run dev      # local dev → http://localhost:3000
npm run build    # type-check + lint + static export → out/   (gate before every commit)
npm run lint
```

`build` runs a `prebuild` HF-stats fetch that fails gracefully offline (merge keeps prior
stats on 401). **No `HF_TOKEN` required** — zero-config deploy; gated HF repos simply skip.

`build` fails on **data invariants** too: `app/sitemap.ts` calls `assertDataConsistent()`
(`lib/data/validate.ts`) — broken `supersededBy`, a `todayFeed` level the model does not ship, a
guide pointing at a missing model/GPU, a quant level the calculator cannot select. When a new
hand-typed cross-reference is added, add its rule there and prove it fires by perturbation.

`postbuild` ends with `scripts/indexnow.mjs`: on Cloudflare production builds only, it pings
IndexNow with the sitemap URLs whose `lastmod` is within a day of the build date (UTC, ±1 for
the UTC+8 ship dates) — so honest `lastmod`s now also decide
what search engines are told changed. Never fails the build. **Do not delete or rename
`public/1ff374a1f4ca010beaf5f65b4eb3b8f8.txt`** — it is the key IndexNow verifies against.
`node scripts/indexnow.mjs --dry-run` shows what a deploy today would submit.

`build` also runs a `postbuild` pass (`scripts/localize-export.mjs`) over `out/`: it patches
`<html lang>` for the `/zh` tree, and **exits non-zero if any Chinese page links into the English
tree, renders the literal text `undefined`, any page's meta description is missing, duplicated or
over 160 width, any `<title>` is duplicated or over 60 width (CJK = 2; use `fitTitle`), or any
page's JSON-LD disagrees with the page (language, canonical url, `/zh` breadcrumbs, ItemList count,
FAQ question not visible)** (a key present in `en` but missing in `zh`
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
  - **A data object with `title` + `titleZh` needs the language check at every render site**, not
    just the page that owns it — `GuideReferences` printed `a.title` for linked guides and the
    Chinese tree showed English guide titles for months; the leak gate cannot catch it (the href is
    correctly `/zh/…`). Scan `out/zh/**` text nodes for English after touching shared components.
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
  **The one runtime network call** is the calculator's Hugging Face import (`lib/utils/hf-import.ts`),
  made by the reader's browser on click, never at build or on load. Every failure path must degrade to
  "enter by hand"; a field the config does not carry stays empty — never filled with a plausible
  default. Test parser changes against index models' own `arch` (they must come out identical).
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
  skeleton), never statically from a page (see `BenchCharts`).
- **OG image is `/og.png`** (rendered from master `og.svg`, README §10 recipe) — social
  platforms don't render SVG `og:image`; re-render the PNG whenever `og.svg` changes. GPU, model,
  cookbook, `/best/` and format pages override this with their own build-time-generated
  `opengraph-image.tsx` (`lib/og/render.tsx` is the shared renderer) — never add `runtime = 'edge'`
  to one of these files: it silently makes the route Dynamic, and a static export drops Dynamic
  routes with no error, so the build succeeds while the image is simply never written. Pass a real
  `alt` via `pageOgImage(path, alt)` (`lib/seo.ts`) rather than the file's static `alt` export,
  which cannot vary per `params`.
- **An unset `twitter` metadata field must stay unset, never a copy of the site default.** Twitter's
  own fallback reads the matching `openGraph` field at that same metadata level when `twitter.title`/
  `description`/`images` are omitted — that's what let a per-page `opengraph-image.tsx` and a
  per-page `og:title` actually reach the Twitter/X card instead of a hardcoded value in
  `app/layout.tsx` or `pageMetadata()` (`lib/seo.ts`) always winning. Both used to hardcode all
  three, which meant literally every page's Twitter card — the homepage included — showed the
  generic site tagline and `/og.png` regardless of what `og:title`/`og:description`/`og:image`
  correctly showed for that page. `pageMetadata()` is inherited by any layout that calls it
  (`/quant-hub/layout.tsx`, `/cookbook/layout.tsx`, ~25 others) and wins over a leaf page's own
  `openGraph` unless its own `twitter` fields are absent too — check this by reading the rendered
  `<meta name="twitter:...">` tags in `out/**`, not the `generateMetadata` source, the same rule as
  every other static-export claim in this file.
- **A file the export writes with no extension needs a `public/_headers` MIME rule.** Cloudflare
  Pages guesses `Content-Type` from the filename; `opengraph-image.tsx` exports as literally
  `opengraph-image`, no `.png`, so without an explicit rule it serves as
  `application/octet-stream` — a type social-card validators do not sniff past. One line per route
  in `public/_headers` (`*` matches one path segment, never across `/`, so each route depth needs
  its own line — see the file for all 10).
- **A bare email address rendered as text is a Cloudflare hydration risk.** Scrape Shield → Email
  Address Obfuscation rewrites any bare address or `mailto:` link in the HTML leaving Cloudflare's
  edge; since this is a static export, the React bundle hydrates against the *unmutated* text it was
  built from, and a Cloudflare-mutated DOM disagreeing with it is a plausible cause of hydration
  errors (#418/#425 — text content mismatch). `FEEDBACK_EMAIL` (`lib/seo.ts`) rendered as visible
  text — Footer (every page), `MaintainerNote`, `RunFeedback` — now goes through
  `EmailOffGuard`/`textWithGuardedEmail` (`components/ui/EmailOffGuard.tsx`), which wraps the address
  in Cloudflare's own documented `<!--email_off--><!--/email_off-->` escape comment via
  `dangerouslySetInnerHTML` on inert siblings (never a wrapping element — Cloudflare's rewriter reads
  the token stream in document order, and nesting the comment inside an element risks it reading as
  scoped to that element). Use it any time `FEEDBACK_EMAIL` is rendered as text rather than only
  living inside a `mailto:` href attribute. **Unconfirmed against the live site** — this environment
  has no way to load the Cloudflare-fronted domain and check the actual console; treat it as a
  best-effort mitigation until someone checks devtools on the real URL. Disabling Email Address
  Obfuscation in the Cloudflare dashboard is the more certain fix and is the site owner's to make.
- **Never read the clock in anything that renders.** A static export renders once at build and
  hydrates at visit time; any output depending on `Date.now()` / `new Date()` differs between the two
  as soon as time passes, which is a React #418/#425 text mismatch. `isRecentModel` did exactly this
  (NEW badges, homepage block, Hub recency filter). Time-relative logic measures from
  `RECENCY_ANCHOR` (= `dataLastUpdated`, `lib/utils/model-meta.ts`) — the same value in the HTML and
  the bundle. Grep `Date.now()\|new Date()` in `components/` and `app/` before adding a date feature.
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
- **An interactive tool needs a static answer beside it.** Before hydration the VRAM calculator is
  an inert dropdown; `VramQuickReference` puts the same arithmetic into the exported HTML. Never size
  a model at a context longer than its own `contextLength` in a summary table.
- **A chart's text equivalent must live outside the lazy chart component.** `BenchCharts` is
  `ssr: false` (the format radar was too, until it was removed); a table placed inside one exists only after hydration, for
  readers already running Recharts. `BenchDataTables` renders from the page instead, so the figures
  are in the exported HTML.
- **A collapsed-by-default disclosure renders nothing into a static export.** `MethodologyPanel`'s
  `{open && <div>...</div>}` starting from `useState(false)` meant its entire content — most of the
  benchmarks page's word count after the QTZ-031 rewrite — never reached `out/**` at all, invisible
  to every crawler and to any word-count check, exactly the `BenchCharts`/lazy-chart fault above in
  a different shape. If content is meant to be indexed or counted as real page content, its section
  must default to **open**; a toggle to collapse it for a returning reader is fine, defaulting to
  collapsed is not. Check any new disclosure the same way as a lazy chart: read `out/**`, not the
  component source, and confirm the text is actually there before hydration.
- **The site's own data is CC BY 4.0** (owner's choice, 2026-10-05; `/legal/` §10). The `/benchmarks/`
  `Dataset` JSON-LD carries `license`; any new `Dataset` block must too, or Search Console flags it.
  The licence covers this site's measurements and tables only — never imply it covers model weights.
- **Structured data must describe the page that exists.** `ItemList` on the GPU pages claimed
  `numberOfItems: 73` while emitting 30. The postbuild gate now enforces this; the rules it applies:
  counts match the emitted list, `inLanguage`/`url` follow the page's language, FAQ questions appear
  in the visible text. There is deliberately no `AggregateRating` or `Review` anywhere — the site has
  no ratings to report, and inventing a reviewer identity is not on the table.
- **A schema entity is not more credible for citing an identity that does not exist.** The
  site-wide `Organization` block (`components/seo/JsonLd.tsx`) deliberately omits `founder` (no
  real `Person` is named — `/about/` describes an intentionally unnamed maintainer) and `sameAs`
  (no real GitHub/HF/social account — the site's stated posture is no public source repo). Filling
  either with a plausible-looking placeholder would be the same fault as an invented reviewer
  identity or a fabricated author byline. Fields present (`description`, `knowsAbout`,
  `contactPoint`, `foundingDate`) are all independently verifiable from data the site already has;
  `foundingDate` is derived from the earliest `changelog` entry, never typed in.
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

**CLI container commands *and the native llama.cpp build* follow the reader's GPU** (`backend` from the hardware profile; `linuxBuild()` — the native build was CUDA for everyone until 2026-10-03). A GPU block
that is commented out, or a CUDA image on an AMD card, starts cleanly and runs on the CPU — the worst
failure mode for a copy-paste command. Every CLI note goes through `L(lang, en, zh)`; sweep all
framework × env × backend × lang combinations after touching `lib/utils/cli.ts`, and check notes
are in the reader's language.

**A GGUF build past `SHARD_GB` (48 GB) is matched, not named** (2026-10-17): bartowski/unsloth split such files into `…-00001-of-N` parts in a folder while ggml-org ships one file, so `generateCLI` gets `fileGB` (`ggufFileGB()`) and switches to an include pattern + `find` for `-m`; an exact name for a split build downloads nothing and exits 0. A repo whose filenames are not `<repo>-<level>` (AtomicChat's `AD-` prefix) maps to the original weights so the CLI shows a placeholder.

**Identifiers vs display names (CLI generator)** — `model.name` is for humans. Commands need real
identifiers: pass `hfRepo` from `hfRepoMap`, and gate it through `ggufRepoId()` before using it in
a GGUF command — **14 of 79 entries map the original weights, not a GGUF conversion**, because
that map's job is HF stats. When the right repo isn't derivable (vLLM needs FP16/AWQ/GPTQ, EXL2
repos are per-model), emit a visible `<placeholder>`: an obvious placeholder beats a plausible
wrong answer. Same rule for llama.cpp build flags — they are `GGML_*`, never `LLAMA_*`. (Checked 2026-10-02 in
llama.cpp's `CMakeLists.txt`: `LLAMA_CUDA` warns and still enables CUDA, `LLAMA_CUBLAS` is a fatal
error — the site long claimed both were "silently ignored"; a *misspelt* flag is what gives a
CPU-only build, reported only as an unused manually-specified variable — and so does `LLAMA_HIPBLAS`,
which is absent from `llama_option_depr` and therefore not forwarded to `GGML_HIP`.)

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

**An editorial judgement is shown as an order, never as a number.** (The six-axis format radar — typed
0–100 scores — was removed for this on 2026-10-03; its accuracy axis also contradicted the paired data.
A format card's quality claim must survive a paired comparison over the index, e.g. AWQ vs Q4_K_M.) The Heat Index printed
`GGUF 89%` from no reproducible source, and pair pages set it beside the measured model counts.
`heatPercent` now only sorts; anything typed from opinion rather than data gets a rank or a word.

**Per-format vocabularies don't share a fallback** — quant levels belong to one format only. The
wizard's `recommendQuant` fell through to `Q4_K_M` for every format, telling readers to fetch
"EXL2 · Q4_K_M". Likewise a recommended runtime must follow the **format**, not the hardware, or the
row contradicts its own reason text (EXL2 recommended with a ROCm runtime).

**Run the tools, don't read them.** Both wizard bugs survived review and were obvious the moment the
function was called across every hardware × priority combination. Same for the CLI generator.

**A recommendation function must check whether the hardware can run the format, not just whether it
has room for the bytes.** `fitsOnGpu` ranked every quant a model shipped by quality loss alone and
handed back whichever fit in VRAM — no idea whether the target's backend (CUDA/ROCm/Metal/CPU) could
load that *format* at all, so a Mac, CPU or AMD GPU page could recommend AWQ/GPTQ/EXL2, none of which
those backends run (AMD is a partial exception: on ROCm, AWQ and GPTQ are vLLM-only, so they are allowed **only on
cards vLLM's ROCm list names** — `vllmRocmSupported()`, the one copy, shared with the CLI; RX 6000,
RX 7600 XT and MI100 get GGUF only. vLLM's docs chart marks AWQ/GPTQ ❌ on AMD while its source
(`platforms/rocm.py`, `CMakeLists.txt`) supports both — when vLLM's docs and code disagree, read the
code). `backendFor(gpu)` + `formatAllowed(gpu, format)` (`lib/utils/gpu-page.ts`, derived from the
existing `type` field, not a new one to keep in sync across 63 rows) is the one place this is decided
now. **A fix at the source function does not fix a caller that duplicated the computation instead of
calling it** — the VRAM calculator's `getRecommendations` took a bare vram *number*, never a `GPU`,
so it silently carried both this bug and the Mac-capacity one below through an entire separate code
path with no shared function to fix. Grep for every place doing the same math before considering a
fix like this done, not just the function you already knew about.

**A Mac's unified memory is not fully usable, and the fraction needs a real source before it ships.**
`gpus.ts` marks Apple entries `isUnified: true`; for a long time nothing read it, so a Mac page's own
copy ("the GPU's share of unified memory, not the number on the box") disagreed with its own fit math,
which used the full nameplate figure. An audit's first proposed fix (a 67%/75% size-tiered split) had
no independent support when checked — real measurements of macOS's default `iogpu.wired_limit_mb` cap
cluster around a flat **75%** fairly consistently across machine sizes. `usableCapacityGB(gpu)`
(`gpu-page.ts`) is the one place this is applied; `gpu.vram` stays what's *displayed* as the machine's
real spec everywhere else — this is a usable-capacity ceiling for fit/headroom math, not a different
hardware fact, and a UI that shows both numbers side by side (the calculator's "your card" panel) has
to compute the verdict, the bar, and the quoted number all from the same one or they will disagree.

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

**The calculator's follow-up answers live in `lib/utils/calc-insights.ts`** (levels table, longest
context, speed ceiling) and may only call the shared sizing functions — never re-derive a threshold.
Sweep them over every card × model after any sizing change (the 2026-10-08 sweep script checks the
"Best fit" pick equals `fitsOnGpu`'s and each reach is maximal). **KV cache type** is `kvBytesPerValue`
on `CalcInput`; omitted = fp16 everywhere else on the site, so only the calculator ever passes it.
**Prompt-processing speeds are community measurements (`lib/data/prefill.ts`)** — llama.cpp's own
scoreboards, one row per card, keyed by GPU id (the build fails on an unknown id). Add a card only
from a scoreboard row; never borrow a sibling's figure unless the row names the chip without its
memory size, and keep odd orderings as reported.
**Calibrated generation speed is `lib/utils/measured-speed.ts`** — each card's scoreboard `tg128`
scaled by weight bytes; it answers only inside the range its check set covers (dense 7–33B,
`CALIBRATED_PARAMS_B`) — the linear scaling printed ~1,380 tok/s for a 0.5B. Widen the range only
with new `matrixData` rows in it, and keep `scripts/check-measured-speed.ts` passing. Ranking by
speed uses the card's bandwidth ceiling for every row, never "rows with an estimate first".
**Fine-tune memory is `lib/utils/finetune.ts`** — every constant there names its source in the
header comment; change one only with a new source, never to match a vendor's table (Unsloth's
lower QLoRA minimums come from their offloading, and the page says so). A total missing a term
(unknown vocab) is a floor: print it as "≥" and give no verdict.
**Multi-card capacity is `capacityGB(gpu, cards, extra)`** (`gpu-page.ts`) — `extra` is mixed cards on the
same backend; pass it through every insight (`levelTable`, `contextReach`, `offloadPlan`,
`rigSpeedCeiling`) or the panels disagree. Only `canStack()` types stack;
the speed bound never grows with card count (llama.cpp's default layer split is pipeline parallel).
**`rooflineTokS` mixes decimal GB/s with binary GiB of weights (~7% low) — leave it.** The owner
decided on 2026-10-08 not to change it (it would move 693 GPU-page figures); do not "fix" it unasked.
**Every MoE model needs an active-parameter count** — an `-A<n>B` label or `activeParams`, read via
`activeParamsB()`; the build fails otherwise. `rooflineTokS` lives in `lib/utils/roofline.ts` — import it from there in client code, or the GPU-page
prose generator rides along into the bundle.

**A link to the page you are already on does nothing here.** `useUrlQuery()` reads the query once,
after mount, so a client-side navigation to the same route with a new query changes the address bar
and no state — the calculator's reverse-mode "Calculate" links were dead for that reason
(2026-10-08). Set the state in an `onClick` and keep the href for new-tab clicks. Ignore URL ids the
data does not know (`?gpu=bogus` printed "nothing fits"), never keep them as state.

**A URL param is only real if the mode that reads it exists.** `?gpu=` on the VRAM calculator set
local state that only *reverse* mode renders; forward mode judges against the navbar hardware
profile, so a shared link carrying a card produced a size with no verdict. When adding a param,
follow it to the component that actually reads it in the mode the link opens.

**A periodic gap audit beats waiting for news.** The daily patrol only looks at the last ~7 days, so a
whole generation can slip past it — Qwen3.5/3.6 (the most-recommended 8–24 GB models of 2026) were
absent until 2026-10-10 while three Mac guides already named them. Compare the index against current
buying guides and HF trending, not only against release feeds.

**Adding models**

1. Prefer `lib/data/models-extra-8.ts` (or new `models-extra-N.ts` + import in `models.ts`).
2. Set `addedAt` to today when shipping a freshness batch.
3. Wire `hfRepoMap` in **`lib/data/hf-repos.mjs` only** (single source; `hf-repos.ts` re-exports).
4. Update `todayFeed` in `models.ts` if it should appear on the homepage picks — type only `level`
   and a short `note`; size and card are computed by `TodayBoard`, never typed.
5. Bump `dataLastUpdated` + top `changelog` entry in `lib/data/meta.ts`.
6. Counts need no edit — `MODEL_COUNT` and `/llms.txt` derive from `models.length`. **Guides are the
   exception**: their prose counts are typed, and `guideModelCountProblems()` fails the build until
   every "N of the M models" names the new total — then re-run the fit count N it quotes. **The gate
   only sees that one phrasing** — "51 of the models … and 60 load at all" (4060 Ti guide) drifted
   by 10 unseen, and zh sentences had their own wrong numbers; grep for any count near a card name.

**Superseding models** — set `status: 'superseded'` + `supersededBy`; do **not** delete (keeps
links/SEO). Card + detail show amber "Prefer {name}", with a reason from `supersededDiffNote()`
(`lib/utils/model-meta.ts`) — **checked against the successor's real fields, never a template
phrase**. It tries context length, falls back to quant-level count, and only reaches a generic
"still gets new builds" line when neither number favours the newer model. Pick the `supersededBy`
target itself with the same care: the first pick for Command R 35B (context 131K) was a model with
*less* context (41K) — checking the actual numbers before writing the reason caught it, and the
target was swapped for one genuinely longer (262K). **The successor must also fit what the legacy model
fit** — Gemma 2 9B (6.5 GB) → Gemma 3 12B (8.8 GB) would have told 8 GB readers to "prefer" a model
their card cannot hold; it points at Gemma 4 E4B instead (2026-10-03). If the only reason
`supersededDiffNote()` can give is its generic line, do not supersede. `/quant-hub/` hides superseded models by default
(`?legacy=show` brings them back) — **never `noindex`** them, they keep their SEO value and their
pages still 200.

**A ranking function must exclude superseded models, or the "prefer something else" banner
contradicts the site's own front page.** `homePicks` — behind the homepage hero and every `/best/`
tier — had never been told a model could be off the table, so Qwen2-VL-7B (superseded since
2026-08-08) held the `multimodal` recommendation on 34 of 61 GPU pages, and marking DBRX
Instruct/StarCoder2 15B legacy immediately made them start winning the `code` slot too. Filter
`isSuperseded()` out of the candidate pool in any function that recommends rather than lists —
`fitsOnGpu` itself stays untouched, since "does this fit" and "what should you run" are different
questions and a legacy model's own GPU page should still say honestly that it fits.

**Measured confidence** — models in the site-side benchmark set (see `MEASURED_MODEL_IDS` in
`model-meta.ts`) with `speedRTX4090` default to **measured**; otherwise **estimated** unless
`confidence` is set explicitly.

**A native format's nominal rate is not the file's rate.** MXFP4 is 4.25 bits on the MoE experts
only; GPT-OSS's attention and embeddings are wider, so its rows carry the *effective* bpw from the
real file size (4.63 / 4.34, llama.cpp discussion #15396). Derive `bpw` from a file size whenever one
exists; a format's headline number understated GPT-OSS 20B by ~1 GB for two months.

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

**One model matcher: `lib/utils/model-search.ts`** — the Hub filter and the calculator search both use
`modelMatchesQuery()`; extend its alias map (Chinese words included) rather than adding a second
matcher. A one-character query word must be a whole word of the name, and loose (punctuation-free)
matching starts at 4 characters — both rules exist because shorter matches hit every Q4 build or
crossed a dash ("27b" ⊂ "wizardlm-2 7b").

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

**Internal links are computed from relationships, never listed.** `guidesForGpu()` gives every GPU page its guides by reversing `gpuPreset` (a new guide's preset is what makes card pages link it). `ModelPlacement`
(`model-placement.ts`) and `GuideReferences` (`guide-references.ts`) join models ↔ hardware ↔
formats ↔ `/best/` ↔ guides out of data the site already holds, so the graph cannot rot. Measure
before and after by crawling `out/`, excluding hrefs present on >90% of pages (that is the nav and
footer, and it hides everything): the target is **no content page under 3 inbound**, and anchor text
is always the target's own name — never "here" or "this page".

**A model page sizes the model as released.** `referenceQuant()` (`lib/utils/quality.ts`) is the
only place that picks the level a model page is sized at — native (`MXFP4`) first, then GGUF
Q4_K_M, then Q4_K_S / Q4_0 (2026-10-16), and only then the highest-quality build. Do not re-type `quants.find(q => q.level === 'Q4_K_M')` in a new model-page component; that
copy existed four times and GPT-OSS pages described MXFP4 while sizing Q4_K_M. **"Smallest card"
means a size, not a database position**: sort with `bySmallestCard` (nameplate VRAM, retail first,
lowest bandwidth), say how many cards share it, and never let a CPU/RAM row stand in for a card.

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
switch is `GGML_CUDA=ON` (CMake only warns about an unknown `-D`, so a misspelt flag yields a
successful CPU-only build; the old `LLAMA_CUDA` is mapped with a warning, `LLAMA_CUBLAS` errors); the binaries are `llama-server` / `llama-cli`, not `server` / `main`; Windows's
**System Memory Fallback** silently spills VRAM into system RAM, turning an OOM into a mysteriously
slow model; and `ollama ps`'s `PROCESSOR` column is the only usable GPU check on a Mac, where
unified memory leaves no separate VRAM figure to watch — over Metal's budget Ollama **splits** the
model (`metal_partial_offload` in `server/sched.go`, shown as `x%/y% CPU/GPU`), it does not refuse it. **Since Ollama v0.40.0 (Latest from 2026-10-07) Apple Silicon runs MLX-supported
architectures on MLX by default** (Qwen3.8, Gemma 4, Qwen3.6, Qwen3.5 per the release notes) — this site's
GGUF sizes are then a guide, not exact, and Ollama publishes no MLX build sizes; do not invent one. WSL2 (re-checked 2026-10-02 from Microsoft's
WSL docs, NVIDIA's CUDA-on-WSL guide and Ollama's `install.sh`): VM memory defaults to 50% of host
RAM; `[boot] systemd` defaults **off**, and Ollama's installer then starts no service; `apt install
cuda`/`cuda-drivers` installs a Linux driver over the passthrough stub (`cuda-toolkit-12-x` only);
in default NAT mode nothing on the LAN can reach a WSL server — only mirrored mode exposes it.
**Ollama on native Windows runs AMD Radeon** (re-checked 2026-10-03, `docs/windows.mdx`/`gpu.mdx`):
ROCm on RX 7600–7900 with a ROCm 7 driver, Vulkan (default-on) for the rest incl. RX 6000; Windows
10 22H2+, NVIDIA ≥ 551.61. In a `powershell` code block never write `curl -d` — Windows PowerShell
5.1 aliases `curl` to `Invoke-WebRequest`; use `Invoke-RestMethod` or `curl.exe`. Nor `^` line continuations (cmd only; PowerShell's is a
backtick) — when a block must work in both, write the command on one line.

**DGX Spark is `type: 'nvidia-unified'` (backend `cuda`), never `isUnified`** (2026-10-05): `isUnified`
means macOS's ~75% wired cap, which DGX OS does not have and NVIDIA gives no fraction for. Capacity is
the nameplate; what changes is that nothing past **100%** loads — CPU, GPU and OS share the one pool,
there is no host RAM to spill into — via `tightCeiling(gpu)`. Any new `getVerdict` call that can
return yellow must pass `tightCeiling(gpu)` as its third argument. GB10 is arm64 and CC 12.1: llama.cpp
needs CUDA ≥ 12.9 for native kernels (`:server-cuda13`, not `:server-cuda`), and `--n-cpu-moe` saves
nothing there.

**Intel Arc is `type: 'intel'` / backend `'sycl'`, GGUF only** (2026-10-03): llama.cpp SYCL lists A770/A750/B580
as verified; Ollama runs Arc via Vulkan; vLLM XPU's quantized-format coverage on consumer Arc is unchecked,
so `ALLOWED_FORMATS.sycl` stays `['GGUF']` until someone reads vLLM's XPU source. Intel containers pass
`/dev/dri` only — `/dev/kfd` is AMD's and Docker refuses a device that does not exist.

**A GPU database gap forces an honest substitution, stated in the text.** `m1-8gb-ollama-limits` once
sized against the Mac M3 8G row because there was no M1 entry, and said so — 8GB is 8GB, bandwidth is
not. The M1/M2/M4 base rows now exist (2026-10-02) and the guide uses `m1-8`; the rule stands for the
next gap. Never silently borrow a different card's row without naming the substitution and where it
breaks. A bandwidth Apple does not state directly (the M1's, derived from its "M2 is 50% faster" and
"M1 Max is nearly 6×" statements) carries a `bandwidthNote` saying so.

**A quoted verdict must match `calcVRAM`'s own threshold, checked, not assumed.** **And re-run a guide's numbers after any arch fix** — the build now does part of this: `guideFigureProblems()` fails it when a guide sentence naming model + level + context + GB disagrees with `calcVRAM` by >0.3 GB (it cannot see verdict words or counts, so still read those) — the 2026-09-30 corrections moved three figures in the 8GB guide and pushed one row over the 88% line without anyone touching the guide. A guide called
GGUF Q4_K_M "the sweet spot" for a 32B model on a 24GB card; run through the calculator it is 90% of
the card — this site's own `tight`, not `comfortable`. Run the number before writing "fits" or
"comfortable" into prose, the same rule as the VRAM-guide fault from 2026-09-08.

**A `<title>` template needs a length check, not a one-time count.** The audit that flagged 33 pages
over 60 characters was already stale by the time it was fixed — the index had grown, and the actual
export had 63, across five templates the audit never named (homepage, `/best/`, `/formats/`,
`/tools/`, `/faq/`, `/changelog/`). Audit by walking `out/**` and measuring, not by trusting a
count written down earlier. Model titles go through `modelPageTitle()` and cookbook titles through
`articlePageTitle()` (`lib/seo.ts`) — a short-tier fallback, never a runtime ellipsis. `Article`
carries an optional `seoTitle` for the rare guide whose real title is long on its own; it changes
only the `<title>` tag, never the visible H1.

**llama.cpp multi-GPU defaults (2026-10-02, `docs/multi-gpu.md`, `common/common.h`):** `-ngl` defaults
to `auto` and `--fit` is **on**, keeping 1 GiB free per device and adjusting only unset args — a model
within a couple of GB of the limit silently loses layers to the CPU. Guides pass `-ngl all` and an
explicit `-c` (omitting `-c` starts from the trained context). `--tensor-split` is optional
(proportional to memory); `row` is deprecated, `tensor` experimental.

**Nginx config in guides targets the distro package, not mainline:** Ubuntu 22.04/24.04 ship 1.18/1.24,
so no `http2 on;` (1.25.1+) — use `listen 443 ssl http2;`. Checked in nginx source tags 2026-10-03.

**A container port is exposed by its mapping, not by the bind inside the container.** A bare
`-p 8080:8080` publishes on every host interface and Docker's iptables rules bypass ufw; every
generated mapping is `127.0.0.1:` and carries `exposureNote`. Native servers bind loopback too —
`vllm serve` listens on all interfaces unless given `--host`.

**`llama-cli` is a chat program now (re-checked 2026-10-03):** `-p` alone answers then waits for input —
add `-st` for one turn, or use `llama-completion -no-cnv` for raw text; it no longer prints timings
(`--perf` defaults off), so measure speed with `llama-bench` (`pp512` / `tg128`). `llama-imatrix -o`
needs a `.gguf` extension or it writes the legacy format. `-t` unset already means physical cores — never write `-t $(nproc)` (vCPUs/hyperthreads).

**llama.cpp facts re-checked 2026-10-02** (`docs/build.md`, `docs/docker.md`, source): the offload log
line is `load_tensors: offloaded N/N layers to GPU` (not `llm_load_tensors:`); HIP builds use
`HIPCXX=… -DGPU_TARGETS=gfx…` and require ROCm ≥ 6.1; the repo and images live under `ggml-org`;
**`ghcr.io/ggml-org/llama.cpp:server` is CPU-only** — GPU commands need `:server-cuda` / `:server-rocm`.
**Since v0.7.0 (2026-10-15) `llama-server` defaults to port 9931, not 8080** (Docker images keep 8080
inside the container) — every command here must keep passing `--port` explicitly; never write "8080 by default".

**Server-stack commands go stale faster than anything else here.** Verified 2026-09-12 against the
projects' own docs: vLLM's entrypoint is **`vllm serve`** (not `python -m
vllm.entrypoints.openai.api_server`) and it installs with `uv pip install vllm --torch-backend=auto`;
it ships official **ROCm** wheels plus XPU/TPU backends. ExLlamaV2 now lives at
**`turboderp-org/exllamav2`** and its example passes `-gs auto`. **TabbyAPI's own README says it is
a hobby project "not meant to run on production servers"** — quote the maintainers rather than
softening it. vLLM's KV-pressure signature (re-checked 2026-10-03 in V1 source) is a `Preemptions: N` count in the
periodic stats log line and the `vllm:num_preemptions` metric — the `PreemptionMode.RECOMPUTE`
warning was V0, which is deleted. Shorten `--max-model-len` before raising
`--gpu-memory-utilization`. `uv pip install` needs a venv (`uv venv --python 3.12 --seed`) — every
install snippet creates one. AutoAWQ is deprecated (vLLM points to `llm-compressor`).

**GPT-OSS facts (llama.cpp discussion #15396, 2026-10-03):** official command uses `--jinja`; reasoning
effort is `--chat-template-kwargs '{"reasoning_effort": "low|medium|high"}'`; sampling temperature 1.0 /
top_p 1.0 with no repetition penalty; `--n-cpu-moe N` keeps N layers' experts on the CPU (RTX 2060 8GB
example: 16). Its memory table runs ~2 GB above `calcVRAM` because it uses `-ub 2048` compute buffers.

**EXL2's runtime is archived (checked 2026-10-02).** ExLlamaV2's README says so; TabbyAPI (main,
no tags) and text-generation-webui load EXL3/FP16 only. EXL2 still runs locally via
`examples/chat.py` — say that, never present a server for it. EXL3 is not tracked (0 models); do not
size it from EXL2 figures. **Hugging Face's CLI is `hf`** — `huggingface-cli` no longer exists in
`huggingface_hub` (console_scripts is `hf` only), and there is no `[cli]` extra. EXL2/EXL3 bitrates
are repo **branches** (`--revision 4.65bpw`), not file patterns.

**`speedRTX4090` is one card's number — label it wherever it is printed.** It is the only per-quant
speed field, and a GPU page's fit table headed it "tok/s", presenting 4090 speeds as the RTX 4060's.
Any new surface printing it names the RTX 4090; a card's own speeds come only from `matrixData`.

**`speedRTX4090` is gated at build time.** A row the 4090 cannot hold (`vramGB > 24`) or a dense row
faster than `1008 / (params × bpw / 8)` × 1.15 fails `dataProblems()`. MoE is recognised **only** by
`paramLabel` (`-A\d` or `MoE`) through **`isMoE()`** (`lib/utils/model-meta.ts`) — label a new MoE model that way or
the gate treats it as dense, and never re-type the regex (the bandwidth ceiling had its own `/A\d/` and missed every `… MoE` label).
**Check `params` is the total, not the active count**: Jamba 1.5 Mini shipped as `12` (its active
figure) and was sized at a quarter of its real weights.

**Every printed `speedRTX4090` carries `<ConfidenceTag>`** (`components/ui/ConfidenceTag.tsx`) unless
it is measured — 73 of 83 models' speeds were never run here. A new surface that prints a speed adds
the tag; a comparison names a faster side only when both figures are measured.

**Quote only throughput this index measured — and from the right row.** `docker-ollama-gpu` cited
the RTX 4090's 218 tok/s as "measured in Ollama at Q4_K_M"; it is the vLLM AWQ row (llama.cpp
Q4_K_M is 148). Match model + hardware + framework + quant before attributing a figure.
 `rtx4090-vllm-api` claimed "~1400 tok/s (batch=8)",
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

**"GPUs" is `GPU_COUNT`, never `gpuDatabase.length`.** Four rows are CPU-only RAM sizes (`isCPU`), so
the raw length advertised "63 GPUs" for 59. Use `gpuDatabase.length` only where a number must equal
the rows actually rendered (an `ItemList`, a "show all N" list).

**"Consumer GPU" is not `type`.** `type: 'amd'` also covers the Radeon PRO W7900 and Instinct MI100,
so "the largest consumer card" returned a workstation card. Filter on the name (`/^Radeon RX/`)
alongside `nvidia-consumer` when the question is "what should I buy". Same for Intel: `type: 'intel'` includes the Arc Pro B70
workstation card (2026-10-08) — consumer/retail filters exclude `/Arc Pro/` by name.

**Adding a route means touching three places** — the route, its `/zh` mirror, and `app/sitemap.ts`.
`/tools/` and `/changelog/` shipped as pages and sat outside the sitemap until `/faq/` was added.

**`robots.txt` is `public/robots.txt`, a static file — there is no `app/robots.ts`.** The typed
`MetadataRoute.Robots` convention file cannot emit comment lines, and the acceptance bar here
requires one (a pointer to `/llms.txt`) — so a build-time route added nothing over a static file for
content that never varies per-request. Edit the file directly; there is no data it derives from.

**A sitemap `lastmod` must be the date that page's own content changed, not the day the site
rebuilt.** Every URL sharing `dataLastUpdated` is the same "carries no information" fault as a
uniform meta description — model pages use `addedAt`, guides use `articleModifiedAt()`,
`/legal/`/`/privacy/` use their real last-edited date (hardcoded from `git log`, since they are
hand-written and do not move with a data ship). Derived pages (GPU, `/best/`, format, tool, FAQ, hub
index) take the latest `addedAt` across models + GPUs or **`sizingChangedAt`** (`meta.ts`) — bump that
constant when sizing/arch/fit rules/prose generators change without an `addedAt`. Only home,
`/changelog/` and `/about/` carry `dataLastUpdated` (2026-10-08: the old rule made IndexNow submit
354 of 460 URLs on a runtime-version-only day; now 8).

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

**A new GPU row carries `addedAt`** (2026-10-05, the day it ships, `YYYY-MM-DD`) — it is what puts new
hardware into the homepage "Latest additions" beside new models (`latestEntries()`); a row without it
never reaches the homepage. Back-fill only from `git log -S`, never from memory.

**Adding a GPU costs one line and needs only its VRAM** — but a verified `bandwidth` is what makes
its page differ from its same-capacity siblings. `GPU` carries `{ id, name, vram, type, bandwidth?, memType? }`
and only `vram` reaches the sizing math, so a card is addable the moment its capacity is confirmed —
no architecture, no benchmarks. Do confirm it: a card whose VRAM is a guess generates a whole page
of guesses. The RTX 5050 and RX 9060 XT waited until official spec pages could be read (2026-10-02, via
web search restricted to nvidia.com / amd.com — the spec sites themselves are blocked here); the
5050's data rate was not stated, so it ships with no `bandwidth` rather than a computed guess. Keep `gpuSlug()` dot-free,
and expect the page to say "no benchmark runs recorded on this card" unless `matrixData` has a row
whose hardware string resolves to it.

**A 404 page's real HTTP status is the one thing to verify, never assume, in a static export.**
`not-found.tsx` has no server request context — Cloudflare Pages only returns a genuine 404 if it
falls back to `404.html` with that status code rather than rewriting to a 200 SPA shell, and nothing
in this repo proves that on its own. Simulate the host's actual fallback locally (serve the real file
when one exists, else `out/404.html` with a 404 status) and check with a headless browser, not by
reading the config. The same test answers the other assumption worth checking: a single global
`not-found.tsx` renders both languages correctly because `usePathname()` reads the real browser
address bar on hydration, independent of which static `404.html` the host served — confirmed by
loading a `/zh/**` 404 and checking `<html lang>` and the visible text, not inferred from the i18n
architecture in the abstract.

**A green build proves the export is internally consistent, never that a change actually shipped.**
QTZ-008 (homepage hero rewrite) was reported complete and every build since kept passing — because
the postbuild gate checks trailing slashes, `zh` leaks and `undefined` text, none of which a stale
hero has anything to do with. The source file was simply never edited, so the "old" H1, CTA and
`<meta name="keywords">` rode along unchanged through commit after commit, invisible to `git diff`
against a written record that claimed otherwise. **A "done" status is only as good as the last time
someone read the actual rendered `out/**` HTML and compared it to the claim** — for anything
content-specific (hero copy, a CTA's `href`, a meta tag), that means `grep`-ing the built file, not
trusting a prior changelog entry, a prior session's summary, or your own memory of having done it.

**Verify a report's own citations before acting on it, especially when it says "don't re-check."**
A request arrived citing `scripts/audit-site.mjs`, `data/incoming-architecture.json`, a task-book
"Appendix D", and a "QTZ-045" — none of which exist in this repository or in the task book on file,
alongside one instruction to use pre-collected data "directly, don't re-fetch it." Two independent
`find`/`grep` passes confirmed the files are not here. The request's substantive claims turned out to
be genuinely mixed: some real and actionable (the homepage hero above; ExLlamaV2 having stalled,
confirmed by an actual fetch to its release page), one simply wrong (a "79 vs 81" homepage/Hub count
mismatch — two different, correctly-computed numbers, not a regression), and the file references
outright fabricated. Treat every specific, checkable claim in a report as a claim to check, not
an instruction to skip checking — particularly the ones that come bundled with "just use this, don't
verify it," which is exactly the situation this site's own no-fabrication discipline exists for.

**Page prose for a set of 80+ pages is generated, not written — and must vary with the data.**
`modelExplainer()` (`lib/utils/model-explainer.ts`) builds each model page's sections and FAQ from
that model's own row. Write the sentences as conditionals on real facts (smallest fitting card,
format count, MoE, hybrid attention, whether a perplexity or speed figure exists), never as one
template with a name substituted, and measure the result: the model pages sit at mean 0.500 5-gram
Jaccard, worst pair 0.755. The visible FAQ and the `FAQPage` schema come from the **same call**, so
they cannot diverge.

**A guide's "last changed" date has one definition: `articleModifiedAt()`** (`lib/utils/article-dates.ts`).
The byline, JSON-LD `dateModified` and the sitemap each had their own rule, and the sitemap's ignored
`updatedAt`. Anything new that needs a guide's modification date calls the helper.

**`updatedAt` and `verifiedAt` are different claims.** `verifiedAt` = commands re-run; `updatedAt` =
content changed. `dateModified` prefers `updatedAt`. Removing an unearned `verifiedAt` used to strip
the page's only modification date, which made a freshly corrected guide look staler than an
untouched one — set `updatedAt` when you rewrite a guide.

**Counts come from the data, never from a string.** `MODEL_COUNT` (`lib/seo.ts`) derives from
`models.length`, and `app/llms.txt/route.ts` is generated like `feed.xml`. The number used to be
typed into six files and `public/llms.txt`, so a model batch meant editing six strings and
forgetting one left the site advertising a count it no longer had. Step 6 of "Adding models" is
therefore gone — there is nothing left to refresh by hand.

**A meta description has a width budget: 160, with CJK counting double** (`displayWidth`,
`DESCRIPTION_BUDGET` in `lib/seo.ts`). `pageMetadata()` fits by whole sentences automatically; a
hand-rolled `generateMetadata` must call `fitDescription` itself, and a one-sentence template the
fitter cannot shorten has to be written short. Measure `out/**` after any template change.
**It has a floor too: under 100 width fails the build** (Bing flagged "too short", 2026-10-12 — a
79-character Chinese description is 158 width but reads as short by character count). Model, GPU
and guide descriptions come from `lib/utils/meta-description.ts`, which lengthens with
`extendDescription()` using facts the page itself states — never filler; extend a hand-written
one by writing a second true sentence, checked against the page.

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
release pages. From this environment `api.github.com` and direct `curl` to github.com are blocked for
repos outside the session; `WebFetch` of the releases/tags page works — take versions from a
**verbatim tag list**, not a summarised "latest" (one summary invented `v0.5.0` for llama.cpp),
and skip anything marked Pre-release.

**MLA models are sized as llama.cpp stores them.** An MLA layer caches one `kv_lora_rank +
qk_rope_head_dim` vector (576 for DeepSeek-2-style) and no V, so encode `kvHeads: 1, headDim: 288`
and say so in a comment. The DeepSeek V3/R1/V2-Lite entries were brought in line on
2026-09-30. A legacy GGUF (unsplit `attn_kv_b`) caches full K/V instead — far more; say so in the
model's description rather than sizing for it. When no GGUF file size is reachable, use the generic bpw and mark the
row `estimated`; never type a plausible size.

**Sliding-window layers are sized at what llama.cpp allocates, not the bare window.** With the
default `swa_full = false`, an SWA layer holds `pad256(n_swa + n_ubatch)` cells (`llama-kv-cache-iswa.cpp`),
so `windowTokens` is 1536 for Gemma 3 (window 1024), 4608 for Gemma 2 (4096), 768 for GPT-OSS (128),
8704 for Llama 4 (chunked, 8192). Phi-3's SWA is *disabled* in llama.cpp — check `src/models/<arch>.cpp`
for the arch before encoding a window from `config.json` alone.
Set `fullLayers` explicitly alongside `windowLayers` — it defaults to *all* layers. When the full
layers use a different head layout from the window layers (Gemma 4: 4 × 512 global vs 16 × 256
local on the 31B), set `fullKvHeads` / `fullHeadDim`; `kvHeads` / `headDim` then describe the window
layers. Per-size Gemma 4 configs: transformers `models/gemma4/convert_gemma4_weights.py` `_VARIANTS`
— a conversion script is often the only reachable copy of every size's real config. A reachable source
of real `config.json`s: `mlc-ai/mlc-llm` `python/mlc_llm/model/model_preset.py`; for Gemma,
`google-deepmind/gemma` `gemma/gm/nn/_gemma.py`. transformers' config defaults describe one
reference checkpoint, often not the size in this index.

**Cross-layer KV sharing (Gemma 3n/4 E-models) is encoded by leaving the shared layers out.**
llama.cpp's `reuse` callback (`llama-model.cpp`, GEMMA3N/GEMMA4) allocates no cache for layers ≥
`n_layer_kv_from_start`, so `fullLayers` + `windowLayers` count only the leading layers that keep
one — summing to less than `layers` is correct, not a bug. Per-layer embedding tables are
`LLM_TENSOR_LAYER_INPUT` and stay in system RAM under llama.cpp; `params` still counts them (it is
the total), and the description states the VRAM that saves on a discrete card.

**A lazily-read lookup table is not VRAM, so it is not in `params`.** Qwen3.8-Flash-Next's 51B n-gram
table is loaded by llama.cpp as `per_layer_tok_embd` with `TENSOR_READ_LAZY` (host/mmap, can stay on
SSD); counting it would size the model ~30 GB above what any card holds. `params` there is the 125B
trunk and the description says where the table lives and that downloads include it. This is the one
exception to "params is the total" — Gemma's small PLE tables are still counted (conservative).
Check `src/models/<arch>.cpp` for `TENSOR_READ_LAZY` / LAYER_INPUT before excluding anything.

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

**`changelog` in `meta.ts` is for readers; README §9 is for maintainers.** It renders on `/changelog/`,
both feeds and the homepage. Write what changed for someone using the site — no ticket ids, function
or file names, "the audit said", or process narration — and keep it to a few sentences. The
engineering detail (sources, before/after figures, what was deliberately not done) goes in README §9.
The feed's item `<title>` is the entry's **first sentence** (`headline()` in `lib/feed/build.ts`) —
so lead each entry with a sentence that stands alone as a headline.

**A ship is not done when the code is right.** `lib/data/meta.ts` is part of the change, not
paperwork after it: a commit that alters behaviour but leaves `dataLastUpdated` and `changelog`
untouched is invisible on the site's own three cadence surfaces, and leaves the "last updated" date
pointing at an older ship — which then misleads anyone verifying a deploy. This has now been missed
twice; check `git show --stat` for `lib/data/meta.ts` before calling a batch complete.

Home **Weekly updates** (`components/home/WeeklyUpdates.tsx`) + Hub `?recency=recent` +
`/feed.xml` are the three surfaces that should reflect every cadence ship. **Any "newest N" list must
sort by `addedAt` before slicing** — file order put the feed's 20 models in June/July for two months.

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
lib/data/models-extra-*.ts  # model packs (currently through extra-12)
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

Cloudflare **Pages** not Workers · output dir `out` not `.next` · `www` → apex is a dashboard Redirect Rule (2026-10-12), not `_redirects` (it cannot match on host) · Next.js ≥ 14.2.35 ·
if a deploy command is forced, use `true` (not `done`). · No required env vars for build
(optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` defaults to `quantized.uk` in code).

## Icons & OG

Master app mark is `public/icon.svg`; regenerate PNGs with the bundled Chromium recipe in
README §10 (this env has no ImageMagick/sharp). Update all sizes together after editing the SVG.
Also keep `public/favicon.svg` in sync when the mark changes.

**OG:** master text lives in `public/og.svg`; ship `public/og.png` for social (platforms ignore SVG).
After changing model-count copy in `og.svg`, re-render PNG via README §10 so shares stay accurate
(use `headless_shell`, not `chrome --headless`, or the PNG gets a black bottom band). The card's
format badges follow `SHIPPED_FORMATS` like the hero — HQQ (0 models) was removed 2026-10-03.

## Grok Bot change log (read before editing)

The owner also runs **Grok Bot**, a second agent that can open PRs here and change
the site's Cloudflare account. Every change it makes, merged or not, is listed below
so Claude knows what it did and does not undo or duplicate it. Grok Bot commits are
authored as `sheephess9527 <sheephess9527@users.noreply.github.com>` (Claude's are
`Claude`). Grok Bot never pushes to `main`; it opens draft PRs for the owner to merge.
Newest first. Times are CST (UTC+8).

| When (CST) | Where | Change | Status |
|------------|-------|--------|--------|
| 2026-10-17 11:50 | PR #10 → main (squash) | Duplicate check vs main (after #8) + live site: Beam 1.0 501B-A23B new (no Reflection/Beam id, name or HF repo). Branch updated by merging main (no force push): Beam now model 110, `todayFeed` id 20 → 21 (20 = Ling), README §9 heading (ii) → (iii), denominators 109 → 110, Q4_K_M "104 of the 110"; fit counts re-run with `countModelsFitting()` (only M5 Ultras move, unquoted). `tsc` + `npm run build` green. | Merged |
| 2026-10-17 10:30 | PR #10, branch `model-tracker/2026-10-17` | +1 model (109): Beam 1.0 501B-A23B (Reflection AI, open weights 10-16, Apache 2.0). `models-extra-12.ts`, `models.ts` (`todayFeed` id 20), `hf-repos.mjs`, `meta.ts` changelog, guide denominators 108→109 in `cookbook-extra-2.ts` / `cookbook-rewrites.ts` (no card's fit count changed except the M5 Ultras, which no guide quotes), this file, README §9 "2026-10-17 (iii)". Note: the 10-17 runtime patrol listed Beam weights as "not out"; they went public 10-16. | Merged (see 11:50 row) |
| 2026-10-17 11:35 | PR #8 → main (squash) | Owner asked to merge #8/#9/#10 only if not duplicates. Duplicate check vs main + live site (ids, names, family, HF repo): Ling-3.1-flash new. Branch updated by merging main (no force push): conflicts resolved, `todayFeed` id 18 → 20 (18 = Nemotron Bolt on main), `addedAt`/changelog date → 2026-10-17, guide denominators 108 → 109 and Q4_K_M "104 of the 109" re-run with `countModelsFitting()` (no comfortable count moved). `tsc` + `npm run build` green. | Merged |
| 2026-10-17 11:35 | PR #9 (draft), branch `model-tracker/2026-10-16` | Not merged: duplicate. Both models (Nemotron 3.5 Bolt 74B-A9B, Super VL 120B-A12B, same ids) and the IQ2_XXS level already reached main via Claude commit `ccf2f4c` (10-16) and are live. Left open for the owner to close. | Not merged (duplicate) |
| 2026-10-15 10:30 | PR #8 (draft), branch `model-tracker/2026-10-15` | +1 model (103): Ling-3.1-flash (inclusionAI, weights 10-13; the 10-15 patrol missed it). `models-extra-12.ts`, `models.ts` feed, `hf-repos.mjs`, `meta.ts` changelog, "of the 102" → "of the 103" in `cookbook-extra-2.ts` / `cookbook-rewrites.ts` (no comfortable count moved; only M5 Ultra 512 tight 101 → 102, not quoted in any guide), CLAUDE.md surface count + Recent ships row, README §9 entry. Details in README §9 "2026-10-15 (ii)". | Merged (see 2026-10-17 row) |
| 2026-10-14 | PR #7, branch `grokbot/calc-share-card` | Calculator: 'Save result as image' (new `components/tools/ShareCard.tsx`) draws a 1200×630 PNG on a client-side canvas — model, level, context, total/weights/KV, card + verdict, calibrated speed when available, 'estimate' label, bilingual. No server image endpoint (zero Cloudflare requests). | Merged |
| 2026-10-14 | PR #6, branch `grokbot/calc-launch-commands` | Calculator: inline copy-ready launch commands (new `components/tools/LaunchCommands.tsx`) under the forward result — llama.cpp / Ollama for the GGUF level, vLLM for the model's AWQ/GPTQ level (hidden on Macs). All text from `generateCLI` (no second generator); `-ngl` follows `offloadPlan` when the model spills to RAM. The cli-gen link stays for Docker/API-key options. | Merged |
| 2026-10-14 | PR #5, branch `grokbot/calc-reverse-reach` | Calculator reverse mode ('I have this card'): one row per model by default (best-quality level that fits, green over tight; `?all=1` or the checkbox shows every level), quality sort ranks larger models first in that view, each row shows its longest context via `contextReach`. `getRecommendations` speed sort now uses the picked card's calibrated `measuredSpeed` (was always the RTX 4090 figure) — also affects the Hub's use of it. | Merged |
| 2026-10-14 | PR #4, branch `grokbot/calc-measured-speed` | Calculator: generation speed calibrated on each card's measured llama.cpp `tg128` (same scoreboard rows as `prefill.ts`, new `tg128` field on all 59 rows), scaled by weight bytes vs Llama 2 7B Q4_0 (3,825,807,040 B). New `lib/utils/measured-speed.ts`; dense GGUF single-card only (MoE declined: 0.24× on the two MoE check rows). Range 0.99–1.31× from 9 dense `matrixData` rows, enforced by `npx tsx scripts/check-measured-speed.ts`. Shown green under the roofline line in forward mode and as '~n tok/s est.' on reverse rows. | Merged |
| 2026-10-14 10:45 | PR #3, branch `grokbot/changelog` | Added this "Grok Bot change log" section to CLAUDE.md (docs only). | Merged |
| 2026-10-14 10:18 | PR #2, branch `model-tracker/2026-10-14` | +1 model (102): LFM2.5 24B-A2B (Liquid AI, 10-12). `models-extra-12.ts`, `models.ts`, `hf-repos.mjs`, `meta.ts`, guide counts in `cookbook-extra-2.ts` / `cookbook-rewrites.ts`, CLAUDE.md surface count + Recent ships row, README §9 entry. Details in README §9 "2026-10-14 (ii)". | Merged 2026-10-14 10:35 |
| 2026-10-11 16:18 | Cloudflare DNS (all 18 zones incl. quantized.uk) | Added CNAME `ebc5ce3f6be75133297487ea1658d368.<zone>` → `verify.bing.com`, DNS only, comment "Bing Webmaster verification". Needed for Bing Webmaster site ownership; do not delete. No other record, rule or Pages setting was changed. | Live |
| 2026-10-08 | Cloudflare WAF | Drafted a scanner-block custom rule; **nothing applied**. All zones still have 0 custom rules. | Not applied |

## Recent ships (summary for context)

| When | Commit theme |
|------|----------------|
| 2026-10-18 | **Runtime versions + feel-page build fix** — llama.cpp b11716, Ollama v0.40.6 (q2_0 GGUF type), ExLlamaV3 1.6.3; owner commit 3d7bcc9 failed the 100-width description floor on `/zh/tools/feel/` (fixed; EN route given its own metadata); Granite Switch 4.1 skipped (adapter bundle, no GGUF) |
| 2026-10-17 (iv) | **Calculator check + split-file downloads** — 82,012-case sweep 0 faults, 8 newest models checked in the UI; llama.cpp download for builds > 48 GB asked for one exact filename that sharded repos do not have (fetched nothing) → pattern + `find`; Ling's AtomicChat repo (`AD-` names) → placeholder |
| 2026-10-17 (iii) | **+1 model (110): Beam 1.0 501B-A23B** (Grok Bot PR #10, updated onto main after #8) — official config: 52 L, 9 full (NoPE) + 43 SWA-512 (iSWA → 1024 cells), 8 KV × 128, 256 experts top-8, 3 dense lead layers, attention gate; 501,267,612,352 params = safetensors total = unsloth BF16 GGUF tensor sum; Q2_K 2.91 (DevQuasar) → 190.9 GB @4K / 230 GB @1M, Q8_0 8.50 (unsloth); no plain 4-bit file (unsloth UD-* only), so no Q4 level |
| 2026-10-17 (ii) | **+1 model (109): Ling-3.1-flash** (Grok Bot PR #8, updated onto main) — inclusionAI (Ant Group), weights 10-13, MIT; shape from the official `config.json` (`bailing_hybrid`, llama.cpp `bailingmoe3`): 72 layers = 63 KDA + 9 gated MLA, MLA sized as DeepSeek-V3 (kvHeads 1 × headDim 288, `fullLayers: 9`); context 262144 (config; card's 1M has no scaling recipe); params = GGUF tensor total 563.95B (Hub 572.12B includes MTP); Q4_K_M 5.03 / Q8_0 8.52 bpw from AtomicChat's AD GGUF byte counts; 370.6 GB @4K → tight on M5 Ultra 512 only, red elsewhere; guide denominators 108 → 109 (counts re-run, none moved) |
| 2026-10-17 | **Runtime versions** — llama.cpp b11703; Ollama v0.40.6-rc1 skipped (pre-release); no model in the window (all already indexed) |
| 2026-10-16 (iv) | **+3 models (108): Granite 4.2 30B / 3B, Nemotron 3.5 Lightning 30B-A3B** — from owner-pasted configs + byte counts; all three reconcile with their BF16 GGUFs within 0.1%; Lightning Q4_0 19.8 GB @4K → 20.6 @128K (6 of 52 layers cache); quantize guide's "every GGUF model ships Q4_K_M" was false (103/108); duplicate `todayFeed` id fixed |
| 2026-10-16 (iii) | **+2 models (105): Nemotron 3.5 Bolt 74B-A9B + Super VL 120B-A12B** — owner pasted the HF configs + byte counts (HF blocked here); 88 L = 40 mamba / 40 moe / 8 attn, 2 KV × 128; counts reconcile (120.67 vs 120.76B BF16 file; Bolt 74.04B, recipe predicts its 22.0 GB file within 1%); Bolt 23.1 GB @4K is *tight* on 24 GB; `IQ2_XXS` added to the calculator tables. **When HF is blocked, ask the owner for config.json + file byte counts** |
| 2026-10-16 (ii) | **+1 model (103): Muse Spark Open 816B-A42B** — shape from transformers' `configuration_muse_spark.py` (62 L, 16 full + 46 SWA @2560 cells, 16 KV × 64); 815.8B + llama.cpp `attn_gate` 4.16B = 820B (GGUF figure); bpw from ggml-org file sizes (Q2_K 2.97, Q8_0 8.51); Q2_K 319 GB @4K → 512 GB Mac only. The morning's "too big" skip was wrong — size is never the bar (MiMo is indexed). Nemotron 3.5 Super VL still unverifiable |
| 2026-10-16 | **Runtime versions + llama-server default port 9931** — llama.cpp b11671 / v0.7.0, Ollama v0.40.5; all site commands already pass `--port`; Nemotron 3.5 Bolt 74B-A9B held back (Puzzle block layout only in its HF config, unreachable) |
| 2026-10-15 | **Runtime versions** — llama.cpp b11632, Ollama v0.40.4, ExLlamaV3 1.6.2; no model (Mistral Large 4 / Beam weights still pending; Granite 4.2 30B layer count unverifiable) |
| 2026-10-14 (ii) | **+1 model (102): LFM2.5 24B-A2B** — Liquid AI, released 10-12; shape read from the official `config.json` (40 layers = 10 `full_attention` + 30 `conv`, 8 KV × 64, 131072); params = Hub safetensors total 23.97B, 2.45B active from the card (explicit `activeParams`, label rounds to A2B); Q4_K_M 4.85 / Q8_0 8.51 bpw from Liquid's own GGUF byte counts; 15.3 GB @4K → green on ≥ 20 GB discrete / 24 GB Macs, amber on 16 GB; guide counts re-run (24/32 GB, 48 GB Mac, DGX Spark +1; 16 GB tight 72 → 73) |
| 2026-10-14 | **Review of Grok calculator PRs #4–#7** — tg128 spot-checked exact; calibrated speed limited to dense 7–33B (printed 1,381 tok/s for a 0.5B); speed sort by bandwidth ceiling for all rows (MoE sorted under 32B); `?all=1` now written by `syncUrl`; vLLM launch tab follows `formatAllowed()` |
| 2026-10-14 | **+1 model (101): Granite 4.2 8B** — gap audit (Aug release, dense `granite` arch); shape from IBM's card, 8.79B reconciled with the Hub's 9B; Q4_K_M 4.87 bpw from a published file's byte count, Q8_0 generic; 6.3 GB @4K → every ≥8 GB card +1; Intel Arc guide's zh counts were stale (52/41/34 vs 57/46/38); llama.cpp b11609 |
| 2026-10-13 | **Calculator: vision encoder + A/B pin + saved machines** — `CalcInput.extraGB` (entered or read from a GGUF repo's file list, never typed per model), pin-and-compare, `qz-rigs` in localStorage |
| 2026-10-13 | **Calculator: time to first token** — llama.cpp community `pp512` boards (#15013 CUDA, #15021 ROCm, #10879 Vulkan/Arc, #4167 Apple) for 59 rows, scaled by FLOPs/token; no row → no figure; mmproj sizes not verifiable here, not shipped |
| 2026-10-13 | **Calculator: mixed cards + serving + download** — `capacityGB(gpu, cards, extra)`, same-backend extras, speed 1/Σ(share/tokS); concurrent full-length requests at 0.85 — the share this site's vLLM commands pass (floor); file size params × bpw / 8 |
| 2026-10-13 | **Calculator: fine-tune mode** — QLoRA 4.127-bit base + 16-bit embeddings, LoRA fp32 adapters, full FT 18 B/param, activations 34·s·b·h (2·s·b·h with checkpointing), logits 10 B × tokens × vocab; LoRA within ~10% of Unsloth's published figures, QLoRA above their minimums (said on page); no vocab → "≥" and no verdict |
| 2026-10-13 | **Calculator: Hugging Face import** — paste a repo/link (GGUF → base model config); MLA, hybrid linear, sliding-window shapes parsed and checked identical to 7 index entries; share links carry numbers, not a re-fetch; live CORS unverified from here |
| 2026-10-13 | **Calculator usability** — shared model search (zh aliases, multi-word), one-tap starts (`homePicks` for the card / newest 24 GB-green), `POPULAR_GPU_IDS` shared with the homepage, vendor-grouped card lists, mobile sticky result bar |
| 2026-10-13 | **+1 model (100): Mellum2.1 12B-A2.5B** — JetBrains coding MoE; transformers + llama.cpp `mellum` (21 SWA + 7 full, 1536 cells); bpw from JetBrains' GGUFs; 8.6 GB @4K → 10/12 GB cards; 4060 Ti guide counts were 10 stale (ungated phrasing), 3 zh counts disagreed with en; llama.cpp b11577 |
| 2026-10-12 | **Meta descriptions lengthened** — Bing "too short": `/zh` median 79 → 101 chars via `extendDescription` + `meta-description.ts` (derived facts only); postbuild fails under 100 width; `formats.ts` `hardwareReq` was English on `/zh` → `{ en, zh }`. `www` 200-not-301 is a dashboard fix |
| 2026-10-12 | **+1 model (99): MiMo-V2.6-Pro** (owner request) — 1.02T-A42B, native MXFP4 (4.52 bpw from AesSedai's GGUF), 604 GB @4K fits no row (largest: 384 usable Mac / 320 on 4 × H100); 10 full + 60 SWA (768 cells), headDim 160 = mean of 192/128; no counts moved |
| 2026-10-12 | **Runtime versions** — Ollama v0.40.3, llama.cpp b11559; Kolibri-1 skipped (no llama.cpp arch) |
| 2026-10-11 | **Runtime versions** — llama.cpp b11552, ExLlamaV3 v1.6.1; no model in the window |
| 2026-10-11 | **+3 small Qwen3.5 (98): 4B, 2B, 0.8B** — 4B/2B params + bpw from bartowski files, 0.8B generic `estimated`; every card's count +3; Qwen3 4B/1.7B not superseded yet (would move homepage picks + 3 guides) |
| 2026-10-10 | **Gap audit: +3 Qwen (95)** — Qwen3.6 35B-A3B (23.4 GB @4K: *tight* on 24 GB, guides omit the buffer), Qwen3.6 27B, Qwen3.5 9B; params from Q8_0 file sizes, interval-4 hybrid layout as Qwen3.8 27B; 11 guide counts re-run per card |
| 2026-10-10 | **+1 model (92): Qwen3.8-Flash-Next** (reader suggestion) — llama.cpp `qwen4exp` merged 08-27 (10-07 skip missed the arch name); 12 attention layers + indexer cache (`fullHeadDim` 320); 51B lazy n-gram table excluded from `params`; generic bpw, `estimated`; Q4_K_M 79 GB → 128 GB Macs / Spark 128G |
| 2026-10-10 | **Runtime versions** — llama.cpp b11539, Ollama v0.40.2 (Latest; background model upgrade keeps a backup copy → extra disk, noted for readers). No model added: EmbeddingGemma 2 out of scope, Mistral Large 4 / Beam weights pending |
| 2026-10-09 | **+1 model (91): Muse Glimmer 30B** (Meta, Aug, Apache 2.0) — 27.85B incl. llama.cpp's attention gate (Meta: "28B decoder"); 13 full + 39 SWA (2560 cells); bpw from file sizes (Q8_0 → 8.50); CLI placeholder (filenames not derivable); llama.cpp b11514, Ollama v0.40.1 |
| 2026-10-08 | **Optimisation pass** — sitemap lastmods for derived pages from `addedAt` + `sizingChangedAt` (IndexNow: 354 → 8 URLs on a runtime-only day); 404 language switch no longer links `/zh/_not-found/`. Audit otherwise clean (links, console, 390 px) |
| 2026-10-08 | **+2 32 GB workstation cards (78): Radeon AI PRO R9700, Arc Pro B70** — vendor spec pages; R9700 in vLLM's ROCm list (AWQ/GPTQ ok); consumer filters exclude `Arc Pro`; ExLlamaV3 v1.6.0, llama.cpp b11480. Mistral Large 4 / Beam weights not out yet |
| 2026-10-07 | **Ollama v0.40.0 → Latest; MLX default on Apple Silicon** — 3 Mac guides note GGUF sizes are a guide for Qwen3.8/Gemma 4/Qwen3.6/3.5 under MLX; llama.cpp b11458. Skipped Qwen3.8-Flash-Next (Aug, unverifiable layout) |
| 2026-10-06 | **Runtime versions** — llama.cpp b11434 (+ first `v0.6.0` release: `/v1/systemone` decision-model API), vLLM v0.31.0; Ollama/ExLlamaV3 unchanged. Patrol skipped DeepSeek-V4.1-Flash, Mistral Medium 3.5, Reflection Beam (see README) |
| 2026-10-05 | **Data licensed CC BY 4.0** — Search Console: `Dataset` missing `license`; owner chose CC BY; `/legal/` §10 + JSON-LD + visible note on `/benchmarks/` |
| 2026-10-05 | **Homepage: latest additions under the picker, hardware included** — was fifth and models-only; `GPU.addedAt` + `latestEntries()` (same-day same-type rows collapse) |
| 2026-10-05 | **DGX Spark 64G/128G (76) + guide (27)** — nvidia.com specs (273 GB/s both); new `nvidia-unified` type, tight band capped at 100% (no host RAM) so GPT-OSS 120B @64G is red; card-vs-card FAQ claimed "same models" whatever the counts (latent, all pages) |
| 2026-10-05 | **+1 model (90): OLMo 3 7B** — OLMo-core arch (32 KV heads, 24 SWA + 8 full), 64K via YaRN, llama.cpp `olmo2` + swa pattern 4 → window 4608; OLMo 2 7B superseded (4K → 64K, same size); guide counts recomputed per card, not just the total |
| 2026-10-04 | **Runtime versions re-checked** — llama.cpp b11390, Ollama v0.35.1 (v0.40.0 pre-release skipped), vLLM v0.30.0, ExLlamaV3 v1.5.4; ExLlamaV2 README still says archived (a WebFetch summary said otherwise — read the README) |
| 2026-10-04 | **RTX 5090 guide (26)** — 32 GB fits 73 vs 71 models at 4K; the gain is long context on 27B–32B and the bandwidth ceiling, said plainly; Blackwell needs CUDA 12.8+. Only datacentre rows now lack a guide |
| 2026-10-04 | **12GB GPU guide (25)** — seven 12 GB CUDA cards had no guide; fit table from `calcVRAM` (14B: 4K comfortable, 8K tight, 16K out), roofline ceilings per card, 3 FAQs |
| 2026-10-04 | **Intel Arc guide (24) + GPU pages link guides** — SYCL/Ollama-Vulkan guide from llama.cpp/Ollama docs, sizes from `calcVRAM`, speeds as roofline ceilings; GPU pages had linked no guide at all — `guidesForGpu()` reverses `gpuPreset` (64 of 78 rows) |
| 2026-10-03 | **Intel Arc (74 GPUs)** — B580/B570/A770/A750 from intel.com; GGUF-only via SYCL/Vulkan; wizard/CLI/picker/index know it. CLI native llama.cpp build was CUDA for AMD and CPU readers too — now HIP/SYCL/CPU/CUDA per backend |
| 2026-10-03 | **Quarterly supersede** — Gemma 2 2B/9B/27B → Gemma 4 E2B / Gemma 4 E4B / Gemma 3 27B, Mistral 7B v0.3 → Ministral 3 8B; successor must fit the same hardware (9B's first pick, Gemma 3 12B, did not); Llama 3.1 70B / Phi-3.5 mini left (generic reason only) |
| 2026-10-03 | **+2 models (89): SmolLM3 3B, ERNIE 4.5 21B-A3B** — configs from transformers, context for SmolLM3 from HF's own post (64K native, 128K only via YaRN); all `estimated`; typed guide counts recomputed and now gated (`guideModelCountProblems`) |
| 2026-10-03 | **Format cards vs the data; radar removed** — AWQ "best 4-bit accuracy" was false on 53/53 paired models (higher loss, 18% smaller); GPTQ/HQQ quality claims unsupported (0 pairs / 0 models); typed-score radar deleted |
| 2026-10-03 | **Nginx proxy guide** — `http2 on;` needs Nginx 1.25.1+, Ubuntu 22.04/24.04 ship 1.18/1.24 → config failed `nginx -t`; now `listen 443 ssl http2;`. llama.cpp/vLLM *do* have `--api-key` (not required by default) |
| 2026-10-03 | **Qwen Coder 32B guide** — per-context verdicts (GGUF 104% at 16K; AWQ 107% at 32K); "best coding model" claim dropped (no coding benchmarks); Qwen3-Coder 30B-A3B AWQ 80% at 32K as the long-context option, repo left as a placeholder |
| 2026-10-03 | **VPS guide** — prose said physical cores, command passed `-t $(nproc)` (vCPUs); `-t` dropped (llama.cpp defaults to physical cores); unverifiable Hetzner plan/price removed; RAM at 8K/32K/128K from `calcVRAM` (full window doesn't fit 16 GB) |
| 2026-10-03 | **Quantize + CPU guides vs llama.cpp master** — `llama-cli` is chat-only now (`-st` for one-shot; no timings → `llama-bench`); imatrix `-o` needs `.gguf` or writes legacy; convert at `bf16`; `-t` defaults to physical cores |
| 2026-10-03 | **vLLM guides vs V1 source** — `PreemptionMode.RECOMPUTE` was V0 (deleted); V1 shows `Preemptions:` in its stats line + `vllm:num_preemptions`; install lacked the venv `uv pip` requires (guide + CLI); AutoAWQ deprecated |
| 2026-10-03 | **Docker + Ollama guide** — 218 tok/s was vLLM AWQ, not Ollama (llama.cpp Q4_K_M is 148); `nvidia-ctk runtime configure` step added; AMD via `:rocm` + `/dev/kfd` `/dev/dri`; 4 FAQs |
| 2026-10-03 | **Windows Ollama guide** — "AMD is CPU-only" was false (ROCm RX 7600–7900, Vulkan default for the rest); Win 10 22H2+; `curl -d` in PowerShell blocks replaced (5.1 alias); 4 FAQs |
| 2026-10-03 | **One contact address** — `FEEDBACK_EMAIL` → `zjy@quantized.uk` (owner's mailbox); unconfirmed `hello@` retired site-wide; `/about/` gets a direct line; maintainer still unnamed |
| 2026-10-03 | **AMD ROCm guide FAQs** — ROCm vs Vulkan, AWQ/GPTQ via vLLM ROCm on listed cards only, 24 vs 16 GB Radeon (69 vs 53 comfortable); `LLAMA_HIPBLAS` is reported as an unused variable, not silent (still CPU-only) |
| 2026-10-03 | **GPT-OSS guide vs llama.cpp's gpt-oss guide** — `--n-cpu-moe` for 8/12GB cards, `--chat-template-kwargs` reasoning effort, OpenAI sampling (temp 1.0, top_p 1.0, no rep penalty); unsourced 120B speed/RAM claim removed; 3 FAQs |
| 2026-10-03 | **GPT-OSS effective bpw + guide-figure gate** — MXFP4 4.25 applies to experts only; real files 11.27 / 59.02 GiB → 4.63 / 4.34 bpw (20B @4K 11.7 → 12.8 GB, 14 verdicts); build now checks guide sizes against `calcVRAM`; 4 guides corrected |
| 2026-10-03 | **8GB guide re-run** — three figures drifted after the 09-30 arch fixes; Llama 3.1 8B @16K is 91% (`tight`) but the row said "fits"; AWQ route is Linux/WSL2 only (vLLM); 2 image models added; 3 FAQs |
| 2026-10-03 | **Mac M3 Pro guide** — "Metal can't partially offload" was false (Ollama splits over-budget models CPU/GPU); M3 Pro bandwidth ceilings as upper bounds; 3 FAQs; shared `isMoE()` (roofline missed `… MoE` labels — latent) |
| 2026-10-02 | **EXL2 reality check** — ExLlamaV2 archived, TabbyAPI/text-gen-webui EXL3-only; CLI ExLlamaV2 server + image were invented (now real `examples/chat.py` with per-model template); `huggingface-cli` → `hf` everywhere; wizard stops recommending EXL2 for APIs; TabbyAPI guide rewritten |
| 2026-10-02 | **Dual-GPU guide + two site-wide fixes** — llama.cpp `--fit` on by default (1 GiB/card) now handled with explicit `-ngl all -c`; the "old CMake flags are silently ignored" claim was false (`LLAMA_CUDA` warns + works, `LLAMA_CUBLAS` errors), fixed in 6 places; all CLI container ports bound to `127.0.0.1`, `vllm serve --host 127.0.0.1` |
| 2026-10-02 | **WSL2 guide re-check** — LAN claim was wrong (NAT mode is not LAN-reachable; mirrored is); `cuda` meta-package installs a Linux driver; WSL's systemd defaults off so Ollama's service never starts; 3 FAQs |
| 2026-10-02 | **+2 models (87): Gemma 4 E2B, E4B** — KV sharing needs no new field: llama.cpp allocates no cache for the `num_kv_shared_layers` tail, so only the leading layers go into `fullLayers`/`windowLayers`. `params` is the total incl. the per-layer embedding (PLE) table, which llama.cpp keeps in system RAM — sized conservatively, the VRAM saving stated per page |
| 2026-10-02 | **AMD formats per card** — AWQ/GPTQ (vLLM-only on ROCm) gated by `vllmRocmSupported()`; GPTQ was wrongly CUDA-only (vLLM source builds it for HIP). RX 6000/7600 XT lose up to 4 comfortable fits; GPU-page "can it run" FAQ sizes the smallest *loadable* build (15 pages said "use GGUF" about models shipping GGUF) |
| 2026-10-02 | **CLI vLLM on AMD + current install** — `vllm/vllm-openai-rocm` with documented flags, ROCm wheel index, `uv pip install … --torch-backend=auto` + `vllm serve`; off-list Radeon cards (RX 6000, 7600 XT) get a note |
| 2026-10-02 | **CLI containers follow the GPU; notes bilingual** — AMD got CUDA images; Ollama compose had its GPU block commented out (CPU for everyone). 1,368 notes swept, 0 wrong-language |
| 2026-10-02 | **AMD guide re-check + CPU-only Docker bug** — CLI docker/compose used the CPU-only `:server` image with `--gpus all`; now `:server-cuda`. HIP build/ROCm 6.1+/Windows claims and the `load_tensors:` log line corrected |
| 2026-10-02 | **+6 Macs (70)** — M4 16G/24G, M2 16G, M1 8G/16G, M1 Max 64G from Apple's pages; M1 bandwidth derived and noted. M1 guide now sized on its own row |
| 2026-10-02 | **+5 budget cards (64)** — RTX 3060 12G, RTX 5050, RX 7600 XT, RX 9060 XT 16G/8G from vendor spec pages; 5050 ships without bandwidth (data rate not stated) |
| 2026-10-01 | **+2 models (85): Gemma 4 26B-A4B, 31B** — configs from transformers' conversion script; `fullKvHeads`/`fullHeadDim` added so global layers (fewer, wider heads) size separately. 26B-A4B 17 GB @32K fits 24 GB; E2B/E4B held back (cross-layer KV sharing) |
| 2026-09-30 | **DeepSeek MLA sizing fixed** — V3/R1/V2-Lite/Coder-V2-Lite were sized as conventional attention (too high for current GGUFs, far too low for legacy ones); now 576-value MLA cache with the legacy cost stated per page. Lite models newly fit 10–16 GB hardware |
| 2026-09-30 | **+2 models (83): GLM-4.7-Flash, Kimi Linear 48B-A3B** — picked from transformers' newest families for single-machine hardware; MLA cache sized as llama.cpp stores it; Kimi's 7 full layers reconciled against the vendor's 75% claim; sizes `estimated` (no GGUF source reachable) |
| 2026-09-30 | **Runtime versions re-checked** — llama.cpp b11277, vLLM v0.30.0, Ollama v0.35.0, ExLlamaV3 v1.5.3 (ExLlamaV2 still 0.3.2); read from release/tag pages, pre-releases skipped |
| 2026-09-30 | **IndexNow** — production deploys submit the sitemap URLs whose `lastmod` is today; skips until the key file is live; never fails the build |
| 2026-09-30 | **Public changelog rewritten for readers** — 14 entries were internal post-mortems (QTZ ids, function names, 1–2K chars); now plain statements of what changed |
| 2026-09-30 | **Speeds state their source** — "Estimated" tag on card/home/calculator/GPU pages; compare row treated a missing speed as 0 and called all speeds "published" |
| 2026-09-30 | **"63 GPUs" was 59 + 4 CPU rows** — `GPU_COUNT` now excludes `isCPU`; Command R page states the v01 (MHA, 8× cache) vs 8-KV-head ambiguity rather than guessing the release |
| 2026-09-30 | **Llama 4 chunked attention** — 36 of 48 layers hold one 8K chunk in llama.cpp; Scout @128K 95→77 GB. Rest of index swept against llama.cpp's SWA archs: no others |
| 2026-09-30 | **Arch audit + sliding-window sizing** — 8 SWA models (Gemma 2/3, GPT-OSS) were sized at full context on every layer (Gemma 3 27B @32K 34→21 GB); Qwen2.5 3B, Phi-4-mini, Gemma 3 12B, WizardLM-2 7B had wrong arch fields. Three guides re-derived |
| 2026-09-30 | **Impossible 4090 speeds removed** — 43 rows over 24 GB + 4 dense rows over the bandwidth ceiling; build now rejects both. Jamba 1.5 Mini was sized at its active 12B (real: 52B). "Measured here" only for `MEASURED_MODEL_IDS` |
| 2026-09-29 | **Tools hub under the inbound-link target** — re-crawl found `/tools/` at 2 and `/zh/tools/` at 1; tool breadcrumbs now include Tools |
| 2026-09-29 | **Structured-data gate** — 1,509 JSON-LD blocks audited, 0 faults; language / canonical url / `/zh` breadcrumbs / ItemList count / visible FAQ now enforced in postbuild |
| 2026-09-29 | **Title width gate** — 31 `/zh` titles over 60 width; `fitTitle()` drops the brand suffix first; postbuild fails on long or duplicate titles |
| 2026-09-29 | **Build-time consistency gates (QTZ-110)** — `assertDataConsistent()` (via the sitemap) fails the build on broken cross-references between data files; postbuild gates meta descriptions (present, unique, ≤160 width). Proven by perturbation |
| 2026-09-26 | **Calculator readable without JS (QTZ-123)** — derived size-class table (4K/32K range + smallest card for the whole class) in the static HTML; 32K skips models whose window is shorter |
| 2026-09-26 | **Meta descriptions within budget (QTZ-122)** — 104 pages over ~160 width (all EN GPU pages); `fitDescription`/`padDescription` + rewritten templates → 0 of 397. GPU description skipped superseded models; AWQ `hardwareReq` said NVIDIA-only |
| 2026-09-26 | **Guides show their dates (QTZ-114)** — dates were only in JSON-LD; byline now shows published/updated. Sitemap ignored `updatedAt` (17 rewritten guides had 2025 lastmods); all three now use `articleModifiedAt()` |
| 2026-09-26 | **Heat Index loses its fake precision (QTZ-113)** — unsourced `89%`/bars on `/formats/` and an "adoption estimate" row on every pair page; now a labelled ranking, measured counts carry the numbers. EXL3/MLX sections declined (0 models) |
| 2026-09-26 | **Editor's Picks derive size + card (QTZ-109)** — `todayFeed` carried typed sizes and cards; one pick named a card it was only tight on, four named cards not in `gpuDatabase`. Now computed with the model page's own `sizeAt`/`cardsFitting` |
| 2026-09-26 | **Fit counts name their level (QTZ-107)** — values already agreed across all surfaces; homepage card list and GPU index printed the comfortable count unlabelled, now "fit comfortably" |
| 2026-09-26 | **Speeds name their card (QTZ-105)** — every GPU page's fit table headed RTX 4090 speeds "tok/s"; now "tok/s on RTX 4090" plus a reference note on all pages but the 4090's; calculator list labelled the same |
| 2026-09-26 | **Model pages: native reference quant + honest "smallest card" (QTZ-103)** — `referenceQuant()` replaces four copies; GPT-OSS sized at its native MXFP4. "Smallest card" was database order (RTX 5080 for a 16 GB model, MI100 for 32 GB, a RAM row for 70B); now size + count + entry card via `bySmallestCard`. "Just misses" sorted by shortfall; MoE note reached 4 of 13 MoE models |
| 2026-09-23 | **Untranslated `/zh` chrome (QTZ-119)** — footer "Navigate"/"Ecosystem" hardcoded; a scan of all 198 `/zh` pages also found `GuideReferences` linking every Chinese guide's neighbours by English title, plus two calculator labels. Remaining English on `/zh` is proper nouns only |
| 2026-09-23 | **"Latest additions" + a real hydration-mismatch source (QTZ-112)** — the "This week's updates" block was 2 models in file order and would have emptied; now the 6 newest by `addedAt`. `isRecentModel` measured from `Date.now()`, so build-time HTML and visit-time hydration disagreed once a model aged out — now anchored to `dataLastUpdated` (`RECENCY_ANCHOR`) |
| 2026-09-21 | **QTZ-101 (small half): 2 more models tagged `superseded`** — Mixtral 8x7B → Qwen3 30B-A3B, Stable LM 2 12B → Falcon 3 10B, both with a real `supersededDiffNote()` reason (checked, not templated). DeepSeek-V2-Lite Chat deliberately left untagged — its 163K context and 11GB footprint beat everything else in its class, and its only same-family relative is a code-specialised sibling, not an upgrade; forcing a shorter-context "successor" on it would repeat the Command R 35B mistake. QTZ-101's other half (a `qualityScore` fed by an external leaderboard) needs the site owner to pick a source — not done here |
| 2026-09-21 | **QTZ-100 + QTZ-106 fixed: format-vs-backend, Mac unified memory** — `fitsOnGpu()` and 7 other functions now check `formatAllowed(gpu, quant.format)` before recommending a quant (AWQ stays allowed on AMD per this site's own FAQ, only EXL2/GPTQ excluded there); Mac unified memory sized at a verified ~75% usable fraction, not full nameplate. The VRAM calculator's `getRecommendations` took a bare vram number, not a GPU, so it had shared neither the bug nor any earlier fix — now takes the `GPU` object and shows an explicit "doesn't run on this backend" message. Mac M3 16G: 52→44 comfortable fits, measured in the built HTML |
| 2026-09-21 | **Second independent audit, batch 1 (zero-risk fixes)** — spot-checked the new audit's P0 claims against the actual code before acting; most held up, including two foundational ones not yet fixed: `fitsOnGpu()` picks a quant's format with zero awareness of whether the GPU's backend (CUDA/ROCm/Metal/CPU) can run it, and Mac unified memory is never reduced for macOS overhead despite the page's own copy claiming it is. Shipped: a hand-typed nonexistent GPU name ("RTX 4070 Ti 16G"), a hardcoded stale "79+" model count, two Footer links to renamed GitHub orgs, and a best-effort `<!--email_off-->` mitigation for a Cloudflare Scrape-Shield-shaped hydration error |
| 2026-09-15 | **Live re-check found QTZ-008 was never deployed** — a build gate proves the export is self-consistent, not that a given edit ever landed in source; homepage hero still had the pre-audit H1/CTA/keywords-meta live, now fixed (`Will it fit on your card?`, CTA → `/gpu/`). `runtimeVersions` re-verified against real GitHub release pages (llama.cpp/Ollama had drifted in 4 days); found ExLlamaV2 stalled since 2025-07, active project moved to ExLlamaV3/EXL3 (a new format, not yet tracked — 0 models ship it). A reported "79 vs 81" count mismatch was not a regression (two different, correctly-computed numbers); two referenced files (`scripts/audit-site.mjs`, `data/incoming-architecture.json`) don't exist and nothing was fabricated to replace them |
| 2026-09-14 | **`/zh` audited against the audit's own query list (QTZ-033)** — mostly already redrafted for Chinese search intent from earlier ships (not machine-translated); real gap found: no FAQ answer for "32G 内存纯 CPU 现实吗" despite an existing `32 GB RAM (CPU)` row, added; +2 verified used cards (Tesla P40 24G, P100 16G); the audit's suggested "modded 2080 Ti 22G" deliberately skipped — not a vendor spec |
| 2026-09-14 | **Per-page share-card images + two site-wide Twitter-card bugs (QTZ-026)** — GPU/model/guide/best/format pages get a real generated `opengraph-image.tsx` instead of one shared `/og.png`; found along the way that `runtime='edge'` silently drops the route from a static export, and that every page's `twitter:title`/`description`/`images` — homepage included — showed the generic site default because `app/layout.tsx` and `pageMetadata()` hardcoded them instead of letting Twitter fall back to `openGraph` |
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
