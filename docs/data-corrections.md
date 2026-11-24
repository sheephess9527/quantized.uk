# Model/GPU data verification and corrections

## 2026-11-24 — Apple Silicon MLX downloads

Checked each conversion's Hugging Face API record for its identity, ungated access,
and MLX Safetensors listing. The linked revision configs report 4-bit groups of 64.
Every conversion page exposed LM Studio's `open_from_hf` link for that exact repo.
These are separately published MLX conversions, not additional calculator size or speed data.

| Indexed checkpoint | Publisher checkpoint | Verified MLX repository (API) | Weights and config |
| --- | --- | --- | --- |
| `llama-3.2-3b` | [Meta Llama 3.2 3B Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct), via the [community conversion's immediate parent](https://huggingface.co/api/models/mlx-community/Llama-3.2-3B-Instruct) | [mlx-community/Llama-3.2-3B-Instruct-4bit](https://huggingface.co/api/models/mlx-community/Llama-3.2-3B-Instruct-4bit) | `model.safetensors`, [4-bit config](https://huggingface.co/mlx-community/Llama-3.2-3B-Instruct-4bit/blob/7f0dc925e0d0afb0322d96f9255cfddf2ba5636e/config.json) |
| `mistral-7b-v0.3` | [Mistral 7B Instruct v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3), named in the [converter's model card](https://huggingface.co/mlx-community/Mistral-7B-Instruct-v0.3-4bit/blob/a4b8f870474b0eb527f466a03fbc187830d271f5/README.md) | [mlx-community/Mistral-7B-Instruct-v0.3-4bit](https://huggingface.co/api/models/mlx-community/Mistral-7B-Instruct-v0.3-4bit) | `model.safetensors`, [4-bit config](https://huggingface.co/mlx-community/Mistral-7B-Instruct-v0.3-4bit/blob/a4b8f870474b0eb527f466a03fbc187830d271f5/config.json) |
| `qwen3-4b` | [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B) | [mlx-community/Qwen3-4B-4bit](https://huggingface.co/api/models/mlx-community/Qwen3-4B-4bit) | `model.safetensors`, [4-bit config](https://huggingface.co/mlx-community/Qwen3-4B-4bit/blob/4dcb3d101c2a062e5c1d4bb173588c54ea6c4d25/config.json) |
| `qwen3-8b` | [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) | [mlx-community/Qwen3-8B-4bit](https://huggingface.co/api/models/mlx-community/Qwen3-8B-4bit) | `model.safetensors`, [4-bit config](https://huggingface.co/mlx-community/Qwen3-8B-4bit/blob/545dc4251c05440727734bcd94334791f6ab0192/config.json) |
| `qwen3-14b` | [Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B) | [mlx-community/Qwen3-14B-4bit](https://huggingface.co/api/models/mlx-community/Qwen3-14B-4bit) | `model-00001-of-00002.safetensors` and `model-00002-of-00002.safetensors`, [4-bit config](https://huggingface.co/mlx-community/Qwen3-14B-4bit/blob/a4d9b2df59d2c150bef02fcbe0d91046b7ca33a4/config.json) |

Not listed in this set: [Gemma 3 4B IT candidate](https://huggingface.co/api/models/mlx-community/gemma-3-4b-it-4bit) reports the base pretrained checkpoint (`gemma-3-4b-pt`), not the indexed IT checkpoint; [Llama 3.2 1B candidate](https://huggingface.co/api/models/mlx-community/Llama-3.2-1B-Instruct-4bit) points to a BF16 intermediary whose API metadata lacks a publisher base reference.

## 2026-11-23 — Backfill of merged PR #28–#49 data changes

These entries record the merged work and its existing evidence, not newly performed
publisher fetches or benchmarks. The original November 21 audit follows unchanged.
PR #45 was open during the initial audit and has since merged. Its own KORMo-Web-4B record is preserved under “Catalog addition — 2026-11-23” below, not duplicated in this backfill. See the [per-PR documentation audit](changes/2026-11-23-pr-28-49-docs-audit.md).

| Date shipped | Model / hardware | Field | Old value | New value | Source / limitation |
| --- | --- | --- | --- | --- | --- |
| 2026-11-22 | DeepSeek-R1-Distill-Qwen-14B (#34) | Benchmark identity | `DeepSeek-R1 14B` did not resolve to the indexed checkpoint | Alias resolves the existing RTX 4090 EXL2 run | `lib/utils/measured-runs.ts`; historical benchmark, not a new measurement. |
| 2026-11-22 | M2 Ultra (#35) | Matrix runtime | llama.cpp, conflicting with chart | Ollama 0.3.14, consistent across surfaces | `lib/data/benchmarks.ts`, `lib/data/meta.ts`; editorial reconciliation: only recorded llama.cpp version was CUDA b4217. No recovered raw run; dates are first-publication bounds. |
| 2026-11-22 | Laptop GPUs (#37) | Hardware catalogue | No laptop-specific rows | 27 GeForce RTX / Radeon laptop memory configurations, vendor `specUrl`, `isLaptop` | [Current sourced rows](../lib/data/gpus.ts); NVIDIA 30/40/50-series laptop specs and archived AMD laptop launch specs are linked per row. Laptop bandwidth is not copied from desktop; no physical performance measured. |
| 2026-11-22 | Older GeForce / workstation / mods / Ryzen AI Max+ 395 (#42) | Hardware catalogue | Missing configurations | 17 rows: 8 consumer, 5 workstation/datacenter, 2 modified cards, 2 APU allocations | [Current sourced rows](../lib/data/gpus.ts): NVIDIA/AMD specs, TechPowerUp and mod articles linked via `specUrl`. Mods are unofficial; bandwidth assumes stock rate. |
| 2026-11-22 | Ryzen AI Max+ 395 64G / 128G (#42) | GPU budget / bandwidth | Not indexed | 48 / 96 GB Windows GPU allocations; 256 GB/s shared bus; `isIntegrated`, not Apple `isUnified` | [AMD VGM FAQ](https://www.amd.com/en/blogs/2025/faqs-amd-variable-graphics-memory-vram-ai-model-sizes-quantization-mcp-more.html); [processor specs](https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html). Not dedicated VRAM or a Linux-tuned allocation; no stacking. |
| 2026-11-22 | GTX 1080 Ti, V100, P100, P40; RTX 2060 Super (#42) | Format eligibility / renderer identity | Legacy CUDA could pass AWQ; Super could match base 2060 | Known compute capability below 7.5 excludes AWQ; unindexed 2060 Super no longer maps to 6/12 GB base rows | `cudaComputeCapability` and linked specs in `gpus.ts`, shared `formatAllowed`, `gpu-detect.ts`; missing capability retains existing policy, not a guarantee. |
| 2026-11-22 | DeepSeek V4 / V4.1, GLM-5.3 Flash, Kimi K3.1 Pro, MiniMax M3.1 Flash (#44) | Index, parameters, GGUF bytes, KV layout, licence and image facts | Pending / unsized | Five indexed models with exact-file sizing and compressed/indexer cache groups | [Per-model source/byte/cache record](changes/2026-11-22-frontier-vram.md). DeepSeek uses compressed-row padding 256; derived active params 13.8 / 16.8B. Fixed KDA/compressor state excluded; cache not validated against a published measurement. |
| 2026-11-22 | Tool-calling facts (#47) | Positive template evidence | Initial 3 Qwen3 entries | Audit of 151 then-indexed checkpoints: 113 positive, 33 readable without tools, 5 unreadable | `TOOL_CALLING_SOURCES` in [model-facts.ts](../lib/data/model-facts.ts) stores per-checkpoint URLs. Templates, not runtime tool-use tests; no inherited training-base claims. |
| 2026-11-22 | Qwen3 14B EXL2 4.65bpw (#47) | Stored RTX 4090 speed | 125 tok/s | 118 tok/s | Existing exact row in `lib/data/benchmarks.ts`; `check-measured-speed.ts` enforces agreement. Other levels do not inherit measured status. |
| 2026-11-22 | Exact-checkpoint model quality (#48) | LiveBench Overall | No calculator score table | 35 of 156 checkpoints have pinned published scores | [model-quality.ts](../lib/data/model-quality.ts), each linked to its dated [LiveBench release](https://livebench.ai/#/release/). Not quant measurements; different releases are not directly comparable; missing scores are not inferred. |

## Original verification pass — 2026-11-21

**Visitor speed provenance (2026-11-23):** No visitor rows were seeded; submissions ship disabled.
For each future approved row in `lib/data/community-speed.ts`, record the submission ID, review
date, public evidence if available, and any limitations here. Do not record private queue fields.
Visitor figures are community data, not site measurements.

First verification pass against publisher model cards/configs and the Hugging Face repository API (including the quantizer's own file metadata). Only unambiguous discrepancies are corrected; original full-checkpoint totals are not silently substituted for stored GGUF language-weight counts.

## Scope

Reviewed `git log --since=2026-10-07 -- lib/data/` and the model/facts/repository/GPU diffs. There are 61 indexed models with `addedAt >= 2026-10-07`; this pass prioritizes the newest 25 by addedAt descending, id ascending for ties. Older changed models, pending-only candidates (which have no addedAt), and benchmark rows for older models are deferred under the 25-model cap. No price fields exist in gpus.ts; its additions in this window are R9700 and Arc Pro B70, not prices. benchmarks.ts has no commits in this window. No runtime performance measurements were performed.

### Selected model ids

- `clairic-27b` (2026-11-21)
- `clairic-flash-9b` (2026-11-21)
- `shot-reader-8b` (2026-11-21)
- `apex-35b-v1` (2026-11-19)
- `daisyrose-27b` (2026-11-19)
- `ternary-bonsai-2-27b` (2026-11-19)
- `botpsy-0-8b` (2026-11-17)
- `mnn-pocket-0-3b` (2026-11-17)
- `mnn-pocket-0-3b-qat` (2026-11-17)
- `arete-27b` (2026-11-15)
- `twil-8b-balanced` (2026-11-15)
- `lfm2-5-1-2b` (2026-11-14)
- `lfm2-5-8b-a1b` (2026-11-14)
- `ministral-3-14b` (2026-11-14)
- `ministral-3-3b` (2026-11-14)
- `clover-35b-a3b-preview` (2026-11-13)
- `hy-memory-30b-a3b` (2026-11-12)
- `kolibri-1-78b-a3-5b` (2026-11-12)
- `ripple-65b-preview` (2026-11-10)
- `xing4-0-29b-a4b` (2026-11-10)
- `metis-1-6-logos` (2026-11-05)
- `metis-1-6-praxis` (2026-11-05)
- `lfm3-vl-2b` (2026-11-03)
- `mistral-large-4` (2026-10-30)
- `lfm3-1-7b` (2026-10-29)

### Deferred indexed models

- `mimo-v2-6-distill-qwen-9b` (2026-10-29)
- `nanbeige4.3-33b` (2026-10-26)
- `spark-x2.6-4b` (2026-10-26)
- `nemotron-3.5-bolt-e4b` (2026-10-24)
- `flint-40b-a2-5b` (2026-10-23)
- `k2-horizon-0-9b` (2026-10-23)
- `k2-horizon-3-7b` (2026-10-23)
- `k2-horizon-375b-a23b` (2026-10-23)
- `laguna-s-2-1-118b-a8b` (2026-10-23)
- `k2-horizon-32b` (2026-10-21)
- `k2-horizon-7b` (2026-10-21)
- `k2-horizon-mova-36b-a4b` (2026-10-21)
- `mimo-v2-6-flash` (2026-10-20)
- `minicpm-v-4-7-35b-a3b` (2026-10-20)
- `north-mini-code-1.0` (2026-10-20)
- `gemma-4-12b` (2026-10-19)
- `beam-1.0-501b-a23b` (2026-10-17)
- `ling-3.1-flash` (2026-10-17)
- `granite-4.2-30b` (2026-10-16)
- `granite-4.2-3b` (2026-10-16)
- `muse-spark-open-816b-a42b` (2026-10-16)
- `nemotron-3.5-bolt-74b-a9b` (2026-10-16)
- `nemotron-3.5-lightning-30b-a3b` (2026-10-16)
- `nemotron-3.5-super-vl-120b-a12b` (2026-10-16)
- `granite-4.2-8b` (2026-10-14)
- `lfm2-5-24b-a2b` (2026-10-14)
- `mellum2-1-12b-a2-5b` (2026-10-13)
- `mimo-v2-6-pro` (2026-10-12)
- `qwen3-5-0.8b` (2026-10-11)
- `qwen3-5-2b` (2026-10-11)
- `qwen3-5-4b` (2026-10-11)
- `qwen3-5-9b` (2026-10-10)
- `qwen3-6-27b` (2026-10-10)
- `qwen3-6-35b-a3b` (2026-10-10)
- `qwen3-8-flash-next` (2026-10-10)
- `muse-glimmer-30b` (2026-10-09)

## Corrections

| Date | Model id | Field | Old value | New value | Source |
| --- | --- | --- | --- | --- | --- |
| 2026-11-21 | mistral-large-4 | LICENCES['mistral-open-weight'].class | commercial | restricted | [Publisher LICENSE §2–3](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE): Model-as-a-Service operators must obtain a separate commercial licence; internal use is exempt. |

## Field-by-field evidence

All byte counts below are decimal bytes, not rounded GB. “Match” for file data means the exact filename and byte count are present in the named repository API. For split variants the recorded bytes equal the sum of all listed shards at that level. Projector matches identify a file of the recorded size; no absent projector filename field is implied. Parameter/API discrepancies below are intentionally unresolved because the site's params field sizes stored language tensors, whereas the original repo can include vision towers, MTP heads and tied/untied tables. These differences alone are not evidence of incorrect sizing.

### clairic-27b

Publisher: [model card](https://huggingface.co/Cloudflare/clairic/blob/main/README.md). API revision: `2c161be5cc71bacd6605b99a8c07547e58cfa434`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Cloudflare/clairic/blob/main/README.md) |
| params (B) | 26.895998464 | 27.781427952B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Cloudflare/clairic?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/Cloudflare/clairic/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 64 / 24 / 4 / 256 | 64 / 24 / 4 / 256 | [source](https://huggingface.co/Cloudflare/clairic/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | Xylolabs/clairic-GGUF: clairic-Q3_K_M.gguf; 13546891072 | Match: `clairic-Q3_K_M.gguf` (13546891072) | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 931146336 | mmproj-clairic-BF16.gguf: 931146336 | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | Xylolabs/clairic-GGUF: clairic-Q4_K_M.gguf; 16775952192 | Match: `clairic-Q4_K_M.gguf` (16775952192) | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 931146336 | mmproj-clairic-BF16.gguf: 931146336 | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | Xylolabs/clairic-GGUF: clairic-Q5_K_M.gguf; 19362330432 | Match: `clairic-Q5_K_M.gguf` (19362330432) | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 931146336 | mmproj-clairic-BF16.gguf: 931146336 | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | Xylolabs/clairic-GGUF: clairic-Q8_0.gguf; 28617877088 | Match: `clairic-Q8_0.gguf` (28617877088) | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 931146336 | mmproj-clairic-BF16.gguf: 931146336 | [source](https://huggingface.co/api/models/Xylolabs/clairic-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Cloudflare/clairic/blob/main/README.md) |

### clairic-flash-9b

Publisher: [model card](https://huggingface.co/Cloudflare/clairic-flash/blob/main/README.md). API revision: `36ad68b999560f56b57ef16a22180f8cb83c6d77`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Cloudflare/clairic-flash/blob/main/README.md) |
| params (B) | 8.953803264 | 9.653104368B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Cloudflare/clairic-flash?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/Cloudflare/clairic-flash/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 32 / 16 / 4 / 256 | 32 / 16 / 4 / 256 | [source](https://huggingface.co/Cloudflare/clairic-flash/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | Xylolabs/clairic-flash-GGUF: clairic-flash-Q3_K_M.gguf; 4691073696 | Match: `clairic-flash-Q3_K_M.gguf` (4691073696) | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 921704960 | mmproj-clairic-flash-BF16.gguf: 921704960 | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | Xylolabs/clairic-flash-GGUF: clairic-flash-Q4_K_M.gguf; 5690055328 | Match: `clairic-flash-Q4_K_M.gguf` (5690055328) | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 921704960 | mmproj-clairic-flash-BF16.gguf: 921704960 | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | Xylolabs/clairic-flash-GGUF: clairic-flash-Q5_K_M.gguf; 6502963872 | Match: `clairic-flash-Q5_K_M.gguf` (6502963872) | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 921704960 | mmproj-clairic-flash-BF16.gguf: 921704960 | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | Xylolabs/clairic-flash-GGUF: clairic-flash-Q8_0.gguf; 9533397664 | Match: `clairic-flash-Q8_0.gguf` (9533397664) | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 921704960 | mmproj-clairic-flash-BF16.gguf: 921704960 | [source](https://huggingface.co/api/models/Xylolabs/clairic-flash-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Cloudflare/clairic-flash/blob/main/README.md) |

### shot-reader-8b

Publisher: [model card](https://huggingface.co/voyager-so/shot-reader-8b/blob/main/README.md). API revision: `5632e6b2de74b33d4b83c53e9c543702ea236f39`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/voyager-so/shot-reader-8b/blob/main/README.md) |
| params (B) | 8.19073536 | 8.767123696B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/voyager-so/shot-reader-8b?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/voyager-so/shot-reader-8b/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 36 / 32 / 8 / 128 | 36 / 32 / 8 / 128 | [source](https://huggingface.co/voyager-so/shot-reader-8b/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | mradermacher/shot-reader-8b-GGUF: shot-reader-8b.Q3_K_M.gguf; 4124163424 | Match: `shot-reader-8b.Q3_K_M.gguf` (4124163424) | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 1159030560 | shot-reader-8b.mmproj-f16.gguf: 1159030560 | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | mradermacher/shot-reader-8b-GGUF: shot-reader-8b.Q4_K_M.gguf; 5027786080 | Match: `shot-reader-8b.Q4_K_M.gguf` (5027786080) | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 1159030560 | shot-reader-8b.mmproj-f16.gguf: 1159030560 | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | mradermacher/shot-reader-8b-GGUF: shot-reader-8b.Q5_K_M.gguf; 5851114848 | Match: `shot-reader-8b.Q5_K_M.gguf` (5851114848) | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 1159030560 | shot-reader-8b.mmproj-f16.gguf: 1159030560 | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | mradermacher/shot-reader-8b-GGUF: shot-reader-8b.Q8_0.gguf; 8709520736 | Match: `shot-reader-8b.Q8_0.gguf` (8709520736) | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 1159030560 | shot-reader-8b.mmproj-f16.gguf: 1159030560 | [source](https://huggingface.co/api/models/mradermacher/shot-reader-8b-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/voyager-so/shot-reader-8b/blob/main/README.md) |

### apex-35b-v1

Publisher: [model card](https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/README.md). API revision: `5105f8f9ed8fd8212a72da546bcbb4f01d2cfd68`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/README.md) |
| params (B) | 35.505251456 | 35.951822704B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Apexintelligence-AI/Apex-35B-V1.0?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 40 / 16 / 2 / 256 | 40 / 16 / 2 / 256 | [source](https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF: Apexintelligence-AI_Apex-35B-V1.0-Q3_K_M.gguf; 17821288672 | Match: `Apexintelligence-AI_Apex-35B-V1.0-Q3_K_M.gguf` (17821288672) | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 899283616 | mmproj-Apexintelligence-AI_Apex-35B-V1.0-f16.gguf: 899283616 | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF: Apexintelligence-AI_Apex-35B-V1.0-Q4_K_M.gguf; 22795471072 | Match: `Apexintelligence-AI_Apex-35B-V1.0-Q4_K_M.gguf` (22795471072) | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 899283616 | mmproj-Apexintelligence-AI_Apex-35B-V1.0-f16.gguf: 899283616 | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF: Apexintelligence-AI_Apex-35B-V1.0-Q5_K_M.gguf; 27461634272 | Match: `Apexintelligence-AI_Apex-35B-V1.0-Q5_K_M.gguf` (27461634272) | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 899283616 | mmproj-Apexintelligence-AI_Apex-35B-V1.0-f16.gguf: 899283616 | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF: Apexintelligence-AI_Apex-35B-V1.0-Q8_0.gguf; 37813700832 | Match: `Apexintelligence-AI_Apex-35B-V1.0-Q8_0.gguf` (37813700832) | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 899283616 | mmproj-Apexintelligence-AI_Apex-35B-V1.0-f16.gguf: 899283616 | [source](https://huggingface.co/api/models/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/README.md) |

### daisyrose-27b

Publisher: [model card](https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/README.md). API revision: `64a4ec665091bb0c1931babce4e97e686eef3c5c`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/README.md) |
| params (B) | 27.320697856 | 27.781427952B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/RadixArk/DaisyRose-27B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 64 / 24 / 4 / 256 | 64 / 24 / 4 / 256 | [source](https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | bartowski/RadixArk_DaisyRose-27B-GGUF: RadixArk_DaisyRose-27B-Q3_K_M.gguf; 13325853504 | Match: `RadixArk_DaisyRose-27B-Q3_K_M.gguf` (13325853504) | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 927607424 | mmproj-RadixArk_DaisyRose-27B-f16.gguf: 927607424 | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/RadixArk_DaisyRose-27B-GGUF: RadixArk_DaisyRose-27B-Q4_K_M.gguf; 17325372224 | Match: `RadixArk_DaisyRose-27B-Q4_K_M.gguf` (17325372224) | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 927607424 | mmproj-RadixArk_DaisyRose-27B-f16.gguf: 927607424 | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | bartowski/RadixArk_DaisyRose-27B-GGUF: RadixArk_DaisyRose-27B-Q5_K_M.gguf; 20787639104 | Match: `RadixArk_DaisyRose-27B-Q5_K_M.gguf` (20787639104) | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 927607424 | mmproj-RadixArk_DaisyRose-27B-f16.gguf: 927607424 | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | bartowski/RadixArk_DaisyRose-27B-GGUF: RadixArk_DaisyRose-27B-Q8_0.gguf; 29047079744 | Match: `RadixArk_DaisyRose-27B-Q8_0.gguf` (29047079744) | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 927607424 | mmproj-RadixArk_DaisyRose-27B-f16.gguf: 927607424 | [source](https://huggingface.co/api/models/bartowski/RadixArk_DaisyRose-27B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/README.md) |

### ternary-bonsai-2-27b

Publisher: [model card](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/README.md). API revision: `839bd57023c1558945afea70a74fa83c054f35f9`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/README.md) |
| params (B) | 26.895998464 | No safetensors total in API; card gives nominal count | [source](https://huggingface.co/api/models/prism-ml/Ternary-Bonsai-2-27B-gguf?blobs=true) |
| context / architecture | 262144 / {"layers":64,"attHeads":24,"kvHeads":4,"headDim":256,"attention":{"fullLayers":16}} | Config unavailable; card confirms 262K hybrid Qwen3.8-27B backbone, exact cache sizing not independently re-derived | [source](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/README.md) |
| Q2_0 repo / filename / bytes | prism-ml/Ternary-Bonsai-2-27B-gguf: Ternary-Bonsai-2-27B-Q2_0.gguf; 7626008928 | Match: `Ternary-Bonsai-2-27B-Q2_0.gguf` (7626008928) | [source](https://huggingface.co/api/models/prism-ml/Ternary-Bonsai-2-27B-gguf?blobs=true) |
| Q2_0 mmprojBytes | 629246976 | Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf: 629246976 | [source](https://huggingface.co/api/models/prism-ml/Ternary-Bonsai-2-27B-gguf?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/README.md) |

### botpsy-0-8b

Publisher: [model card](https://huggingface.co/qvac/BotPsy-0.8B/blob/main/README.md). API revision: `24561e9681643eaf807fc28b0875210cb17f89c1`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/qvac/BotPsy-0.8B/blob/main/README.md) |
| params (B) | 0.752393024 | 0.85298592B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/qvac/BotPsy-0.8B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/qvac/BotPsy-0.8B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 24 / 8 / 2 / 256 | 24 / 8 / 2 / 256 | [source](https://huggingface.co/qvac/BotPsy-0.8B/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | qvac/BotPsy-0.8B-GGUFs: botpsy-0.8b-q4_k_m-imat.gguf; 529296960 | Match: `botpsy-0.8b-q4_k_m-imat.gguf` (529296960) | [source](https://huggingface.co/api/models/qvac/BotPsy-0.8B-GGUFs?blobs=true) |
| Q8_0 repo / filename / bytes | qvac/BotPsy-0.8B-GGUFs: botpsy-0.8b-q8_0.gguf; 811843040 | Match: `botpsy-0.8b-q8_0.gguf` (811843040) | [source](https://huggingface.co/api/models/qvac/BotPsy-0.8B-GGUFs?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/qvac/BotPsy-0.8B/blob/main/README.md) |

### mnn-pocket-0-3b

Publisher: [model card](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md). API revision: `48fae9c0be6ec505e80f36f69b8ba21097f9f822`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md) |
| params (B) | 0.361551232 | 0.361551232B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/taobao-mnn/MNN-Pocket-0.3B?blobs=true) |
| contextLength | 32768 | 40960; card explicitly supports 32K in deployment, so retain 32768 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 28 / 14 / 2 / 64 | 28 / 14 / 2 / 64 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/config.json) |
| Q8_0 repo / filename / bytes | taobao-mnn/MNN-Pocket-0.3B-GGUF: MNN-Pocket-0.3B-Instruct-Q8_0.gguf; 386751520 | Match: `MNN-Pocket-0.3B-Instruct-Q8_0.gguf` (386751520) | [source](https://huggingface.co/api/models/taobao-mnn/MNN-Pocket-0.3B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md) |

### mnn-pocket-0-3b-qat

Publisher: [model card](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md). API revision: `48fae9c0be6ec505e80f36f69b8ba21097f9f822`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md) |
| params (B) | 0.302830976 | 0.361551232B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/taobao-mnn/MNN-Pocket-0.3B?blobs=true) |
| contextLength | 32768 | 40960; card explicitly supports 32K in deployment, so retain 32768 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 28 / 14 / 2 / 64 | 28 / 14 / 2 / 64 | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/config.json) |
| Q4_1 repo / filename / bytes | taobao-mnn/MNN-Pocket-0.3B-GGUF: MNN-Pocket-0.3B-Instruct-Q4_1.gguf; 191896672 | Match: `MNN-Pocket-0.3B-Instruct-Q4_1.gguf` (191896672) | [source](https://huggingface.co/api/models/taobao-mnn/MNN-Pocket-0.3B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README.md) |

### arete-27b

Publisher: [model card](https://huggingface.co/NousResearch/Arete-27B/blob/main/README.md). API revision: `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/NousResearch/Arete-27B/blob/main/README.md) |
| params (B) | 27.35672856 | 27.35672856B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/NousResearch/Arete-27B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/NousResearch/Arete-27B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 64 / 24 / 4 / 256 | 64 / 24 / 4 / 256 | [source](https://huggingface.co/NousResearch/Arete-27B/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | bartowski/NousResearch_Arete-27B-GGUF: NousResearch_Arete-27B-Q3_K_M.gguf; 13165067264 | Match: `NousResearch_Arete-27B-Q3_K_M.gguf` (13165067264) | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q3_K_M mmprojBytes | 927607104 | mmproj-NousResearch_Arete-27B-f16.gguf: 927607104 | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/NousResearch_Arete-27B-GGUF: NousResearch_Arete-27B-Q4_K_M.gguf; 17203416064 | Match: `NousResearch_Arete-27B-Q4_K_M.gguf` (17203416064) | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 927607104 | mmproj-NousResearch_Arete-27B-f16.gguf: 927607104 | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | bartowski/NousResearch_Arete-27B-GGUF: NousResearch_Arete-27B-Q5_K_M.gguf; 20684893184 | Match: `NousResearch_Arete-27B-Q5_K_M.gguf` (20684893184) | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 927607104 | mmproj-NousResearch_Arete-27B-f16.gguf: 927607104 | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | bartowski/NousResearch_Arete-27B-GGUF: NousResearch_Arete-27B-Q8_0.gguf; 28665068544 | Match: `NousResearch_Arete-27B-Q8_0.gguf` (28665068544) | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 927607104 | mmproj-NousResearch_Arete-27B-f16.gguf: 927607104 | [source](https://huggingface.co/api/models/bartowski/NousResearch_Arete-27B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/NousResearch/Arete-27B/blob/main/README.md) |

### twil-8b-balanced

Publisher: [model card](https://huggingface.co/webAI-Official/TwIL-8B/blob/main/README.md). API revision: `9563ba7dfb70eeca4a26654b195011cbf818e7d9`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | webai-nc-1.0 | webai-non-commercial-license-ver.-1.0; see publisher licence text | [source](https://huggingface.co/webAI-Official/TwIL-8B/blob/main/LICENSE.md) |
| params (B) | 8.79159296 | 8.79159296B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/webAI-Official/TwIL-8B?blobs=true) |
| contextLength | 131072 | 131072 | [source](https://huggingface.co/webAI-Official/TwIL-8B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 40 / 32 / 8 / 128 | 40 / 32 / 8 / 128 (hidden_size/heads) | [source](https://huggingface.co/webAI-Official/TwIL-8B/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | webAI-Official/TwIL-8B: TwIL-8B-Q4_K_M-balanced.gguf; 5347917568 | Match: `TwIL-8B-Q4_K_M-balanced.gguf` (5347917568) | [source](https://huggingface.co/api/models/webAI-Official/TwIL-8B?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/webAI-Official/TwIL-8B/blob/main/README.md) |

### lfm2-5-1-2b

Publisher: [model card](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/README.md). API revision: `b9d816ab510f9a28dca37cb182e9da8b0226e13c`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | lfm-open-1.0 | lfm1.0; see publisher licence text | [source](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/README.md) |
| params (B) | 1.170340608 | 1.170340608B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-1.2B-Instruct?blobs=true) |
| contextLength | 128000 | 128000 | [source](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 16 / 32 / 8 / 64 | 16 / 32 / 8 / 64 (hidden_size/heads) | [source](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | LiquidAI/LFM2.5-1.2B-Instruct-GGUF: LFM2.5-1.2B-Instruct-Q4_K_M.gguf; 730895168 | Match: `LFM2.5-1.2B-Instruct-Q4_K_M.gguf` (730895168) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-1.2B-Instruct-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | LiquidAI/LFM2.5-1.2B-Instruct-GGUF: LFM2.5-1.2B-Instruct-Q5_K_M.gguf; 843354944 | Match: `LFM2.5-1.2B-Instruct-Q5_K_M.gguf` (843354944) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-1.2B-Instruct-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | LiquidAI/LFM2.5-1.2B-Instruct-GGUF: LFM2.5-1.2B-Instruct-Q8_0.gguf; 1246253888 | Match: `LFM2.5-1.2B-Instruct-Q8_0.gguf` (1246253888) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-1.2B-Instruct-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/README.md) |

### lfm2-5-8b-a1b

Publisher: [model card](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/README.md). API revision: `dd83f5cb02aa2938b66bba9a9998d38d0517c1f3`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | lfm-open-1.0 | lfm1.0; see publisher licence text | [source](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/README.md) |
| params (B) | 8.467856832 | 8.467856832B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-8B-A1B?blobs=true) |
| contextLength | 128000 | 128000 | [source](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 24 / 32 / 8 / 64 | 24 / 32 / 8 / 64 (hidden_size/heads) | [source](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | LiquidAI/LFM2.5-8B-A1B-GGUF: LFM2.5-8B-A1B-Q4_K_M.gguf; 5155564768 | Match: `LFM2.5-8B-A1B-Q4_K_M.gguf` (5155564768) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-8B-A1B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | LiquidAI/LFM2.5-8B-A1B-GGUF: LFM2.5-8B-A1B-Q5_K_M.gguf; 6030339296 | Match: `LFM2.5-8B-A1B-Q5_K_M.gguf` (6030339296) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-8B-A1B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | LiquidAI/LFM2.5-8B-A1B-GGUF: LFM2.5-8B-A1B-Q8_0.gguf; 9010195680 | Match: `LFM2.5-8B-A1B-Q8_0.gguf` (9010195680) | [source](https://huggingface.co/api/models/LiquidAI/LFM2.5-8B-A1B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/README.md) |

### ministral-3-14b

Publisher: [model card](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512/blob/main/README.md). API revision: `29439f81c2be264d8d393273f99e7db9c0961120`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512/blob/main/README.md) |
| params (B) | 13.50607872 | 13.94503168B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 40 / 32 / 8 / 128 | 40 / 32 / 8 / 128 | [source](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | mistralai/Ministral-3-14B-Instruct-2512-GGUF: Ministral-3-14B-Instruct-2512-Q4_K_M.gguf; 8239593024 | Match: `Ministral-3-14B-Instruct-2512-Q4_K_M.gguf` (8239593024) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 879258784 | Ministral-3-14B-Instruct-2512-BF16-mmproj.gguf: 879258784 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | mistralai/Ministral-3-14B-Instruct-2512-GGUF: Ministral-3-14B-Instruct-2512-Q5_K_M.gguf; 9621091904 | Match: `Ministral-3-14B-Instruct-2512-Q5_K_M.gguf` (9621091904) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 879258784 | Ministral-3-14B-Instruct-2512-BF16-mmproj.gguf: 879258784 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | mistralai/Ministral-3-14B-Instruct-2512-GGUF: Ministral-3-14B-Instruct-2512-Q8_0.gguf; 14359836224 | Match: `Ministral-3-14B-Instruct-2512-Q8_0.gguf` (14359836224) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 879258784 | Ministral-3-14B-Instruct-2512-BF16-mmproj.gguf: 879258784 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-14B-Instruct-2512-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512/blob/main/README.md) |

### ministral-3-3b

Publisher: [model card](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512/blob/main/README.md). API revision: `b35d4dfe56c142746f54dbd64f579faab2744308`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512/blob/main/README.md) |
| params (B) | 3.429006336 | 3.849090048B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 26 / 32 / 8 / 128 | 26 / 32 / 8 / 128 | [source](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | mistralai/Ministral-3-3B-Instruct-2512-GGUF: Ministral-3-3B-Instruct-2512-Q4_K_M.gguf; 2147023008 | Match: `Ministral-3-3B-Instruct-2512-Q4_K_M.gguf` (2147023008) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 841501856 | Ministral-3-3B-Instruct-2512-BF16-mmproj.gguf: 841501856 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | mistralai/Ministral-3-3B-Instruct-2512-GGUF: Ministral-3-3B-Instruct-2512-Q5_K_M.gguf; 2474178720 | Match: `Ministral-3-3B-Instruct-2512-Q5_K_M.gguf` (2474178720) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 841501856 | Ministral-3-3B-Instruct-2512-BF16-mmproj.gguf: 841501856 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | mistralai/Ministral-3-3B-Instruct-2512-GGUF: Ministral-3-3B-Instruct-2512-Q8_0.gguf; 3652204704 | Match: `Ministral-3-3B-Instruct-2512-Q8_0.gguf` (3652204704) | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 841501856 | Ministral-3-3B-Instruct-2512-BF16-mmproj.gguf: 841501856 | [source](https://huggingface.co/api/models/mistralai/Ministral-3-3B-Instruct-2512-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512/blob/main/README.md) |

### clover-35b-a3b-preview

Publisher: [model card](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/blob/main/README.md). API revision: `4b0402b65e523d0183a14c431955438714cb16ff`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/blob/main/README.md) |
| params (B) | 34.66 | 34.661350848B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Diffuspace/Clover-35B-A3B-Preview?blobs=true) |
| contextLength | 131072 | 131072 | [source](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 40 / 16 / 2 / 256 | 40 / 16 / 2 / 256 | [source](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF: Diffuspace_Clover-35B-A3B-Preview-Q3_K_M.gguf; 17344330656 | Match: `Diffuspace_Clover-35B-A3B-Preview-Q3_K_M.gguf` (17344330656) | [source](https://huggingface.co/api/models/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF?blobs=true) |
| Q4_0 repo / filename / bytes | bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF: Diffuspace_Clover-35B-A3B-Preview-Q4_0.gguf; 19942611872 | Match: `Diffuspace_Clover-35B-A3B-Preview-Q4_0.gguf` (19942611872) | [source](https://huggingface.co/api/models/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF: Diffuspace_Clover-35B-A3B-Preview-Q4_K_M.gguf; 22318513056 | Match: `Diffuspace_Clover-35B-A3B-Preview-Q4_K_M.gguf` (22318513056) | [source](https://huggingface.co/api/models/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF: Diffuspace_Clover-35B-A3B-Preview-Q5_K_M.gguf; 26984676256 | Match: `Diffuspace_Clover-35B-A3B-Preview-Q5_K_M.gguf` (26984676256) | [source](https://huggingface.co/api/models/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF: Diffuspace_Clover-35B-A3B-Preview-Q8_0.gguf; 36914690976 | Match: `Diffuspace_Clover-35B-A3B-Preview-Q8_0.gguf` (36914690976) | [source](https://huggingface.co/api/models/bartowski/Diffuspace_Clover-35B-A3B-Preview-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview/blob/main/README.md) |

### hy-memory-30b-a3b

Publisher: [model card](https://huggingface.co/tencent/Hy-Memory-30B-A3B/blob/main/README.md). API revision: `64a460a94d5498b7316fb02395c72d01c47a7347`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/tencent/Hy-Memory-30B-A3B/blob/main/README.md) |
| params (B) | 30.06 | 30.064725888B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/tencent/Hy-Memory-30B-A3B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 48 / 32 / 4 / 128 | 48 / 32 / 4 / 128 | [source](https://huggingface.co/tencent/Hy-Memory-30B-A3B/blob/main/config.json) |
| Q3_K_M repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q3_K_M.gguf; 14446329600 | Match: `Hy-Memory-30B-A3B-Q3_K_M.gguf` (14446329600) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q4_K_M.gguf; 18236702464 | Match: `Hy-Memory-30B-A3B-Q4_K_M.gguf` (18236702464) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q6_K.gguf; 24707464960 | Match: `Hy-Memory-30B-A3B-Q6_K.gguf` (24707464960) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q8_0.gguf; 31985728896 | Match: `Hy-Memory-30B-A3B-Q8_0.gguf` (31985728896) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| Q8_0-expsIQ2_XXS repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q8_0-expsIQ2_XXS.gguf; 9143025408 | Match: `Hy-Memory-30B-A3B-Q8_0-expsIQ2_XXS.gguf` (9143025408) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| Q8_0-expsIQ1_M repo / filename / bytes | tencent/Hy-Memory-30B-A3B-GGUF: Hy-Memory-30B-A3B-Q8_0-expsIQ1_M.gguf; 8034156288 | Match: `Hy-Memory-30B-A3B-Q8_0-expsIQ1_M.gguf` (8034156288) | [source](https://huggingface.co/api/models/tencent/Hy-Memory-30B-A3B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/tencent/Hy-Memory-30B-A3B/blob/main/README.md) |

### kolibri-1-78b-a3-5b

Publisher: [model card](https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/blob/main/README.md). API revision: `88ec6355ad703d569e5a4e23b9c5adda589cf7f3`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/blob/main/README.md) |
| params (B) | 78.1 | 78.10307456B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Aleph-Alpha/Kolibri-1-BF16?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 50 / 48 / 4 / 128 | 50 / 48 / 4 / 128 | [source](https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/blob/main/config.json) |
| IQ1_M repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-IQ1_M.gguf; 19774226304 | Match: `Kolibri-1-IQ1_M.gguf` (19774226304) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| IQ2_XXS repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-IQ2_XXS.gguf; 22774013824 | Match: `Kolibri-1-IQ2_XXS.gguf` (22774013824) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| IQ2_XS repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-IQ2_XS.gguf; 24339996544 | Match: `Kolibri-1-IQ2_XS.gguf` (24339996544) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| IQ3_XXS repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-IQ3_XXS.gguf; 33653829504 | Match: `Kolibri-1-IQ3_XXS.gguf` (33653829504) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| Q3_K_M repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-Q3_K_M.gguf; 37620641664 | Match: `Kolibri-1-Q3_K_M.gguf` (37620641664) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| IQ4_XS repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-IQ4_XS.gguf; 43632914304 | Match: `Kolibri-1-IQ4_XS.gguf` (43632914304) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/Kolibri-1-GGUF: Kolibri-1-Q4_K_M.gguf; 49759219584 | Match: `Kolibri-1-Q4_K_M.gguf` (49759219584) | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | bartowski/Kolibri-1-GGUF: (split shards; no single filename); 83135393696 | Match: `Kolibri-1-Q8_0/Kolibri-1-Q8_0-00001-of-00003.gguf` (39733405216); `Kolibri-1-Q8_0/Kolibri-1-Q8_0-00002-of-00003.gguf` (39568431904); `Kolibri-1-Q8_0/Kolibri-1-Q8_0-00003-of-00003.gguf` (3833556576); sum 83135393696 | [source](https://huggingface.co/api/models/bartowski/Kolibri-1-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/blob/main/README.md) |

### ripple-65b-preview

Publisher: [model card](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/README.md). API revision: `d58dbcf43344e27494a40cec6727e180450f4a6b`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/README.md) |
| params (B) | 64.79 | 64.78268936B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/ricursiveAI/Ripple-65B-Preview?blobs=true) |
| contextLength | 2097152 | 2097152 | [source](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 80 / 80 / 8 / 128 | 80 / 80 / 8 / 128 | [source](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/config.json) |
| IQ1_M repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ1_M.gguf; 18493392352 | Match: `Ripple-65B-Preview-AD-IQ1_M.gguf` (18493392352) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ2_XXS repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ2_XXS.gguf; 20007273952 | Match: `Ripple-65B-Preview-AD-IQ2_XXS.gguf` (20007273952) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ2_XS repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ2_XS.gguf; 22120482272 | Match: `Ripple-65B-Preview-AD-IQ2_XS.gguf` (22120482272) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ2_S repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ2_S.gguf; 25310774752 | Match: `Ripple-65B-Preview-AD-IQ2_S.gguf` (25310774752) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ3_XXS repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ3_XXS.gguf; 27964982752 | Match: `Ripple-65B-Preview-AD-IQ3_XXS.gguf` (27964982752) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ3_S repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ3_S.gguf; 32411600352 | Match: `Ripple-65B-Preview-AD-IQ3_S.gguf` (32411600352) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| IQ4_XS repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-IQ4_XS.gguf; 38722143712 | Match: `Ripple-65B-Preview-AD-IQ4_XS.gguf` (38722143712) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-Q4_K_M.gguf; 38798820576 | Match: `Ripple-65B-Preview-Q4_K_M.gguf` (38798820576) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: Ripple-65B-Preview-AD-Q5_K_M.gguf; 47929624032 | Match: `Ripple-65B-Preview-AD-Q5_K_M.gguf` (47929624032) | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: (split shards; no single filename); 57666225856 | Match: `Ripple-65B-Preview-AD-Q6_K-00001-of-00002.gguf` (45000893024); `Ripple-65B-Preview-AD-Q6_K-00002-of-00002.gguf` (12665332832); sum 57666225856 | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | AtomicChat/Ripple-65B-Preview-GGUF: (split shards; no single filename); 68840113568 | Match: `Ripple-65B-Preview-Q8_0-00001-of-00002.gguf` (44906597984); `Ripple-65B-Preview-Q8_0-00002-of-00002.gguf` (23933515584); sum 68840113568 | [source](https://huggingface.co/api/models/AtomicChat/Ripple-65B-Preview-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/README.md) |

### xing4-0-29b-a4b

Publisher: [model card](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B/blob/main/README.md). API revision: `a4326a38845cb3de339105a95449b81e2bdf29af`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B/blob/main/README.md) |
| params (B) | 31.23 | 31.215031088B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/XingChen-AGI/Xing4.0-29B-A4B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 40 / 32 / 1 / 288 | 40 / 32 / 32 / 112 (hidden_size/heads); MLA cache representation differs; not a direct mismatch | [source](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B/blob/main/config.json) |
| Q8_0 repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q8_0.gguf; 33222310848 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q8_0.gguf` (33222310848) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q6_K.gguf; 27191114688 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q6_K.gguf` (27191114688) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q5_K_M.gguf; 24000035776 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q5_K_M.gguf` (24000035776) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf; 20056603584 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q4_K_M.gguf` (20056603584) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| IQ4_XS repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-IQ4_XS.gguf; 17982561216 | Match: `XingChen-AGI_Xing4.0-29B-A4B-IQ4_XS.gguf` (17982561216) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| Q3_K_M repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q3_K_M.gguf; 16100834240 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q3_K_M.gguf` (16100834240) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| IQ3_XXS repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-IQ3_XXS.gguf; 14433573824 | Match: `XingChen-AGI_Xing4.0-29B-A4B-IQ3_XXS.gguf` (14433573824) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| Q2_K repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-Q2_K.gguf; 12841507776 | Match: `XingChen-AGI_Xing4.0-29B-A4B-Q2_K.gguf` (12841507776) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| IQ2_XXS repo / filename / bytes | bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF: XingChen-AGI_Xing4.0-29B-A4B-IQ2_XXS.gguf; 10317247424 | Match: `XingChen-AGI_Xing4.0-29B-A4B-IQ2_XXS.gguf` (10317247424) | [source](https://huggingface.co/api/models/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B/blob/main/README.md) |

### metis-1-6-logos

Publisher: [model card](https://huggingface.co/Lernex/Metis-1.6-Logos/blob/main/README.md). API revision: `f965c9a571686ef6e31ec74b478c4c0bf7f151ae`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Lernex/Metis-1.6-Logos/blob/main/README.md) |
| params (B) | 10.24 | 10.393227876B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos?blobs=true) |
| contextLength | 131072 | 131072 | [source](https://huggingface.co/Lernex/Metis-1.6-Logos/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 20 / 40 / 10 / 64 | 20 / 40 / 10 / 64 | [source](https://huggingface.co/Lernex/Metis-1.6-Logos/blob/main/config.json) |
| IQ4_XS repo / filename / bytes | Lernex/Metis-1.6-Logos-GGUF: Metis-1.6-Logos-IQ4_XS.gguf; 6065003936 | Match: `Metis-1.6-Logos-IQ4_XS.gguf` (6065003936) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | Lernex/Metis-1.6-Logos-GGUF: Metis-1.6-Logos-Q4_K_M.gguf; 6744975776 | Match: `Metis-1.6-Logos-Q4_K_M.gguf` (6744975776) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | Lernex/Metis-1.6-Logos-GGUF: Metis-1.6-Logos-Q5_K_M.gguf; 7834279776 | Match: `Metis-1.6-Logos-Q5_K_M.gguf` (7834279776) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | Lernex/Metis-1.6-Logos-GGUF: Metis-1.6-Logos-Q6_K.gguf; 8847425376 | Match: `Metis-1.6-Logos-Q6_K.gguf` (8847425376) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | Lernex/Metis-1.6-Logos-GGUF: Metis-1.6-Logos-Q8_0.gguf; 11105534816 | Match: `Metis-1.6-Logos-Q8_0.gguf` (11105534816) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Logos-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Lernex/Metis-1.6-Logos/blob/main/README.md) |

### metis-1-6-praxis

Publisher: [model card](https://huggingface.co/Lernex/Metis-1.6-Praxis/blob/main/README.md). API revision: `ff28a9ee82fed593e9d07b7a5c93004c286d1405`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | apache-2.0 | apache-2.0 | [source](https://huggingface.co/Lernex/Metis-1.6-Praxis/blob/main/README.md) |
| params (B) | 2.95 | 3.077520815B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis?blobs=true) |
| contextLength | 131072 | 131072 | [source](https://huggingface.co/Lernex/Metis-1.6-Praxis/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 12 / 32 / 8 / 64 | 12 / 32 / 8 / 64 | [source](https://huggingface.co/Lernex/Metis-1.6-Praxis/blob/main/config.json) |
| IQ4_XS repo / filename / bytes | Lernex/Metis-1.6-Praxis-GGUF: Metis-1.6-Praxis-IQ4_XS.gguf; 1836154464 | Match: `Metis-1.6-Praxis-IQ4_XS.gguf` (1836154464) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | Lernex/Metis-1.6-Praxis-GGUF: Metis-1.6-Praxis-Q4_K_M.gguf; 2019139168 | Match: `Metis-1.6-Praxis-Q4_K_M.gguf` (2019139168) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | Lernex/Metis-1.6-Praxis-GGUF: Metis-1.6-Praxis-Q5_K_M.gguf; 2325706336 | Match: `Metis-1.6-Praxis-Q5_K_M.gguf` (2325706336) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | Lernex/Metis-1.6-Praxis-GGUF: Metis-1.6-Praxis-Q6_K.gguf; 2597131872 | Match: `Metis-1.6-Praxis-Q6_K.gguf` (2597131872) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | Lernex/Metis-1.6-Praxis-GGUF: Metis-1.6-Praxis-Q8_0.gguf; 3224393312 | Match: `Metis-1.6-Praxis-Q8_0.gguf` (3224393312) | [source](https://huggingface.co/api/models/Lernex/Metis-1.6-Praxis-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/Lernex/Metis-1.6-Praxis/blob/main/README.md) |

### lfm3-vl-2b

Publisher: [model card](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/README.md). API revision: `23387beda43c60310348e83e25f78f33c3140d3a`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | lfm-open-1.0 | lfm1.0; see publisher licence text | [source](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/README.md) |
| params (B) | 1.73 | 1.918181888B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B?blobs=true) |
| contextLength | 128000 | 128000 | [source](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 24 / 16 / 4 / 128 | 24 / 16 / 4 / 128 | [source](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | LiquidAI/LFM3-VL-2B-GGUF: LFM3-VL-2B-Q4_K_M.gguf; 1099627808 | Match: `LFM3-VL-2B-Q4_K_M.gguf` (1099627808) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 378996032 | mmproj-LFM3-VL-2B-BF16.gguf: 378996032; mmproj-LFM3-VL-2B-F16.gguf: 378996032 | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | LiquidAI/LFM3-VL-2B-GGUF: LFM3-VL-2B-Q5_K_M.gguf; 1258663200 | Match: `LFM3-VL-2B-Q5_K_M.gguf` (1258663200) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q5_K_M mmprojBytes | 378996032 | mmproj-LFM3-VL-2B-BF16.gguf: 378996032; mmproj-LFM3-VL-2B-F16.gguf: 378996032 | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | LiquidAI/LFM3-VL-2B-GGUF: LFM3-VL-2B-Q6_K.gguf; 1427638304 | Match: `LFM3-VL-2B-Q6_K.gguf` (1427638304) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q6_K mmprojBytes | 378996032 | mmproj-LFM3-VL-2B-BF16.gguf: 378996032; mmproj-LFM3-VL-2B-F16.gguf: 378996032 | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | LiquidAI/LFM3-VL-2B-GGUF: LFM3-VL-2B-Q8_0.gguf; 1846238496 | Match: `LFM3-VL-2B-Q8_0.gguf` (1846238496) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 378996032 | mmproj-LFM3-VL-2B-BF16.gguf: 378996032; mmproj-LFM3-VL-2B-F16.gguf: 378996032 | [source](https://huggingface.co/api/models/LiquidAI/LFM3-VL-2B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/README.md) |

### mistral-large-4

Publisher: [model card](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/README.md). API revision: `af26e7869af601441d5cdf75a1272469ddc3d059`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | mistral-open-weight | other; see publisher licence text; class corrected to restricted | [source](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/README.md) |
| params (B) | 1049.36 | No safetensors total in API; card gives nominal count | [source](https://huggingface.co/api/models/mistralai/Mistral-Large-4-1T-A52B?blobs=true) |
| contextLength | 1048576 | 1048576 | [source](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 72 / 64 / 1 / 288 | 72 / 64 / 64 / 64; MLA cache representation differs; not a direct mismatch | [source](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/config.json) |
| IQ2_XXS repo / filename / bytes | ggml-org/Mistral-Large-4-1T-A52B-GGUF: (split shards; no single filename); 297676048832 | Match: `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00001-of-00006.gguf` (49163206752); `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00002-of-00006.gguf` (49776608640); `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00003-of-00006.gguf` (49720940320); `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00004-of-00006.gguf` (49710906784); `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00005-of-00006.gguf` (49710906784); `IQ2_XXS/Mistral-Large-4-1T-A52B-IQ2_XXS-00006-of-00006.gguf` (49593479552); sum 297676048832 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| IQ2_XXS mmprojBytes | 3444696416 | mmproj-BF16.gguf: 3444696416 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q2_K repo / filename / bytes | ggml-org/Mistral-Large-4-1T-A52B-GGUF: (split shards; no single filename); 380706433472 | Match: `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00001-of-00008.gguf` (49793631328); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00002-of-00008.gguf` (48061691744); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00003-of-00008.gguf` (48043378976); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00004-of-00008.gguf` (48043378976); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00005-of-00008.gguf` (48032679136); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00006-of-00008.gguf` (48032695392); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00007-of-00008.gguf` (48041310240); `Q2_K/Mistral-Large-4-1T-A52B-Q2_K-00008-of-00008.gguf` (42657667680); sum 380706433472 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q2_K mmprojBytes | 3444696416 | mmproj-BF16.gguf: 3444696416 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q4_K_M repo / filename / bytes | ggml-org/Mistral-Large-4-1T-A52B-GGUF: (split shards; no single filename); 634802244608 | Match: `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00001-of-00013.gguf` (49955069664); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00002-of-00013.gguf` (49252350976); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00003-of-00013.gguf` (48304324800); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00004-of-00013.gguf` (49438283744); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00005-of-00013.gguf` (49513536192); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00006-of-00013.gguf` (49515486016); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00007-of-00013.gguf` (49437732704); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00008-of-00013.gguf` (49525303680); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00009-of-00013.gguf` (49498403616); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00010-of-00013.gguf` (49451271840); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00011-of-00013.gguf` (49510543936); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00012-of-00013.gguf` (47720826208); `Q4_K_M/Mistral-Large-4-1T-A52B-Q4_K_M-00013-of-00013.gguf` (43679111232); sum 634802244608 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q4_K_M mmprojBytes | 3444696416 | mmproj-BF16.gguf: 3444696416 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | ggml-org/Mistral-Large-4-1T-A52B-GGUF: (split shards; no single filename); 1115150340608 | Match: `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00001-of-00024.gguf` (47729425376); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00002-of-00024.gguf` (46966507456); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00003-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00004-of-00024.gguf` (46966507456); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00005-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00006-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00007-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00008-of-00024.gguf` (46939768672); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00009-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00010-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00011-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00012-of-00024.gguf` (46913029920); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00013-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00014-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00015-of-00024.gguf` (46913029920); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00016-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00017-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00018-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00019-of-00024.gguf` (46939768672); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00020-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00021-of-00024.gguf` (46913029952); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00022-of-00024.gguf` (46939768704); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00023-of-00024.gguf` (46939768672); `Q8_0/Mistral-Large-4-1T-A52B-Q8_0-00024-of-00024.gguf` (34906436416); sum 1115150340608 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| Q8_0 mmprojBytes | 3444696416 | mmproj-BF16.gguf: 3444696416 | [source](https://huggingface.co/api/models/ggml-org/Mistral-Large-4-1T-A52B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/README.md) |

### lfm3-1-7b

Publisher: [model card](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/README.md). API revision: `1da06bec6a819da10b54c67e5c90972b46d81871`.

| Field | Site value | Official value / outcome | Source |
| --- | --- | --- | --- |
| licence | lfm-open-1.0 | lfm1.0; see publisher licence text | [source](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/README.md) |
| params (B) | 1.73 | 1.728801536B full source checkpoint (not necessarily the GGUF language tensor total) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-1.7B?blobs=true) |
| contextLength | 262144 | 262144 | [source](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/config.json) |
| arch layers / attention heads / KV heads / head dimension | 24 / 16 / 4 / 128 | 24 / 16 / 4 / 128 | [source](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/config.json) |
| Q4_K_M repo / filename / bytes | LiquidAI/LFM3-1.7B-GGUF: LFM3-1.7B-Q4_K_M.gguf; 1099627808 | Match: `LFM3-1.7B-Q4_K_M.gguf` (1099627808) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-1.7B-GGUF?blobs=true) |
| Q5_K_M repo / filename / bytes | LiquidAI/LFM3-1.7B-GGUF: LFM3-1.7B-Q5_K_M.gguf; 1258663200 | Match: `LFM3-1.7B-Q5_K_M.gguf` (1258663200) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-1.7B-GGUF?blobs=true) |
| Q6_K repo / filename / bytes | LiquidAI/LFM3-1.7B-GGUF: LFM3-1.7B-Q6_K.gguf; 1427638304 | Match: `LFM3-1.7B-Q6_K.gguf` (1427638304) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-1.7B-GGUF?blobs=true) |
| Q8_0 repo / filename / bytes | LiquidAI/LFM3-1.7B-GGUF: LFM3-1.7B-Q8_0.gguf; 1846238496 | Match: `LFM3-1.7B-Q8_0.gguf` (1846238496) | [source](https://huggingface.co/api/models/LiquidAI/LFM3-1.7B-GGUF?blobs=true) |
| per-quant speed / perplexity | not recorded | No site number to correct; publisher task benchmark scores are not RTX 4090 throughput or per-quant loss | [source](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/README.md) |

## Checked-and-correct fields by model

Exact file/shard totals and recorded projector sizes matched for all 103 quant variants across the 25 selected models.

This is a field-qualified list, not a claim that every parameter-count/runtime assumption is settled.

- `clairic-27b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `clairic-flash-9b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `shot-reader-8b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `apex-35b-v1`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `daisyrose-27b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `ternary-bonsai-2-27b`: exact quant filenames/byte totals and projector sizes match the repository API; Apache licence and nominal context match card (config unavailable).
- `botpsy-0-8b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `mnn-pocket-0-3b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `mnn-pocket-0-3b-qat`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `arete-27b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `twil-8b-balanced`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `lfm2-5-1-2b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `lfm2-5-8b-a1b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `ministral-3-14b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `ministral-3-3b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `clover-35b-a3b-preview`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `hy-memory-30b-a3b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `kolibri-1-78b-a3-5b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `ripple-65b-preview`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `xing4-0-29b-a4b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `metis-1-6-logos`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `metis-1-6-praxis`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.
- `lfm3-vl-2b`: exact quant filenames/byte totals and projector sizes match the repository API; licence and context checked against publisher evidence.
- `mistral-large-4`: exact quant filenames/byte totals and projector sizes match the repository API; licence classification corrected; context matches.
- `lfm3-1-7b`: exact quant filenames/byte totals match the repository API; licence and context checked against publisher evidence.

## Unresolved / ambiguous items and deliberate non-changes

- **Stored versus original parameter totals:** the full safetensors totals above often include components absent from the language GGUF. This pass did not re-read every GGUF tensor directory, so these remain qualified rather than “fixed.” In particular, Clairic, Flash, Shot Reader, Apex, DaisyRose and Ministral include vision; Pocket QAT and Q8_0 intentionally have separate stored output layouts. Clover/Hy/Kolibri totals are rounded on the site. Metis cards say 10.23B / 2.94B while site values are 10.24B / 2.95B and API totals are 10.393B / 3.078B; do not resolve these by guessing which components count.
- **MLA:** Xing config has 32 KV heads and Mistral has 64, but site uses compressed-cache pseudo-heads (1 × 288 plus the Mistral sparse/shared-layer adjustment). Directly copying config heads would break the representation. Cache-runtime derivation was not repeated here.
- **Pocket context:** config max_position_embeddings is 40960, but the publisher card explicitly says “40,960 positions (32K supported in deployment).” The site's 32768 is deliberately retained.
- **Bonsai:** publisher GGUF repo has no config.json (404); its card describes 27.36B including vision, and language-only files. Exact parameter/cache shape is not independently established by this pass.
- **Benchmark provenance:** no selected quant has a site per-quant speed or loss number. Publisher benchmarks are not interchangeable with quantized runtime measurements. Historical speedBenchmarks/pplBenchmarks/matrixData are outside the selected cohort and were not re-verified. No price records were found in gpus.ts.
- **Licence text:** TwIL's API uses “other”; its LICENSE.md identifies webAI Non-Commercial License 1.0, agreeing with the site. Liquid's “other” cards name LFM Open License v1.0; the LFM3 licence text retains a separate licence requirement above its revenue threshold. Mistral's MaaS gate is explicit even though internal commercial use remains allowed.
- **Scope cap:** pending-only entries and older changed model records are deferred, not verified by this pass. The 36 recent-but-older indexed ids are enumerated above. Dates in this log are verification dates, not new model releases.

## Local validation — 2026-11-21

- Follow-up: prepended a dated English/Chinese entry in `lib/data/changelog.ts` explaining the Mistral licence reclassification and Hub filter change. `lib/data/meta.ts` already has `dataLastUpdated = '2026-11-21'`, so no date edit was needed.
- `npm test`: passed recommendations (58,254 fits / 82 profiles), calculator evidence, speed calibration, exact CLI sources and RSS checks.
- `npm run build`: passed compilation, lint/type checks, static page generation (1,204/1,204), and postbuild checks (646 pages; 322 Chinese pages; 1,166 structured-data entities). IndexNow skipped because this is not a Cloudflare production build.
- The build-generated `lib/data/hf-stats.json` changes are excluded. No deployment or visual/browser verification was performed.

## Pass 2 (2026-11-21)

This pass covers the 36 deferred indexed models listed above. Together with Pass 1, the review now covers **all 61 recent indexed models** in the selected addedAt scope; the earlier 36-model deferral is resolved as a review deferral, not a claim that every field is independently established. Pending-only and older records remain outside that cohort. Only clear source-backed corrections are applied; the qualifications below remain unchanged in data.

### Corrections

| Date | Model id | Field | Old value | New value | Source |
| --- | --- | --- | --- | --- | --- |
| 2026-11-21 | muse-spark-open-816b-a42b | licence mapping / name / class / link | nvidia-open-model / NVIDIA Open Model Licence / commercial / NVIDIA agreement | muse-model-license / Muse Model License (Muse 模型许可) / restricted / publisher HF page | [Publisher API](https://huggingface.co/api/models/meta-models/Muse-Spark-Open-816B-A42B?blobs=true), cardData.license_name and full licence in extra_gated_prompt; [publisher page](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B) |
| 2026-11-21 | mimo-v2-6-flash | Q2_K source.bytes | 126365949248 | 126365949344 | [Quant publisher API](https://huggingface.co/api/models/ggml-org/MiMo-V2.6-Flash-RL-GGUF?blobs=true) |
| 2026-11-21 | mimo-v2-6-flash | MXFP4 source.bytes | 167369465152 | 167369465248 | [Quant publisher API](https://huggingface.co/api/models/ggml-org/MiMo-V2.6-Flash-RL-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-bolt-74b-a9b | IQ2_XXS source.bytes | 22018326528 | 22018326464 | [Quant publisher API](https://huggingface.co/api/models/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | Q4_0 source.bytes | 71803752384 | 72101548000 | [Quant publisher API](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | Q8_0 source.bytes | 128472993728 | 128472993760 | [Quant publisher API](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q2_K source.file | `K2-Horizon-375B-A23B-Q2_K-00001-of-00004.gguf` | `K2-Horizon-375B-A23B-Q2_K/K2-Horizon-375B-A23B-Q2_K-00001-of-00004.gguf` | [Quant publisher API](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q3_K_M source.file | `K2-Horizon-375B-A23B-Q3_K_M-00001-of-00005.gguf` | `K2-Horizon-375B-A23B-Q3_K_M/K2-Horizon-375B-A23B-Q3_K_M-00001-of-00005.gguf` | [Quant publisher API](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q4_K_M source.file | `K2-Horizon-375B-A23B-Q4_K_M-00001-of-00007.gguf` | `K2-Horizon-375B-A23B-Q4_K_M/K2-Horizon-375B-A23B-Q4_K_M-00001-of-00007.gguf` | [Quant publisher API](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q8_0 source.file | `K2-Horizon-375B-A23B-Q8_0-00001-of-00011.gguf` | `K2-Horizon-375B-A23B-Q8_0/K2-Horizon-375B-A23B-Q8_0-00001-of-00011.gguf` | [Quant publisher API](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | Q4_0 derived bpw / legacy vramGB | 4.76 / 75.1 | 4.78 / 75.4 | [Quant publisher API](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true); bytes × 8 / unchanged 120.76B; calcVRAM at 4K |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | bilingual description: Q4_0 artifact size | 71.8 GB | 72.1 GB | [Quant publisher API](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true); 72101548000 bytes |
| 2026-11-21 | mimo-v2-6-flash | Q2_K source.checkedAt | 2026-10-20 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/ggml-org/MiMo-V2.6-Flash-RL-GGUF?blobs=true) |
| 2026-11-21 | mimo-v2-6-flash | MXFP4 source.checkedAt | 2026-10-20 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/ggml-org/MiMo-V2.6-Flash-RL-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-bolt-74b-a9b | IQ2_XXS source.checkedAt | 2026-10-16 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | Q4_0 source.checkedAt | 2026-10-16 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true) |
| 2026-11-21 | nemotron-3.5-super-vl-120b-a12b | Q8_0 source.checkedAt | 2026-10-16 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q2_K source.checkedAt | 2026-10-23 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q3_K_M source.checkedAt | 2026-10-23 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q4_K_M source.checkedAt | 2026-10-23 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | k2-horizon-375b-a23b | Q8_0 source.checkedAt | 2026-10-23 | 2026-11-21 | [Rechecked listing](https://huggingface.co/api/models/bartowski/K2-Horizon-375B-A23B-GGUF?blobs=true) |
| 2026-11-21 | site metadata | sizingChangedAt | 2026-11-05 | 2026-11-21 | Sizing changes above; dataLastUpdated already 2026-11-21 |
| 2026-11-21 | reader-facing changelog | bilingual release entry | no Pass 2 entry | prepended Muse filter and 36-model verification entry | Publisher evidence above; lib/data/changelog.ts |

Muse Model License section 3 requires a separate written agreement when a Model-as-a-Service operator and its affiliates exceed $20M aggregate gross revenue during consecutive twelve months; internal/non-MaaS use is exempt. This matches the site's restricted-class rule for revenue gates. Muse Glimmer was checked separately: its [publisher API](https://huggingface.co/api/models/meta-models/Muse-Glimmer-30B?blobs=true) and [LICENSE](https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/LICENSE) identify Apache 2.0, so its existing mapping is retained. There are no other Muse mappings in the table.

The five byte differences are current listing differences, not a determination of whether historical files changed. MiMo's totals include both shards (each differs by 96 bytes); Bolt selects the exact non-UD IQ2_XXS file. Super VL's main-model sizes exclude MTP and projector files. Its projector remains 966925568 bytes. K2's recorded part counts and all four byte sums match; only the directory prefixes change. QuantSource.file is the exact repo listing path; split-source callers in LaunchCommands and CLIGenerator deliberately omit ggufFilename when parts > 1, retaining the existing wildcard command strategy.

### Qualified checked-correct list

These models have agreeing licence identity, scalar publisher architecture/context and parameter figures consistent at displayed/nominal precision or the selected stored layout. This is not runtime/cache or benchmark certification; missing provenance remains qualified.

- `nanbeige4.3-33b`: apache-2.0; context 524288; [publisher config](https://huggingface.co/Nanbeige/Nanbeige4.3-33B/blob/main/config.json) and [API](https://huggingface.co/api/models/Nanbeige/Nanbeige4.3-33B?blobs=true). Recorded artifact sizes match.
- `spark-x2.6-4b`: apache-2.0; context 1048576; [publisher config](https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/config.json) and [API](https://huggingface.co/api/models/XHToken/Spark-X2.6-4B?blobs=true). Recorded artifact sizes match.
- `k2-horizon-0-9b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/IFM/K2-Horizon-0.9B/blob/main/config.json) and [API](https://huggingface.co/api/models/IFM/K2-Horizon-0.9B?blobs=true). Recorded artifact sizes match.
- `k2-horizon-3-7b`: apache-2.0; context 524288; [publisher config](https://huggingface.co/IFM/K2-Horizon-3.7B/blob/main/config.json) and [API](https://huggingface.co/api/models/IFM/K2-Horizon-3.7B?blobs=true). Recorded artifact sizes match.
- `gemma-4-12b`: apache-2.0; context 262144; [publisher config](https://huggingface.co/google/gemma-4-12B-it/blob/main/config.json) and [API](https://huggingface.co/api/models/google/gemma-4-12B-it?blobs=true). Recorded bytes match current candidates; filename provenance is still omitted.
- `granite-4.2-30b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/ibm-granite/granite-4.2-30b/blob/main/config.json) and [API](https://huggingface.co/api/models/ibm-granite/granite-4.2-30b?blobs=true). Recorded artifact sizes match.
- `granite-4.2-3b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/ibm-granite/granite-4.2-3b/blob/main/config.json) and [API](https://huggingface.co/api/models/ibm-granite/granite-4.2-3b?blobs=true). Recorded artifact sizes match.
- `granite-4.2-8b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/ibm-granite/granite-4.2-8b/blob/main/config.json) and [API](https://huggingface.co/api/models/ibm-granite/granite-4.2-8b?blobs=true). Recorded artifact sizes match.
- `lfm2-5-24b-a2b`: lfm-open-1.0; context 131072; [publisher config](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/config.json) and [API](https://huggingface.co/api/models/LiquidAI/LFM2.5-24B-A2B?blobs=true). Recorded bytes match current candidates; filename provenance is still omitted.
- `mellum2-1-12b-a2-5b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking/blob/main/config.json) and [API](https://huggingface.co/api/models/JetBrains/Mellum2.1-12B-A2.5B-Thinking?blobs=true). Site quants remain search-only; publisher GGUF candidates were found but not attached.
- `muse-glimmer-30b`: apache-2.0; context 131072; [publisher config](https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/config.json) and [API](https://huggingface.co/api/models/meta-models/Muse-Glimmer-30B?blobs=true). Recorded artifact sizes match.

### Unresolved / deliberate non-changes

- **Context convention:** Lightning config/site are 262144, but its card and GGUF document up to 1M on larger deployments. North Mini Code's 256K card differs from its 500000 config/GGUF. Bolt E4B's site/config/card agree at 65536 despite a 131072 GGUF header. No context caps changed.
- **Parameters and runtime representation:** exact tensor sums differ slightly from several nominal/file-size-derived counts. Qwen3.5 0.8B/2B/4B checked files contain 0.772846B/1.942653B/4.326351B versus site 0.8B/1.96B/4.35B. Original API totals can include vision, audio and MTP. Full split-model counts were not independently summed across every tensor-bearing shard. MiMo asymmetric K/V, Ling MLA pseudo-heads, and converted Qwen extra blocks are not grounds for copying conventional config scalars into cache-sizing fields.
- **Gated/source gaps:** Muse Spark's public publisher API supplies the full licence, but publisher config/card/license-file downloads are gated; full parameter/cache verification remains qualified. Nineteen variants across Beam, Muse Spark, Mellum2.1, MiMo Pro, Qwen3.5 0.8B/2B/4B and Qwen3.8 Flash Next have no exact source records. Eight rows across North Mini Code, Gemma 4 12B, Ling Flash and LFM2.5 24B omit filenames; their candidate file/shard bytes agree. Ling's matching artifacts are AtomicChat AD variants; its standard-looking site level labels remain qualified. No missing-source fields were guessed.
- **Projectors:** all 22 recorded positive mmprojBytes assertions match current artifacts. An absent projector size remains unknown, not zero.
- **Benchmarks/prices:** no deferred per-quant speedRTX4090 or matching benchmarks.ts model row. MiMo Flash/Pro MXFP4 loss=0 has no identified same-config quantitative perplexity-loss evidence; a native-format reference baseline is possible but not established. No benchmark/loss values changed. No applicable model/GPU price fields were found.
- Detailed per-field research and saved responses remain outside the repository at ~/verify-notes-36.md and ~/data-verification-36/. No inference measurements, runtime cache verification, deployment or visual verification performed.

### Pass 2 local validation

- `npm run check:cli`: passed; split-source wildcard behavior is retained.
- `npm test`: passed recommendations (58,253 fits / 82 profiles), calculator evidence, speed calibration, CLI sources and RSS checks. The corrected Super VL Q4_0 sizing removes one marginal fit from the earlier count.
- Targeted assertions passed: Muse restricted/bilingual licence, Glimmer Apache retained, nine exact artifact paths and byte totals against saved API evidence, provenance dates, and the Super VL 4K estimate.
- `npm run build`: passed compile/lint/type checks, static export and localization/structured-data gates (646 pages, 322 Chinese pages, 1,166 page entities). IndexNow skipped outside Cloudflare production.
- Build-generated `lib/data/hf-stats.json` was reverted. README and non-data code are untouched. No visual/browser or deployment verification performed.

## Pass 3 batch 1 (2026-11-21)

Scope: 30 of the 90 indexed models with no `addedAt` or `addedAt < 2026-10-07`; the other 60 are reserved for batches 2–3 after owner merge. This extends the earlier 61-model recent scope, not a repeat of it. Research notes and the full three-batch ID plan are outside the repository at `~/verify-notes-p3-1.md` and `~/data-verification-p3-plan.json`; fetched publisher/card/config/licence responses, candidate filenames/bytes, GGUF metadata and per-model ledgers are in `~/data-verification-p3-1/`.

### Corrections

| Date | Model id | Field | Old value | New value | Official source |
|---|---|---|---|---|---|
| 2026-11-21 | codestral-22b | arch.attHeads | 32 | 48 | [Publisher config](https://huggingface.co/mistralai/Codestral-22B-v0.1/blob/main/config.json): 56 layers, 48 attention heads, 8 KV heads, hidden size 6144; also agrees with the mapped GGUF header |
| 2026-11-21 | starcoder2-15b | arch.attHeads | 40 | 48 | [Publisher config](https://huggingface.co/bigcode/starcoder2-15b/blob/main/config.json): 40 layers, 48 attention heads, 4 KV heads, hidden size 6144 |
| 2026-11-21 | starcoder2-15b | arch.kvHeads | 8 | 4 | [Publisher config](https://huggingface.co/bigcode/starcoder2-15b/blob/main/config.json); head dimension remains 6144 / 48 = 128 |
| 2026-11-21 | reader-facing changelog | bilingual release entry | no Pass 3 entry | prepended batch scope and architecture/cache correction entry | Publisher evidence above; lib/data/changelog.ts |

StarCoder2's head correction halves its calculated KV cache, not its weight bytes. Codestral's attention-head correction does not change its existing KV-head count. No exact artifact byte field or benchmark was changed. `dataLastUpdated` and `sizingChangedAt` are already `2026-11-21`, so both remain synchronized without a cosmetic edit. No affected description asserts a derived numerical context/size pair that needs changing.

### Qualified checked-correct / checked-with-exceptions list

The qualifications are part of each result: these are not blanket runtime, legal or benchmark certifications. Publisher API licence metadata is available for 29/30 models; WizardLM remains inaccessible. Counts below retain nominal/displayed precision where indicated. Raw publisher configs are distinguished from quantizer headers. Every row's quant variants remain search-only and share the artifact/benchmark limitations below.

| Model id | Checked fields and qualifications | Publisher evidence |
|---|---|---|
| llama-3.1-8b | llama3.1; 8.03B agrees with API total; 32/32/8/128 and 131072 agree with mapped GGUF. Original config gated. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.1-8B-Instruct?blobs=true), [Meta card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md) |
| llama-3.1-70b | llama3.1; 70.6B agrees at displayed precision; 80/64/8/128 and 131072 agree with mapped GGUF. Original config gated. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.1-70B-Instruct?blobs=true), [Meta card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md) |
| llama-3.2-3b | llama3.2; 3.21B agrees; 28/24/8/128 and 131072 agree with mapped GGUF. Original config gated. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.2-3B-Instruct?blobs=true), [Meta card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md) |
| qwen2.5-7b | Apache 2.0; 7.62B agrees with API total at displayed precision; scalar architecture agrees. Card supports 131072 with YaRN, native config 32768. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2.5-7B-Instruct?blobs=true) |
| qwen2.5-14b | Apache 2.0; scalar architecture agrees; 131072 requires card's YaRN configuration. Site/card 14.7B versus API 14.770033664B retained as precision qualification. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2.5-14B-Instruct?blobs=true) |
| qwen2.5-32b | Apache 2.0; scalar architecture agrees; 131072 requires card's YaRN configuration. Site/card 32.5B versus API 32.763876352B retained as precision qualification. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2.5-32B-Instruct?blobs=true) |
| deepseek-coder-v2-lite | DeepSeek licence; 15.7B and 163840 agree with API/config. KV 1×288 is an intentional MLA cache encoding; see runtime qualification below. | [Publisher config](https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct/blob/main/config.json), [licence](https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct/blob/main/LICENSE-MODEL) |
| phi-3.5-mini | MIT; 3.82B, 32/32/32/96 and 131072 agree at displayed precision. | [Card/config](https://huggingface.co/microsoft/Phi-3.5-mini-instruct), [API](https://huggingface.co/api/models/microsoft/Phi-3.5-mini-instruct?blobs=true) |
| mistral-nemo-12b | Apache 2.0; 12.2B and scalar architecture agree. Site 131072 agrees with original config/card, despite converted GGUF 1024000. | [Card/config](https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407), [API](https://huggingface.co/api/models/mistralai/Mistral-Nemo-Instruct-2407?blobs=true) |
| gemma-2-9b | Gemma; 9.24B agrees with API; 42/16/8/256, 8192 and 4096 sliding window agree with mapped GGUF. Original config gated; site's 4608 includes its explicitly documented 512-token batch. | [API](https://huggingface.co/api/models/google/gemma-2-9b-it?blobs=true) |
| qwen2.5-72b | Qwen licence and >100M commercial MAU gate agree; 72.7B and scalar architecture agree. 131072 is card-supported YaRN context, not native config 32768. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct), [licence](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE) |
| deepseek-r1-distill-qwen-14b | MIT metadata, scalar architecture and 131072 agree; 14.7B is nominal (API 14.770033664B). | [Card/config](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), [API](https://huggingface.co/api/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B?blobs=true) |
| llama-3.3-70b | llama3.3; 70.6B agrees at displayed precision; 80/64/8/128 and 131072 agree with mapped GGUF. Original config gated. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.3-70B-Instruct?blobs=true) |
| mistral-small-24b | Checked, not certified: name/24B/architecture identify 2501, mapped GGUF/licence identify 2409. Deliberately unchanged; see identity conflict below. | [2409 config](https://huggingface.co/mistralai/Mistral-Small-Instruct-2409/blob/main/config.json), [2501 config](https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501/blob/main/config.json) |
| qwen2.5-coder-32b | Apache 2.0; scalar architecture agrees; 131072 requires card's YaRN configuration. Site/card 32.5B versus API/GGUF 32.763876352B retained. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2.5-Coder-32B-Instruct?blobs=true) |
| qwen2.5-coder-7b | Apache 2.0; 7.62B agrees with API total at displayed precision; scalar architecture agrees. 131072 requires card's YaRN configuration. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2.5-Coder-7B-Instruct?blobs=true) |
| qwen2.5-3b | Qwen Research/noncommercial agrees; 3.09B, 36/16/2/128 and 32768 agree with original config/API. GGUF duplicates an output table; do not equate that tensor sum with original total. | [Card/config](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct), [licence](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE) |
| llama-3.2-1b | llama3.2; 1.24B agrees at displayed precision; 16/32/8/64 and 131072 agree with mapped GGUF. Original config gated. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.2-1B-Instruct?blobs=true), [Meta card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md) |
| deepseek-r1-distill-llama-70b | MIT publisher metadata, 70.6B, scalar architecture and 131072 agree at displayed precision. Card also names Llama 3.3's original licence; inherited obligations remain qualified. | [Card/config](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B), [API](https://huggingface.co/api/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B?blobs=true) |
| codestral-22b | MNPL; 22.2B, 56/48/8/128 and 32768 agree after correction. | [Card/config](https://huggingface.co/mistralai/Codestral-22B-v0.1), [API](https://huggingface.co/api/models/mistralai/Codestral-22B-v0.1?blobs=true) |
| mixtral-8x7b | Apache 2.0; 46.7B, scalar architecture and 32768 agree at displayed precision. Mapped quant repo inaccessible; public TheBloke candidate remains unbound. | [Card/config](https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1), [API](https://huggingface.co/api/models/mistralai/Mixtral-8x7B-Instruct-v0.1?blobs=true) |
| command-r-35b | CC BY-NC 4.0 and nominal 35B agree with v01 API; release/architecture remain unresolved. Publisher config/card gated. | [API](https://huggingface.co/api/models/CohereForAI/c4ai-command-r-v01?blobs=true) |
| yi-1.5-34b | Apache 2.0; 34.4B, scalar architecture and 4096 agree at displayed precision for the non-32K Chat release. | [Card/config](https://huggingface.co/01-ai/Yi-1.5-34B-Chat), [API](https://huggingface.co/api/models/01-ai/Yi-1.5-34B-Chat?blobs=true) |
| solar-10.7b | Instruct is CC BY-NC 4.0, not base model's Apache 2.0; existing mapping correct. 10.7B, scalar architecture and 4096 agree. Mapped quant repo inaccessible. | [Card/config](https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0), [API](https://huggingface.co/api/models/upstage/SOLAR-10.7B-Instruct-v1.0?blobs=true) |
| starcoder2-15b | OpenRAIL-M; 40/48/4/128 and 16384 agree after correction. 15B is card's nominal name versus API 15.957889024B; runtime window remains qualified. | [Card/config](https://huggingface.co/bigcode/starcoder2-15b), [API](https://huggingface.co/api/models/bigcode/starcoder2-15b?blobs=true) |
| llama-3.2-11b-vision | llama3.2 and nominal 11B agree with publisher metadata (API 10.670220835B includes vision). Original config gated; architecture, separate encoder bytes and +2GB prose not certified. | [API](https://huggingface.co/api/models/meta-llama/Llama-3.2-11B-Vision-Instruct?blobs=true), [Meta card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md) |
| qwen2-vl-7b | Apache 2.0; scalar architecture and 32768 agree. API 8.291375616B includes vision, matching site's 8.29B total, not a selected language-only GGUF count. | [Card/config](https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct), [API](https://huggingface.co/api/models/Qwen/Qwen2-VL-7B-Instruct?blobs=true) |
| nous-hermes-3-llama-3.1-8b | 8.03B, scalar architecture and 131072 agree. Publisher tags llama3 despite a Llama 3.1 base and supplies no licence file; inherited identity remains qualified. | [Card/config](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B), [API](https://huggingface.co/api/models/NousResearch/Hermes-3-Llama-3.1-8B?blobs=true) |
| wizardlm-2-7b | Checked but not certified: original microsoft and WizardLMTeam API/card/config requests return 401. Public quantizer candidate does not establish publisher fields. | [Original endpoint](https://huggingface.co/api/models/microsoft/WizardLM-2-7B?blobs=true), [team endpoint](https://huggingface.co/api/models/WizardLMTeam/WizardLM-2-7B?blobs=true) |
| granite-3.1-8b | Apache 2.0; 8.2B, scalar architecture and 131072 agree at displayed precision. | [Card/config](https://huggingface.co/ibm-granite/granite-3.1-8b-instruct), [API](https://huggingface.co/api/models/ibm-granite/granite-3.1-8b-instruct?blobs=true) |

### Unresolved / deliberate non-changes

- **Mistral Small checkpoint identity:** the record combines 24B/40 layers/32 heads (2501, Apache 2.0) with `bartowski/Mistral-Small-Instruct-2409-GGUF` and MRL (2409, 22.247282688B/56 layers/48 heads). Both releases are real. Choosing which model the row represents would change the user's checkpoint/licence, so neither the architecture nor licence nor repo is silently switched.
- **Command R identity:** generic mapped repo returns 401; public v01 and 08-2024 conversions both exist. Existing prose explicitly assumes 8 KV heads and warns about v01's 64-head MHA cache. No release selection or framework-default overwrite; original config remains gated.
- **Artifacts:** all **83 variants** lack `source` records: **47 GGUF**, **22 AWQ**, **11 EXL2**, **3 GPTQ**. Mapped APIs are accessible for **22/30** models. Exact-level GGUF candidates were located for **46/47 GGUF rows**, including alternative-only candidates; StarCoder2's inspected alternative has no exact Q4_K_M. These are candidate filenames and byte sums, not 46 verified site-source matches. The remaining formats lack bound repositories/revisions. All exact candidate filenames, shard sizes and URLs are in the external ledger; no source binding, byte claim or projector choice is invented. The eight inaccessible mapped repos concern Mixtral, Command R, Solar, StarCoder2, Llama Vision, Qwen2-VL, Hermes and WizardLM. A 401 does not distinguish removal, misspelling or private access.
- **Projectors:** no selected row records `mmprojBytes`. Alternative [Llama Vision](https://huggingface.co/api/models/leafspark/Llama-3.2-11B-Vision-Instruct-GGUF?blobs=true) and [Qwen2-VL](https://huggingface.co/api/models/bartowski/Qwen2-VL-7B-Instruct-GGUF?blobs=true) listings contain projectors (Qwen supplies f16 and f32). Candidates are not attached to unbound quants; missing encoder evidence remains unknown, not zero.
- **Context/runtime:** Qwen's 131072 requires the publisher's documented YaRN setup above native 32768. Nemo's original 131072 is retained despite converted metadata 1024000. DeepSeek Coder's 1×288 scalar encoding describes current compressed MLA, while the inspected older GGUF contains unsplit `attn_kv_b`; its existing warning remains. Gemma's 4608 cache cap includes its documented 512 batch. StarCoder2 config describes 4096 sliding attention, but current [llama.cpp StarCoder2 graph](https://github.com/ggml-org/llama.cpp/blob/master/src/models/starcoder2.cpp) builds ordinary `build_attn_inp_kv`, not a demonstrated capped runtime allocation. No inference/cache allocation was measured.
- **Parameter precision/layout:** 14.7B and 32.5B card/site figures differ from API 14.770033664B/32.763876352B; StarCoder2's card names 15B while API totals 15.957889024B. Nominal-versus-stored-count policy remains unresolved rather than selectively replacing estimates. Qwen 3B's GGUF duplicates an output table; split-file tensor counts are not full-model totals. Vision totals are not language-only denominators.
- **Licences/gating:** Hermes's literal llama3 tag conflicts with its Llama 3.1 base; no publisher licence file is listed. DeepSeek's MIT-tagged Llama distill explicitly acknowledges the original Llama 3.3 licence. No single-badge legal interpretation is invented. WizardLM original sources are unavailable; gated Meta/Google/Cohere raw configs limit architecture checks as noted per model.
- **Benchmarks/prices:** per-quant speed/loss assertions and matching `benchmarks.ts` rows were inspected, but no same-configuration official experiment was identified to verify or replace them. The site declares local runs and a Llama 3.1 8B/WikiText-2/4096/batch-1 PPL reference in `meta.ts`; an official task-quality table is not evidence for those measurements. No benchmark values changed. No applicable price fields were found. No browser, visual, deployment or inference verification performed.

### Pass 3 batch 1 local validation

- Node 20.20.2, matching the repository environment blueprint.
- Targeted assertions passed: both corrected architectures equal saved original publisher configs; StarCoder2 KV size agrees with the four-head formula at zero, 4K and 16K context while weight estimates stay unchanged; bilingual changelog and both metadata dates are synchronized.
- `npm test`: passed recommendations (58,261 fits / 82 hardware profiles), calculator evidence, speed calibration, CLI source handling and RSS. Compared with the prior 58,253-fit count, the corrected StarCoder2 cache permits eight additional fits.
- `npm run build`: passed compile/lint/type checks, static export and postbuild gates (646 pages, 322 Chinese pages, 1,166 page entities); IndexNow skipped outside Cloudflare production. Prebuild's existing gated-repo HF API 401s were non-fatal.
- Build-generated `lib/data/hf-stats.json` was reverted; only model data, the bilingual changelog and this correction log are committed. README and non-data code are untouched. User-facing output remains visually unverified; no deployment performed.

## Pass 3 batch 2 (2026-11-21)

Scope: the next 30 of the 90 older indexed models, bringing Pass 3 research coverage to 60/90. Batch 1 is merged; this batch starts from updated `origin/main` at `46abb1a`. Research was completed before implementation and remains outside the repository at `~/verify-notes-p3-2.md` and `~/data-verification-p3-2/` (saved publisher responses, GGUF metadata/tensors, per-variant candidate files/byte sums and proposed corrections). No unresolved source, parameter, licence or benchmark claims are promoted into data.

### Corrections

| Date | Model id | Field | Old value | New value | Official source |
|---|---|---|---|---|---|
| 2026-11-21 | qwen2.5-1.5b | contextLength | 131072 | 32768 | [Publisher config](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/config.json) and [model-specific card](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct): Full 32,768; mapped GGUF also 32768 |
| 2026-11-21 | qwen2.5-1.5b | bilingual description context | 128K | 32K | Same publisher card/config; no model-specific 128K/YaRN instructions in this card |
| 2026-11-21 | stablelm-2-12b | arch.attHeads | 40 | 32 | [Publisher config](https://huggingface.co/stabilityai/stablelm-2-12b-chat/blob/main/config.json) |
| 2026-11-21 | stablelm-2-12b | arch.headDim | 128 | 160 | [Publisher modeling code](https://huggingface.co/stabilityai/stablelm-2-12b-chat/blob/main/modeling_stablelm.py): head_dim = hidden_size / num_attention_heads; config 5120 / 32 = 160 |
| 2026-11-21 | falcon-3-10b | arch.attHeads | 32 | 12 | [Publisher config](https://huggingface.co/tiiuae/Falcon3-10B-Instruct/blob/main/config.json), corroborated by mapped GGUF |
| 2026-11-21 | falcon-3-10b | arch.kvHeads | 8 | 4 | Same publisher config and mapped GGUF |
| 2026-11-21 | falcon-3-10b | arch.headDim | 128 | 256 | Same publisher config: explicit head_dim 256; hidden 3072 / 12 heads |
| 2026-11-21 | reader-facing changelog | bilingual release entry | no Batch 2 entry | prepended context and architecture/cache corrections | Publisher evidence above; lib/data/changelog.ts |

The Qwen family introduction's generic “up to 128K” is not the 1.5B checkpoint's specification: its model-specific card, config and GGUF agree on 32768. StableLM's corrected head size increases its calculated KV cache by 25%, without changing weight bytes. Falcon's corrected KV product is unchanged (8 × 128 = 4 × 256); its cache estimate does not decrease just because the head count does. Neither architecture description contains a derived numerical context/size pair needing replacement. `dataLastUpdated` and `sizingChangedAt` already equal `2026-11-21`, the day of these sizing changes, so both remain synchronized without a cosmetic edit.

### Qualified checked-correct list

Every result is qualified by missing exact quant provenance and unverified local benchmark assertions. The external ledger records site values and official counterparts for every field and variant of all 30 models; publisher metadata/config is distinguished from conversion headers.

- `phi-3-medium-14b`: MIT, nominal 14B, scalar architecture and 131072 agree with the [128K publisher checkpoint](https://huggingface.co/microsoft/Phi-3-medium-128k-instruct); generic mapped repo does not settle 4K versus 128K artifact identity.
- `phi-4-mini`: MIT, 3.84B, scalar architecture and 131072 agree with [publisher config/API](https://huggingface.co/microsoft/Phi-4-mini-instruct).
- `deepseek-r1-distill-qwen-7b`: MIT metadata/licence, 7.62B, scalar architecture and 131072 agree with [publisher config/API](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B), which also acknowledges its Apache-2.0 Qwen base.
- `olmo-2-7b`: Apache 2.0, 7.3B, scalar architecture and 4096 agree with [publisher config/API](https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct).
- `openchat-3.6-8b`: Llama 3 metadata, 8.03B, scalar architecture and 8192 agree with the [dated publisher checkpoint](https://huggingface.co/openchat/openchat-3.6-8b-20240522); exact dated quant repo remains an unbound alternative.
- `zephyr-7b-beta`: MIT, 7.24B, scalar architecture and 32768 agree with [publisher config/API](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta).
- `qwen2.5-0.5b`: Apache 2.0, 0.49B, scalar architecture and 32768 agree with [publisher config/API](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct); GGUF's extra output table is not the original parameter total.
- `gemma-2-2b`, `gemma-2-27b`, `aya-23-8b`: publisher APIs confirm licence metadata/totals at displayed precision; mapped GGUF headers corroborate scalar geometry/context. Original raw configs are gated, so these are not independent original-config certifications. Gemma's site cache window includes its documented 512-token batch.
- `qwen3-8b`, `qwen3-14b`, `qwen3-32b`, `qwen3-30b-a3b`: Apache 2.0, displayed counts and scalar geometry agree with publisher config/API and mapped headers; 40960 agrees with config/GGUF but not the current card's native-context wording. The 30B routed-expert formula agrees with 28.99B/128 experts/top-8. Context remains qualified below.
- `qwen2.5-1.5b`, `stablelm-2-12b`, `falcon-3-10b`: the corrected fields agree with publisher evidence above; no blanket artifact, parameter-precision or benchmark certification.
- `deepseek-v2-lite`, `deepseek-r1-distill-qwen-32b`, `internlm2-7b`, `internlm2-20b`, `mistral-7b-v0.3`, `llama-3.2-90b-vision`, `jamba-1.5-mini`, `dbrx-instruct`, `gemma-3-4b-it`, `gemma-3-12b-it`, `llama-4-scout-17b`, `llama-4-maverick-17b`, `llama-3.1-405b`: checked with the field-specific exceptions below and in the external ledger, not certified wholesale.

### Unresolved / deliberate non-changes

- **Artifacts/projectors:** all **77 variants** are search-only: **52 GGUF, 18 AWQ, 6 EXL2, 1 GPTQ**, with no recorded `source` or selected projector bytes. Mapped APIs are accessible for 18/30 models; exact-level candidates were found for 45/52 GGUF rows, including alternative-only repositories. These are candidate filenames/byte sums, not site-source matches. Twelve unbound projector candidates were recorded across inspected alternatives; missing encoder evidence stays unknown, never zero. No replacement repo or projector is guessed.
- **InternLM identity/licence:** site names say InternLM2, mapped GGUF/search names say 2.5. Publisher cards say free commercial usage with an application form but supply no named licence file. The current GitHub Apache statement covers newer InternLM3, not demonstrated retroactive terms for these rows. Existing unknown badges and conservative config-aligned 32768 remain.
- **Context/runtime:** current Qwen3 cards describe 32768 native/131072 YaRN, while configs/GGUFs agree with site 40960; no automatic overwrite. DeepSeek-V2's 1×288 pseudo-heads describe compressed MLA, not its literal head layout; sampled older conversion uses unsplit KV tensors. Gemma's cache caps include batch overhead. Jamba's alternative header confirms four attention layers but not measured Mamba allocation. Meta's Llama 4 reference verifies chunk/global masking patterns, not actual runtime cache allocations.
- **Parameters:** preserve nominal versus stored-count policy. R1 32B site 32.5 versus API/GGUF 32.763876352B, Mistral v0.3 site 7.24 versus 7.248023552B, and Falcon site 10.4 versus 10.305653760B remain documented, not selectively normalized. Qwen tiny conversions duplicate output tables; vision API totals differ from language-only GGUFs; first-shard tensor sums are not full-model counts.
- **Gating:** original raw Gemma/Meta/Aya/Jamba configs remain gated. Llama Vision's inspected alternative contains no GGUF files; inspected 405B alternatives lack the selected levels. DBRX original HF endpoints are inaccessible, but the [official introduction](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm) confirms 132B/36B active/32K, and [official terms](https://www.databricks.com/legal/open-model-license) confirm the >700M MAU gate; scalar architecture remains unconfirmed.
- **Benchmarks/prices:** per-quant speed/PPL and matching Qwen3 benchmark rows were inspected; no same-configuration official experiment verifies or replaces the declared local measurements. No values invented. No applicable model/GPU price fields found. No inference, deployment or visual verification performed.

### Pass 3 batch 2 local validation

- Node 20.20.2. Targeted assertions passed: approved publisher geometries/context, both Qwen description strings, raw zero/4K KV formula, unchanged weights and synchronized release dates. An initial ad hoc assertion incorrectly scaled an already rounded KV result; using the raw formula resolved that test-only rounding discrepancy without any product-code change.
- `npm test`: passed recommendations (58,088 fits / 82 profiles), calculator evidence, speed calibration, CLI sources and RSS.
- `npm run build`: passed compile/lint/type checks, static export and localization/structured-data gates (646 pages, 322 Chinese pages, 1,166 page entities). Existing gated-repo HF 401s were non-fatal; IndexNow skipped outside Cloudflare production.
- Generated `lib/data/hf-stats.json` reverted; `git diff --check` passed. README/non-data code untouched. User-facing changes remain visually unverified; no deployment performed.

## Pass 3 batch 3 (2026-11-21)

Scope: the final 30 older indexed models, starting from updated `origin/main` at `e733b66` after Batch 2 merged. Research preceded implementation; complete field/site/official comparisons, source URLs and exact per-variant artifact ledgers remain in `~/verify-notes-p3-3.md` and `~/data-verification-p3-3/`. Coverage means reviewed with the qualifications below, not blanket certification of unresolved provenance, measurements or legal interpretation.

### Corrections

| Date | Model id | Field | Old value | New value | Official source |
|---|---|---|---|---|---|
| 2026-11-21 | deepseek-v3 | licence mapping | mit | deepseek-license | [Original model licence](https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL), [publisher card](https://huggingface.co/deepseek-ai/DeepSeek-V3): MIT applies to code, model weights use DeepSeek Model Licence |
| 2026-11-21 | mistral-large-3 | arch.layers | 64 | 61 | [Publisher params.json](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512/blob/main/params.json): n_layers 61 |
| 2026-11-21 | mistral-large-3 | arch.attHeads | 64 | 128 | Same publisher params: n_heads 128 |
| 2026-11-21 | mistral-large-3 | arch.kvHeads | 8 | 1 | Same publisher params: kv_lora_rank 512 + qk_rope_head_dim 64; current compressed MLA convention, not literal publisher head count |
| 2026-11-21 | mistral-large-3 | arch.headDim | 128 | 288 | Same publisher params; 2 × 1 × 288 represents one 576-value K-only cache, corroborated by [llama.cpp conversion](https://github.com/ggml-org/llama.cpp/blob/master/conversion/mistral.py) and [runtime graph](https://github.com/ggml-org/llama.cpp/blob/master/src/models/deepseek2.cpp) |
| 2026-11-21 | mistral-large-3 | geometry comment and bilingual descriptions | inaccessible/unverified params and conventional-cache upper-bound prose | publisher-backed dimensions; current compressed MLA assumption; older unsplit conversions and unmeasured allocation explicitly qualified | Same publisher params, conversion and runtime graph; sampled same-checkpoint [GGUF API](https://huggingface.co/api/models/unsloth/Mistral-Large-3-675B-Instruct-2512-GGUF?blobs=true) and header |
| 2026-11-21 | reader-facing changelog | bilingual release entry | no Batch 3 entry | prepended licence identity, cache correction and qualified index-wide coverage | Evidence above; lib/data/changelog.ts |

DeepSeek-V3's custom model licence text matches the existing DeepSeek entry's [V2 terms](https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL) after whitespace normalization; its `commercial` class is unchanged. [V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324) is MIT, but it is a distinct checkpoint, not established by this row's original-V3 mapping or unbound quant searches.

Mistral's publisher params establish the geometry rather than an assumed DeepSeek shape. The sampled converted header is `deepseek2`, with key_length 576, MLA key/value dimensions 192/128 and split `attn_k_b`/`attn_v_b`. The [model factory](https://github.com/ggml-org/llama.cpp/blob/master/src/llama-model.cpp) dispatches to Deepseek2; [hparams.is_mla()](https://github.com/ggml-org/llama.cpp/blob/master/src/llama-hparams.cpp) is true for those nonzero MLA dimensions, and the graph uses a K-only cache. This verifies layout/code-path compatibility, not inference performance, measured allocation or the identity of any unbound selected artifact. Older unsplit conversions remain qualified. The new scalar formula gives 2.14 GiB KV at 32K and 17.16 GiB at 256K with FP16/batch 1; weight estimates are unchanged. Stale approximate weight/cache numbers were removed from both descriptions rather than carried into the new runtime explanation. The card-supported 262144 context cap is retained despite params/GGUF 294912.

`dataLastUpdated` and `sizingChangedAt` already equal `2026-11-21`, the day of these sizing changes; both remain synchronized without inventing a later date.

### Qualified checked-correct list

All 30 original publisher APIs were accessible; 28 original `config.json` files were readable, Mistral Large 3 supplies `params.json`, and Gemma 3's raw config is gated. Conversion headers are not substituted for original-config certification. Every local speed/PPL claim remains subject to the measurement qualification below.

- `phi-4`: MIT, nominal 14.7B, scalar geometry and 16384 agree with [publisher config/API](https://huggingface.co/microsoft/phi-4).
- `gpt-oss-20b`, `gpt-oss-120b`: Apache 2.0, displayed totals, scalar geometry and 131072 agree with [20B](https://huggingface.co/openai/gpt-oss-20b) / [120B](https://huggingface.co/openai/gpt-oss-120b) configs/APIs. Layer types confirm 12/12 and 18/18 full/sliding splits; expert counts/top-4 agree. Padded 768-token cache allocation is not a publisher model-window value or a new measurement.
- `smollm3-3b`: Apache 2.0, 3.08B, scalar geometry and 65536 agree with [publisher config/API](https://huggingface.co/HuggingFaceTB/SmolLM3-3B).
- `olmo-3-7b`: Apache 2.0, 7.3B, scalar geometry/65536 and 8 full/24 sliding layers agree with [publisher config/API](https://huggingface.co/allenai/Olmo-3-7B-Instruct); the site window adds its documented 512-token batch.
- `ernie-4.5-21b-a3b`: Apache 2.0, scalar geometry/131072 and 21.83B language weights agree with [publisher config](https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT) / recorded GGUF tensor accounting. Both exact source-byte assertions match; routed 20.38B/64 experts/top-6/one dense lead agree.
- `gemma-3-27b-it`: Gemma licence metadata and language count 27.01B agree with [publisher API](https://huggingface.co/api/models/google/gemma-3-27b-it?blobs=true) / GGUF accounting; original total includes vision and raw config is gated. Both exact file/projector byte assertions match; mapped header corroborates scalar geometry/context.
- `gemma-4-31b`, `gemma-4-e4b`, `gemma-4-e2b`: Apache 2.0, language-weight totals, scalar geometry/context and config-derived full/local/cache-owner counts agree with publisher configs and mapped/alternative headers. 31B/E4B recorded file/projector bytes match; E2B remains unbound. Global/local dimensions and shared layers remain explicit, not collapsed into generic all-layer KV estimates.
- `qwen3-coder-30b-a3b`, `devstral-small-2507`, `qwen3-vl-30b-a3b`, `magistral-small-2509`, `seed-oss-36b`: publisher licences, scalar geometry/context and all recorded artifact bytes agree, with nominal/file-derived versus direct tensor totals qualified. Devstral is explicitly text-only; the existing image-capability map correctly excludes it despite a community projector file. Magistral is vision-capable but has no selected projector.
- `qwen3-235b-a22b`, `qwen3-4b`, `qwen3-1.7b`, `deepseek-r1`, `deepseek-r1-distill-llama-8b`, `glm-4-9b-chat`, `glm-4.5-air`, `qwen3-vl-8b`, `ministral-3-8b`, `qwen3-8-27b`, `glm-4.7-flash`, `kimi-linear-48b-a3b`, `gemma-4-26b-a4b`: reviewed with context, parameter, legal-inheritance or runtime exceptions below and in the external ledger; not certified wholesale. `deepseek-v3` and `mistral-large-3` have the corrections above, not blanket artifact certification.

### Unresolved / deliberate non-changes

- **Artifacts/projectors:** 91 variants: 74 GGUF, 13 AWQ and 4 EXL2. All **35 recorded source-byte assertions match** (including Seed's eight-shard AWQ aggregate), as do **22 positive projector-byte assertions**. No byte changes needed. The other **56 variants** have no exact source; inspected candidates cover 38/40 unbound GGUF rows, not verified site-source matches. No exact selected-level candidate was found for Qwen3 235B Q3_K_M or GPT-OSS 120B MXFP4 in inspected listings. Missing projector evidence stays unknown, not zero; file-size matches do not prove encoder compatibility or imply image capability.
- **Contexts:** Qwen3 card/native limits differ from config allowances and optional YaRN limits; existing caps stay qualified. GLM-4.7-Flash's cited family 128K table covers 4.5/Air, not this checkpoint; config/GGUF 202752 does not establish that the current conservative 131072 must be raised. Its cap remains unresolved rather than called publisher-certified. Mistral Large 3's card supports the retained 256K cap.
- **Parameters/layout:** nominal versus file-derived counts, tied/duplicated output tables, vision, MTP and partial-shard totals are distinct. Qwen3 1.7B's API/GGUF 2.031739904B includes both output and embedding tables; removing one tied table yields 1.720574976B, consistent with site/publisher naming. GLM Air and Qwen3.8 converted extra blocks include MTP, not extra inference layers. Small precision differences are not selectively normalized.
- **Licences/runtime:** R1's MIT-tagged Llama 8B distill also acknowledges the original Llama 3.1 licence; no new single-badge inheritance interpretation. GLM-4 explicitly requires commercial registration, agreeing with restricted. DeepSeek's older sampled unsplit conversions do not validate current compressed-cache estimates. Kimi's config confirms seven full/twenty KDA layers; Gemma shared-cache counts and hybrid shapes agree with config but allocator behavior was not measured.
- **Benchmarks/prices:** local per-quant speed/PPL assertions and matching Qwen3 4B/Coder/Phi-4 benchmark rows were inspected, but no same-configuration official experiment verifies or replaces them. Official task-quality scores are not substitutes. No applicable model/GPU prices found. No inference, visual verification or deployment performed.

### Pass 3 batch 3 local validation

- Node 20.20.2. Targeted assertions passed: existing DeepSeek commercial licence; publisher-backed compressed-MLA geometry; zero/32K/256K KV cache of 0/2.14/17.16 GiB; unchanged weight estimates and context cap; bilingual runtime qualifiers, synchronized dates and 151 indexed models.
- `npm test`: passed recommendations (58,088 fits / 82 profiles), calculator evidence, speed calibration, CLI sources and RSS.
- `npm run build`: passed compile/lint/type checks, static export and localization/structured-data gates (646 pages, 322 Chinese pages, 1,166 page entities). The 20 existing gated-repo HF API 401s were non-fatal; IndexNow skipped outside Cloudflare production.
- Generated `lib/data/hf-stats.json` reverted; only the approved data/release changes and this log are included. README and non-data code untouched. User-facing changes remain visually unverified; no inference or deployment performed.

Pass 3 covers all 90 older models; together with the 61 recent models in Passes 1–2, the whole index of 151 models is now covered, with unresolved items explicitly qualified.

## Catalog addition — 2026-11-23

| Model id | Field | Old value | New value | Source |
| --- | --- | --- | --- | --- |
| `kormo-web-4b` | Catalog entry, licence and image input | Not indexed | KORMo-Web-4B, a Qwen3.5-4B fine-tune for Korean and English browser screenshots; Apache-2.0, supports image input | [Publisher model card][kormo-card] |
| `kormo-web-4b` | Context and architecture | Not indexed | 262,144 tokens; 32 layers, 16 attention heads, 4 KV heads, head dimension 256; only 8 full-attention layers grow the main KV cache | [Publisher config][kormo-config] |
| `kormo-web-4b` | Stored language parameters and GGUF file sizes | Not indexed | 4,841,450,496 parameters counted from GGUF tensor headers; Q3_K_M: 2,427,130,688 bytes; Q4_K_M: 3,166,776,128 bytes; Q5_K_M: 3,720,637,248 bytes; Q8_0: 5,157,831,488 bytes | [GGUF files and metadata][kormo-gguf] |
| `kormo-web-4b` | Image projector | Not indexed | All four rows use `mmproj-KORMo-VL_KORMo-Web-4B-bf16.gguf` (675,569,408 bytes) for image-input sizing | [GGUF files and metadata][kormo-gguf] |
| `kormo-web-4b` | HF stats mapping | None | `bartowski/KORMo-VL_KORMo-Web-4B-GGUF` | [Quantizer repository][kormo-gguf] |
| `kormo-web-4b` | Recent-model feed | None on main; PR originally used 51 | ID 56, Q4_K_M; preserves IDs 51–55 on main | [Catalog PR #45](https://github.com/sheephess9527/quantized.uk/pull/45) |

Documented the addition in README §9 and the bilingual public changelog. Memory figures are estimates from the published artifacts, not inference measurements.

[kormo-card]: https://huggingface.co/KORMo-VL/KORMo-Web-4B/blob/4be14497ea5196661b9db1cd1ad27acaa9a6771d/README.md
[kormo-config]: https://huggingface.co/KORMo-VL/KORMo-Web-4B/blob/4be14497ea5196661b9db1cd1ad27acaa9a6771d/config.json
[kormo-gguf]: https://huggingface.co/api/models/bartowski/KORMo-VL_KORMo-Web-4B-GGUF/revision/b6cff2f436d2d7c0973d5964ca7db295da18caf3?blobs=true
