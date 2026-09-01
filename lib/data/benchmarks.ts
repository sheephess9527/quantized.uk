export interface SpeedResult {
  model: string;
  hardware: string;
  framework: string;
  quant: string;
  tokensPerSec: number;
  color: string;
}

export interface PPLResult {
  quant: string;
  ppl: number;
  pplLossPercent: number;
}

export interface MatrixRow {
  model: string;
  hardware: string;
  framework: string;
  quant: string;
  speedTokSec: number;
  vramUsedGB: number;
  /**
   * Bilingual, like every other reader-facing field in lib/data. This column
   * used to be an English-only string, so the Chinese benchmarks page rendered
   * an entire column in English — UI strings were translated but data fields
   * were never in the i18n path at all.
   */
  notes: { en: string; zh: string };
}

export const speedBenchmarks: SpeedResult[] = [
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 235, color: '#f97316' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'vLLM', quant: 'AWQ INT4', tokensPerSec: 218, color: '#06b6d4' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 148, color: '#7c3aed' },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 155, color: '#7c3aed' },
  { model: 'Qwen3 8B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 142, color: '#7c3aed' },
  { model: 'Qwen3 4B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 168, color: '#7c3aed' },
  { model: 'Qwen3-Coder 30B-A3B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 92, color: '#7c3aed' },
  { model: 'DeepSeek-R1 14B', hardware: 'RTX 4090', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 128, color: '#f97316' },
  { model: 'Qwen2.5 32B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 44, color: '#7c3aed' },
  { model: 'Qwen3 32B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 42, color: '#7c3aed' },
  { model: 'Qwen3 30B-A3B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 95, color: '#7c3aed' },
  { model: 'R1-Distill-Llama-8B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 145, color: '#7c3aed' },
  { model: 'Phi-4 14B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 88, color: '#7c3aed' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 3090', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 175, color: '#f97316' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 3090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 112, color: '#7c3aed' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 78, color: '#7c3aed' },
  { model: 'Llama 3.1 8B', hardware: 'M3 Max 48G', framework: 'Ollama', quant: 'GGUF Q4_K_M', tokensPerSec: 68, color: '#22c55e' },
  { model: 'Llama 3.1 8B', hardware: 'M2 Ultra 192G', framework: 'Ollama', quant: 'GGUF Q4_K_M', tokensPerSec: 90, color: '#22c55e' },
];

export const pplBenchmarks: PPLResult[] = [
  { quant: 'FP16', ppl: 6.14, pplLossPercent: 0 },
  { quant: 'Q8_0', ppl: 6.17, pplLossPercent: 0.49 },
  { quant: 'Q6_K', ppl: 6.22, pplLossPercent: 1.30 },
  { quant: 'Q5_K_M', ppl: 6.28, pplLossPercent: 2.28 },
  { quant: 'Q4_K_M', ppl: 6.45, pplLossPercent: 5.05 },
  { quant: 'Q4_0', ppl: 6.67, pplLossPercent: 8.63 },
  { quant: 'Q3_K_M', ppl: 7.23, pplLossPercent: 17.7 },
  { quant: 'Q2_K', ppl: 9.12, pplLossPercent: 48.5 },
];

export const matrixData: MatrixRow[] = [
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 235, vramUsedGB: 5.4, notes: { en: 'Peak consumer performance', zh: '消费级最快' } },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'vLLM', quant: 'AWQ INT4', speedTokSec: 218, vramUsedGB: 4.9, notes: { en: 'Best for batch API', zh: '批量 API 服务最佳' } },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 148, vramUsedGB: 5.7, notes: { en: 'Easiest setup', zh: '部署最简单' } },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 155, vramUsedGB: 5.4, notes: { en: 'Strong coding; similar VRAM to 8B', zh: '代码能力强；显存占用接近 8B' } },
  { model: 'DeepSeek-R1 14B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 128, vramUsedGB: 9.8, notes: { en: 'Reasoning distill; hot in 2026', zh: '推理蒸馏版；2026 年热门' } },
  { model: 'Qwen2.5 32B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 44, vramUsedGB: 22.0, notes: { en: 'Tight fit at 4K ctx; use Q3 for headroom', zh: '4K 上下文下勉强装下；想留余量用 Q3' } },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4060 Ti 16G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 98, vramUsedGB: 5.4, notes: { en: 'Great budget option', zh: '高性价比之选' } },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 78, vramUsedGB: 5.7, notes: { en: 'Budget-friendly', zh: '预算友好' } },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 82, vramUsedGB: 5.4, notes: { en: 'Sweet spot on 16GB cards', zh: '16GB 显卡的甜点位' } },
  { model: 'Qwen3 8B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 142, vramUsedGB: 5.8, notes: { en: 'Qwen3 thinking mode; ~2026 flagship 8B', zh: 'Qwen3 思考模式；2026 年 8B 旗舰' } },
  { model: 'Qwen3 14B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 118, vramUsedGB: 10.0, notes: { en: 'Strong reasoning; 16GB+ sweet spot', zh: '推理能力强；16GB 以上的甜点位' } },
  { model: 'Qwen3 32B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 42, vramUsedGB: 22.5, notes: { en: 'Dense 32B successor to Qwen2.5-32B', zh: 'Qwen2.5-32B 的稠密 32B 后继' } },
  { model: 'Qwen3 30B-A3B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 95, vramUsedGB: 19.0, notes: { en: 'MoE 3B active — fast on 16GB cards', zh: 'MoE 激活 3B —— 16GB 显卡上很快' } },
  { model: 'R1-Distill-Llama-8B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 145, vramUsedGB: 5.6, notes: { en: 'R1 reasoning on 8B footprint', zh: '8B 体量上的 R1 推理能力' } },
  { model: 'Phi-4 14B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 88, vramUsedGB: 9.1, notes: { en: 'Strong dense 14B; 12GB with short ctx', zh: '稠密 14B 表现强；短上下文下 12GB 可跑' } },
  { model: 'Qwen3-Coder 30B-A3B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 92, vramUsedGB: 19.2, notes: { en: 'Agentic coding MoE; 256K native ctx', zh: '面向 agent 编码的 MoE；原生 256K 上下文' } },
  { model: 'Llama 3.1 8B', hardware: 'RTX 3090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 175, vramUsedGB: 5.4, notes: { en: 'Older but capable', zh: '较旧但依然可用' } },
  { model: 'Llama 3.1 8B', hardware: 'M3 Max 48G', framework: 'Ollama', quant: 'GGUF Q4_K_M', speedTokSec: 68, vramUsedGB: 5.7, notes: { en: 'Unified memory advantage', zh: '统一内存优势' } },
  { model: 'Llama 3.1 8B', hardware: 'M2 Ultra 192G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 90, vramUsedGB: 5.7, notes: { en: 'Can run 70B models solo', zh: '单卡即可跑 70B' } },
];