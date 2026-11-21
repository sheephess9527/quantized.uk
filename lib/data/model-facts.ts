/**
 * Per-model licence and input-modality facts — the data behind the Hub's two
 * extra filters.
 *
 * **Where a licence comes from.** Initial table read 2026-11-14; later additions
 * have their source/check dates in the model pack and change record. Read the model's own
 * Hugging Face repository — the card's declarative `license` / `license_name`
 * (`https://huggingface.co/api/models/<repo>`), and where that tag was just
 * `other`, the licence file it points at. The repo read is the model's
 * `hfRepoMap` entry (`lib/data/hf-repos.mjs`) when that is the publisher's own
 * repo; where that entry is a community GGUF conversion, it is the publisher's
 * own repo of the same weights (Qwen3-8B from `Qwen/Qwen3-8B`, not bartowski's
 * copy) — a quantiser's card restates the upstream licence, it is not a separate
 * source. Two models have no
 * entry at all because no licence could be read: their rows carry no licence and
 * appear only under the filter's `all` setting. A licence is a claim about
 * someone else's terms — never add one from memory.
 *
 * **The classification rule.** One question, asked of the licence text itself:
 * *does it let anyone use the weights commercially without first meeting a
 * threshold, registering, or asking the publisher for a separate permission?*
 *
 * - `commercial` — yes. Permissive licences (Apache 2.0, MIT, OpenMDW) and open-
 *   model licences that attach obligations but no gate (Gemma, Falcon, Jamba,
 *   NVIDIA, DeepSeek, OpenRAIL-M). Attribution and
 *   acceptable-use clauses do not change the class; every licence here has some.
 * - `restricted` — only after a gate: Llama 3.x/4 and the Qwen licences inside
 *   700M / 100M monthly-active-user ceilings, Qwen 3.8-Flash-Next's separate
 *   licence for hosting it as a service, GLM-4's commercial registration,
 *   LFM Open's revenue threshold, DBRX's user-count clause, Mistral's separate
 *   licence for Model-as-a-Service operators.
 * - `noncommercial` — commercial use is not granted: the research licences
 *   (Qwen Research, Mistral Research), Mistral's non-production licence,
 *   CC BY-NC 4.0, and Stability's non-commercial terms.
 *
 * The class is a filter, not legal advice: the Hub shows the licence's own name
 * beside every model, and the link below is the text to read before shipping.
 */

export type LicenceClass = 'commercial' | 'restricted' | 'noncommercial';

export interface LicenceInfo {
  /** Short label for a card badge, e.g. `Llama 3.1`. */
  short: string;
  /** Full name, shown in the badge's tooltip. */
  name: { en: string; zh: string };
  class: LicenceClass;
  /** The licence text itself. */
  url: string;
}

export const LICENCES = {
  'webai-nc-1.0': { short: 'webAI NC', name: { en: 'webAI Non-Commercial License 1.0', zh: 'webAI 非商业许可 1.0' }, class: 'noncommercial', url: 'https://huggingface.co/webAI-Official/TwIL-8B/blob/main/LICENSE.md' },
  'apache-2.0': { short: 'Apache 2.0', name: { en: 'Apache 2.0', zh: 'Apache 2.0' }, class: 'commercial', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
  'mit': { short: 'MIT', name: { en: 'MIT', zh: 'MIT' }, class: 'commercial', url: 'https://opensource.org/license/mit' },
  'bigcode-openrail-m': { short: 'OpenRAIL-M', name: { en: 'BigCode OpenRAIL-M', zh: 'BigCode OpenRAIL-M' }, class: 'commercial', url: 'https://huggingface.co/spaces/bigcode/bigcode-model-licenses/blob/main/OpenRAIL-M.md' },
  'openmdw-1.1': { short: 'OpenMDW 1.1', name: { en: 'OpenMDW 1.1', zh: 'OpenMDW 1.1' }, class: 'commercial', url: 'https://openmdw.ai/license/1-1/' },
  'gemma': { short: 'Gemma', name: { en: 'Gemma Terms of Use', zh: 'Gemma 使用条款' }, class: 'commercial', url: 'https://ai.google.dev/gemma/terms' },
  'falcon-llm-license': { short: 'Falcon', name: { en: 'Falcon LLM Licence', zh: 'Falcon LLM 许可' }, class: 'commercial', url: 'https://falconllm.tii.ae/falcon-terms-and-conditions.html' },
  'jamba-open-model-license': { short: 'Jamba', name: { en: 'Jamba Open Model Licence', zh: 'Jamba 开放模型许可' }, class: 'commercial', url: 'https://huggingface.co/ai21labs/AI21-Jamba-Mini-1.5/blob/main/LICENSE.txt' },
  'nvidia-open-model': { short: 'NVIDIA Open', name: { en: 'NVIDIA Open Model Licence', zh: 'NVIDIA 开放模型许可' }, class: 'commercial', url: 'https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement-license/' },
  'deepseek-license': { short: 'DeepSeek', name: { en: 'DeepSeek Model Licence', zh: 'DeepSeek 模型许可' }, class: 'commercial', url: 'https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL' },
  'mistral-open-weight': { short: 'Mistral Open-Weight', name: { en: 'Mistral Ecosystem Open-Weight Licence', zh: 'Mistral 生态开放权重许可' }, class: 'restricted', url: 'https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE' },
  'llama3': { short: 'Llama 3', name: { en: 'Llama 3 Community Licence', zh: 'Llama 3 社区许可' }, class: 'restricted', url: 'https://www.llama.com/llama3/license/' },
  'llama3.1': { short: 'Llama 3.1', name: { en: 'Llama 3.1 Community Licence', zh: 'Llama 3.1 社区许可' }, class: 'restricted', url: 'https://www.llama.com/llama3_1/license/' },
  'llama3.2': { short: 'Llama 3.2', name: { en: 'Llama 3.2 Community Licence', zh: 'Llama 3.2 社区许可' }, class: 'restricted', url: 'https://www.llama.com/llama3_2/license/' },
  'llama3.3': { short: 'Llama 3.3', name: { en: 'Llama 3.3 Community Licence', zh: 'Llama 3.3 社区许可' }, class: 'restricted', url: 'https://www.llama.com/llama3_3/license/' },
  'llama4': { short: 'Llama 4', name: { en: 'Llama 4 Community Licence', zh: 'Llama 4 社区许可' }, class: 'restricted', url: 'https://www.llama.com/llama4/license/' },
  'qwen-license': { short: 'Qwen', name: { en: 'Qwen Licence', zh: 'Qwen 许可' }, class: 'restricted', url: 'https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE' },
  'qwen-community-1.0': { short: 'Qwen Community', name: { en: 'Qwen Community Licence 1.0', zh: 'Qwen 社区许可 1.0' }, class: 'restricted', url: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE' },
  'glm-4': { short: 'GLM-4', name: { en: 'GLM-4 Licence', zh: 'GLM-4 许可' }, class: 'restricted', url: 'https://huggingface.co/zai-org/glm-4-9b-chat/blob/main/LICENSE' },
  'lfm-open-1.0': { short: 'LFM Open', name: { en: 'LFM Open Licence 1.0', zh: 'LFM 开放许可 1.0' }, class: 'restricted', url: 'https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE' },
  'databricks-open-model': { short: 'DBRX', name: { en: 'Databricks Open Model Licence', zh: 'Databricks 开放模型许可' }, class: 'restricted', url: 'https://www.databricks.com/legal/open-model-license' },
  'cc-by-nc-4.0': { short: 'CC BY-NC 4.0', name: { en: 'CC BY-NC 4.0', zh: 'CC BY-NC 4.0' }, class: 'noncommercial', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  'mrl': { short: 'Mistral Research', name: { en: 'Mistral Research Licence', zh: 'Mistral 研究许可' }, class: 'noncommercial', url: 'https://mistral.ai/licenses/MRL-0.1.md' },
  'mnpl': { short: 'Mistral Non-Prod', name: { en: 'Mistral Non-Production Licence', zh: 'Mistral 非生产许可' }, class: 'noncommercial', url: 'https://mistral.ai/licences/MNPL-0.1.md' },
  'qwen-research': { short: 'Qwen Research', name: { en: 'Qwen Research Licence', zh: 'Qwen 研究许可' }, class: 'noncommercial', url: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE' },
  'stability-nc': { short: 'Stability NC', name: { en: 'Stability Non-Commercial Research Licence', zh: 'Stability 非商业研究许可' }, class: 'noncommercial', url: 'https://huggingface.co/stabilityai/stablelm-2-12b-chat/blob/main/LICENSE' },
} as const satisfies Record<string, LicenceInfo>;

export type LicenceId = keyof typeof LICENCES;

/** Model id → licence. Anything absent has no licence recorded (see above). */
export const MODEL_LICENCE: Record<string, LicenceId> = {
  'clairic-27b': 'apache-2.0',
  'clairic-flash-9b': 'apache-2.0',
  'shot-reader-8b': 'apache-2.0',
  'ternary-bonsai-2-27b': 'apache-2.0',
  'daisyrose-27b': 'apache-2.0',
  'apex-35b-v1': 'apache-2.0',
  'botpsy-0-8b': 'apache-2.0',
  'mnn-pocket-0-3b': 'apache-2.0',
  'mnn-pocket-0-3b-qat': 'apache-2.0',
  'arete-27b': 'apache-2.0',
  'twil-8b-balanced': 'webai-nc-1.0',
  'lfm2-5-1-2b': 'lfm-open-1.0',
  'lfm2-5-8b-a1b': 'lfm-open-1.0',
  'ministral-3-3b': 'apache-2.0',
  'ministral-3-14b': 'apache-2.0',

  // No entry, therefore no licence claim: 'internlm2-7b' and 'internlm2-20b' ship no
  // licence file and their card tag is a bare `other` with no name.
  'aya-23-8b': 'cc-by-nc-4.0',
  'beam-1.0-501b-a23b': 'apache-2.0',
  'clover-35b-a3b-preview': 'apache-2.0',
  'codestral-22b': 'mnpl',
  'command-r-35b': 'cc-by-nc-4.0',
  // Repo is gated (401 to an anonymous read): Databricks publishes the licence and its
  // 700M-MAU clause on the web, and BDRX's card names it too.
  'dbrx-instruct': 'databricks-open-model',
  'deepseek-coder-v2-lite': 'deepseek-license',
  'deepseek-r1': 'mit',
  'deepseek-r1-distill-llama-70b': 'mit',
  'deepseek-r1-distill-llama-8b': 'mit',
  'deepseek-r1-distill-qwen-14b': 'mit',
  'deepseek-r1-distill-qwen-32b': 'mit',
  'deepseek-r1-distill-qwen-7b': 'mit',
  'deepseek-v2-lite': 'deepseek-license',
  'deepseek-v3': 'mit',
  'devstral-small-2507': 'apache-2.0',
  'ernie-4.5-21b-a3b': 'apache-2.0',
  'falcon-3-10b': 'falcon-llm-license',
  'flint-40b-a2-5b': 'apache-2.0',
  'gemma-2-27b': 'gemma',
  'gemma-2-2b': 'gemma',
  'gemma-2-9b': 'gemma',
  'gemma-3-12b-it': 'gemma',
  'gemma-3-27b-it': 'gemma',
  'gemma-3-4b-it': 'gemma',
  'gemma-4-12b': 'apache-2.0',
  'gemma-4-26b-a4b': 'apache-2.0',
  'gemma-4-31b': 'apache-2.0',
  'gemma-4-e2b': 'apache-2.0',
  'gemma-4-e4b': 'apache-2.0',
  'glm-4-9b-chat': 'glm-4',
  'glm-4.5-air': 'mit',
  'glm-4.7-flash': 'mit',
  'gpt-oss-120b': 'apache-2.0',
  'gpt-oss-20b': 'apache-2.0',
  'granite-3.1-8b': 'apache-2.0',
  'granite-4.2-30b': 'apache-2.0',
  'granite-4.2-3b': 'apache-2.0',
  'granite-4.2-8b': 'apache-2.0',
  'hy-memory-30b-a3b': 'apache-2.0',
  'jamba-1.5-mini': 'jamba-open-model-license',
  'k2-horizon-0-9b': 'apache-2.0',
  'k2-horizon-3-7b': 'apache-2.0',
  'k2-horizon-32b': 'apache-2.0',
  'k2-horizon-375b-a23b': 'apache-2.0',
  'k2-horizon-7b': 'apache-2.0',
  'k2-horizon-mova-36b-a4b': 'apache-2.0',
  'kimi-linear-48b-a3b': 'mit',
  'kolibri-1-78b-a3-5b': 'apache-2.0',
  'laguna-s-2-1-118b-a8b': 'openmdw-1.1',
  'lfm2-5-24b-a2b': 'lfm-open-1.0',
  'lfm3-1-7b': 'lfm-open-1.0',
  'lfm3-vl-2b': 'lfm-open-1.0',
  'ling-3.1-flash': 'mit',
  'llama-3.1-405b': 'llama3.1',
  'llama-3.1-70b': 'llama3.1',
  'llama-3.1-8b': 'llama3.1',
  'llama-3.2-11b-vision': 'llama3.2',
  'llama-3.2-1b': 'llama3.2',
  'llama-3.2-3b': 'llama3.2',
  'llama-3.2-90b-vision': 'llama3.2',
  'llama-3.3-70b': 'llama3.3',
  'llama-4-maverick-17b': 'llama4',
  'llama-4-scout-17b': 'llama4',
  'magistral-small-2509': 'apache-2.0',
  'mellum2-1-12b-a2-5b': 'apache-2.0',
  'metis-1-6-logos': 'apache-2.0',
  'metis-1-6-praxis': 'apache-2.0',
  'mimo-v2-6-distill-qwen-9b': 'mit',
  'mimo-v2-6-flash': 'mit',
  'mimo-v2-6-pro': 'mit',
  'minicpm-v-4-7-35b-a3b': 'apache-2.0',
  'ministral-3-8b': 'apache-2.0',
  'mistral-7b-v0.3': 'apache-2.0',
  // The API's card parse says `other` with no name; the card's own front matter says
  // apache-2.0, which is what is recorded here.
  'mistral-large-3': 'apache-2.0',
  'mistral-large-4': 'mistral-open-weight',
  'mistral-nemo-12b': 'apache-2.0',
  'mistral-small-24b': 'mrl',
  'mixtral-8x7b': 'apache-2.0',
  'muse-glimmer-30b': 'apache-2.0',
  'muse-spark-open-816b-a42b': 'nvidia-open-model',
  'nanbeige4.3-33b': 'apache-2.0',
  'nemotron-3.5-bolt-74b-a9b': 'openmdw-1.1',
  'nemotron-3.5-bolt-e4b': 'openmdw-1.1',
  'nemotron-3.5-lightning-30b-a3b': 'openmdw-1.1',
  'nemotron-3.5-super-vl-120b-a12b': 'openmdw-1.1',
  'north-mini-code-1.0': 'apache-2.0',
  'nous-hermes-3-llama-3.1-8b': 'llama3',
  'olmo-2-7b': 'apache-2.0',
  'olmo-3-7b': 'apache-2.0',
  'openchat-3.6-8b': 'llama3',
  'phi-3-medium-14b': 'mit',
  'phi-3.5-mini': 'mit',
  'phi-4': 'mit',
  'phi-4-mini': 'mit',
  'qwen2-vl-7b': 'apache-2.0',
  'qwen2.5-0.5b': 'apache-2.0',
  'qwen2.5-1.5b': 'apache-2.0',
  'qwen2.5-14b': 'apache-2.0',
  'qwen2.5-32b': 'apache-2.0',
  'qwen2.5-3b': 'qwen-research',
  'qwen2.5-72b': 'qwen-license',
  'qwen2.5-7b': 'apache-2.0',
  'qwen2.5-coder-32b': 'apache-2.0',
  'qwen2.5-coder-7b': 'apache-2.0',
  'qwen3-1.7b': 'apache-2.0',
  'qwen3-14b': 'apache-2.0',
  'qwen3-235b-a22b': 'apache-2.0',
  'qwen3-30b-a3b': 'apache-2.0',
  'qwen3-32b': 'apache-2.0',
  'qwen3-4b': 'apache-2.0',
  'qwen3-5-0.8b': 'apache-2.0',
  'qwen3-5-2b': 'apache-2.0',
  'qwen3-5-4b': 'apache-2.0',
  'qwen3-5-9b': 'apache-2.0',
  'qwen3-6-27b': 'apache-2.0',
  'qwen3-6-35b-a3b': 'apache-2.0',
  'qwen3-8-27b': 'apache-2.0',
  'qwen3-8-flash-next': 'qwen-community-1.0',
  'qwen3-8b': 'apache-2.0',
  'qwen3-coder-30b-a3b': 'apache-2.0',
  'qwen3-vl-30b-a3b': 'apache-2.0',
  'qwen3-vl-8b': 'apache-2.0',
  'ripple-65b-preview': 'apache-2.0',
  'seed-oss-36b': 'apache-2.0',
  'smollm3-3b': 'apache-2.0',
  'solar-10.7b': 'cc-by-nc-4.0',
  'spark-x2.6-4b': 'apache-2.0',
  'stablelm-2-12b': 'stability-nc',
  'starcoder2-15b': 'bigcode-openrail-m',
  // Microsoft's own repo now returns 401; the release was announced under Apache 2.0 and
  // every mirror of the weights carries that tag.
  'wizardlm-2-7b': 'apache-2.0',
  'xing4-0-29b-a4b': 'apache-2.0',
  'yi-1.5-34b': 'apache-2.0',
  'zephyr-7b-beta': 'mit',
};

/**
 * Models whose input is not text alone — the `multimodal` half of the input
 * filter. Set where the model's own card declares it (its `pipeline_tag` is
 * `image-text-to-text` / `any-to-any`, or its prose says images/video), which is
 * why three Qwen models are here while `categories` still calls them `general`:
 * Qwen3.5-0.8B, Qwen3.8-27B and Qwen3.8-Flash-Next all take images per their own
 * cards (2026-11-14) and were never tagged `multimodal`. `categories` is the task
 * taxonomy and is left alone; this is the capability flag. Video and audio input
 * are not separated yet — several entries above accept them too.
 */
export const IMAGE_INPUT_MODEL_IDS: readonly string[] = [
  'clairic-27b',
  'clairic-flash-9b',
  'shot-reader-8b',
  'ternary-bonsai-2-27b',
  'daisyrose-27b',
  'apex-35b-v1',
  'arete-27b',
  'ministral-3-3b',
  'ministral-3-14b',
  'gemma-3-12b-it',
  'gemma-3-27b-it',
  'gemma-3-4b-it',
  'gemma-4-12b',
  'gemma-4-26b-a4b',
  'gemma-4-31b',
  'gemma-4-e2b',
  'gemma-4-e4b',
  'lfm3-vl-2b',
  'llama-3.2-11b-vision',
  'llama-3.2-90b-vision',
  'llama-4-maverick-17b',
  'llama-4-scout-17b',
  'magistral-small-2509',
  'mimo-v2-6-distill-qwen-9b',
  'mimo-v2-6-flash',
  'mimo-v2-6-pro',
  'minicpm-v-4-7-35b-a3b',
  'mistral-large-3',
  'mistral-large-4',
  'muse-glimmer-30b',
  'muse-spark-open-816b-a42b',
  'nemotron-3.5-bolt-74b-a9b',
  'nemotron-3.5-bolt-e4b',
  'nemotron-3.5-super-vl-120b-a12b',
  'qwen2-vl-7b',
  'qwen3-5-0.8b',
  'qwen3-5-2b',
  'qwen3-5-4b',
  'qwen3-5-9b',
  'qwen3-6-27b',
  'qwen3-6-35b-a3b',
  'qwen3-8-27b',
  'qwen3-8-flash-next',
  'qwen3-vl-30b-a3b',
  'qwen3-vl-8b',
];
