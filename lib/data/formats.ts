export interface QuantFormat {
  id: string;
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
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
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-300',
    borderClass: 'border-cyan-500/20',
    heatPercent: 45,
    heatTrend: 7,
    description: {
      en: 'Activation-Aware Weight Quantization. High-accuracy INT4 for NVIDIA. Pairs perfectly with vLLM for server deployment.',
      zh: '激活感知权重量化，高精度 INT4，专为 NVIDIA GPU 优化，与 vLLM 搭配是服务端最优解。',
    },
    strengths: { en: ['Best accuracy at 4-bit', 'Blazing fast with vLLM', 'Excellent batch throughput'], zh: ['4-bit 精度最高', 'vLLM 下速度极快', '批量推理吞吐出色'] },
    weaknesses: { en: ['NVIDIA only', 'More setup than GGUF'], zh: ['仅限 NVIDIA', '配置比 GGUF 复杂'] },
    hardwareReq: 'NVIDIA GPU (CUDA 11.8+)',
    bestFor: { en: 'High-throughput API server', zh: '高吞吐 API 服务端' },
    framework: 'vLLM · AutoAWQ · TGI',
  },
  {
    id: 'exl2',
    name: 'EXL2',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-300',
    borderClass: 'border-orange-500/20',
    heatPercent: 32,
    heatTrend: 0,
    description: {
      en: 'ExLlamaV2 format. Mixed-precision per-layer quantization — best accuracy-per-bit ratio. Fastest single-GPU inference available.',
      zh: 'ExLlamaV2 格式，每层独立混合精度量化，每比特精度最优，单 GPU 推理速度最快。',
    },
    strengths: { en: ['Fastest GPU inference', 'Best accuracy per bit', 'Ultra-low 2bpw option'], zh: ['GPU 推理速度最快', '每比特精度最优', '超低 2bpw 选项'] },
    weaknesses: { en: ['NVIDIA only', 'Steeper learning curve'], zh: ['仅限 NVIDIA', '学习曲线较陡'] },
    hardwareReq: 'NVIDIA GPU (Ampere+ recommended)',
    bestFor: { en: 'Max single-GPU performance', zh: '单卡极致性能' },
    framework: 'ExLlamaV2 · TabbyAPI',
  },
  {
    id: 'gptq',
    name: 'GPTQ',
    color: '#22c55e',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/20',
    heatPercent: 28,
    heatTrend: -2,
    description: {
      en: 'GPT Quantization — one of the first mainstream post-training methods. Wide framework compatibility; being gradually superseded by AWQ.',
      zh: '最早普及的训练后量化格式之一，框架兼容性广，新模型正逐渐被 AWQ 取代。',
    },
    strengths: { en: ['Wide compatibility', 'Mature ecosystem', 'Works with HF transformers'], zh: ['框架兼容性广', '生态成熟', '支持 HF Transformers'] },
    weaknesses: { en: ['Slow quantization process', 'Lower accuracy than AWQ'], zh: ['量化过程较慢', '精度低于 AWQ'] },
    hardwareReq: 'NVIDIA GPU (CUDA)',
    bestFor: { en: 'Legacy server deployment', zh: '既有服务端部署' },
    framework: 'auto-gptq · vLLM · TGI',
  },
  {
    id: 'hqq',
    name: 'HQQ',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-300',
    borderClass: 'border-yellow-500/20',
    heatPercent: 18,
    heatTrend: 12,
    description: {
      en: 'Half-Quadratic Quantization. No calibration data needed. Impressive quality at 2-bit. Rising star for extreme compression.',
      zh: '半二次量化，无需校准数据，2-bit 下质量令人印象深刻，极端压缩场景的新星。',
    },
    strengths: { en: ['No calibration data', 'Excellent 2-bit quality', 'Fast quantization'], zh: ['无需校准数据', '2-bit 质量出众', '量化速度快'] },
    weaknesses: { en: ['Smaller ecosystem', 'Fewer model releases'], zh: ['生态相对较小', '可用模型较少'] },
    hardwareReq: 'NVIDIA GPU, AMD ROCm',
    bestFor: { en: 'Research · extreme compression', zh: '研究 · 极端压缩' },
    framework: 'HQQ · bitsandbytes',
  },
];

export const formatRadarData = [
  { subject: 'CPU Compat',      GGUF: 95, AWQ: 20, EXL2: 5,  GPTQ: 15, HQQ: 40 },
  { subject: 'VRAM Efficiency', GGUF: 65, AWQ: 80, EXL2: 95, GPTQ: 75, HQQ: 85 },
  { subject: 'Speed',           GGUF: 60, AWQ: 85, EXL2: 95, GPTQ: 75, HQQ: 70 },
  { subject: 'Accuracy/bit',    GGUF: 75, AWQ: 80, EXL2: 88, GPTQ: 72, HQQ: 82 },
  { subject: 'Ease of Use',     GGUF: 95, AWQ: 65, EXL2: 48, GPTQ: 55, HQQ: 58 },
  { subject: 'Server Scale',    GGUF: 38, AWQ: 88, EXL2: 70, GPTQ: 82, HQQ: 60 },
];
