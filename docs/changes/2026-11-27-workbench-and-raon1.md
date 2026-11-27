# 2026-11-27 — KRAFTON Raon-1 mini graduation, 15-checkpoint Apple Silicon MLX expansion & 6-pillar local LLM workbench

## Summary of Changes

1. **Graduated KRAFTON `Raon-1 mini` (`raon-1-mini`, 30B-A4.3B MoE, Apache-2.0)**
   - Verified on `2026-11-27` that both [`KRAFTON/Raon-1-mini`](https://huggingface.co/KRAFTON/Raon-1-mini) and [`KRAFTON/Raon-1-mini-gguf`](https://huggingface.co/KRAFTON/Raon-1-mini-gguf) have `gated: false` and serve direct unauthenticated HTTP 302 CDN downloads.
   - Parsed the `raon-1-mini-Q4_K_M.gguf` header (`general.architecture = raon1`, 25 layers, 262,144 context, 736 tensors):
     - Total language elements: **`28,783,231,402`** (`params: 28.783231402`, `paramLabel: '30B-A4.3B'`).
     - Routed-expert elements: **`25,669,140,480`** across 24 MoE layers (`denseLead: 1`, `experts: 128`, `perToken: 6`, plus 1 shared expert).
     - Hybrid attention (`llama.cpp` `b12774` `src/models/raon1-mini.cpp`): `head_count_kv` has 1 on 7 layers (`[4, 8, 12, 16, 20, 24, 25]`) and 0 on 18 recurrent RDA layers. Each MLA layer caches a K-only latent + RoPE row of `kv_lora_rank (512) + qk_rope_head_dim (64) = 576` values per token (`attention: { fullLayers: 0, compressed: [{ layers: 7, values: 576, ratio: 1 }] }`).
   - Indexed five official GGUF levels (`IQ4_XS` 16,210,359,040 B · `Q4_K_M` 19,686,485,760 B · `Q5_K_M` 22,183,816,960 B · `Q6_K` 25,839,513,600 B · `Q8_0` 30,693,607,680 B) in `lib/data/models-extra-20.ts`, removed `raon-1-mini` from `lib/data/pending.ts`, added `KRAFTON/Raon-1-mini-gguf` to `lib/data/hf-repos.mjs`, added `'raon-1-mini': 'apache-2.0'` to `lib/data/model-facts.ts`, and added `raon-1-mini` to `isLlamaCppV11GGUF()` in `lib/utils/cli.ts`.

2. **Expanded Apple Silicon 4-bit MLX Allowlist (`lib/data/mac-models.ts`, `components/hub/MacModelSetup.tsx`) & Format Reference (`lib/data/formats.ts`)**
   - Audited 12 additional `mlx-community/*-4bit` repositories against the strict allowlist rule in `CLAUDE.md` (direct publisher `base_model` tag, `4-bit` tag, `library_name: "mlx"`, `.safetensors` shard listing, and `bits: 4` in `config.json`), expanding `macModelRepos` from 3 to **15** models (`qwen3-4b`, `qwen3-8b`, `qwen3-14b`, `qwen3-32b`, `qwen3-30b-a3b`, `qwen3-235b-a22b`, `qwen3-coder-30b-a3b`, `qwen2.5-72b`, `glm-4.5-air`, `glm-4.7-flash`, `qwen3-6-35b-a3b`, `gemma-4-26b-a4b`, `gemma-4-31b`, `qwen3-8-27b`, `qwen3-8-flash-next`).
   - Added `macModelWeightBytes` with exact combined `.safetensors` byte totals, shard counts, and quantization group size (`g64` / `g32`), plus `mlx_lm.server --model <repo> --port 8080` in `MacModelSetup.tsx`.
   - Added **EXL3** (`ExLlamaV3 · TabbyAPI`) and **NVFP4** (`TensorRT-LLM · vLLM`) reference entries to `lib/data/formats.ts` so `/formats/` and `/zh/formats/` document the active 2026 NVIDIA quantization formats alongside `GGUF`, `AWQ`, `EXL2`, `GPTQ`, and `HQQ`.

3. **6-Pillar Local LLM Deployment Workbench**
   - **Pillar 1 — GPU Size × Speed Pareto Frontier & 3 Sweet-Spot Picks (`components/gpu/GpuParetoFrontier.tsx`)**: Mounted on every `/gpu/[gpuId]/` and `/zh/gpu/[gpuId]/` page. Computes the non-dominated Pareto frontier of fitting models (parameter count vs. measured/calibrated/ceiling tok/s) and highlights 3 sweet spots: *Max Capability Fit*, *Daily Driver Sweet Spot (≥35 tok/s, ≥4-bit)*, and *Long-Context Champion*.
   - **Pillar 3 — Instant `llama-bench` / `ollama --verbose` Parser & SVG Report Card (`components/tools/LlamaBenchParser.tsx`)**: Mounted on `/tools/speed/` and `/zh/tools/speed/`. Parses `llama-bench` Markdown tables, `-o json`, and `ollama run --verbose` terminal output client-side, separates prompt prefill (`pp512`) from token decode (`tg128`), and exports an SVG benchmark card or Markdown summary.
   - **Pillar 4 — Thinking Token Budget & Speculative Decoding Simulator (`components/tools/SpeedFeel.tsx`)**: Upgraded `/tools/feel/` and `/zh/tools/feel/` with a reasoning chain-of-thought token budget (`0` to `16K` thinking tokens → `Time-to-Final-Answer`) and speculative decoding presets (`--spec-type mtp` or separate `-md draft.gguf --draft-max`).
   - **Pillars 5 & 6 — Heterogeneous Multi-GPU Rig Builder, Concurrency KV Planner, Terminal JSON CLI & Hugging Face Bookmarklet (`components/tools/EcosystemAndRigWorkbench.tsx`, `components/tools/CLIGenerator.tsx`)**: Mounted on `/tools/` and `/zh/tools/`, with corresponding `-np` / `--max-num-seqs`, `--tensor-split`, and `--draft-max` controls in `/tools/cli-gen/`.

## Verification

- `npm test`: All 19 test suites pass (**172** models, **46/57** MoE offload layouts, **404** eligible model/GPU pairs per language, **102,669** recommendations across 126 hardware profiles, CLI sources including `raon-1-mini` and 15 MLX checkpoints, RSS feeds, and `llms.txt` parity).
- `npm run build`: Verified full static export + `postbuild` localization, title/description width, JSON-LD, and export file-count gates.

## Handoff notes

- **What is done**: `raon-1-mini` is graduated into `lib/data/models-extra-20.ts` and removed from `lib/data/pending.ts`; `lib/data/mac-models.ts` covers 15 verified 4-bit MLX checkpoints; `lib/data/formats.ts` documents `EXL3` and `NVFP4`; and all 6 workbench upgrades are live across `/gpu/[gpuId]/`, `/tools/speed/`, `/tools/feel/`, `/tools/cli-gen/`, and `/tools/`.
- **What is verified**: `npm test` and `npm run build` pass locally; post-deploy live verification will be recorded once Cloudflare Pages finishes building `main`.
- **Traps to avoid**:
  - Keep `EXL3` and `NVFP4` as reference entries in `lib/data/formats.ts` until a model row in `models*.ts` carries them in `quants` (`SHIPPED_FORMATS` automatically controls single-format and head-to-head pages).
  - When adding entries to `lib/data/mac-models.ts`, always verify the HF API `?blobs=true` record for direct publisher `base_model`, `4-bit` tag, `library_name: "mlx"`, and `.safetensors` byte totals, and keep `scripts/check-cli-sources.ts` in sync if `macModelOptions()` shape changes.
