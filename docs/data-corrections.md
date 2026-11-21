# Model data verification — 2026-11-21

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

- `npm test`: passed recommendations (58,254 fits / 82 profiles), calculator evidence, speed calibration, exact CLI sources and RSS checks.
- `npm run build`: passed compilation, lint/type checks, static page generation (1,204/1,204), and postbuild checks (646 pages; 322 Chinese pages; 1,166 structured-data entities). IndexNow skipped because this is not a Cloudflare production build.
- The build-generated `lib/data/hf-stats.json` changes are excluded. No deployment or visual/browser verification was performed.
