import type { QuantModel } from './types';

/** Publisher configs and licences, GGUF tensor headers and matching projector listings
 * were read on 2026-11-19. See docs/changes/2026-11-19-patrol.md for sources. */
export const extraModels16: QuantModel[] = [
  {
    "id": "daisyrose-27b",
    "name": "DaisyRose 27B",
    "family": "RadixArk DaisyRose",
    "params": 27.320697856,
    "paramLabel": "27B",
    "categories": [
      "general",
      "instruct",
      "multimodal"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "pro-gpu",
      "mac"
    ],
    "contextLength": 262144,
    "arch": {
      "layers": 64,
      "attHeads": 24,
      "kvHeads": 4,
      "headDim": 256,
      "attention": {
        "fullLayers": 16
      }
    },
    "addedAt": "2026-11-19",
    "description": {
      "en": "RadixArk’s multimodal reasoning checkpoint is reinforcement-trained from Qwen3.8 27B and keeps the same architecture, tokenizer and context. Of 64 decoder layers, 16 grow the main KV cache. The GGUF contains an additional MTP block. Estimates use the recorded full file size and cover ordinary decoding without a separate speculative cache. Image use adds the matching F16 projector. No per-quant speed or perplexity loss is recorded.",
      "zh": "RadixArk 基于 Qwen3.8 27B 用强化学习训练的多模态推理权重，保留了原有架构、分词器和上下文。64 层主解码器中有 16 层的 KV 缓存会增长。GGUF 另含一个 MTP 块。按整份文件估算普通解码，不额外估算投机解码缓存。读图需另加配套 F16 投影文件。未记录各档位速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 3.902053622271866,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/RadixArk_DaisyRose-27B-GGUF",
          "file": "RadixArk_DaisyRose-27B-Q3_K_M.gguf",
          "bytes": 13325853504,
          "mmprojBytes": 927607424,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.073185850615484,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/RadixArk_DaisyRose-27B-GGUF",
          "file": "RadixArk_DaisyRose-27B-Q4_K_M.gguf",
          "bytes": 17325372224,
          "mmprojBytes": 927607424,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.087000914417638,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/RadixArk_DaisyRose-27B-GGUF",
          "file": "RadixArk_DaisyRose-27B-Q5_K_M.gguf",
          "bytes": 20787639104,
          "mmprojBytes": 927607424,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.505516190574426,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/RadixArk_DaisyRose-27B-GGUF",
          "file": "RadixArk_DaisyRose-27B-Q8_0.gguf",
          "bytes": 29047079744,
          "mmprojBytes": 927607424,
          "checkedAt": "2026-11-19"
        }
      }
    ]
  },
  {
    "id": "apex-35b-v1",
    "name": "Apex 35B V1.0",
    "family": "Apex Intelligence Apex",
    "params": 35.505251456,
    "paramLabel": "35B-A3B",
    "categories": [
      "general",
      "instruct",
      "multimodal"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "pro-gpu",
      "mac"
    ],
    "contextLength": 262144,
    "arch": {
      "layers": 40,
      "attHeads": 16,
      "kvHeads": 2,
      "headDim": 256,
      "attention": {
        "fullLayers": 10
      },
      "moe": {
        "expertParams": 32.21225472,
        "experts": 256,
        "perToken": 8,
        "moeLayers": 40
      }
    },
    "addedAt": "2026-11-19",
    "description": {
      "en": "Apex Intelligence post-trained this checkpoint from Qwen3.6 35B-A3B. Its 40 decoder layers use 256 routed experts with eight selected per token, and only 10 layers grow the main KV cache. The selected GGUFs and F16 image projector come from the same bartowski repository. File sizing includes the extra MTP block, while the cache estimate covers ordinary decoding. No per-quant speed or perplexity loss is recorded.",
      "zh": "Apex Intelligence 基于 Qwen3.6 35B-A3B 后训练的权重。40 层主解码器使用 256 个路由专家，每个 token 选择 8 个，仅 10 层主 KV 缓存随上下文增长。选用的 GGUF 和 F16 视觉投影文件来自同一个 bartowski 仓库。权重大小计入额外的 MTP 块，缓存按普通解码估算。未记录各档位速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.015471050886113,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
          "file": "Apexintelligence-AI_Apex-35B-V1.0-Q3_K_M.gguf",
          "bytes": 17821288672,
          "mmprojBytes": 899283616,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.136247768924969,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
          "file": "Apexintelligence-AI_Apex-35B-V1.0-Q4_K_M.gguf",
          "bytes": 22795471072,
          "mmprojBytes": 899283616,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.187621976097124,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
          "file": "Apexintelligence-AI_Apex-35B-V1.0-Q5_K_M.gguf",
          "bytes": 27461634272,
          "mmprojBytes": 899283616,
          "checkedAt": "2026-11-19"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.520137000885237,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF",
          "file": "Apexintelligence-AI_Apex-35B-V1.0-Q8_0.gguf",
          "bytes": 37813700832,
          "mmprojBytes": 899283616,
          "checkedAt": "2026-11-19"
        }
      }
    ]
  }
,
  {
    "id": "ternary-bonsai-2-27b",
    "name": "Ternary Bonsai 2 27B",
    "family": "Prism ML Ternary Bonsai",
    "params": 26.895998464,
    "paramLabel": "27B",
    "categories": [
      "general",
      "instruct",
      "multimodal"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 262144,
    "arch": {
      "layers": 64,
      "attHeads": 24,
      "kvHeads": 4,
      "headDim": 256,
      "attention": {
        "fullLayers": 16
      }
    },
    "addedAt": "2026-11-19",
    "description": {
      "en": "Prism ML’s ternary Qwen3.8 27B derivative, indexed here in the official Q2_0 packing. Its Hadamard-rotated weights require llama.cpp b11556 or later according to the publisher. The 64-layer decoder retains 16 growing-cache layers. Image use adds the matching Q8_0 projector. The specialized PQ2_0 and PTQ1_0 packages use different runtime kernels. No speed or perplexity loss is recorded for this file.",
      "zh": "Prism ML 基于 Qwen3.8 27B 发布的三值权重，本条收录官方 Q2_0 封装。发布方说明，Hadamard 旋转权重要求 llama.cpp b11556 或更新版本。64 层解码器中有 16 层的缓存随上下文增长。读图另加配套 Q8_0 投影。专用 PQ2_0 和 PTQ1_0 包采用不同的运行时内核。未记录此文件的速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_0",
        "bpw": 2.2682954680287715,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "prism-ml/Ternary-Bonsai-2-27B-gguf",
          "file": "Ternary-Bonsai-2-27B-Q2_0.gguf",
          "bytes": 7626008928,
          "mmprojBytes": 629246976,
          "checkedAt": "2026-11-19"
        }
      }
    ]
  }
];
