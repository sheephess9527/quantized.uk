# 2026-11-26 — llama.cpp v1.1.0 (`b12774`), three Apache-2.0 models & full-site layout/UX upgrade

## 1. Runtime & Model Patrol

### A. Inference runtime upgrade: `llama.cpp v1.1.0` (`b12774`)
- Upstream `llama.cpp` published semantic stable release **`v1.1.0`** (`prerelease: false`) on `2026-11-26`. Its release asset `nightly-tag.txt` resolves to **`b12774`**.
- Verified all Windows prebuilt ZIP archives on `b12774` (`llama-b12774-bin-win-cpu-x64.zip`, `cuda-12.4-x64.zip`, `cuda-13.5-x64.zip`, `vulkan-x64.zip`, `rocm-10.0-x64.zip`, `sycl-x64.zip`, plus `cudart-llama-bin-win-cuda-12.4-x64.zip` and `13.5-x64.zip`), matching the asset suffixes in `lib/utils/cli.ts`, `lib/data/cookbook-extra-2.ts` and `lib/data/cookbook-rewrites.ts`.
- Updated `LLAMACPP_BUILD` in `lib/data/runtime-build.ts` to `'b12774'` and `runtimeVersions` (`checkedAt: '2026-11-26'`) in `lib/data/meta.ts`. Ollama (`v0.40.18`), vLLM (`v0.34.0`), ExLlamaV2 (`v0.3.2`) and ExLlamaV3 (`v1.6.7`) remain unchanged.

### B. Three verified Apache-2.0 models indexed (`lib/data/models-extra-20.ts`, total **167** models)
1. **`mellum2-1-12b-a2-5b-instruct` (`Mellum2.1 12B-A2.5B Instruct`)**:
   - Publisher: [JetBrains/Mellum2.1-12B-A2.5B-Instruct](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct) (Apache 2.0) + [official GGUF](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct-GGUF/tree/main).
   - GGUF `total` = `12,149,923,072` params; 7 full + 21 SWA layers (1,024 padded to 1,536), 64 routed experts (top-8, 11.10B routed); exact byte counts for `Q4_K_M` (`8,071,294,048` B), `Q6_K` (`10,879,833,184` B) and `Q8_0` (`12,925,416,544` B). Tool-calling verified in GGUF `chat_template`.
2. **`domyn-edge-sft` (`Domyn Edge SFT`)** — promoted from `pending.ts`:
   - Publisher: [Domyn/Domyn-Edge-SFT](https://huggingface.co/Domyn/Domyn-Edge-SFT) (Apache 2.0) + [prithivMLmods/Domyn-Edge-SFT-GGUF](https://huggingface.co/prithivMLmods/Domyn-Edge-SFT-GGUF/tree/main).
   - Supported in `llama.cpp v1.1.0` (`b12774` `src/models/domyn-edge.cpp`): GGUF `total` = `3,928,787,968` params (`3.9B`); 12 full-attention NoPE layers (`8 × 256` KV) + 24 sliding-window layers (`8 × 64` KV, window 1,025 padded to 1,536). Five verified GGUF levels (`Q3_K_M` .. `Q8_0`).
3. **`inkling-2-mini` (`Inkling 2 Mini`)** — promoted from `pending.ts`:
   - Publisher: [thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) (Apache 2.0) + [bartowski/Inkling-2-Mini-GGUF](https://huggingface.co/bartowski/Inkling-2-Mini-GGUF/tree/main).
   - Supported in `llama.cpp v1.1.0` (`b12774` `src/models/inkling2-loop.cpp`): GGUF language `total` = `26,070,385,152` params + `641,806,112` B BF16 `mmproj`; publisher-stated `5.4B` effective active parameters per token across 3 passes of middle layers `6–17`. `inkling2_loop` expands 24 physical layers to 48 execution slots (8 full-attention + 40 SWA slots at `8 × 128`); whole-layer offload retained (same policy as looped `Metis-1.6`).
- Both `domyn-edge-sft` and `inkling-2-mini` are gated in `canOfferOllamaLaunch` (`lib/utils/cli.ts`, covered in `scripts/check-cli-sources.ts`), because Ollama `v0.40.18` bundles `llama.cpp b12651` (its `inkling-2-mini` library tag targets Apple Silicon only).
- Refreshed `/pending/` (`lib/data/pending.ts`): removed `domyn-edge-sft` and `inkling-2-mini`; added `ling-3-2-air` and `gigachat4-37b-a4b`; updated `raon-1-mini` (gated GGUF access), `hy4-flash` (`v1.1.0` DSA+SWA landed; SSD Engram residency pending) and `zaya1-8b` (`v1.1.0` `zaya1` landed; instruct repo 401 gated).

---

## 2. Layout, Navigation & Visual Polish Upgrades

1. **Global `⌘K / Ctrl+K` Command Palette & Sleek Hardware Pill (`Navbar.tsx`, `CommandPaletteModal.tsx`, `HardwareProfileSelector.tsx`)**:
   - Added a `⌘K` search button and keyboard shortcut in `Navbar.tsx` that lazy-loads `CommandPaletteModal.tsx` via `next/dynamic({ ssr: false })` (zero added initial JS until opened), indexing all 167 models, 126 hardware rows, 28 guides, 20 runtime errors and 9 tools/quick-answers with keyboard navigation.
   - Widened the compact hardware profile selector in `Navbar.tsx` (`max-w-[9.5rem] lg:max-w-[12.5rem]`) with an emerald active indicator dot.
2. **Model Detail Page 2-Column Layout + Inline Quick Launch Commands (`ModelDetail.tsx`, `ModelQuickRun.tsx`, `ModelExplainer.tsx`, `app/quant-hub/[modelId]/page.tsx`)**:
   - Restructured `/quant-hub/[modelId]` into a desktop `lg:grid-cols-[minmax(0,1fr)_320px]` layout:
     - **Primary column**: Mac MLX setup (where verified) → server-precomputed **`ModelQuickRun`** (`[llama.cpp | Ollama]` 1-click copyable launch command using `generateCLI`) → quantization variants table (highlighting the reference build) + verified file bytes → architecture & KV cache explainer + FAQs → GPU placement & guides.
     - **Sticky right sidebar**: compact Model Specifications `<dl>` card (total params, active params/token, max context, best quant, PPL rise, input modality, linked licence, hardware tags, HF stats) + popular GPU pair chips + HF model card badge + related reports + reranker link.
3. **Homepage 5-Act Visual Hierarchy (`HomeContent.tsx`, `HeroSection.tsx`)**:
   - Tightened Hero vertical padding so `HomeMatch` sits higher above the fold on laptops, paired `WeeklyUpdates` + `TodayBoard` side-by-side (`xl:grid-cols-12`) on wide screens, and grouped the 13 homepage blocks into 5 clearly separated acts (`space-y-12` + subtle hairlines).
4. **GPU Detail Page Sticky Filter & Parameter-Bucket Jump Bar (`GpuPageContent.tsx`, `FitControls.tsx`)**:
   - Combined `FitControls` (4K–128K context & concurrency 1–8) with instant parameter-bucket jump buttons (`<4B` · `4–10B` · `10–20B` · `20–50B` · `50B+` with live fit counts) inside a `sticky top-14 z-30` backdrop-blurred bar so readers on 24G–192G cards can jump straight to `20–50B` or `50B+` and change context in place.
5. **Model Hub `[Cards | Table]` View Switcher & Sorting (`QuantHubContent.tsx`, `ModelTable.tsx`)**:
   - Added a `[Cards | Table]` view toggle and sort selector (`Default`, `Newest`, `Params ↓`, `4K VRAM ↑`, `RTX 4090 Speed ↓`) on `/quant-hub/`. Table view displays dense side-by-side specs including pinned LiveBench Overall scores linked to their dated releases (never ranked/sorted across different LiveBench releases per convention).
6. **Cookbook Technical Documentation Typography (`ArticleView.tsx`)**:
   - Replaced disconnected per-paragraph `.glass` boxes with a unified `#111218` technical article surface (`text-[15px] leading-7 text-slate-300`, numbered section headings, clean `divide-y` rhythm, and a wider `230px` sticky Scrollspy TOC column).
7. **Global Micro-Polish (`app/globals.css`, `Footer.tsx`)**:
   - Enabled `font-variant-numeric: tabular-nums` across all tables and monospace metrics, refined dark surface tokens (`--surface-1`, `--surface-2`), added `/errors/` to Footer Tools, and updated Footer's ecosystem link from stalled `ExLlamaV2` to active `ExLlamaV3`.

---

## 3. Handoff notes

- **Verified**:
  - `npm run typecheck` → 0 errors.
  - `npm run lint` → 0 warnings or errors.
  - `npm test` → all 19 suites pass (167 models, 385 model/GPU pairs per language, 97,614 fits across 126 hardware profiles, CLI `b12774` & Ollama gates verified).
  - `npm run build` (`next build` + `postbuild`) → all 1,542 HTML pages, structured data, title/description width budgets, Chinese link-leak/404 gates and `check-export-size` pass.
- **Traps / notes for next session**:
  - Never add a LiveBench sort option to `QuantHubContent`: `liveBenchScores` spans multiple dated releases that are not directly comparable (`CLAUDE.md` & `lib/data/model-quality.ts`).
  - Keep `CommandPaletteModal` dynamically imported with `{ ssr: false }` in `Navbar.tsx` so static reference/guide pages keep their slim ~167–177 kB First Load JS budgets without carrying the full model/GPU/guide/error indexes in the shared layout bundle!
  - `Inkling 2 Mini` stays on whole-layer offload (`arch.moe` omitted) like `Metis-1.6` because its middle 12 layers execute 3 times across 48 slots in `llama.cpp`.
