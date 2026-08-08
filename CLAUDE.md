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

**Live snapshot (2026-08-07 MoE freshness batch):**

| Surface | Notes |
|--------|--------|
| Models | **75** in index (`models-extra` … `models-extra-7`) |
| Cookbook | **23** guides; key ones carry `verifiedAt` + `verifiedStack` |
| Hub | Filters: size / category / hardware / format / **recency** (`?recency=recent`) |
| Home | Job paths, weekly updates block, data freshness line, honest format heat |
| Feed | `/feed.xml` — RSS of changelog + recent models |
| Tools | VRAM, CLI, format wizard, compare |
| Privacy | No public repo link on site pages; feedback `hello@quantized.uk` in Footer |

## Commands

```bash
npm run dev      # local dev → http://localhost:3000
npm run build    # type-check + lint + static export → out/   (gate before every commit)
npm run lint
```

`build` runs a `prebuild` HF-stats fetch that fails gracefully offline (merge keeps prior
stats on 401). **No `HF_TOKEN` required** — zero-config deploy; gated HF repos simply skip.

## Conventions (must follow)

- **Bilingual:** every UI string goes in **both** `en` and `zh` in `lib/i18n/translations.ts`.
  A missing `zh` renders `undefined` in the Chinese UI.
- **Static-export only:** no request-time fetching, no `next/image` opt.
  Dynamic routes become static via `generateStaticParams()`.
  **Allowed exception:** route handlers that are **fully static**
  (`export const dynamic = 'force-static'`) e.g. `app/feed.xml/route.ts` for RSS.
- **Data-driven:** add content in `lib/data/*.ts` (satisfy `lib/data/types.ts`).
- **`Array.from(new Set(...))`**, never `[...new Set(...)]` (bundler target won't down-level it).
- **Fonts via `next/font` only** (self-hosted; Tailwind reads `--font-inter`/`--font-mono`).
  Never add a Google Fonts `@import`/`<link>` — it's render-blocking and double-loads.
- **Recharts must be lazy** — import chart components via `next/dynamic` (`ssr: false` + a
  skeleton), never statically from a page (see `FormatRadarLazy`, `BenchCharts`).
- **OG image is `/og.png`** (rendered from master `og.svg`, README §10 recipe) — social
  platforms don't render SVG `og:image`; re-render the PNG whenever `og.svg` changes.
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

**Adding models**

1. Prefer `lib/data/models-extra-7.ts` (or new `models-extra-N.ts` + import in `models.ts`).
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
**Also add the level to `quantBPW` + `quantGroups` in `lib/utils/vram.ts`** — that table is static
and does *not* read from model data, so a model whose native format is missing there can only be
sized with the wrong bpw. (The CLI generator is fine; it derives levels from `model.quants`.)

**Never set `verifiedAt` you didn't earn** — it means "commands re-checked on this date". Agent
environments here have no GPU and no HF network access, so most stacks can't actually be run. An
unverified guide simply omits the field; back-dating or copying a sibling's date silently degrades
the badge on all 23 guides. Same rule for `verifiedStack`.

**`arch` is not decoration** — `layers` / `kvHeads` / `headDim` feed the VRAM calculator's KV-cache
math. Check them against the real `config.json` before shipping a model; GPT-OSS's `headDim: 64`
(vs the usual 128) halves its KV footprint and a copy-pasted 128 would silently overstate it.

## Content cadence (product priority)

With real traffic, **freshness > new tools**. Suggested rhythm:

| Cadence | Action |
|---------|--------|
| Weekly | Refresh `todayFeed` + one `changelog` line; bump `dataLastUpdated` |
| Biweekly | +1–3 real flagship models with `addedAt` |
| Monthly | Re-verify 1 high-traffic cookbook (`verifiedAt` / `verifiedStack`) |
| Quarterly | Supersede more legacy models; trim noise |

Home **Weekly updates** (`components/home/WeeklyUpdates.tsx`) + Hub `?recency=recent` +
`/feed.xml` are the three surfaces that should reflect every cadence ship.

## Key paths agents touch often

```
lib/data/types.ts           # QuantModel / QuantVariant / Article fields
lib/data/models.ts          # concat packs + todayFeed
lib/data/models-extra-*.ts  # model packs (currently through extra-7)
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
| 2026-08-08 | **GPT-OSS follow-through** — `gpt-oss-mxfp4-local` guide (23); MXFP4 added to VRAM calculator (Q4_K_M had overstated GPT-OSS weights ~14%) |
| 2026-08-07 | **MoE freshness batch** — +4 models → 75 (`extra-7`): GPT-OSS 20B/120B native MXFP4, GLM-4.5-Air, Devstral Small 1.1; feed + counts + og.png |
| 2026-07-22 | **Cadence pack A+B+C** — +4 models → 71; superseded tags; confidence column; Hub recent; weekly block; RSS; cookbook verified stack |
| 2026-06-26 | Real-traffic UX — job paths, mobile GPU profile, honest format heat, feedback email, Plausible events |
| 2026-06-26 | Model packs — Qwen3 MoE/32B, DeepSeek-V3/R1, Mistral Large 3, GLM-4, etc. |
| Earlier | PWA, safe areas, self-hosted fonts, lazy charts, OG PNG, QA fixes (≤3B filter, CLI quant sync, HF merge) |

Prefer **continuing the cadence** (data + labels + verified guides) over inventing a fifth tool.
