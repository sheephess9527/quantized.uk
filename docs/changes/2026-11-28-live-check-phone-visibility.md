# 2026-11-28 — Live check phone UI visibility wait

## What happened

- Scheduled `Daily live check` run 45976381391 (2026-11-27 09:45 UTC) failed 24/25:
  `FAIL zh phone UI — not visible: getByRole('searchbox')` (issue #69).
- The page markup is correct: `/zh/quant-hub/` ships `#hub-search-mobile` (`sm:hidden` wrapper)
  and `#hub-search` (`hidden sm:block`), identical to `/quant-hub/`, both `type="search"`
  with placeholder `搜索模型`.
- No commit or deploy landed between 08:00 and 11:00 UTC on 2026-11-27.
- Manual `workflow_dispatch` re-run 46088975926 (2026-11-28 00:38 UTC) against the same site
  passed 25/25, including `zh phone UI`.

Conclusion: timing flake. `locator.boundingBox()` waits only for the element to be attached,
so it can return `null` if layout/CSS or hydration has not settled right after `domcontentloaded`.

## Change

- `scripts/check-live.mjs`: `rect()` now calls `locator.waitFor({ state: 'visible', timeout })`
  before `boundingBox()`. A truly hidden control still fails with the same `not visible` message
  after the 15 s timeout.

## Handoff notes

- Done: test-only robustness fix; README §9 entry. No reader-visible change, so
  `lib/data/changelog.ts` and `dataLastUpdated` are untouched.
- Verified: live site passes the unchanged check on re-run; syntax checked with `node --check`
  equivalent (no browser available in the authoring environment, so the patched script was not run
  locally; CI `checks` does not run `check:live`, trigger `Daily live check` via workflow_dispatch after merge).
- Not done: close issue #69 after the next scheduled run passes.
- Trap: if this recurs on the same step, look for a real CSS/hydration regression on the zh Hub
  rather than lengthening timeouts.
