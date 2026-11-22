import type { QuantModel } from './types';

/** DeepSeek V4/V4.1 Flash, GLM-5.3-Flash, Kimi K3.1 Pro and MiniMax M3.1 Flash, moved from pending 2026-11-22.
 * Architecture from the publishers' config.json, GGUF headers and llama.cpp's cache code (deepseek4, deepseek41,
 * glm5-next, kimi-k31, minimax-m3); sizes from GGUF headers summed over every part. See docs/changes/2026-11-22-frontier-vram.md. */
export const extraModels18: QuantModel[] = [
  {
    "id": "deepseek-v4-flash-0731",
    "name": "DeepSeek-V4-Flash-0731",
    "family": "DeepSeek V4",
    "params": 284.334567511,
    "paramLabel": "284B MoE",
    // No vendor figure. GGUF header: 284.33B total − 277.03B routed experts = 7.31B always read, + 6/256 × 277.03 = 6.49B → 13.8B.
    "activeParams": 13.8,
    "categories": [
      "general",
      "instruct",
      "code"
    ],
    "hardwareTags": [
      "pro-gpu",
      "mac"
    ],
    "contextLength": 1048576,
    "arch": {
      "layers": 43,
      "attHeads": 64,
      "kvHeads": 1,
      "headDim": 256,
      "attention": {
        "fullLayers": 0,
        "windowLayers": 43,
        "windowTokens": 768,
        "compressed": [
          {
            "layers": 21,
            "values": 640,
            "ratio": 4
          },
          {
            "layers": 20,
            "values": 512,
            "ratio": 128
          }
        ],
        "note": {
          "en": "llama.cpp deepseek4 cache: every layer keeps a 128-token window of 512-wide K-only rows; 21 CSA layers add one 512-wide row plus a 128-wide indexer key per 4 tokens, 20 HCA layers one 512-wide row per 128 tokens. Fixed-size compressor state is not counted.",
          "zh": "llama.cpp deepseek4 缓存：每层保留 128 token 窗口的 512 维仅 K 行；21 个 CSA 层每 4 个 token 增加一行 512 维压缩 KV 和一行 128 维索引键，20 个 HCA 层每 128 个 token 增加一行 512 维压缩 KV。固定大小的压缩器状态不计入。"
        }
      },
      "moe": {
        "expertParams": 277.025390592,
        "experts": 256,
        "perToken": 6,
        "moeLayers": 43
      }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "DeepSeek's July 2026 Flash checkpoint: 284.3B parameters in the GGUF headers, 256 routed experts with six chosen per token, and a 1M-token window. Its attention does not keep a normal KV cache. Every layer holds a short 128-token window, and the long-range cache is compressed: 21 layers store one row per 4 tokens and 20 layers one row per 128 tokens. That makes the full million-token context cheap next to the weights, so memory planning is about the expert weights. Sizes come from the ggml-org GGUF files.",
      "zh": "DeepSeek 2026 年 7 月发布的 Flash 检查点：GGUF 头记录 2843 亿参数，256 个路由专家，每个 token 选 6 个，上下文窗口 100 万 token。它的注意力不保留常规 KV 缓存：每层只保留 128 token 的短窗口，长程缓存经过压缩，21 层每 4 个 token 存一行，20 层每 128 个 token 存一行。因此即使用满 100 万 token，缓存相对权重也很小，显存规划主要看专家权重。文件大小取自 ggml-org 的 GGUF。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_K",
        "bpw": 3.3017283721567936,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ggml-org/DeepSeek-V4-Flash-0731-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ggml-org/DeepSeek-V4-Flash-0731-GGUF",
          "file": "DeepSeek-V4-Flash-0731-Q2_K-00001-of-00002.gguf",
          "bytes": 117349438592,
          "parts": 2,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "MXFP4",
        "bpw": 4.360821568330874,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ggml-org/DeepSeek-V4-Flash-0731-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ggml-org/DeepSeek-V4-Flash-0731-GGUF",
          "file": "DeepSeek-V4-Flash-0731-MXFP4-00001-of-00002.gguf",
          "bytes": 154991539328,
          "parts": 2,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  },
  {
    "id": "deepseek-v4-1-flash-1017",
    "name": "DeepSeek-V4.1-Flash-1017",
    "family": "DeepSeek V4",
    "params": 748.494684784,
    "paramLabel": "748B MoE",
    // No vendor figure. GGUF header: 748.49B − 543.58B routed experts − 196.61B engram_embd lookup tables (2 rows per
    // n-gram head per token, negligible) = 8.30B always read, + 6/384 × 543.58 = 8.49B → 16.8B.
    "activeParams": 16.8,
    "categories": [
      "general",
      "instruct",
      "code",
      "multimodal"
    ],
    "hardwareTags": [
      "pro-gpu"
    ],
    "contextLength": 1048576,
    "arch": {
      "layers": 40,
      "attHeads": 64,
      "kvHeads": 1,
      "headDim": 256,
      "attention": {
        "fullLayers": 0,
        "windowLayers": 40,
        "windowTokens": 768,
        "compressed": [
          {
            "layers": 3,
            "values": 640,
            "ratio": 2
          },
          {
            "layers": 1,
            "values": 640,
            "ratio": 1
          }
        ],
        "note": {
          "en": "llama.cpp deepseek41 cache: every layer keeps a 128-token window of 512-wide K-only rows. Compressed layers share KV across layers (kv_source_layer_ids 2, 8, 14, 20), so only those four own rows of 512 KV + 128 index values: three at one row per 2 tokens, one per token.",
          "zh": "llama.cpp deepseek41 缓存：每层保留 128 token 窗口的 512 维仅 K 行。压缩层跨层共享 KV（kv_source_layer_ids 为 2、8、14、20），只有这 4 层持有 512 维 KV 加 128 维索引的行：3 层每 2 个 token 一行，1 层每个 token 一行。"
        }
      },
      "moe": {
        "expertParams": 543.5817984,
        "experts": 384,
        "perToken": 6,
        "moeLayers": 40
      }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "DeepSeek's October 2026 Flash update reads images as well as text: 748.5B parameters in the GGUF headers, 384 routed experts with six chosen per token, and a 1M-token window. Compressed layers share one cache across groups of layers, so only four layers store long-range rows and the million-token context stays small beside the weights. The mrfakename GGUFs keep the routed experts in the checkpoint's native 4-bit form, so even the Q8_0 build averages about 5.4 bits per weight. The image projector is a separate file and is not included here.",
      "zh": "DeepSeek 2026 年 10 月的 Flash 更新，可读图像和文本：GGUF 头记录 7485 亿参数，384 个路由专家，每个 token 选 6 个，上下文窗口 100 万 token。压缩层按组共享缓存，只有 4 层存储长程行，因此 100 万 token 的上下文相对权重仍然很小。mrfakename 的 GGUF 让路由专家保持检查点原生的 4 位格式，所以连 Q8_0 版本平均也只有约 5.4 bit/权重。图像投影文件另行提供，不计入此处。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_K",
        "bpw": 2.8271721595600496,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
          "file": "Q2_K/DeepSeek-V4.1-Flash-1017-Q2_K-00001-of-00010.gguf",
          "bytes": 264515416800,
          "parts": 10,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 3.7116800759242836,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
          "file": "Q3_K_M/DeepSeek-V4.1-Flash-1017-Q3_K_M-00001-of-00010.gguf",
          "bytes": 347271601056,
          "parts": 10,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.753407942174948,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
          "file": "Q4_K_M/DeepSeek-V4.1-Flash-1017-Q4_K_M-00001-of-00010.gguf",
          "bytes": 444737572416,
          "parts": 10,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 5.429075047121651,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mrfakename/DeepSeek-V4.1-Flash-1017-GGUF",
          "file": "Q8_0/DeepSeek-V4.1-Flash-1017-Q8_0-00001-of-00010.gguf",
          "bytes": 507954227008,
          "parts": 10,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  },
  {
    "id": "glm-5-3-flash",
    "name": "GLM-5.3-Flash",
    "family": "Z.ai GLM-5",
    "params": 313.326811966,
    "paramLabel": "313B-A18B",
    "categories": [
      "general",
      "instruct",
      "code",
      "multimodal"
    ],
    "hardwareTags": [
      "pro-gpu",
      "mac"
    ],
    "contextLength": 1048576,
    "arch": {
      "layers": 45,
      "attHeads": 64,
      "kvHeads": 1,
      "headDim": 256,
      "attention": {
        "fullLayers": 11,
        "compressed": [
          {
            "layers": 11,
            "values": 384,
            "ratio": 1
          }
        ],
        "note": {
          "en": "config.json layer_types: 11 of 45 layers are DeepSeek sparse attention with a K-only MLA cache (kv_lora_rank 512, no RoPE part) plus a 384-wide indexer row per token (key, gate and pooled key, llama.cpp glm5-next); the other 34 are KDA linear layers with a fixed state.",
          "zh": "config.json 的 layer_types：45 层中 11 层是 DeepSeek 稀疏注意力，使用仅 K 的 MLA 缓存（kv_lora_rank 512，无 RoPE 部分），每个 token 另有 384 维索引行（键、门控与池化键，llama.cpp glm5-next）；其余 34 层是 KDA 线性层，状态大小固定。"
        }
      },
      "moe": {
        "expertParams": 304.405807104,
        "experts": 288,
        "perToken": 8,
        "moeLayers": 42,
        "denseLead": 3
      }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "Z.ai's August 2026 Flash model takes text and images: 313.3B parameters in the GGUF headers, 288 routed experts with eight chosen per token, and a 1M-token window. Only 11 of its 45 layers keep a cache that grows with context; the other 34 are linear-attention layers with a fixed state. The Q2_K and Q4_K files come from ggml-org. The unsloth Q8_0 build also carries the multi-token-prediction block, so it is slightly larger than the trunk alone. The image projector is a separate file and is not included here.",
      "zh": "Z.ai 2026 年 8 月发布的 Flash 模型，可读文本和图像：GGUF 头记录 3133 亿参数，288 个路由专家，每个 token 选 8 个，上下文窗口 100 万 token。45 层中只有 11 层的缓存随上下文增长，其余 34 层是状态大小固定的线性注意力层。Q2_K 和 Q4_K 文件来自 ggml-org；unsloth 的 Q8_0 还包含多 token 预测模块，因此比主干略大。图像投影文件另行提供，不计入此处。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_K",
        "bpw": 3.4164725502909086,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ggml-org/GLM-5.3-Flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ggml-org/GLM-5.3-Flash-GGUF",
          "file": "GLM-5.3-Flash-Q2_K-00001-of-00002.gguf",
          "bytes": 133809056544,
          "parts": 2,
          "mmprojBytes": 652829376,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.630882687886443,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ggml-org/GLM-5.3-Flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ggml-org/GLM-5.3-Flash-GGUF",
          "file": "GLM-5.3-Flash-Q4_K-00001-of-00002.gguf",
          "bytes": 181372463648,
          "parts": 2,
          "mmprojBytes": 652829376,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.706103740525108,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "unsloth/GLM-5.3-Flash-GGUF",
          "file": "Q8_0/GLM-5.3-Flash-Q8_0-00001-of-00008.gguf",
          "bytes": 340981966208,
          "parts": 8,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  },
  {
    "id": "kimi-k3-1-pro",
    "name": "Kimi K3.1 Pro",
    "family": "Kimi K3",
    "params": 2779.661661792,
    "paramLabel": "2.8T-A104B",
    "categories": [
      "general",
      "instruct",
      "code",
      "multimodal"
    ],
    "hardwareTags": [
      "pro-gpu"
    ],
    "contextLength": 1048576,
    "arch": {
      "layers": 93,
      "attHeads": 96,
      "kvHeads": 1,
      "headDim": 288,
      "attention": {
        "fullLayers": 24,
        "compressed": [
          {
            "layers": 24,
            "values": 128,
            "ratio": 1
          }
        ],
        "note": {
          "en": "config.json and the GGUF header: 24 of 93 layers are DeepSeek sparse attention with a K-only MLA cache (kv_lora_rank 512 + 64 RoPE = 576 values) plus a 128-wide indexer key per token (llama.cpp kimi-k31); the other 69 are Kimi Delta Attention layers with a fixed state.",
          "zh": "config.json 与 GGUF 头：93 层中 24 层是 DeepSeek 稀疏注意力，使用仅 K 的 MLA 缓存（kv_lora_rank 512 + 64 维 RoPE，共 576 个值），每个 token 另有 128 维索引键（llama.cpp kimi-k31）；其余 69 层是 Kimi Delta Attention，状态大小固定。"
        }
      },
      "moe": {
        "expertParams": 2722.740830208,
        "experts": 896,
        "perToken": 16,
        "moeLayers": 92,
        "denseLead": 1
      }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "Moonshot's October 2026 flagship reads text and images: 2.78T parameters in the GGUF headers, 896 routed experts with 16 chosen per token, and a 1M-token window. Only 24 of its 93 layers keep a cache that grows with context, so context is a small part of the bill; the weights are the problem. Even DevQuasar's Q2_K build is about 1 TB, which is beyond every single machine in this index and needs a multi-GPU server or heavy offload. DevQuasar's MXFP4_MOE build is left out because it is not the released format. The image projector is a separate file.",
      "zh": "Moonshot 2026 年 10 月的旗舰模型，可读文本和图像：GGUF 头记录 2.78 万亿参数，896 个路由专家，每个 token 选 16 个，上下文窗口 100 万 token。93 层中只有 24 层的缓存随上下文增长，因此上下文只占很小一部分，难点在权重：即便是 DevQuasar 的 Q2_K 也约 1 TB，超出本索引中任何单机，需要多卡服务器或大量卸载。DevQuasar 的 MXFP4_MOE 不是官方发布格式，未收录。图像投影文件另行提供。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_K",
        "bpw": 2.9048572113925895,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/DevQuasar/moonshotai.Kimi-K3.1-Pro-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "DevQuasar/moonshotai.Kimi-K3.1-Pro-GGUF",
          "file": "Q2_K/moonshotai.Kimi-K3.1-Pro-Q2_K-00001-of-00033.gguf",
          "bytes": 1009315027936,
          "parts": 33,
          "mmprojBytes": 904448928,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  },
  {
    "id": "minimax-m3-1-flash",
    "name": "MiniMax M3.1 Flash",
    "family": "MiniMax M3",
    "params": 426.186392064,
    "paramLabel": "426B-A23B",
    "categories": [
      "general",
      "instruct",
      "code",
      "multimodal"
    ],
    "hardwareTags": [
      "pro-gpu",
      "mac"
    ],
    "contextLength": 1048576,
    "arch": {
      "layers": 60,
      "attHeads": 64,
      "kvHeads": 4,
      "headDim": 128,
      "attention": {
        "fullLayers": 60,
        "compressed": [
          {
            "layers": 57,
            "values": 256,
            "ratio": 1
          }
        ],
        "note": {
          "en": "GGUF header and llama.cpp minimax-m3: all 60 layers keep a normal K/V cache (4 KV heads of 128); the 57 sparse layers after the 3 dense ones also keep an indexer cache with one 128-wide K and V head per token.",
          "zh": "GGUF 头与 llama.cpp minimax-m3：60 层都保留常规 K/V 缓存（4 个 128 维 KV 头）；3 个稠密层之后的 57 个稀疏层另有索引缓存，每个 token 一个 128 维 K 头和 V 头。"
        }
      },
      "moe": {
        "expertParams": 413.122188672,
        "experts": 128,
        "perToken": 4,
        "moeLayers": 57,
        "denseLead": 3
      }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "MiniMax's October 2026 Flash model reads text and images: 426.2B parameters in the GGUF header, 128 routed experts with four chosen per token, and a 1M-token window. Unlike the other new frontier models it keeps an ordinary K/V cache on every layer, plus a small sparse-attention index, so long context costs real memory. The only standard-level GGUF so far is smalinin's Q2_K; unsloth's dynamic UD builds and AtomicChat's AD builds are not tracked. The licence asks commercial users to notify MiniMax and requires written permission above 20 million US dollars a year in revenue. The image projector is a separate file.",
      "zh": "MiniMax 2026 年 10 月的 Flash 模型，可读文本和图像：GGUF 头记录 4262 亿参数，128 个路由专家，每个 token 选 4 个，上下文窗口 100 万 token。与其他几款新旗舰不同，它每层都保留常规 K/V 缓存，另有一个小的稀疏注意力索引，所以长上下文会占用可观的显存。目前唯一的标准档位 GGUF 是 smalinin 的 Q2_K；unsloth 的 UD 动态版本和 AtomicChat 的 AD 版本未收录。许可要求商用者通知 MiniMax，年收入超过 2000 万美元需书面授权。图像投影文件另行提供。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_K",
        "bpw": 3.0459179402355514,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/smalinin/MiniMax-M3.1-Flash-Q2_K-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "smalinin/MiniMax-M3.1-Flash-Q2_K-GGUF",
          "file": "Q2_K/MiniMax-M3.1-Flash-Q2_K-00001-of-00006.gguf",
          "bytes": 162266097184,
          "parts": 6,
          "mmprojBytes": 1735304576,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  }
];
