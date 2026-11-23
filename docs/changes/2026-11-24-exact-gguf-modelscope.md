# 2026-11-24 — Exact GGUF file sizing and ModelScope downloads

- The forward calculator reads public Hugging Face `blob` and `resolve` file links, or `org/repo filename.gguf`. It asks the Hub's `paths-info` API for bytes at the selected revision; a split GGUF is sized only when every part is present. Only metadata and config are fetched, not model weights. Repository import and manual model sizing remain available.
- File bytes replace the weight estimate, not the KV cache or activation allowance. The quant label is derived from the filename when recognizable. The existing architecture import uses `config.json` at the revision or the linked base model. If architecture is missing, the file size is still shown, and the calculator asks for layers, KV heads and head dimension before estimating total VRAM. No extra vision-encoder size is inferred.
- The shared URL stores the source link, exact bytes and architecture snapshot. The recipient and link preview do not contact Hugging Face again. The file is not saved to the hardware profile.
- Five indexed Chinese models show a ModelScope download link with the uploader named in both languages. See the [listing evidence and MiniMax exclusion](../data-corrections.md#2026-11-24--modelscope-gguf-download-links). No new routes, dependencies or backend work.

## Verification

`npm test` includes parser, filename quant, shard sizing, fallback configuration and share-preview cases. Use `npm run typecheck` and `npm run build` on Node 20, then serve the static export to check the live Hub request and ModelScope links in both languages at desktop and phone widths.

Local checks on 2026-11-23 UTC (with the phone layout from #58): the export contains 3,738 files, unchanged from the #58 baseline. At 1,280 px and 390 px in English and Chinese, the calculator read 4,683,074,240 bytes for [bartowski's Qwen2.5 7B Instruct Q4_K_M file](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/blob/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf), displayed 4.36 GiB of weights and estimated 5.04 GiB at 4K, batch 1 and f16 KV. Opening the share snapshot reproduced the estimate with Hugging Face requests blocked. The existing bilingual phone regression check also passed.
