export interface SpeedResult {
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
  hardware: string;
  framework: string;
  quant: string;
  speedTokSec: number;
  vramUsedGB: number;
  notes: string;
}

export const speedBenchmarks: SpeedResult[] = [
  { hardware: 'RTX 4090',        framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 235, color: '#f97316' },
  { hardware: 'RTX 4090',        framework: 'vLLM',      quant: 'AWQ INT4',     tokensPerSec: 218, color: '#06b6d4' },
  { hardware: 'RTX 4090',        framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  tokensPerSec: 148, color: '#7c3aed' },
  { hardware: 'RTX 3090',        framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', tokensPerSec: 175, color: '#f97316' },
  { hardware: 'RTX 3090',        framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  tokensPerSec: 112, color: '#7c3aed' },
  { hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  tokensPerSec: 78,  color: '#7c3aed' },
  { hardware: 'M3 Max 48G',      framework: 'Ollama',    quant: 'GGUF Q4_K_M',  tokensPerSec: 68,  color: '#22c55e' },
  { hardware: 'M2 Ultra 192G',   framework: 'Ollama',    quant: 'GGUF Q4_K_M',  tokensPerSec: 90,  color: '#22c55e' },
];

export const pplBenchmarks: PPLResult[] = [
  { quant: 'FP16',    ppl: 6.14, pplLossPercent: 0    },
  { quant: 'Q8_0',    ppl: 6.17, pplLossPercent: 0.49 },
  { quant: 'Q6_K',    ppl: 6.22, pplLossPercent: 1.30 },
  { quant: 'Q5_K_M',  ppl: 6.28, pplLossPercent: 2.28 },
  { quant: 'Q4_K_M',  ppl: 6.45, pplLossPercent: 5.05 },
  { quant: 'Q4_0',    ppl: 6.67, pplLossPercent: 8.63 },
  { quant: 'Q3_K_M',  ppl: 7.23, pplLossPercent: 17.7 },
  { quant: 'Q2_K',    ppl: 9.12, pplLossPercent: 48.5 },
];

export const matrixData: MatrixRow[] = [
  { hardware: 'RTX 4090 24G',    framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 235, vramUsedGB: 5.4,  notes: 'Peak consumer performance' },
  { hardware: 'RTX 4090 24G',    framework: 'vLLM',      quant: 'AWQ INT4',     speedTokSec: 218, vramUsedGB: 4.9,  notes: 'Best for batch API' },
  { hardware: 'RTX 4090 24G',    framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  speedTokSec: 148, vramUsedGB: 5.7,  notes: 'Easiest setup' },
  { hardware: 'RTX 4060 Ti 16G', framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 98,  vramUsedGB: 5.4,  notes: 'Great budget option' },
  { hardware: 'RTX 4060 Ti 16G', framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  speedTokSec: 78,  vramUsedGB: 5.7,  notes: 'Budget-friendly' },
  { hardware: 'RTX 3090 24G',    framework: 'ExLlamaV2', quant: 'EXL2 4.65bpw', speedTokSec: 175, vramUsedGB: 5.4,  notes: 'Older but capable' },
  { hardware: 'M3 Max 48G',      framework: 'Ollama',    quant: 'GGUF Q4_K_M',  speedTokSec: 68,  vramUsedGB: 5.7,  notes: 'Unified memory advantage' },
  { hardware: 'M2 Ultra 192G',   framework: 'llama.cpp', quant: 'GGUF Q4_K_M',  speedTokSec: 90,  vramUsedGB: 5.7,  notes: 'Can run 70B models solo' },
];
