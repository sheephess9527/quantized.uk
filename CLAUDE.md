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

## Commands

```bash
npm run dev      # local dev → http://localhost:3000
npm run build    # type-check + lint + static export → out/   (gate before every commit)
npm run lint
```

`build` runs a `prebuild` HF-stats fetch that fails gracefully offline.

## Conventions (must follow)

- **Bilingual:** every UI string goes in **both** `en` and `zh` in `lib/i18n/translations.ts`.
  A missing `zh` renders `undefined` in the Chinese UI.
- **Static-export only:** no route handlers, no request-time fetching, no `next/image` opt.
  Dynamic routes become static via `generateStaticParams()`.
- **Data-driven:** add content in `lib/data/*.ts` (satisfy the interfaces in `lib/data/types.ts`).
- **`Array.from(new Set(...))`**, never `[...new Set(...)]` (bundler target won't down-level it).
- **PWA safe areas:** the app is installable (iOS Add to Home Screen, standalone). Respect
  `env(safe-area-inset-*)` — top handled by Navbar + `<main>`, bottom/sides by `body` in
  `globals.css`. Test any top-bar / full-height change against the notch.

## Git & deploy

- Work on `main` (small fixes) or the agent branch `claude/quantized-uk-platform-yxfz9v`.
- **Pushing to `main` auto-deploys** via Cloudflare Pages (build `npm run build`, output `out`).
- Always `git push -u origin <branch>`; on `fetch first` rejection, `git pull --rebase origin main`.
- Don't open a PR unless asked.

## Deploy footguns (full list in README §6)

Cloudflare **Pages** not Workers · output dir `out` not `.next` · Next.js ≥ 14.2.35 ·
if a deploy command is forced, use `true` (not `done`).

## Icons

Master is `public/icon.svg`; regenerate PNGs with the bundled Chromium recipe in README §10
(this env has no ImageMagick/sharp). Update all sizes together after editing the SVG.
