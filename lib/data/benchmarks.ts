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
  notes: string;
}

export const speedBenchmarks: SpeedResult[] = [
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 235, color: '#f97316' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'vLLM', quant: 'AWQ INT4', tokensPerSec: 218, color: '#06b6d4' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 148, color: '#7c3aed' },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 155, color: '#7c3aed' },
  { model: 'Qwen3 8B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 142, color: '#7c3aed' },
  { model: 'DeepSeek-R1 14B', hardware: 'RTX 4090', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 128, color: '#f97316' },
  { model: 'Qwen2.5 32B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 44, color: '#7c3aed' },
  { model: 'Qwen3 32B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 42, color: '#7c3aed' },
  { model: 'Qwen3 30B-A3B', hardware: 'RTX 4090', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', tokensPerSec: 95, color: '#7c3aed' },
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
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 235, vramUsedGB: 5.4, notes: 'Peak consumer performance' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'vLLM', quant: 'AWQ INT4', speedTokSec: 218, vramUsedGB: 4.9, notes: 'Best for batch API' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 148, vramUsedGB: 5.7, notes: 'Easiest setup' },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 155, vramUsedGB: 5.4, notes: 'Strong coding; similar VRAM to 8B' },
  { model: 'DeepSeek-R1 14B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 128, vramUsedGB: 9.8, notes: 'Reasoning distill; hot in 2026' },
  { model: 'Qwen2.5 32B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 44, vramUsedGB: 22.0, notes: 'Tight fit at 4K ctx; use Q3 for headroom' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4060 Ti 16G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 98, vramUsedGB: 5.4, notes: 'Great budget option' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 78, vramUsedGB: 5.7, notes: 'Budget-friendly' },
  { model: 'Qwen2.5 7B', hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 82, vramUsedGB: 5.4, notes: 'Sweet spot on 16GB cards' },
  { model: 'Qwen3 8B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 142, vramUsedGB: 5.8, notes: 'Qwen3 thinking mode; ~2026 flagship 8B' },
  { model: 'Qwen3 14B', hardware: 'RTX 4090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 118, vramUsedGB: 10.0, notes: 'Strong reasoning; 16GB+ sweet spot' },
  { model: 'Qwen3 32B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 42, vramUsedGB: 22.5, notes: 'Dense 32B successor to Qwen2.5-32B' },
  { model: 'Qwen3 30B-A3B', hardware: 'RTX 4090 24G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 95, vramUsedGB: 19.0, notes: 'MoE 3B active — fast on 16GB cards' },
  { model: 'Llama 3.1 8B', hardware: 'RTX 3090 24G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 175, vramUsedGB: 5.4, notes: 'Older but capable' },
  { model: 'Llama 3.1 8B', hardware: 'M3 Max 48G', framework: 'Ollama', quant: 'GGUF Q4_K_M', speedTokSec: 68, vramUsedGB: 5.7, notes: 'Unified memory advantage' },
  { model: 'Llama 3.1 8B', hardware: 'M2 Ultra 192G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M', speedTokSec: 90, vramUsedGB: 5.7, notes: 'Can run 70B models solo' },
];