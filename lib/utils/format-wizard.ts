export type HardwareType = 'nvidia' | 'amd' | 'mac' | 'cpu';
export type Priority = 'quality' | 'speed' | 'ease';
export type UseCase = 'chat' | 'code' | 'api';

export interface WizardInput {
  hardware: HardwareType;
  priority: Priority;
  useCase: UseCase;
  vramGB?: number;
}

export interface WizardResult {
  format: string;
  framework: string;
  quant: string;
  score: number;
  reasons: { en: string; zh: string }[];
}

import { SHIPPED_FORMATS } from '@/lib/utils/model-meta';

/** Only recommend formats the index can actually show a model in. */
const FORMATS = SHIPPED_FORMATS;

function scoreFormat(input: WizardInput, format: string): { score: number; reasons: { en: string; zh: string }[] } {
  let score = 50;
  const reasons: { en: string; zh: string }[] = [];

  if (input.hardware === 'mac') {
    if (format === 'GGUF') { score += 30; reasons.push({ en: 'GGUF is the only format with full Apple Silicon support via llama.cpp Metal', zh: 'GGUF 是唯一通过 llama.cpp Metal 完整支持 Apple Silicon 的格式' }); }
    else { score -= 40; reasons.push({ en: 'AWQ/EXL2/GPTQ have limited or no native Mac support', zh: 'AWQ/EXL2/GPTQ 在 Mac 上支持有限或不可用' }); }
  }

  if (input.hardware === 'cpu') {
    if (format === 'GGUF') { score += 35; reasons.push({ en: 'GGUF + llama.cpp is the gold standard for CPU inference', zh: 'GGUF + llama.cpp 是 CPU 推理的黄金标准' }); }
    else { score -= 30; }
  }

  if (input.hardware === 'amd') {
    if (format === 'GGUF') {
      score += 32;
      reasons.push({ en: 'GGUF via llama.cpp ROCm (or the Vulkan backend) is the only consistently supported path on Radeon', zh: 'GGUF 经 llama.cpp ROCm（或 Vulkan 后端）是 Radeon 上唯一稳定可用的路径' });
    } else if (format === 'EXL2') {
      score -= 60;
      reasons.push({ en: 'ExLlamaV2 is CUDA-only — EXL2 will not run on ROCm at all', zh: 'ExLlamaV2 仅支持 CUDA —— EXL2 在 ROCm 上完全无法运行' });
    } else {
      score -= 35;
      reasons.push({ en: 'AWQ/GPTQ/HQQ kernels are CUDA-first; ROCm support is partial and version-sensitive', zh: 'AWQ/GPTQ/HQQ 的算子以 CUDA 为先，ROCm 支持不完整且对版本敏感' });
    }
  }

  if (input.hardware === 'nvidia') {
    if (format === 'EXL2' && input.priority === 'speed') { score += 25; reasons.push({ en: 'EXL2 via ExLlamaV2 delivers the fastest consumer-GPU inference', zh: 'EXL2 + ExLlamaV2 在消费级 GPU 上推理速度最快' }); }
    if (format === 'AWQ' && input.useCase === 'api') { score += 20; reasons.push({ en: 'AWQ + vLLM is optimised for high-throughput API serving', zh: 'AWQ + vLLM 针对高吞吐 API 服务优化' }); }
    if (format === 'GGUF' && input.priority === 'ease') { score += 25; reasons.push({ en: 'GGUF has the widest tool support (llama.cpp, Ollama) and simplest setup', zh: 'GGUF 工具链最广（llama.cpp、Ollama），部署最简单' }); }
    if (format === 'GPTQ') { score += 5; }
    if (format === 'HQQ') { score -= 10; }
  }

  if (input.priority === 'quality') {
    if (format === 'GGUF') { score += 10; reasons.push({ en: 'GGUF Q6_K / Q8_0 offer near-FP16 quality with broad compatibility', zh: 'GGUF Q6_K / Q8_0 在广泛兼容的同时接近 FP16 质量' }); }
    if (format === 'EXL2') { score += 8; reasons.push({ en: 'EXL2 flexible bpw lets you tune the quality/size tradeoff precisely', zh: 'EXL2 灵活 bpw 可精确调节质量/体积权衡' }); }
  }

  if (input.useCase === 'code' && format === 'GGUF') {
    score += 5;
    reasons.push({ en: 'GGUF models from bartowski/unsloth cover virtually every coding model', zh: 'bartowski/unsloth 的 GGUF 覆盖几乎所有代码模型' });
  }

  if (input.vramGB && input.vramGB <= 8 && format === 'GGUF') {
    score += 10;
    reasons.push({ en: 'GGUF Q4_K_M fits comfortably in ≤8GB VRAM for 7–8B models', zh: 'GGUF Q4_K_M 可在 ≤8GB 显存运行 7–8B 模型' });
  }

  return { score, reasons };
}

/**
 * The runtime has to follow the *format* first. Keying off hardware first meant
 * an AMD reader saw "EXL2 → Ollama / llama.cpp (ROCm)" sitting directly beside
 * this row's own reason, "ExLlamaV2 is CUDA-only — EXL2 will not run on ROCm at
 * all". Hardware only decides which GGUF runtime to name.
 */
function recommendFramework(format: string, input: WizardInput): string {
  if (format === 'EXL2') return 'ExLlamaV2 (CUDA only)';
  if (format === 'AWQ') return input.useCase === 'api' ? 'vLLM' : 'vLLM (CUDA only)';
  if (format === 'GPTQ') return 'vLLM / AutoGPTQ (CUDA only)';
  if (format === 'HQQ') return 'transformers + HQQ (CUDA only)';

  // GGUF — the one format that runs everywhere.
  if (input.hardware === 'mac') return 'Ollama / llama.cpp (Metal)';
  if (input.hardware === 'cpu') return 'llama.cpp';
  if (input.hardware === 'amd') return 'Ollama / llama.cpp (ROCm)';
  return input.priority === 'ease' ? 'Ollama' : 'llama.cpp';
}

/**
 * Quant levels are per-format vocabularies. The old fallback returned the GGUF
 * level `Q4_K_M` for every format, so choosing "easiest setup" — the common
 * path — printed "EXL2 · Q4_K_M" and "AWQ · Q4_K_M", levels that do not exist
 * in either format.
 */
function recommendQuant(format: string, input: WizardInput): string {
  switch (format) {
    case 'GGUF':
      return input.priority === 'quality' ? 'Q6_K' : 'Q4_K_M';
    case 'EXL2':
      return input.priority === 'quality' ? '5.0bpw' : '4.65bpw';
    case 'AWQ':
    case 'GPTQ':
      return 'INT4';
    case 'HQQ':
      return input.priority === 'quality' ? '4bit' : '2bit';
    default:
      return 'INT4';
  }
}

export function runFormatWizard(input: WizardInput): WizardResult[] {
  const results = FORMATS.map(format => {
    const { score, reasons } = scoreFormat(input, format);
    return {
      format,
      framework: recommendFramework(format, input),
      quant: recommendQuant(format, input),
      score,
      reasons,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}