// Ollama library tags the calculator can translate into an indexed model and quant.
// Every row was read from registry.ollama.ai on `OLLAMA_TAGS_CHECKED` (`npm run verify:ollama`
// re-reads them). A tag is listed only when its checkpoint is the one the index sizes; a library
// tag that serves a different checkpoint (e.g. `devstral:24b` is Small 2505, the index has 2507)
// is left out so the calculator says so instead of guessing.

export const OLLAMA_TAGS_CHECKED = '2026-11-22';

export interface OllamaTagRow {
  /** Tag text before any quant suffix, as typed after the colon (`8b`, `30b-a3b`). */
  tags: string[];
  /** Stems that take an explicit quant suffix (`8b-instruct` → `8b-instruct-q8_0`). */
  quantStems: string[];
  modelId: string;
  /** Calculator quant key the bare tag downloads (Ollama's default file type). */
  level: string;
  /** The bare tag now serves a later checkpoint of the same architecture and size. */
  bareIsNewer?: boolean;
}

export interface OllamaLibraryEntry {
  name: string;
  /** Tag that `name` / `name:latest` resolves to, when checked. */
  latest?: string;
  rows: OllamaTagRow[];
}

const row = (tags: string[], quantStems: string[], modelId: string, level: string, bareIsNewer?: boolean): OllamaTagRow =>
  ({ tags, quantStems, modelId, level, ...(bareIsNewer ? { bareIsNewer } : {}) });
const instruct = (size: string, modelId: string, level = 'Q4_K_M') => row([size], [`${size}-instruct`], modelId, level);
const plain = (size: string, modelId: string, level = 'Q4_K_M') => row([size], [size], modelId, level);
const bare = (tags: string[], modelId: string, level = 'Q4_K_M') => row(tags, [], modelId, level);

export const ollamaLibrary: OllamaLibraryEntry[] = [
  { name: 'llama3.1', rows: [instruct('8b', 'llama-3.1-8b'), instruct('70b', 'llama-3.1-70b'), instruct('405b', 'llama-3.1-405b')] },
  { name: 'llama3.2', rows: [instruct('1b', 'llama-3.2-1b', 'Q8_0'), instruct('3b', 'llama-3.2-3b')] },
  { name: 'llama3.3', rows: [instruct('70b', 'llama-3.3-70b')] },
  { name: 'llama3.2-vision', rows: [instruct('11b', 'llama-3.2-11b-vision'), instruct('90b', 'llama-3.2-90b-vision')] },
  { name: 'llama4', rows: [
    row(['scout', '16x17b'], ['17b-scout-16e-instruct'], 'llama-4-scout-17b', 'Q4_K_M'),
    row(['maverick', '128x17b'], ['17b-maverick-128e-instruct'], 'llama-4-maverick-17b', 'Q4_K_M'),
  ] },
  { name: 'qwen2.5', rows: ['0.5b', '1.5b', '3b', '7b', '14b', '32b', '72b'].map(s => instruct(s, `qwen2.5-${s}`)) },
  { name: 'qwen2.5-coder', rows: [instruct('7b', 'qwen2.5-coder-7b'), instruct('32b', 'qwen2.5-coder-32b')] },
  { name: 'qwen3', latest: '8b', rows: [
    plain('1.7b', 'qwen3-1.7b'),
    row(['4b'], ['4b'], 'qwen3-4b', 'Q4_K_M', true),
    plain('8b', 'qwen3-8b'),
    plain('14b', 'qwen3-14b'),
    plain('32b', 'qwen3-32b'),
    row(['30b', '30b-a3b'], ['30b-a3b'], 'qwen3-30b-a3b', 'Q4_K_M', true),
    row(['235b', '235b-a22b'], ['235b-a22b'], 'qwen3-235b-a22b', 'Q4_K_M', true),
  ] },
  { name: 'qwen3-coder', rows: [bare(['30b'], 'qwen3-coder-30b-a3b')] },
  { name: 'qwen3-vl', rows: [bare(['8b'], 'qwen3-vl-8b'), bare(['30b', '30b-a3b'], 'qwen3-vl-30b-a3b')] },
  { name: 'qwen3.5', rows: [plain('0.8b', 'qwen3-5-0.8b', 'Q8_0'), plain('2b', 'qwen3-5-2b', 'Q8_0'), plain('4b', 'qwen3-5-4b'), plain('9b', 'qwen3-5-9b')] },
  // Explicit-quant qwen3.6 tags carry extra weights (27.8B / 36.0B), so only the bare tags match.
  { name: 'qwen3.6', rows: [bare(['27b'], 'qwen3-6-27b'), bare(['35b', '35b-a3b'], 'qwen3-6-35b-a3b')] },
  // deepseek-r1:8b is the 0528 Qwen3 distill, not the Llama 8B distill, so it is not listed.
  { name: 'deepseek-r1', rows: [
    bare(['7b'], 'deepseek-r1-distill-qwen-7b'),
    bare(['14b'], 'deepseek-r1-distill-qwen-14b'),
    bare(['32b'], 'deepseek-r1-distill-qwen-32b'),
    bare(['70b'], 'deepseek-r1-distill-llama-70b'),
    { ...bare(['671b'], 'deepseek-r1'), bareIsNewer: true },
  ] },
  { name: 'deepseek-v3', rows: [bare(['671b'], 'deepseek-v3')] },
  { name: 'deepseek-coder-v2', rows: [bare(['16b'], 'deepseek-coder-v2-lite', 'Q4_0')] },
  { name: 'deepseek-v2', rows: [bare(['16b'], 'deepseek-v2-lite', 'Q4_0')] },
  { name: 'phi3.5', rows: [bare(['3.8b'], 'phi-3.5-mini', 'Q4_0')] },
  { name: 'phi3', rows: [bare(['14b', 'medium'], 'phi-3-medium-14b', 'Q4_0')] },
  { name: 'phi4', rows: [plain('14b', 'phi-4')] },
  { name: 'phi4-mini', rows: [bare(['3.8b'], 'phi-4-mini')] },
  { name: 'mistral', rows: [bare(['7b'], 'mistral-7b-v0.3')] },
  { name: 'mistral-nemo', rows: [bare(['12b'], 'mistral-nemo-12b', 'Q4_0')] },
  { name: 'mistral-small', rows: [row(['24b'], ['24b-instruct-2501'], 'mistral-small-24b', 'Q4_K_M')] },
  { name: 'ministral-3', rows: [row(['8b'], ['8b-instruct-2512'], 'ministral-3-8b', 'Q4_K_M')] },
  { name: 'codestral', rows: [bare(['22b'], 'codestral-22b', 'Q4_0')] },
  { name: 'mixtral', rows: [row(['8x7b'], ['8x7b-instruct-v0.1'], 'mixtral-8x7b', 'Q4_0')] },
  { name: 'gemma2', rows: [bare(['2b'], 'gemma-2-2b', 'Q4_0'), bare(['9b'], 'gemma-2-9b', 'Q4_0'), bare(['27b'], 'gemma-2-27b', 'Q4_0')] },
  { name: 'gemma3', rows: ['4b', '12b', '27b'].map(s => row([s], [`${s}-it`], `gemma-3-${s}-it`, 'Q4_K_M')) },
  // gemma4:26b-a4b-it-* tags carry extra weights (25.8B), so only the bare 26B tags match.
  { name: 'gemma4', rows: [
    row(['e2b'], ['e2b-it'], 'gemma-4-e2b', 'Q4_K_M'),
    row(['e4b'], ['e4b-it'], 'gemma-4-e4b', 'Q4_K_M'),
    row(['12b'], ['12b-it'], 'gemma-4-12b', 'Q4_K_M'),
    bare(['26b', '26b-a4b'], 'gemma-4-26b-a4b'),
    row(['31b'], ['31b-it'], 'gemma-4-31b', 'Q4_K_M'),
  ] },
  { name: 'gpt-oss', rows: [bare(['20b'], 'gpt-oss-20b', 'MXFP4'), bare(['120b'], 'gpt-oss-120b', 'MXFP4')] },
  { name: 'glm4', rows: [bare(['9b'], 'glm-4-9b-chat', 'Q4_0')] },
  { name: 'glm-4.7-flash', latest: '', rows: [row([''], [''], 'glm-4.7-flash', 'Q4_K_M')] },
  { name: 'granite3.1-dense', rows: [instruct('8b', 'granite-3.1-8b')] },
  { name: 'granite4.2', rows: [plain('3b', 'granite-4.2-3b'), plain('8b', 'granite-4.2-8b'), plain('30b', 'granite-4.2-30b')] },
  { name: 'falcon3', rows: [instruct('10b', 'falcon-3-10b')] },
  // olmo-3:7b is the Think model; the index sizes the Instruct one.
  { name: 'olmo-3', rows: [row(['7b-instruct'], ['7b-instruct'], 'olmo-3-7b', 'Q4_K_M')] },
  { name: 'olmo2', rows: [row(['7b'], ['7b-1124-instruct'], 'olmo-2-7b', 'Q4_K_M')] },
  { name: 'hermes3', rows: [bare(['8b'], 'nous-hermes-3-llama-3.1-8b', 'Q4_0')] },
  { name: 'solar', rows: [row(['10.7b'], ['10.7b-instruct-v1'], 'solar-10.7b', 'Q4_0')] },
  { name: 'wizardlm2', rows: [plain('7b', 'wizardlm-2-7b', 'Q4_0')] },
  { name: 'stablelm2', rows: [row(['12b', '12b-chat'], ['12b-chat'], 'stablelm-2-12b', 'Q4_0')] },
  { name: 'starcoder2', rows: [plain('15b', 'starcoder2-15b', 'Q4_0')] },
  { name: 'dbrx', rows: [row(['132b', 'instruct'], ['132b-instruct'], 'dbrx-instruct', 'Q4_0')] },
];
