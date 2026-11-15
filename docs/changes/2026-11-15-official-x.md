# Official X profile link — 2026-11-15

## Scope and source

The owner registered **@toquantized**, supplied a screenshot confirming the
handle and successfully tested a prefilled X compose link. The owner chose
manual publishing and asked to add the account to the website.

Official profile: https://x.com/toquantized

## Complete changes

- `lib/site.ts`: central `X_HANDLE` and `X_URL` constants.
- `components/layout/Footer.tsx`: official profile link and short description in
  the shared "Stay current" section; opens externally with `noopener noreferrer`.
- `lib/i18n/translations.ts`: English/Chinese link labels and descriptions;
  replaces stale update-frequency and hard-coded link-count wording.
- `lib/data/changelog.ts`: bilingual announcement, also included in RSS.
- `lib/data/hf-stats.json`: normal mandatory prebuild refresh of public HF stats
  (120 fetched successfully, 20 unavailable); no models were added by this change.
- `README.md`: public account integration notes and §9 change entry.
- `CLAUDE.md`: official-account source and manual-posting convention.
- `docs/changes/2026-11-15-official-x.md`: this source, file inventory and checks.

RSS, changelog and pending-model links remain available. No X API connection,
embedded social scripts, new tracking events, account signup or publishing action
is part of this change. No model or sizing data is changed.

## Validation and delivery

- `npm run build`: passed, including compilation, types, lint, data invariants and
  static export. Localization/SEO gate checked 616 pages, all 307 Chinese pages,
  614 unique titles/descriptions and 1,122 structured page entities.
- Chromium against the exported site: EN/ZH homepage, model page, calculator and
  about page all show exactly one official X link in the footer with the correct
  handle, destination, new-tab target and safe rel. RSS/changelog/pending links
  remain correct for the active language. No stale link-count/frequency wording.
- Mobile 390 px and desktop 1440 px: no horizontal overflow or page errors.
  Chinese mobile footer screenshot visually checked.
- `git diff --check`: passed. No extra unit tests were added for this simple link.
- Prepared on `feature/official-x-link` for routine website maintenance deployment.
  Production verification follows the main-branch push.
