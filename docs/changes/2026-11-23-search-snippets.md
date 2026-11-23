# 2026-11-23 search titles and snippets

Chosen from real search data, not guesses. Read-only sources:

- **Google Search Console** export from the owner (property `sc-domain:quantized.uk`,
  requested 2026-08-22 to 2026-11-21; daily rows exist only from 2026-10-29). Totals:
  110 clicks, 16,204 impressions, average position 7.2.
- **Cloudflare Web Analytics** (sampled, ~1 in 10 page loads), 2026-08-23 to 11-23:
  ~24.8k page views, ~11.9k visits; Bing sends far more search visits than Google.

## Problems found

| Page | Impressions | Clicks | Avg position | Old title |
| --- | ---: | ---: | ---: | --- |
| `/benchmarks/` | 5,320 | 0 | 6.2 | LLM benchmarks: measured tok/s and VRAM \| quantized.uk |
| `/quant-hub/qwen3-8b/` | 415 | 3 | 9.6 | Qwen3 8B Instruct VRAM & quant guide \| quantized.uk |

"qwen3 8b q4_k_m" and 11 spelling variants (`qwen3 8b q4`, `qwen3-8b q4_k_m`,
`qwen3-8b-q4_k_m`, `qwen3:8b-q4_k_m`, `qwen3-8b-instruct-q4_k_m.gguf`, …) total
121 impressions at position ~8 with no clicks. The level and size those
searches name were in the meta description but not the title. Search Console hides
most queries for privacy (listed queries account for 4 of 110 clicks), so the
`/benchmarks/` queries are not known; Brazil had 3,802 impressions and 2 clicks.

## Changes

- `/benchmarks/`: title "Local LLM speed tests: tok/s on RTX 4090, 3090 and Mac";
  description names Llama 3.1 8B, Qwen3, llama.cpp, Ollama, ExLlamaV2, vLLM and the four
  measured machines (all present in `lib/data/benchmarks.ts`); perplexity is named
  separately because only Llama 3.1 8B has quant-level perplexity rows. `/zh/benchmarks/` mirrored.
- English model pages: `modelPageTitle(name, level, totalGB)` puts the reference level
  (`referenceQuant()`) and its 4K size (`sizeAt(…, REF_CONTEXT)`) first, the same values
  `modelMetaDescription()` prints. Tiers: `<name> <level> VRAM: <GB> GB | quantized.uk`,
  then without the brand, then the previous two tiers. Applies to every English model page.

## Follow-up

Compare clicks and CTR for these pages about two weeks after deploy. Bing query data
(Bing Webmaster Tools export) was requested from the owner and is not in this record.
