/**
 * Fine-tuning memory: full fine-tune, LoRA (16-bit base) and QLoRA (4-bit base).
 *
 * Every constant here has a stated source; the result is an estimate of a
 * standard Hugging Face transformers + PEFT/TRL run, not of any one tool's
 * optimised path (Unsloth offloads checkpoints and chunks the loss, and
 * publishes lower minimums than this).
 *
 * - Full fine-tune, mixed precision AdamW: 6 B/param weights (bf16 copy + fp32
 *   main copy) + 8 B/param Adam moments (fp32) + 4 B/param fp32 gradients —
 *   transformers docs, `model_memory_anatomy.md`. bitsandbytes 8-bit Adam
 *   brings the optimizer to 2 B/param (same page).
 * - QLoRA base: NF4 4 bits + 0.5 bits of block-64 fp32 constants, of which
 *   double quantization saves 0.373 → 4.127 bits/param (QLoRA paper, §3).
 *   Embeddings and the output head stay 16-bit: `nn.Embedding` is not a Linear
 *   layer, and transformers' `get_keys_to_not_convert` keeps the output
 *   embedding (and anything tied to it) unquantized.
 * - LoRA adapters train in fp32: 4 B weights + 4 B gradients + 8 B Adam.
 * - Activations: 34·s·b·h bytes per layer for a standard transformer layer in
 *   16-bit with a fused attention kernel (no s² score term) — the constant in
 *   Korthikanti et al. 2022, as implemented in EleutherAI's
 *   `calc_transformer_mem.py`. With gradient checkpointing (the default in
 *   fine-tuning recipes) only each layer's 16-bit input is kept (2·s·b·h per
 *   layer) plus one layer recomputed at a time.
 * - Logits: the head writes bf16 logits (2 B), the loss upcasts them with
 *   `logits.float()` (4 B, transformers `loss_utils.py`) and the backward pass
 *   holds an fp32 gradient of the same shape (4 B): 10 B × tokens × vocab.
 * - A 10% working buffer on top, the same rule the inference estimate uses.
 */

export type FtMethod = 'qlora' | 'lora' | 'full';
export type FtOptimizer = 'adamw' | 'adamw8bit';

export const NF4_BITS = 4.127;
const GIB = 1024 ** 3;

export interface FtShape {
  paramsB: number;
  layers: number;
  /** Model width (hidden_size). */
  hidden: number;
  /** Width of the query projection: attention heads × head size. */
  qDim: number;
  /** Width of each of K and V: KV heads × head size. */
  kvDim: number;
  /** MLP intermediate size summed over experts; derived from the parameter count when unknown. */
  intermediate?: number;
  vocab?: number;
  tiedEmbeddings?: boolean;
}

export interface FtInput {
  shape: FtShape;
  method: FtMethod;
  optimizer: FtOptimizer;
  rank: number;
  seqLen: number;
  batch: number;
  checkpointing: boolean;
}

export interface FtResult {
  baseGB: number;
  trainableParams: number;
  trainableGB: number;
  activationsGB: number;
  /** Undefined when the vocabulary size is unknown — the term is then not counted. */
  logitsGB?: number;
  overheadGB: number;
  totalGB: number;
  /** True when the MLP width had to be derived from the parameter count. */
  intermediateDerived: boolean;
}

function embeddingParams(s: FtShape): number {
  if (!s.vocab) return 0;
  return s.vocab * s.hidden * (s.tiedEmbeddings ? 1 : 2);
}

/** MLP width per layer (all experts together), from the config or from what the parameter count leaves over. */
function mlpWidth(s: FtShape): { width: number; derived: boolean } {
  if (s.intermediate) return { width: s.intermediate, derived: false };
  const attn = s.hidden * s.qDim * 2 + s.hidden * s.kvDim * 2;
  const perLayer = (s.paramsB * 1e9 - embeddingParams(s)) / s.layers - attn;
  return { width: Math.max(0, perLayer / (3 * s.hidden)), derived: true };
}

/** LoRA on every linear layer (PEFT `target_modules="all-linear"`): r × (in + out) per matrix. */
export function loraParams(s: FtShape, rank: number): { params: number; derived: boolean } {
  const { width, derived } = mlpWidth(s);
  const attn = (s.hidden + s.qDim) * 2 + (s.hidden + s.kvDim) * 2;
  const mlp = (s.hidden + width) * 3;
  return { params: rank * (attn + mlp) * s.layers, derived };
}

export function finetuneMemory(input: FtInput): FtResult {
  const { shape: s, method, optimizer, rank, seqLen, batch, checkpointing } = input;
  const P = s.paramsB * 1e9;
  const adam = optimizer === 'adamw8bit' ? 2 : 8;

  let baseBytes: number;
  let trainableParams: number;
  let trainableBytes: number;
  let intermediateDerived = false;
  if (method === 'full') {
    baseBytes = P * 6;
    trainableParams = P;
    trainableBytes = P * (adam + 4);
  } else {
    const emb = embeddingParams(s);
    baseBytes = method === 'qlora' ? (P - emb) * (NF4_BITS / 8) + emb * 2 : P * 2;
    const lora = loraParams(s, rank);
    trainableParams = lora.params;
    intermediateDerived = lora.derived;
    trainableBytes = lora.params * (4 + 4 + adam);
  }

  const tokens = seqLen * batch;
  const activationBytes = checkpointing
    ? 2 * tokens * s.hidden * s.layers + 34 * tokens * s.hidden
    : 34 * tokens * s.hidden * s.layers;
  const logitsBytes = s.vocab ? 10 * tokens * s.vocab : undefined;

  const subtotal = baseBytes + trainableBytes + activationBytes + (logitsBytes ?? 0);
  const overheadBytes = subtotal * 0.1;
  const gb = (b: number) => Math.round((b / GIB) * 100) / 100;
  return {
    baseGB: gb(baseBytes),
    trainableParams,
    trainableGB: gb(trainableBytes),
    activationsGB: gb(activationBytes),
    logitsGB: logitsBytes === undefined ? undefined : gb(logitsBytes),
    overheadGB: gb(overheadBytes),
    totalGB: gb(subtotal + overheadBytes),
    intermediateDerived,
  };
}
