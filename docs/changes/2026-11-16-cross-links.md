# Two-site RAG handoff — 2026-11-16

Requested by the owner: model and VRAM pages link to a reranker picker, and
reranker.uk links back to "Will it fit my GPU?". Also investigate quantized.uk's
reported Google decline; the technical audit and explicit data gap are recorded
in [the audit](../audits/2026-11-16-google-traffic.md).

## Changes

- `components/tools/RerankerLink.tsx`: shared contextual link to the matching
  EN/ZH reranker picker. Public UTM labels identify source and model/VRAM placement.
- `components/hub/ModelDetail.tsx`: handoff beside the model actions/table.
- `components/tools/VRAMCalculator.tsx`: handoff visible in every calculator mode.
- `lib/site.ts`: same-owner related-tool origin constant.
- `lib/i18n/translations.ts`: EN/ZH handoff wording.
- `lib/data/changelog.ts`, `lib/data/meta.ts`: dated announcement and update date.
- `README.md`, `CLAUDE.md`: integration convention, change entry and correction of
  an unsupported historical Google/AI causal inference.
- This Markdown record and the technical/source-access audit.
- `lib/data/hf-stats.json`: normal required prebuild public-stat refresh.

The reciprocal reranker changes live in its own repository. Its backlink scopes
the calculator to the **generative LLM** in a RAG pipeline: reranker batching and
activation memory still require separate checking. No per-user identifiers,
model/GPU details, new analytics scripts or cross-site cookies are added.

## Verification and delivery

- `npm test`: all existing suites pass.
- `npm run build`: compilation/types/lint/data checks/export pass; 620 pages,
  309 Chinese pages, 618 titles/descriptions and 1,130 structured entities checked.
- Local browser checks: model/VRAM forward links and reranker homepage/picker/model
  table backlinks pass in EN/ZH at 390px, with 1440px overflow checks. Correct
  destination languages, placement/source UTM labels, clickable external links
  and the LLM-versus-reranker scope text were checked. No page errors.
- Work prepared on `feature/reranker-cross-links`; deployment checks follow.
- Google traffic diagnosis remains blocked on actual performance data; the public
  technical findings and exact limitation are recorded separately, not presented
  as a measured cause or a promise of SEO recovery.
