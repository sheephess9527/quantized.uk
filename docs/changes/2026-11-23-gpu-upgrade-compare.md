# 2026-11-23 — GPU upgrade comparisons

The existing GPU and VRAM-tier pages, including their Chinese mirrors, offer a collapsed comparison. Both sides use the same context and concurrency, FP16 KV cache and no offload. GPU pages inherit their fit controls; tier pages use the same presets inside the comparison and keep their editorial picks at 4K / batch 1.

The comparison names its real baseline device: the first listed card at that capacity in `POPULAR_GPU_IDS`, or the first listed card at that capacity if none is popular. At 16 GB, the RTX 5060 Ti replaces the Tesla V100 as the comparison baseline, so the RTX 5080 no longer shows false unlocks relative to a modern 16 GB GeForce card. The Apple page uses an actual 36 GB Mac. This does not change the editorial picks or imply all cards at a given capacity fit the same models.

- Newly unlocked: green on the candidate but not on the current device (tight is not green).
- Better quantization: green on both, with a strictly better ranking under the GPU page's existing per-model rule.
- Context gain: for up to three of the largest shared models with a gain, hold the current device's quantization fixed and search each device's green limit, capped by the model's native window.
- A count calls out fits lost when a candidate has less usable memory or supports different model formats.

The candidate and controls are page-local. There are no extra routes, prices, data fetches or title changes. The upgrade checks run in `npm test`; the export can be checked with `npm run build`, `find out -type f | wc -l`, and a comparison of exported title bytes against the base export.

## 2026-11-24 — Reading the results

The context count labels displayed examples, in descending parameter order. Quantization rows distinguish two published perplexity-loss values, one published value, and a BPW estimate when neither value is available. Capacity estimates do not measure speed or task accuracy.

Regression checks: cover zero loss and both mixed-coverage directions. Check example counts, empty states, expanded rows and mobile wrapping on GPU and tier pages in both languages.
