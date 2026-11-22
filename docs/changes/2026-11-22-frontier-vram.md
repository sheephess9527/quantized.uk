# 2026-11-22 — Computed VRAM for DeepSeek V4/V4.1, GLM-5.3, Kimi K3.1 and MiniMax M3.1

Five models move from `lib/data/pending.ts` to `lib/data/models-extra-18.ts`. Their caches are not plain
full attention, so the calculator gained `attention.compressed`: groups of `{ layers, values, ratio }`, each a
K-only row of `values` numbers per `ratio` tokens on `layers` layers (`ceil(ctx / ratio)` rows, KV-cache dtype).

Sources: publishers' `config.json`; GGUF headers read by HTTP range (tensor element counts summed over every
part, `*_exps` tensors as expert params); llama.cpp `e300919` `src/llama-model.cpp` `create_memory` and the
cache classes named below. Fixed-size state (KDA recurrent state, DeepSeek compressor state) is not counted,
as for Kimi Linear and Qwen3-Next.

| Model | Cache (llama.cpp) | Encoding | Sizes |
|---|---|---|---|
| DeepSeek-V4-Flash-0731 | `llama_kv_cache_dsv4`: 43 layers keep a 128-token window of 512-wide K; 21 ratio-4 layers add 512 KV + 128 index per 4 tokens; 20 ratio-128 layers add 512 per 128 tokens (`dsv4_comp_size = ceil(kv/ratio)`) | `kvHeads 1, headDim 256, windowLayers 43, windowTokens 768 (pad256(128+512)), compressed [21×640/4, 20×512/128]` | ggml-org Q2_K 117,349,438,592 B, MXFP4 154,991,539,328 B (2 parts each); 284,334,567,511 params, 277,025,390,592 expert |
| DeepSeek-V4.1-Flash-1017 | `deepseek41`: 40-layer 128-token window; compressed layers share KV via `kv_source_layer_ids` 2, 8, 14, 20, so only those own 640-wide rows (2, 8, 14 at ratio 2; 20 at ratio 1) | `windowLayers 40, windowTokens 768, compressed [3×640/2, 1×640/1]` | mrfakename Q2_K / Q3_K_M / Q4_K_M / Q8_0 264.5 / 347.3 / 444.7 / 508.0 GB (10 parts); 748,494,684,784 params. Routed experts stay native 4-bit, so Q8_0 is 5.43 bpw |
| GLM-5.3-Flash | `llama_memory_hybrid_idx`: 34 KDA layers recurrent; 11 DSA layers K-only MLA (kv_lora 512, rope 0) + indexer `128 × kpool_row 3` = 384 | `kvHeads 1, headDim 256, fullLayers 11, compressed [11×384/1]` | ggml-org Q2_K 133,809,056,544 B, Q4_K (= Q4_K_M) 181,372,463,648 B; unsloth Q8_0 340,981,966,208 B (includes the MTP layer: 46 blocks, 320.8B); 313,326,811,966 params |
| Kimi K3.1 Pro | hybrid: 69 KDA recurrent; 24 DSA layers K-only MLA 576 (GGUF `key_length` 576) + 128-wide indexer key (`indexer_kpool` unset → 1 row) | `kvHeads 1, headDim 288, fullLayers 24, compressed [24×128/1]` | DevQuasar Q2_K 1,009,315,027,936 B (33 parts), mmproj 904,448,928 B; 2,779,661,661,792 params. MXFP4_MOE left out (not the released format) |
| MiniMax M3.1 Flash | `llama_kv_cache_msa`: main K/V on 60 layers (4 × 128); indexer copy of hparams with 1 KV head, K 128 and V 128 (not MLA → V allocated) on the 57 `is_indexer_full` layers (≥ dense lead 3) | `kvHeads 4, headDim 128, fullLayers 60, compressed [57×256/1]` | smalinin Q2_K 162,266,097,184 B (6 parts), mmproj 1,735,304,576 B; 426,186,392,064 params. unsloth UD-* and AtomicChat AD-* not tracked (no standard levels) |

Not added: Q2_K_S rows (no calculator level); GGUF Q4_0/Q8_0 single files in ggml-org repos that are only MTP/draft parts.
Requested models that stay pending: none of the five. Step-5 Preview and Nemotron-Labs Dory stay pending (not in scope).
Licences from each publisher repo's card: DeepSeek V4/V4.1 and GLM-5.3 MIT; Kimi K3.1-Pro License (MaaS agreement above
20M USD revenue → restricted); MiniMax Community License (commercial use needs notice, authorisation above 20M USD → restricted).
