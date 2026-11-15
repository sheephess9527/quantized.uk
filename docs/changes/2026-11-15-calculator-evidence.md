# Calculator evidence and reader reports — 2026-11-15

Status: implemented and verified on `feature/calculator-evidence-reports`.

## Authorized scope

Add a result evidence card, related community measurement links and a structured
test-report export. Keep all changes and verification results in Markdown.
The static site needs no new service, account, database or runtime API.

## Source review

Reviewed https://llamaperf.com/ publicly, including its calculator, report detail,
submission form and methodology. No authenticated area was accessed and no report
was submitted. Curated source:
https://llamaperf.com/report/3f2eaf9e-db10-4585-be9c-6faf513045b3
(reported 2026-11-13, reviewed 2026-11-15).

Qwen3.8 27B on one RTX 5070 Ti: capy-flash 0.11.2, GSQ 3-bit,
int8 KV, MTP enabled with three draft tokens, fully on GPU. Five runs:
median decode 122.4 tok/s, prefill 2642.5 tok/s; prompt 613 tokens,
output 256 tokens, median TTFT 232 ms. Configured context, concurrency and
exact weight revision are unstated. The reported 16 GB is ambiguous between
capacity and measured use; it is deliberately excluded from peak-memory data.

This is related evidence, never a same-configuration GGUF measurement. Published
weight bytes also remain inputs to an estimate, not measured runtime memory.

## Implemented behavior

- Forward result evidence explains memory estimates, source file bytes, current
  context/KV/sequences/encoder, calibrated speed versus theoretical ceilings, and
  the absence of verified exact-configuration measurements. The existing source
  line moves into this card; `QuantFileLine` remains the shared implementation.
- Related reports appear on forward calculator and model pages. Matching uses
  exact model ids, prioritizes the selected GPU and labels other GPUs. Source
  settings, missing fields, dates and original report link remain visible.
  Other models explicitly show that the reviewed index has no entry.
- Collapsed report form includes the current model/quant/source file, hardware
  and card count, RAM bandwidth preset, context, sequences, KV, encoder, memory
  estimate and serialized sizing inputs (including custom architecture).
- Outcome requires an explicit selection. Engine/version, exact model revision,
  observed peak memory and measurement scope, generation/prefill speeds, actual
  prompt/output tokens, repetition count, offload, speculation and notes are
  optional observations. Blank fields remain unknown, never fabricated zeros.
- Generate a local Markdown preview before copy/download/mail draft. Drafts
  contain a short attachment request rather than potentially oversized logs.
  User must attach the downloaded report and send it themselves. No backend,
  new analytics event, automatic submission or email sending was introduced.
- Both configuration changes and edits to measurements invalidate the preview.
  Literal fences preserve logs safely in Markdown. No cross-scope memory error
  percentage or performance calibration is inferred from these reports.

## Complete file inventory

| File | Change |
| --- | --- |
| `components/tools/CalculatorEvidence.tsx` | Result evidence card |
| `components/tools/VRAMCalculator.tsx` | Integrate evidence, related runs and current-setting report export |
| `components/reports/RelatedReports.tsx` | Shared reviewed-run list and empty state |
| `components/hub/ModelDetail.tsx` | Related report entry point |
| `components/feedback/RunReportForm.tsx` | Optional observations, preview, copy, download and mail draft |
| `lib/utils/run-report.ts` | Typed configuration and literal Markdown export |
| `lib/data/performance-reports.ts` | One reviewed source, exact-id relation and reference validation |
| `lib/data/validate.ts` | Include report invariants in the build gate |
| `lib/i18n/translations.ts` | English/Chinese evidence, form and export wording |
| `lib/data/meta.ts` | Reader update date 2026-11-15; sizing date unchanged |
| `lib/data/changelog.ts` | Bilingual reader-facing feature entry |
| `lib/data/hf-stats.json` | Mandatory prebuild refreshed public stats: 120 succeeded, 20 unavailable; no model additions |
| `scripts/check-calculator-evidence.ts` | Reference perturbations, exact-id relations, bilingual keys, unknown observations, literal logs and current-config export checks |
| `README.md` | Architecture/schema/workflow description and §9 change entry |
| `CLAUDE.md` | Community evidence and local report conventions |
| `docs/changes/2026-11-15-calculator-evidence.md` | Scope, sources, implementation, all files and verification |

## Verification results

- `scripts/check-calculator-evidence.ts`: passed with tsx. Deliberately incorrect
  model/GPU ids, future dates, non-finite speed and unsafe source URLs are rejected.
  Family prefixes do not match; unrelated measured speeds never enter reader reports.
- `npm run build`: passed, including type checking, lint, static export, data
  invariants and localization checks. All 616 pages have normalized internal links;
  all 307 Chinese pages have the correct language and stay within the Chinese tree.
  All 614 titles and descriptions meet uniqueness/length gates; 1,122 structured
  page entities pass language/URL/count/FAQ checks. IndexNow skipped outside production.
- Chromium against the exported site, **EN + 中文**, **390 px + 1440 px**:
  no hydration errors or horizontal page overflow; result evidence and source links
  render; source report appears only for its model; empty states render correctly.
- Form checks: outcome cannot default to success; current Q3_K_M / RTX 5070 Ti /
  8,192 context / q8_0 / two sequences / 0.86 GiB encoder export correctly; exact
  clipboard and downloaded file contents match preview. Editing observations or
  changing context clears it. Two RTX 3090 cards export with their count; blank
  measured values remain unknown. Mail draft stays short and no email is sent.
- Visual inspection of Chinese mobile screenshot passed. Local QA screenshots:
  `/workspace/scratch/llamaperf-review/calculator-evidence-{en,zh}-390.png`.
- `git diff --check`: passed.

## Limits and delivery

The initial reviewed index intentionally has one report, rather than claiming
comprehensive coverage. No bulk ingestion, authenticated llamaPerf integration,
report storage, automatic calibration or change to sizing mathematics is included.
Branch delivery follows the repository workflow; merging into production is a
separate deployment action. The Markdown configuration keys stay stable across
languages; reader-facing headings, labels and caveats are localized.
