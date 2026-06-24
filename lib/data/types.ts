export interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;
  bpw: number;
  vramGB: number;
  pplLossPercent: number;
  speedRTX4090?: number;
  hfSearchUrl: string;
}

export interface ModelArch {
  layers: number;
  attHeads: number;
  kvHeads: number;
  headDim: number;
}

export interface QuantModel {
  id: string;
  name: string;
  family: string;
  params: number;
  paramLabel: string;
  categories: string[];
  hardwareTags: string[];
  contextLength: number;
  arch: ModelArch;
  quants: QuantVariant[];
  description: { en: string; zh: string };
}