# 2026-11-23 — GPU upgrade comparisons

The existing GPU and VRAM-tier pages, including their Chinese mirrors, offer a collapsed comparison. Both sides use the same context and concurrency, FP16 KV cache and no offload. GPU pages inherit their fit controls; tier pages use the same presets inside the comparison and keep their editorial picks at 4K / batch 1. The tier baseline is the representative device used for those picks, not a claim about every GPU at that capacity.

- Newly unlocked: green on the candidate but not on the current device (tight is not green).
- Better quantization: green on both, with a strictly better ranking under the GPU page's existing per-model rule.
- Context gain: for up to three of the largest shared models with a gain, hold the current device's quantization fixed and search each device's green limit, capped by the model's native window.
- A count calls out fits lost when a candidate has less usable memory or supports different model formats.

The candidate and controls are page-local. There are no extra routes, prices, data fetches or title changes. The upgrade checks run in `npm test`; the export can be checked with `npm run build`, `find out -type f | wc -l`, and a comparison of exported title bytes against the base export.
