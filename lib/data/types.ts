export type QuantConfidence = 'measured' | 'estimated' | 'community';
export type ModelStatus = 'active' | 'superseded';

export interface QuantVariant {
  format: 'GGUF' | 'AWQ' | 'EXL2' | 'GPTQ' | 'HQQ';
  level: string;
  bpw: number;
  vramGB: number;
  pplLossPercent: number;
  speedRTX4090?: number;
  hfSearchUrl: string;
  /** Default when omitted: estimated */
  confidence?: QuantConfidence;
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
  /** Default when omitted: active */
  status?: ModelStatus;
  /** Prefer this model id when status is superseded */
  supersededBy?: string;
  /** ISO date YYYY-MM-DD — used for "recently added" filter */
  addedAt?: string;
}
