export interface CalcInput {
  paramsB: number;
  layers: number;
  kvHeads: number;
  headDim: number;
  bpw: number;
  contextLength: number;
  batchSize: number;
}

export interface CalcResult {
  modelWeightsGB: number;
  kvCacheGB: number;
  activationsGB: number;
  totalGB: number;
}

export const quantBPW: Record<string, number> = {
  'FP32':     32,
  'FP16':     16,
  'BF16':     16,
  'INT8':     8,
  'Q8_0':     8.5,
  'Q6_K':     6.56,
  'Q5_K_M':   5.68,
  'Q5_K_S':   5.54,
  'Q4_K_M':   4.85,
  'Q4_K_S':   4.58,
  'Q4_0':     4.55,
  'Q3_K_M':   3.87,
  'Q3_K_S':   3.50,
  'Q2_K':     2.63,
  'IQ1_M':    1.75,
  'AWQ INT4': 4.0,
  'GPTQ INT4':4.0,
  'GPTQ INT8':8.0,
  'EXL2 2bpw':2.0,
  'EXL2 3bpw':3.0,
  'EXL2 4bpw':4.0,
  'EXL2 4.65bpw':4.65,
  'EXL2 5bpw':5.0,
  'EXL2 6bpw':6.0,
  'EXL2 8bpw':8.0,
  'HQQ 2bit': 2.0,
  'HQQ 4bit': 4.0,
};

export const quantGroups: Record<string, string[]> = {
  'GGUF': ['Q2_K', 'Q3_K_M', 'Q4_0', 'Q4_K_S', 'Q4_K_M', 'Q5_K_S', 'Q5_K_M', 'Q6_K', 'Q8_0'],
  'AWQ':  ['AWQ INT4'],
  'GPTQ': ['GPTQ INT4', 'GPTQ INT8'],
  'EXL2': ['EXL2 2bpw', 'EXL2 3bpw', 'EXL2 4bpw', 'EXL2 4.65bpw', 'EXL2 5bpw', 'EXL2 6bpw', 'EXL2 8bpw'],
  'HQQ':  ['HQQ 2bit', 'HQQ 4bit'],
  'Full': ['FP16', 'BF16', 'FP32'],
};

export function calcVRAM(input: CalcInput): CalcResult {
  const { paramsB, layers, kvHeads, headDim, bpw, contextLength, batchSize } = input;

  // Model weights: params × bits ÷ 8 → bytes → GB, with 2% embedding overhead
  const modelWeightsGB = (paramsB * 1e9 * (bpw / 8)) / (1024 ** 3) * 1.02;

  // KV cache: 2 (K+V) × layers × kvHeads × headDim × contextLen × batchSize × 2 bytes (fp16)
  const kvBytes = 2 * layers * kvHeads * headDim * contextLength * batchSize * 2;
  const kvCacheGB = kvBytes / (1024 ** 3);

  // Activation buffer: ~10% of (weights + kvcache)
  const activationsGB = (modelWeightsGB + kvCacheGB) * 0.10;

  const totalGB = modelWeightsGB + kvCacheGB + activationsGB;

  return {
    modelWeightsGB: round(modelWeightsGB),
    kvCacheGB: round(kvCacheGB),
    activationsGB: round(activationsGB),
    totalGB: round(totalGB),
  };
}

function round(n: number, decimals = 2) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

export function getVerdict(totalGB: number, gpuVram: number): 'green' | 'yellow' | 'red' {
  const ratio = totalGB / gpuVram;
  if (ratio <= 0.88) return 'green';
  if (ratio <= 1.05) return 'yellow';
  return 'red';
}
