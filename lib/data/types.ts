export type QuantConfidence = 'measured' | 'estimated' | 'community';
export type ModelStatus = 'active' | 'superseded';

export interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;
  bpw: number;
  /** Legacy hand-typed figure — no display reads it (they call `sizeAt4K()`); kept so old rows
   *  type-check. It mixed file sizes with old 4K totals and disagreed with the calculator on 182 of 313 rows. */
  vramGB: number;
  /**
   * Perplexity loss against the unquantized weights, where someone has actually
   * published one. Optional on purpose: most 2026 releases ship GGUF
   * conversions with no per-level perplexity sweep, and filling the column with
   * an invented figure would feed a fabricated number straight into the hub
   * ranking, the homepage picks and every GPU page. Sort with `qualityRank()`
   * (lib/utils/quality.ts), which falls back to bits-per-weight, and display
   * with `formatLoss()`, which prints an em dash rather than a number.
   */
  pplLossPercent?: number;
  speedRTX4090?: number;
  hfSearchUrl: string;
  /** Default when omitted: estimated */
  confidence?: QuantConfidence;
  /**
   * The published file this row's `bpw` was derived from. Set only when the bytes were read from a
   * real repo listing (tree API / CDN Content-Length) — never back-filled from a GiB figure or a
   * search snippet, and never guessed. A row without it is sized from the generic table or from a
   * file size that was not recorded; `sizingBasis()` (lib/utils/quant-source.ts) tells them apart.
   * `assertDataConsistent()` fails the build when `bytes × 8 / params` drifts from `bpw`.
   */
  source?: QuantSource;
}

export interface QuantSource {
  /** Hugging Face repo the listing was read from, e.g. `bartowski/North-Mini-Code-1.0-GGUF`. */
  repo: string;
  /** File name exactly as listed; the first part of a split build. Omitted when only the size was recorded. */
  file?: string;
  /** Bytes of the language-model weights, every part summed. Not the vision projector. */
  bytes: number;
  /** Number of parts when the build is split (`…-00001-of-0000N.gguf`). */
  parts?: number;
  /** The separate vision projector (mmproj) the repo ships — counted in neither `bytes` nor `vramGB`. */
  mmprojBytes?: number;
  /** YYYY-MM-DD the listing was read. */
  checkedAt: string;
}

export interface ModelArch {
  layers: number;
  attHeads: number;
  /**
   * `kvHeads × headDim` is what `calcVRAM` sizes, doubled for K and V. For an MLA
   * model (DeepSeek-2-style: GLM-4.7-Flash, Kimi Linear) llama.cpp caches one
   * compressed vector of `kv_lora_rank + qk_rope_head_dim` per token per layer
   * and no V, so those entries use `kvHeads: 1, headDim: (576 / 2) = 288` — a
   * sizing encoding, not the model's real head layout.
   */
  kvHeads: number;
  headDim: number;
  /**
   * How the layers actually cache attention state. Omit for the classic case —
   * every layer keeps a KV cache that grows linearly with context — which is
   * what all the 2024/2025 models in this index do.
   *
   * 2026 architectures broke that assumption, and the breakage is large rather
   * than marginal. Qwen3.8-27B has 64 layers of which only **16** run full
   * attention; the other 48 are Gated DeltaNet linear attention with a
   * fixed-size recurrent state that does not grow with context. Sizing it with
   * `layers: 64` overstates the KV cache by exactly 4× — 8.0 GB against a
   * measured 2.0 GB at 32K. Gemma 4 interleaves sliding-window layers with
   * global ones at 5:1, so its local layers cap out at the window size no
   * matter how long the context is.
   *
   * Both are describable with the same two numbers, so the calculator stays one
   * formula rather than a pile of per-model special cases.
   */
  attention?: {
    /**
     * Layers whose KV cache grows with context. Defaults to `layers`.
     * For a hybrid-linear model this is the count of full-attention layers;
     * the linear ones hold a constant state that is negligible beside it.
     */
    fullLayers?: number;
    /** Layers whose KV cache is capped by a sliding window. */
    windowLayers?: number;
    /** The window, in tokens, that caps `windowLayers`. */
    windowTokens?: number;
    /**
     * KV heads / head size on the full-attention layers, when they differ from
     * the window layers (`kvHeads` / `headDim`). Gemma 4's global layers use
     * fewer, wider heads (31B: 4 × 512 vs 16 × 256 on its window layers).
     */
    fullKvHeads?: number;
    fullHeadDim?: number;
    /**
     * Compressed or index caches that keep one K-only row of `values` numbers per
     * `ratio` tokens on `layers` layers, beside any full/window cache above.
     * DeepSeek V4's CSA/HCA layers (llama.cpp `llama_kv_cache_dsv4`: rows =
     * ceil(context / ratio)) and the sparse-attention indexer caches of MiniMax M3
     * (`llama_kv_cache_msa`) are sized this way. `values` is not doubled.
     */
    compressed?: { layers: number; values: number; ratio: number }[];
    /** Where the layer split was sourced from — shown to the reader. */
    note?: { en: string; zh: string };
  };
  /**
   * The routed-expert tensors of a MoE model — what llama.cpp's `--n-cpu-moe N`
   * (`blk.<i>.ffn_*_exps` for i < N, `common/arg.cpp`) moves to system RAM while
   * attention, shared experts, embeddings and the KV cache stay on the card.
   * `expertParams` is counted from the config (layers × experts × matrices ×
   * hidden × expert width) and must reconcile with `params` — the rest is what
   * the card has to hold. Omit it when the config was not read: the calculator
   * then offers only the whole-layer split.
   */
  moe?: {
    /** Parameters in the routed-expert tensors, billions. */
    expertParams: number;
    experts: number;
    perToken: number;
    /** Layers that carry routed experts. */
    moeLayers: number;
    /** Dense layers before the first MoE layer (`first_k_dense_replace`). */
    denseLead?: number;
    /**
     * MoE layers alternate with other block types (Mamba, attention), so N in
     * `--n-cpu-moe N` is a layer index, not a count of MoE layers — only
     * `--cpu-moe` (every expert) is offered.
     */
    interleaved?: boolean;
  };
}

export interface QuantModel {
  id: string;
  name: string;
  family: string;
  params: number;
  paramLabel: string;
  /**
   * Active parameters per token, in billions — MoE models whose `paramLabel`
   * does not carry it (`21B MoE`). Labels like `30B-A3B` are parsed instead;
   * read it through `activeParamsB()`, never directly. Vendor-stated figure, or —
   * when the vendor states none — weight reads per token counted from the config, with
   * the arithmetic in a comment (Metis-1.6's looped stack re-reads its trunk each pass).
   */
  activeParams?: number;
  categories: string[];
  hardwareTags: string[];
  contextLength: number;
  arch: ModelArch;
  quants: QuantVariant[];
  description: { en: string; zh: string };
  /** Default when omitted: active */
  status?: ModelStatus;
  /** Prefer this model id when status is superseded */
  supersededBy?: string;
  /** ISO date YYYY-MM-DD — used for "recently added" filter */
  addedAt?: string;
}
