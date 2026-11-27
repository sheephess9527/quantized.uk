# 2026-11-27 — Homepage picks: 4-bit quality floor, honest speed label, one-line hero badge

Requested by the owner after reviewing the 11-26 redesign.

## Problems

1. **"Largest model estimated to fit" recommended Q2_K.** On the default RTX 4060 Ti 16G example the slot showed Xing4.0 29B-A4B at GGUF Q2_K with no published perplexity. `fitsOnGpu` picks each model's best quant that fits, and `capable` took the largest model regardless of how low that quant was.
2. **Speed card label mismatch.** The example card is a 4060 Ti, but the third card read "Highest measured speed on RTX 4090" with "RTX 4090 · 128 tok/s", easy to read as the reader's own speed.
3. **Hero clutter.** "Sourced Data · Edge Deployment · Geek-First" and "2026-11-26 latest update" were two stacked pills above the headline.

## Change

- `lib/utils/home-picks.ts`: `MIN_RECOMMENDED_BPW = 4`, `meetsQualityFloor()` (bpw ≥ 4 and level not matching Q1/Q2/Q3, IQ1–IQ3, TQ1–2; a Q3_K_M row for Apex 35B reports 4.015 bpw, so bpw alone let it through). `capable` takes the largest fit passing the floor; only if none passes does it take the largest fit at any level, with `lowBit: true`.
- `components/home/HomeMatch.tsx`: shows `kindCapableLowBit` instead of the usual note on a `lowBit` pick; fills `{gpu}` in the fastest note.
- `lib/i18n/translations.ts` (EN + ZH): new `kindCapableLowBit`; `kindCapableWhy` mentions 4-bit; `kindFastest` → "Fastest by measured speed (RTX 4090 reference)" / 「实测最快（以 RTX 4090 为参考）」; `kindFastestWhy` names the selected card.
- `components/home/HeroSection.tsx`: badge and changelog link in one pill (`flex-wrap`, `rounded-2xl sm:rounded-full`, separator hidden on phones).
- `components/layout/Navbar.tsx`: search button `min-w-[44px]` below `sm` (was 35 px wide on a 390 px viewport).
- Reader changelog entry + `dataLastUpdated` → 2026-11-27.

Before → after (`homePicks(gpu, 'chat')`): RTX 4060 Ti 16G capable Xing4.0 29B Q2_K → Mistral Small 24B Instruct AWQ INT4; RTX 4090 Apex 35B Q3_K_M → MiniCPM-V 4.7 35B-A3B Q4_K_S. Fallback fires for 0 of all GPU × use-case combinations today.

Knock-on (same function): `/best/` tiers, question pages, the calculator's card picks and `/gpu/*/opengraph-image` top pick follow the same floor.

Deliberately not done:
- `headroom` has no floor. Its current pick on 16–24 GB is Ternary Bonsai 2.5 27B at Q2_0, which is that model's native ternary-style release, not a degraded requant. Revisit if a plain Q2_K ever lands there.
- `fastest` still ranks by RTX 4090 `speedRTX4090`. `measuredSpeed()` gives per-card calibrated estimates but only for dense single-card GGUF, so swapping it in would mix estimate with measurement under a "measured" title.

## Mobile check (live site, 390×844, before this change)

- No horizontal page scroll (`scrollWidth` 384). The only wider element is a benchmark table with `min-w-[560px]` inside its own scroll container (intentional).
- Menu works: Day/Night/Auto, My GPU selector and all nav links are inside the hamburger, 36–44 px rows.
- Fixed here: search icon button 35 px wide → 44 px.
- Not changed (small, cosmetic): on the speed card the "+x% perplexity vs FP16" and "RTX 4090 · n tok/s" pair wraps onto two lines each at 390 px; the "About this index" 2×2 stat block's divider line sits slightly off the left edge; the open mobile menu is translucent, so the hero CTA shows through as a blur behind the links.

## Verification

- `tsc --noEmit` clean; every `tsx scripts/check-*.ts` in `npm test` passed (incl. `check-recommendations`: 97,614 fits across 126 profiles). The final `node --test scripts/check-hf-stats.mjs` and `next build` could not run in this sandbox (Bun's node shim; `next/font` Google fetch fails), so the PR's GitHub Actions `data-checks` + `build` are the gate.
- Not yet verified live: homepage EN/ZH after deploy, mobile render of the merged pill.

## Handoff notes

- Done: the three homepage fixes + mobile search tap target, docs.
- Verify after merge: both homepages show 2026-11-27, the 4060 Ti example's first card is a ≥4-bit quant, the pill is one line on desktop.
- Trap: don't gate on `bpw` alone — some Q3_K_M rows round to ~4.0 bpw.
