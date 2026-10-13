import type { ModelArch } from '@/lib/data/types';

/**
 * Size any Hugging Face repo from its own `config.json`.
 *
 * Runs in the reader's browser at click time — the one place this static site
 * talks to the network. Nothing here is guessed to fill a gap: a field the
 * config does not carry stays empty and the UI asks for it, and every shortcut
 * that is taken is reported back as a note the reader sees.
 */

export interface ImportedShape {
  repo: string;
  /** Total parameters in billions, from the Hub's safetensors / GGUF metadata. */
  paramsB?: number;
  layers?: number;
  kvHeads?: number;
  headDim?: number;
  attention?: ModelArch['attention'];
  contextLength?: number;
  experts?: number;
  expertsPerToken?: number;
  /** Fine-tuning needs these; inference sizing does not. */
  hidden?: number;
  vocab?: number;
  /** MLP width per layer, summed over routed and shared experts. */
  intermediate?: number;
  tiedEmbeddings?: boolean;
  /** The repo whose config.json was read — differs from `repo` for a GGUF repo naming its base. */
  configRepo?: string;
  notes: ImportNote[];
}

export type ImportNote =
  | 'gated'          // config.json refused: gated or private repo
  | 'noConfig'       // no config.json and no base model to fall back to
  | 'viaBase'        // architecture read from the base model a GGUF repo names
  | 'noParams'       // the Hub reports no parameter count
  | 'mla'            // multi-head latent attention, sized as llama.cpp caches it
  | 'linear'         // hybrid linear attention: recurrent layers hold no growing cache
  | 'window'         // sliding-window layers sized at llama.cpp's window + batch
  | 'windowIgnored'  // a sliding_window field with no per-layer pattern: counted as full
  | 'moe';           // mixture of experts: every expert stays resident

const HUB = 'https://huggingface.co';

/** "org/name" from a repo id, an hf.co / huggingface.co URL, or a `hf download` line. */
export function parseRepoInput(input: string): string | null {
  const s = input.trim().replace(/^hf\s+download\s+/, '').split(/\s+/)[0] ?? '';
  const url = /^(?:https?:\/\/)?(?:www\.)?(?:huggingface\.co|hf\.co)\/(.+)$/i.exec(s);
  const path = (url ? url[1] : s).replace(/^models\//, '').split(/[?#]/)[0];
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [org, name] = parts;
  return /^[\w.-]+$/.test(org) && /^[\w.-]+$/.test(name) ? `${org}/${name}` : null;
}

/** What llama.cpp allocates for a sliding-window layer: window + one 512-token batch, padded to 256. */
export function llamaCppWindowCells(window: number): number {
  return Math.ceil((window + 512) / 256) * 256;
}

type Json = Record<string, unknown>;
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);

/** Multimodal and wrapper configs keep the language model one level down. */
function textConfig(cfg: Json): Json {
  const candidates = [cfg, cfg.text_config, cfg.llm_config, cfg.language_config, cfg.thinker_config]
    .filter((c): c is Json => !!c && typeof c === 'object');
  return candidates.find(c => num(c.num_hidden_layers) ?? num(c.n_layer) ?? num(c.num_layers)) ?? cfg;
}

/** Architecture fields from a parsed `config.json`; no network. */
export function shapeFromConfig(cfg: Json): Omit<ImportedShape, 'repo' | 'paramsB'> {
  const c = textConfig(cfg);
  const notes: ImportNote[] = [];
  const layers = num(c.num_hidden_layers) ?? num(c.n_layer) ?? num(c.num_layers);
  const heads = num(c.num_attention_heads) ?? num(c.n_head);
  const hidden = num(c.hidden_size) ?? num(c.n_embd) ?? num(c.d_model);
  let kvHeads = num(c.num_key_value_heads) ?? num(c.multi_query_group_num) ?? (c.multi_query === true ? 1 : undefined) ?? heads;
  let headDim = num(c.head_dim) ?? (hidden && heads ? hidden / heads : undefined);

  // MLA (DeepSeek-2/3 style): llama.cpp caches one kv_lora_rank + rope vector
  // per token and no separate V — the same encoding the index uses.
  const loraRank = num(c.kv_lora_rank);
  const rope = num(c.qk_rope_head_dim);
  if (loraRank && rope) {
    kvHeads = 1;
    headDim = (loraRank + rope) / 2;
    notes.push('mla');
  }

  let attention: ModelArch['attention'];
  const types = Array.isArray(c.layer_types) ? (c.layer_types as unknown[]).map(String) : undefined;
  const window = num(c.sliding_window) ?? num(c.attention_chunk_size);
  if (types && layers && types.length >= layers) {
    const used = types.slice(0, layers);
    const full = used.filter(t => t === 'full_attention' || t === 'attention' || t === 'global').length;
    const sliding = used.filter(t => /sliding|chunk|local/.test(t)).length;
    const other = layers - full - sliding;
    if (other > 0) notes.push('linear');
    if (sliding > 0 && window) {
      notes.push('window');
      attention = { fullLayers: full, windowLayers: sliding, windowTokens: llamaCppWindowCells(window) };
    } else if (sliding > 0) {
      // A sliding layer with no stated window cannot be capped; count it as full.
      attention = { fullLayers: full + sliding };
      notes.push('windowIgnored');
    } else if (other > 0) {
      attention = { fullLayers: full };
    }
  } else if (layers && num(c.full_attention_interval)) {
    attention = { fullLayers: Math.floor(layers / num(c.full_attention_interval)!) };
    notes.push('linear');
  } else if (layers && window && num(c.sliding_window_pattern) && c.use_sliding_window !== false) {
    // Gemma 3 style: every Nth layer is global.
    const full = Math.floor(layers / num(c.sliding_window_pattern)!);
    attention = { fullLayers: full, windowLayers: layers - full, windowTokens: llamaCppWindowCells(window) };
    notes.push('window');
  } else if (window && c.use_sliding_window !== false) {
    // A window with no per-layer pattern: which layers use it is not stated,
    // so every layer is sized at full context — an upper bound, said so.
    notes.push('windowIgnored');
  }

  const experts = num(c.num_experts) ?? num(c.num_local_experts) ?? num(c.n_routed_experts);
  const expertsPerToken = num(c.num_experts_per_tok) ?? num(c.moe_topk) ?? num(c.num_selected_experts);
  if (experts && experts > 1) notes.push('moe');

  const moeWidth = num(c.moe_intermediate_size);
  const sharedWidth = num(c.shared_expert_intermediate_size) ?? (num(c.n_shared_experts) && moeWidth ? num(c.n_shared_experts)! * moeWidth : undefined);
  const intermediate = experts && experts > 1 && moeWidth
    ? moeWidth * experts + (sharedWidth ?? 0)
    : num(c.intermediate_size) ?? num(c.ffn_hidden_size) ?? num(c.n_inner);
  const tied = typeof c.tie_word_embeddings === 'boolean' ? c.tie_word_embeddings
    : typeof cfg.tie_word_embeddings === 'boolean' ? (cfg.tie_word_embeddings as boolean) : undefined;

  return {
    hidden,
    vocab: num(c.vocab_size) ?? num(cfg.vocab_size) ?? num(c.padded_vocab_size),
    intermediate,
    tiedEmbeddings: tied,
    layers,
    kvHeads: kvHeads ? Math.round(kvHeads) : undefined,
    headDim: headDim ? Math.round(headDim) : undefined,
    attention,
    contextLength: num(c.max_position_embeddings) ?? num(c.n_positions) ?? num(c.seq_length) ?? num(c.max_sequence_length),
    experts,
    expertsPerToken,
    notes,
  };
}

/** Total parameters (billions) from the Hub's model-info JSON. */
export function paramsFromInfo(info: Json): number | undefined {
  const st = info.safetensors as Json | undefined;
  const gguf = info.gguf as Json | undefined;
  const total = num(st?.total) ?? num(gguf?.total);
  return total ? total / 1e9 : undefined;
}

function baseModelOf(info: Json): string | undefined {
  const card = info.cardData as Json | undefined;
  const base = card?.base_model;
  const first = Array.isArray(base) ? base[0] : base;
  return typeof first === 'string' ? parseRepoInput(first) ?? undefined : undefined;
}

export type ImportResult =
  | { ok: true; shape: ImportedShape }
  | { ok: false; error: 'badInput' | 'notFound' | 'network' };

async function getJson(fetchImpl: typeof fetch, url: string): Promise<{ status: number; body?: Json }> {
  const res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return { status: res.status };
  return { status: res.status, body: (await res.json()) as Json };
}

export async function importFromHub(input: string, fetchImpl: typeof fetch = fetch): Promise<ImportResult> {
  const repo = parseRepoInput(input);
  if (!repo) return { ok: false, error: 'badInput' };
  try {
    const info = await getJson(fetchImpl, `${HUB}/api/models/${repo}`);
    if (info.status === 404 || info.status === 401) return { ok: false, error: 'notFound' };
    const notes: ImportNote[] = [];
    const paramsB = info.body ? paramsFromInfo(info.body) : undefined;
    if (!paramsB) notes.push('noParams');

    let configRepo = repo;
    let cfg = await getJson(fetchImpl, `${HUB}/${repo}/resolve/main/config.json`);
    if (cfg.status === 401 || cfg.status === 403) notes.push('gated');
    if (!cfg.body && cfg.status === 404 && info.body) {
      // A GGUF repo has no config.json; most name the model they convert.
      const base = baseModelOf(info.body);
      if (base && base !== repo) {
        cfg = await getJson(fetchImpl, `${HUB}/${base}/resolve/main/config.json`);
        if (cfg.body) { configRepo = base; notes.push('viaBase'); }
        else if (cfg.status === 401 || cfg.status === 403) notes.push('gated');
      }
    }
    if (!cfg.body && !notes.includes('gated')) notes.push('noConfig');

    const shape = cfg.body ? shapeFromConfig(cfg.body) : { notes: [] as ImportNote[] };
    return {
      ok: true,
      shape: { repo, paramsB, configRepo: cfg.body ? configRepo : undefined, ...shape, notes: [...notes, ...shape.notes] },
    };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/**
 * A GGUF repo's vision encoder: the `mmproj` file and its size, from the Hub's
 * file listing. Prefers the f16 build (what llama.cpp's docs load), then bf16,
 * then the smallest. Undefined when the repo lists no mmproj file or the Hub
 * cannot be reached — the reader then enters it by hand.
 */
export async function mmprojFromHub(repo: string, fetchImpl: typeof fetch = fetch): Promise<{ file: string; gb: number } | undefined> {
  try {
    const res = await fetchImpl(`${HUB}/api/models/${repo}?blobs=true`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return undefined;
    const info = (await res.json()) as Json;
    const files = (Array.isArray(info.siblings) ? info.siblings : [])
      .map(f => f as Json)
      .filter(f => typeof f.rfilename === 'string' && /mmproj/i.test(f.rfilename as string) && /\.gguf$/i.test(f.rfilename as string) && num(f.size));
    if (files.length === 0) return undefined;
    const pick = files.find(f => /f16/i.test(f.rfilename as string) && !/bf16/i.test(f.rfilename as string))
      ?? files.find(f => /bf16/i.test(f.rfilename as string))
      ?? [...files].sort((a, b) => (num(a.size) ?? 0) - (num(b.size) ?? 0))[0];
    return { file: pick.rfilename as string, gb: (num(pick.size) ?? 0) / 1024 ** 3 };
  } catch {
    return undefined;
  }
}
