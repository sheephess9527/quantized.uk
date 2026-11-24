# 2026-11-24 — Apple Silicon model downloads

- An exact-checkpoint allowlist adds a Mac / Apple Silicon section above the quantization table on five existing model detail pages, in English and Chinese. Other models are unchanged; no route, page title, or sizing input was added or changed.
- The [per-model source audit](../data-corrections.md#2026-11-24--apple-silicon-mlx-downloads) records the 4-bit MLX repositories and weights. These downloads are not the GGUF files in the sizing table.
- The command follows the [MLX LM README](https://github.com/ml-explore/mlx-lm#command-line). LM Studio uses the link from each repository's [Hugging Face integration](https://huggingface.co/docs/hub/lmstudio); the fallback follows [LM Studio's Discover documentation](https://lmstudio.ai/docs/app/basics/download-model).

## Verification

`npm test` checks that entries match existing model IDs, that the command and LM Studio URL target the MLX repo, and that an unverified model has no entry. To check the frontend, serve the static export and open `/quant-hub/qwen3-4b/` and its `/zh/` mirror at desktop and phone widths; check the visible commands, the copy button, and both link targets. The browser check does not launch LM Studio or run model inference.
