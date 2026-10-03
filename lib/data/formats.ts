/**
 * `color` is the format's brand colour — bars, fills, badge backgrounds.
 * `textColor` is the variant that clears 4.5:1 on this site's background, for
 * anywhere the colour is applied to *text*. GGUF's `#7c3aed` measured 3.30:1
 * as a label; the other four already passed and their `textColor` is simply
 * the same value. Keeping both means the charts do not have to be washed out
 * to make the labels legible.
 */
export interface QuantFormat {
  id: string;
  name: string;
  color: string;
  /** Accessible-on-dark variant of `color`, for text. */
  textColor: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  /** Editorial ordering only — never printed as a number (it has no reproducible source). */
  heatPercent: number;
  heatTrend: number;
  description: { en: string; zh: string };
  strengths: { en: string[]; zh: string[] };
  weaknesses: { en: string[]; zh: string[] };
  hardwareReq: string;
  bestFor: { en: string; zh: string };
  framework: string;
}

export const quantFormats: QuantFormat[] = [
  {
    id: 'gguf',
    name: 'GGUF',
    color: '#7c3aed',
    textColor: '#a78bfa',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-300',
    borderClass: 'border-violet-500/20',
    heatPercent: 89,
    heatTrend: 3,
    description: {
      en: 'The most versatile format. CPU, GPU, Apple Silicon — runs everywhere. Supports hybrid inference splitting weights across RAM and VRAM.',
      zh: '最通用的量化格式，CPU、GPU、苹果芯片全兼容。支持跨内存和显存混合推理。',
    },
    strengths: { en: ['Any hardware', 'CPU+GPU hybrid', 'Huge ecosystem', 'Beginner-friendly'], zh: ['兼容任意硬件', 'CPU+GPU 混合推理', '生态最完善', '上手极简'] },
    weaknesses: { en: ['Slower than GPU-native', 'Not ideal for high concurrency'], zh: ['慢于 GPU 原生格式', '高并发场景非最优'] },
    hardwareReq: 'Any — CPU / NVIDIA / AMD / Apple',
    bestFor: { en: 'Local / edge deployment', zh: '本地 / 端侧部署' },
    framework: 'llama.cpp · Ollama',
  },
  {
    id: 'awq',
    name: 'AWQ',
    color: '#06b6d4',
    textColor: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-300',
    borderClass: 'border-cyan-500/20',
    heatPercent: 45,
    heatTrend: 7,
    description: {
      en: 'Activation-Aware Weight Quantization: 4-bit weights quantized with the activation statistics in hand, served mainly by vLLM on NVIDIA and on the AMD cards vLLM\'s ROCm build supports. On every model in this index that ships both, the AWQ INT4 file is smaller than GGUF Q4_K_M (median 18% smaller) and its published quality loss is higher (median 1.1 points more). AutoAWQ, the tool most AWQ builds were made with, is deprecated in favour of vLLM\'s llm-compressor; existing AWQ checkpoints still load.',
      zh: '激活感知权重量化：在掌握激活统计的前提下把权重量化到 4-bit，主要由 vLLM 在 NVIDIA 以及 vLLM ROCm 版本支持的 AMD 显卡上运行。在本索引中同时提供两者的每一个模型上，AWQ INT4 文件都比 GGUF Q4_K_M 小（中位数小 18%），公布的质量损失则更高（中位数多 1.1 个百分点）。大多数 AWQ 版本所用的 AutoAWQ 已被弃用，改由 vLLM 的 llm-compressor 接替；已有的 AWQ 权重仍可正常加载。',
    },
    strengths: { en: ['Smaller than GGUF Q4_K_M on every paired model here', 'Served by vLLM with continuous batching', 'Measured 218 tok/s (Llama 3.1 8B, RTX 4090, vLLM)'], zh: ['在本站每个可配对模型上都比 GGUF Q4_K_M 小', '由 vLLM 以连续批处理方式提供服务', '实测 218 tok/s（Llama 3.1 8B，RTX 4090，vLLM）'] },
    weaknesses: { en: ['Higher published loss than Q4_K_M on every paired model here', 'GPU only — no CPU or Apple path', 'AutoAWQ deprecated (llm-compressor replaces it)'], zh: ['在本站每个可配对模型上公布的损失都高于 Q4_K_M', '只能用 GPU —— 没有 CPU 或 Apple 路径', 'AutoAWQ 已弃用（由 llm-compressor 接替）'] },
    hardwareReq: 'NVIDIA GPU (CUDA 11.8+) or AMD via vLLM ROCm',
    bestFor: { en: 'High-throughput API server', zh: '高吞吐 API 服务端' },
    framework: 'vLLM · AutoAWQ · TGI',
  },
  {
    id: 'exl2',
    name: 'EXL2',
    color: '#f97316',
    textColor: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-500/20',
    heatPercent: 32,
    heatTrend: 0,
    description: {
      en: 'ExLlamaV2 format. Mixed-precision per-layer quantization with a high accuracy-per-bit ratio, and on this site\'s own measurements the fastest single-GPU format it has run. ExLlamaV2 itself is now archived — development moved to ExLlamaV3 and its new EXL3 format — and the servers that used to load EXL2 (TabbyAPI, text-generation-webui) now load EXL3 instead, so EXL2 runs locally through ExLlamaV2\'s own scripts but no longer has a maintained API server.',
      zh: 'ExLlamaV2 格式，每层独立混合精度量化，每比特精度很高；按本站自己的实测，它是跑过的格式里单卡速度最快的。不过 ExLlamaV2 本身已经归档 —— 开发转到了 ExLlamaV3 及其新的 EXL3 格式 —— 以前能加载 EXL2 的服务端（TabbyAPI、text-generation-webui）现在加载的是 EXL3，所以 EXL2 仍能通过 ExLlamaV2 自带的脚本在本机运行，但已经没有仍在维护的 API 服务端。',
    },
    strengths: { en: ['Fastest single-GPU format measured here', 'High accuracy per bit', 'Ultra-low 2bpw option'], zh: ['本站实测单卡最快的格式', '每比特精度高', '超低 2bpw 选项'] },
    weaknesses: { en: ['NVIDIA only', 'Runtime archived — no maintained API server', 'Steeper learning curve'], zh: ['仅限 NVIDIA', '运行时已归档 —— 没有仍在维护的 API 服务端', '学习曲线较陡'] },
    hardwareReq: 'NVIDIA GPU (Ampere+ recommended)',
    bestFor: { en: 'Local single-GPU chat on NVIDIA', zh: 'NVIDIA 单卡本地对话' },
    // TabbyAPI dropped EXL2 for EXL3 (pyproject depends on exllamav3 only), so it
    // is no longer a reader of this format — and guide matching splits on '·'.
    framework: 'ExLlamaV2',
  },
  {
    id: 'gptq',
    name: 'GPTQ',
    color: '#22c55e',
    textColor: '#22c55e',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/20',
    heatPercent: 28,
    heatTrend: -2,
    description: {
      en: 'GPT Quantization, one of the first mainstream post-training methods, with wide framework compatibility. AutoGPTQ, its original tooling, is unmaintained, and its README points to GPTQModel. No model in this index ships both a GPTQ and an AWQ build, so this site has no paired figure to say which loses less quality.',
      zh: '最早普及的训练后量化方法之一，框架兼容性广。它原本的工具 AutoGPTQ 已停止维护，README 推荐改用 GPTQModel。本索引里没有任何模型同时提供 GPTQ 和 AWQ 版本，所以本站没有可配对的数据来判断哪个质量损失更小。',
    },
    strengths: { en: ['Wide compatibility', 'Mature ecosystem', 'Works with HF transformers'], zh: ['框架兼容性广', '生态成熟', '支持 HF Transformers'] },
    weaknesses: { en: ['Slow quantization process', 'AutoGPTQ unmaintained (GPTQModel replaces it)'], zh: ['量化过程较慢', 'AutoGPTQ 已停止维护（由 GPTQModel 接替）'] },
    hardwareReq: 'NVIDIA GPU (CUDA) or AMD via vLLM ROCm',
    bestFor: { en: 'Legacy server deployment', zh: '既有服务端部署' },
    framework: 'GPTQModel · vLLM · TGI',
  },
  {
    id: 'hqq',
    name: 'HQQ',
    color: '#eab308',
    textColor: '#eab308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-300',
    borderClass: 'border-yellow-500/20',
    heatPercent: 18,
    heatTrend: 12,
    description: {
      en: 'Half-Quadratic Quantization. It needs no calibration data, which its own README makes the headline feature, and it targets extreme compression down to 2-bit. No model in this index ships an HQQ build, so this site has no quality or size figure of its own for it.',
      zh: '半二次量化。无需校准数据，这也是它 README 里的首要卖点，面向低至 2-bit 的极端压缩。本索引没有任何模型提供 HQQ 版本，所以本站没有关于它的质量或体积数据。',
    },
    strengths: { en: ['No calibration data', 'Fast quantization', 'Aimed at 2–4-bit compression'], zh: ['无需校准数据', '量化速度快', '面向 2–4 bit 压缩'] },
    weaknesses: { en: ['Smaller ecosystem', 'Fewer model releases'], zh: ['生态相对较小', '可用模型较少'] },
    hardwareReq: 'NVIDIA GPU, AMD ROCm',
    bestFor: { en: 'Research · extreme compression', zh: '研究 · 极端压缩' },
    framework: 'HQQ · bitsandbytes',
  },
];

