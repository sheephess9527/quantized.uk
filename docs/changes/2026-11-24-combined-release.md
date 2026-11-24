# 2026-11-24 — Combined model Hub, calculator and benchmarks release

The five pull requests were combined against main at `8655e08` in a separate
worktree. The merge preserves each PR head in the history and publishes the
tested combination in one production deployment.

| PR | Published change | Change record |
| --- | --- | --- |
| [#59](https://github.com/sheephess9527/quantized.uk/pull/59) | Clarify the model search and saved-GPU filter labels in both languages | [Mobile layout and Hub labels](2026-11-24-phone-layout-contrast.md) |
| [#60](https://github.com/sheephess9527/quantized.uk/pull/60) | Size exact public Hugging Face GGUF files, including split files, and link verified ModelScope mirrors | [Exact GGUF sizing and mirrors](2026-11-24-exact-gguf-modelscope.md) |
| [#61](https://github.com/sheephess9527/quantized.uk/pull/61) | Copy localized Markdown badges on model detail pages | [Model card badge](2026-11-24-model-card-badge.md) |
| [#62](https://github.com/sheephess9527/quantized.uk/pull/62) | Filter measured runs and download the displayed records as attributed CSV | [Benchmark filters and CSV](2026-11-24-benchmark-csv.md) |
| [#63](https://github.com/sheephess9527/quantized.uk/pull/63) | Show MLX and LM Studio entries for three verified Qwen3 conversions | [Mac model downloads](2026-11-24-mac-model-downloads.md) |

Conflicts were resolved in README, the bilingual changelog, the data correction
log and the model-detail translation objects. Both sets of model-page features
and evidence records were retained.

## Verification

- All five PR heads passed GitHub build and data checks before integration.
- The combined `npm test` and `npm run build` passed. The first local build
  stopped in the Google Fonts loader. An ordinary retry succeeded with the
  existing application and font configuration.
- The export has 3,741 files and 1,454 HTML pages. Link, Chinese localization,
  title, description, structured-data and export-size checks passed.
- Chromium at 390 px passed in English and Chinese. The checks covered the
  Hub label, coexisting MLX, LM Studio, ModelScope and badge elements, the
  badge's clipboard fallback, benchmark filtering and attributed CSV,
  GGUF import and share replay with Hugging Face blocked, and changelog text.
- The live Hub metadata test used Qwen2.5 7B Instruct Q4_K_M. It displayed
  4.36 GiB of file data and 5.04 GiB of estimated memory at 4K. The copied
  snapshot reproduced both figures. Browser testing covered the Mac launch
  links and copied command without launching LM Studio or running inference.
- The existing mobile layout regression also passed in both languages,
  including result-jump focus, 44 px controls, and the Hub filter disclosure.

## Deployment

- GitHub marked PRs #59–#63 merged after the fast-forward to application
  commit `83749fa`. Cloudflare Pages reported a first-attempt build failure.
  The GitHub check returned a generic error without build logs accessible in
  this session. A documentation-only push retries the same application source.
  [First Cloudflare check](https://github.com/sheephess9527/quantized.uk/runs/138181701750)
