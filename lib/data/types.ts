export type QuantConfidence = 'measured' | 'estimated' | 'community';
export type ModelStatus = 'active' | 'superseded';

export interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;
  bpw: number;
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
}

export interface ModelArch {
  layers: number;
  attHeads: number;
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
    /** Where the layer split was sourced from — shown to the reader. */
    note?: { en: string; zh: string };
  };
}

export interface QuantModel {
  id: string;
  name: string;
  family: string;
  params: number;
  paramLabel: string;
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
