# Recurring model and website patrol

Authorized by the user on 2026-11-15: check every other day in the evening,
promptly index qualifying new models and maintain the website. All changes must
be documented in Markdown.

## Schedule

- Task: **巡检 quantized.uk 模型与网站**; enabled, creation confirmed by the scheduler.
- Every two calendar days, approximately **19:00 Asia/Shanghai** (flexible evening
  execution, within an hour of the target). This is the timezone already used by
  the user's existing scheduled tasks, rather than the workspace's UTC timezone.
- First scheduled occurrence: **2026-11-15 19:00 +08:00**, then November 17, 19, etc.
- Managed by the ChatGPT automation scheduler, not GitHub Actions or a local cron.
  It inherits the conversation's environment configuration; the scheduler did not
  return concrete environment details at creation. Each run checks its available
  repository access and reports blockers honestly.

```ical
BEGIN:VEVENT
DTSTART;TZID=Asia/Shanghai:20261115T190000
RRULE:FREQ=DAILY;INTERVAL=2
END:VEVENT
```

## Execution contract

1. Read current `CLAUDE.md`, `README.md` and the last patrol record; synchronize
   `sheephess9527/quantized.uk` with main without overwriting other sessions' work.
   Prefer `/workspace/quantized.uk`; clone into the available workspace if absent.
2. Compare official releases and current HF trends with the index and `/pending/`.
   Check both releases since the last patrol and gaps in older model generations.
   Follow the existing inclusion criteria; verify original configs, licences,
   architecture/runtime support, quant file sizes and relevant vision encoders.
   Never invent measurement, quality, architecture or file-size facts.
3. Actually index qualifying, verifiable models with EN/ZH content and associated
   mappings, metadata and changelog. Update pending candidates with missing evidence
   and dated reasons; remove a pending entry when its model is indexed.
4. Check relevant stable inference-runtime releases, download assets and generated
   commands; inspect calculator, model pages, tutorials, community report links,
   localization and key user flows. Make necessary evidence-backed maintenance
   fixes; present larger product redesigns as proposals.
5. Record sources, decisions, files, checks and deployment results in
   `docs/changes/YYYY-MM-DD-patrol.md` and README §9. Record the scope and conclusion
   even if no change is needed; do not manufacture an update to appear active.
6. Use a fresh isolated branch, pass `npm run build` and relevant focused checks,
   verify affected bilingual/mobile flows, then merge routine verified model,
   data, version and clear-defect maintenance into main and deploy. This ongoing
   maintenance is authorized by the user's request. Verify Cloudflare and live
   behavior, then remove merged branches. Do not force-push or destroy user data.
7. Report additions, website updates, verification/deployment status and blockers
   in concise Chinese. Do not send external email or submit community reports.
   Missing access or failed checks must not be described as successful maintenance.

## Related release

The user also authorized deployment of the calculator-evidence changes in the
same request. Its source inventory and checks are recorded in
[the release record](changes/2026-11-15-calculator-evidence.md). Cloudflare deployment
of `88a141d` succeeded; production browser checks passed in EN/ZH at mobile and
desktop widths, including local report download/copy and preview invalidation.

## Documentation changes in this scheduling setup

- `docs/maintenance.md`: persisted schedule and execution contract.
- `README.md`: maintenance entry point and dated schedule/merge changelog.
- `CLAUDE.md`: recurring-maintenance authorization and documentation convention.
- `docs/changes/2026-11-15-calculator-evidence.md`: production merge and verification record.

Scheduling setup changes documentation only; the application source is the already
built and browser-verified `88a141d` release. `git diff --check` passes.
