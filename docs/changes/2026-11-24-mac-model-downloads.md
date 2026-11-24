# 2026-11-24 — Apple Silicon model downloads

- An exact-checkpoint allowlist adds a Mac / Apple Silicon section above the quantization table on the existing Qwen3 4B, 8B and 14B detail pages, in English and Chinese. Other model pages show no download section; no route, page title, or sizing input was added or changed.
- The [per-model source audit](../data-corrections.md#2026-11-24--apple-silicon-mlx-downloads) records the 4-bit MLX repositories, weights, and excluded candidates. Llama 3.2 3B names a community intermediary rather than the publisher in the conversion API, and the Mistral 7B conversion API has neither a base model nor a 4-bit tag. These downloads are not the GGUF files in the sizing table.
- The command follows the [MLX LM README](https://github.com/ml-explore/mlx-lm#command-line). LM Studio uses the link from each repository's [Hugging Face integration](https://huggingface.co/docs/hub/lmstudio); the fallback follows [LM Studio's Discover documentation](https://lmstudio.ai/docs/app/basics/download-model).

## Verification

`npm test` checks that entries match existing model IDs, that the command and LM Studio URL target the MLX repo, and that the four excluded models have no entry. To check the frontend, serve the static export and open `/quant-hub/qwen3-4b/` and its `/zh/` mirror at desktop and phone widths. Check the command and link targets, and deny clipboard writes to verify that the copy control points readers to manual selection. On a machine without LM Studio, the link leaves the page and Discover fallback available. The browser check does not run model inference.
