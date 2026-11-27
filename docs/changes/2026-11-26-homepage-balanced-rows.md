# 2026-11-26 — Homepage: balanced full-width rows

## Problem

Two side-by-side homepage grids from the 5-act reorganisation (`89388d2`) paired a short block with a tall stack, leaving a large empty void in the light theme (white cards on `#f4f6f9` make it obvious):

1. **Act 1** — `WeeklyUpdates` (`xl:col-span-7`, six two-line tiles) beside `TodayBoard` (`xl:col-span-5`, six four-line list rows). The left card ended about halfway down the right one.
2. **Act 4** — `QuickAccess` (`lg:col-span-1`, five vertically stacked tool cards) beside `ExploreStrip` (`lg:col-span-2`, one short card). The right two-thirds stayed empty under Explore.

## Change

- `components/home/HomeContent.tsx`: both pairs are stacked as full-width rows; no more asymmetric column splits on the homepage.
- `components/home/TodayBoard.tsx`: picks render as bordered tiles in a `1 / md:2 / xl:3` grid (six picks = two even rows of three), styled like the Latest additions tiles above.
- `components/home/QuickAccess.tsx`: tools render as a `1 / sm:2 / lg:3 / xl:5` grid with the icon above the text so each card fits at one-fifth width; cards are `h-full` so a row stays even.

No copy or data changes; EN and ZH share these components.

## Verification

- `npm run typecheck`, `npm run lint`, `npm test`, `npx next build && npm run postbuild`.

## Handoff notes

- Don't put a list of unknown or growing length next to a fixed short block in a 2-column grid on the homepage. Use full-width rows and spread items across columns inside the row instead.
- No `lib/data/changelog.ts` entry: layout-only, nothing new for readers to act on.
