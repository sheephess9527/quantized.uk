# Model card badge referral attribution

The badge component adds the same three UTM values to every newly copied Markdown destination. It retains the localized production path and the shared image URL. The clipboard fallback returns the identical snippet. The change introduces no event, identifier, cookie, backend or redirect.

| Language | Qwen3-8B link destination |
| --- | --- |
| English | `https://quantized.uk/quant-hub/qwen3-8b/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_model_card_badge` |
| Chinese | `https://quantized.uk/zh/quant-hub/qwen3-8b/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_model_card_badge` |

## Reading the numbers

In Plausible, select the reporting period and filter by UTM source `huggingface`, medium `referral` and campaign `hf_model_card_badge`. Use **Visits**, with **Entry page** for the landing model and language. Record the period and dashboard time zone. Start organic reporting on the first full dashboard day after controlled QA.

A tagged visit can also come from a repost of the link. An ordinary HF link and an older, untagged badge can share the same referrer. Missing referrers and blocked analytics limit coverage. Cloudflare Web Analytics can corroborate overall referrer trends; it does not log query strings. Search Console measures search performance separately.

| Observation | Evidence |
| --- | --- |
| Copied | Successful clipboard write is local UI feedback only. The fallback reveals text for manual copying. Neither action increments a campaign metric. |
| Published | Verify the visible badge and link against a specific public card revision. Record its URL, revision and date. Keep owner-controlled test cards separate. |
| Visit | The filtered Plausible report records a visit. An SVG request can be a cache fill or preview. There is no verified impression denominator for a click-through rate. |

## Regression and acceptance

- Run `npm test`, `npm run typecheck` and `npm run build`. After export, run `CHROME_PATH=/path/to/chrome node scripts/check-model-card-badge.mjs`. The browser test serves the export from a simulated preview origin and blocks external requests. It exercises the clipboard and manual fallback for two models in both languages, decodes the SVG, compares tagged and bare metadata, and checks the sitemap.
- **Local results, 2026-11-25.** Type checking and the production build passed. Postbuild checked 1,454 pages and counted 3,741 export files. The browser regression passed on Chromium 158 for all four model/language combinations, including real clipboard reads, denial fallback, decoded images, metadata and sitemap. The standard test launcher encountered a local IPC permission error; every command in the test suite then passed using Node's `--import tsx` loader for the TypeScript scripts.
- **HF rendering, pending.** In an authorized owner-controlled test card's uncommitted preview, paste each language's snippet. Inspect the rendered image, decoded dimensions, alt text and enclosing link. An image proxy is acceptable. Click through and verify the final host, language, path, UTM values and successful response. Record the evidence. Preview alone does not establish public adoption.
- **Dashboard acceptance, pending.** Use independent fresh browser sessions for a tagged click and an untagged link from the same card. Confirm a destination pageview reaches the existing Plausible endpoint in each session. Verify the tagged visit appears for the correct campaign and entry page; the untagged control must stay outside it. Isolate test traffic by reporting period. Leave adoption and organic volume unverified until separately observed.
- **Release check, pending deployment.** Verify the release date on both homepages and the new entry in both public changelogs.

## References

- [Plausible campaign attribution](https://plausible.io/docs/top-referrers) and [query handling](https://plausible.io/docs/custom-query-params)
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [HF model card documentation](https://huggingface.co/docs/hub/model-cards) and [a public card with an external linked badge](https://huggingface.co/Qwen/Qwen3-8B/raw/main/README.md)
