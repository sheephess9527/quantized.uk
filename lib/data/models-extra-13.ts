import type { QuantModel } from './types';

/** Official config.json, Hub safetensors metadata and GGUF tree byte counts read 2026-11-14.
 * Original repos: LiquidAI/LFM2.5-{1.2B-Instruct,8B-A1B},
 * mistralai/Ministral-3-{3B,14B}-Instruct-2512-BF16; GGUF repos are in source below.
 * llama.cpp src/models/{lfm2,lfm2moe,mistral3}.cpp confirms cache layouts and dense-leading MoE.
 * Ministral language counts: embeddings + L*(Q,K,V,O + 3 MLP matrices + 2 norms) + final norm,
 * 3B tied / 14B untied output, excluding the mmproj. LFM totals use Hub metadata, not rounded card labels.
 * LFM routed tensors: (24-2)*32*3*2048*1792 = 7,751,073,792 parameters.
 * Licence texts read from original repositories; LFM Open has a $10M annual-revenue threshold.
 * File-derived bpw is still a memory estimate, never a measured speed/quality claim.
 */
export const extraModels13: QuantModel[] = [
  {
    "id": "lfm2-5-1-2b",
    "name": "LFM2.5 1.2B Instruct",
    "family": "LiquidAI LFM2.5",
    "params": 1.170340608,
    "paramLabel": "1.2B",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 128000,
    "arch": {
      "layers": 16,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 64,
      "attention": {
        "fullLayers": 6,
        "note": {
          "en": "Only the 6 full-attention layers grow a KV cache; short-convolution layers keep fixed state, which is not separately sized.",
          "zh": "只有 6 层全注意力保留随上下文增长的 KV 缓存；短卷积层保留固定状态，未单独估算。"
        }
      }
    },
    "addedAt": "2026-11-14",
    "description": {
      "en": "Liquid AI's small hybrid text model for on-device use. Its official config has 16 layers, only 6 of which keep a growing attention cache; the rest use short convolutions. The 128,000-token limit is from the config. Sizes come from the official GGUF files. The LFM Open licence has a revenue threshold; read its terms before deployment. No per-level perplexity loss has been published.",
      "zh": "Liquid AI 面向端侧的小型混合架构文本模型。官方配置有 16 层，其中仅 6 层保留随上下文增长的注意力缓存，其余使用短卷积。128,000 token 上限来自配置，体积来自官方 GGUF 文件。LFM Open 许可有营收门槛，部署前请核对条款。各档位没有公布困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.0,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
          "file": "LFM2.5-1.2B-Instruct-Q4_K_M.gguf",
          "bytes": 730895168,
          "checkedAt": "2026-11-14"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.76,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
          "file": "LFM2.5-1.2B-Instruct-Q5_K_M.gguf",
          "bytes": 843354944,
          "checkedAt": "2026-11-14"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.52,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-1.2B-Instruct-GGUF",
          "file": "LFM2.5-1.2B-Instruct-Q8_0.gguf",
          "bytes": 1246253888,
          "checkedAt": "2026-11-14"
        }
      }
    ]
  },
  {
    "id": "lfm2-5-8b-a1b",
    "name": "LFM2.5 8B-A1B",
    "family": "LiquidAI LFM2.5",
    "params": 8.467856832,
    "paramLabel": "8B-A1.5B",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 128000,
    "arch": {
      "layers": 24,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 64,
      "attention": {
        "fullLayers": 6,
        "note": {
          "en": "Only the 6 full-attention layers grow a KV cache; short-convolution layers keep fixed state, which is not separately sized.",
          "zh": "只有 6 层全注意力保留随上下文增长的 KV 缓存；短卷积层保留固定状态，未单独估算。"
        }
      },
      "moe": {
        "expertParams": 7.751073792,
        "experts": 32,
        "perToken": 4,
        "moeLayers": 22,
        "denseLead": 2
      }
    },
    "addedAt": "2026-11-14",
    "description": {
      "en": "Liquid AI's hybrid mixture-of-experts text model, with 1.5B active parameters per token as stated by the publisher. All experts remain in memory. Its config has 24 layers with 6 full-attention layers, 32 experts per routed layer and 4 selected per token, with two leading dense layers. Sizes use the official GGUF bytes and the parameter total reported by Hugging Face, rather than the rounded 8.3B in the card. The LFM Open licence has a revenue threshold. No per-level perplexity loss has been published.",
      "zh": "Liquid AI 的混合专家文本模型，发布者标注每个 token 激活 1.5B 参数，所有专家仍需常驻内存。官方配置有 24 层、6 层全注意力；路由层各有 32 个专家，每个 token 选 4 个，开头两层为稠密层。体积取自官方 GGUF 字节数，参数量采用 Hugging Face 报告的总数，而非模型卡取整后的 8.3B。LFM Open 许可有营收门槛。各档位没有公布困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.87,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-8B-A1B-GGUF",
          "file": "LFM2.5-8B-A1B-Q4_K_M.gguf",
          "bytes": 5155564768,
          "checkedAt": "2026-11-14"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.7,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-8B-A1B-GGUF",
          "file": "LFM2.5-8B-A1B-Q5_K_M.gguf",
          "bytes": 6030339296,
          "checkedAt": "2026-11-14"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.51,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "LiquidAI/LFM2.5-8B-A1B-GGUF",
          "file": "LFM2.5-8B-A1B-Q8_0.gguf",
          "bytes": 9010195680,
          "checkedAt": "2026-11-14"
        }
      }
    ],
    "activeParams": 1.5
  },
  {
    "id": "ministral-3-3b",
    "name": "Ministral 3 3B Instruct",
    "family": "Mistral Ministral 3",
    "params": 3.429006336,
    "paramLabel": "3B",
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
      "layers": 26,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 128
    },
    "addedAt": "2026-11-14",
    "description": {
      "en": "The small Ministral 3 instruction model under Apache 2.0, with text and image input. The language backbone has 26 full-attention layers and a 256K window. The language parameter count is reconstructed from the official config; the separate vision encoder is excluded from that count and its bytes are recorded beside each GGUF. Image-input sizing must include that encoder and budget image tokens within the context. No per-level perplexity loss has been published.",
      "zh": "Apache 2.0 许可的 Ministral 3 小型指令模型，支持文本和图像输入。语言骨干有 26 层全注意力，256K 上下文。语言参数量按官方配置重建，独立视觉编码器不计入该参数量，其字节数单独记录在各 GGUF 档位旁。读图估算须额外计入编码器，并将图像 token 计入上下文预算。各档位没有公布困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.01,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-3B-Instruct-2512-GGUF",
          "file": "Ministral-3-3B-Instruct-2512-Q4_K_M.gguf",
          "bytes": 2147023008,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 841501856
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.77,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-3B-Instruct-2512-GGUF",
          "file": "Ministral-3-3B-Instruct-2512-Q5_K_M.gguf",
          "bytes": 2474178720,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 841501856
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.52,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-3B-Instruct-2512-GGUF",
          "file": "Ministral-3-3B-Instruct-2512-Q8_0.gguf",
          "bytes": 3652204704,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 841501856
        }
      }
    ]
  },
  {
    "id": "ministral-3-14b",
    "name": "Ministral 3 14B Instruct",
    "family": "Mistral Ministral 3",
    "params": 13.50607872,
    "paramLabel": "14B",
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
      "layers": 40,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 128
    },
    "addedAt": "2026-11-14",
    "description": {
      "en": "The larger Ministral 3 instruction model under Apache 2.0, with text and image input. Its language backbone has 40 full-attention layers, 8 KV heads of 128 dimensions and a 256K window. Parameters count the language model reconstructed from the official config; its separate vision encoder is recorded as an additional download, not folded into the language weights. Long-context and image use need more memory than the GGUF file alone. No per-level perplexity loss has been published.",
      "zh": "Apache 2.0 许可的 Ministral 3 较大尺寸指令模型，支持文本和图像输入。语言骨干有 40 层全注意力、8 个 128 维 KV 头，256K 上下文。参数量按官方配置重建语言模型计算，独立视觉编码器作为额外文件记录，不混入语言权重。长上下文和读图的运行内存均高于 GGUF 文件本身。各档位没有公布困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.88,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-14B-Instruct-2512-GGUF",
          "file": "Ministral-3-14B-Instruct-2512-Q4_K_M.gguf",
          "bytes": 8239593024,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 879258784
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.7,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-14B-Instruct-2512-GGUF",
          "file": "Ministral-3-14B-Instruct-2512-Q5_K_M.gguf",
          "bytes": 9621091904,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 879258784
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.51,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mistralai/Ministral-3-14B-Instruct-2512-GGUF",
          "file": "Ministral-3-14B-Instruct-2512-Q8_0.gguf",
          "bytes": 14359836224,
          "checkedAt": "2026-11-14",
          "mmprojBytes": 879258784
        }
      }
    ]
  }
];
