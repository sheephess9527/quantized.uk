import type { QuantModel } from './types';

/** Publisher configs and GGUF tensor/byte counts audited in docs/changes/2026-11-23-patrol.md. */
export const extraModels19: QuantModel[] = [
  {
    "id": "kormo-web-9b",
    "name": "KORMo-Web-9B",
    "family": "KORMo-Web",
    "params": 8.953803264,
    "paramLabel": "9B",
    "categories": [
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
      "layers": 32,
      "attHeads": 16,
      "kvHeads": 4,
      "headDim": 256,
      "attention": {
        "fullLayers": 8
      }
    },
    "addedAt": "2026-11-23",
    "description": {
      "en": "A Qwen3.5-based browser agent for Korean and English web tasks. Its GGUF stores 8.95B language parameters. Image input uses the separate BF16 projector. Eight of 32 layers have a KV cache that grows with context. Estimates cover model inference and exclude the browser and extension.",
      "zh": "基于 Qwen3.5 的浏览器智能体，可处理韩语和英语网页任务。GGUF 含约 89.5 亿语言参数，图像输入使用独立的 BF16 投影文件。32 层中有 8 层的 KV 缓存随上下文增长。估算只覆盖模型推理，浏览器和扩展的开销另计。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.0,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
          "file": "KORMo-VL_KORMo-Web-9B-Q3_K_M.gguf",
          "bytes": 4480146240,
          "checkedAt": "2026-11-23",
          "mmprojBytes": 921705120
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.22,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
          "file": "KORMo-VL_KORMo-Web-9B-Q4_K_M.gguf",
          "bytes": 5841050432,
          "checkedAt": "2026-11-23",
          "mmprojBytes": 921705120
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.15,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
          "file": "KORMo-VL_KORMo-Web-9B-Q5_K_M.gguf",
          "bytes": 6886087488,
          "checkedAt": "2026-11-23",
          "mmprojBytes": 921705120
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.51,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-9B-GGUF",
          "file": "KORMo-VL_KORMo-Web-9B-Q8_0.gguf",
          "bytes": 9527499584,
          "checkedAt": "2026-11-23",
          "mmprojBytes": 921705120
        }
      }
    ]
  },
  {
    "id": "granite-switch-4.1-8b",
    "name": "Granite Switch 4.1 8B",
    "family": "IBM Granite",
    "params": 8.974319616,
    "paramLabel": "8B",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 131072,
    "arch": {
      "layers": 40,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 128,
      "attention": {
        "compressed": [
          {
            "layers": 1,
            "values": 256,
            "ratio": 1
          }
        ],
        "note": {
          "en": "The 40 GGUF transformer blocks have 8 KV heads each. llama.cpp also keeps one 128-wide key and value per token for its adapter router.",
          "zh": "GGUF 的 40 个 Transformer 层各有 8 个 KV 头。llama.cpp 另外为适配器路由器的每个 token 保留一组 128 维 K 和 V。"
        }
      }
    },
    "addedAt": "2026-11-23",
    "description": {
      "en": "IBM ships these text GGUFs with two switchable adapters. They store 8.97B parameters, including the adapters. The 128K context estimate includes the adapter router cache. IBM’s separate speech pipeline requires its own runtime and memory.",
      "zh": "IBM 的文本 GGUF 内置两个可切换适配器，连同适配器共存有约 89.7 亿参数。128K 上下文估算包含适配器路由器的缓存。IBM 的语音流程需要另行配置运行时，并单独计算内存。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.88,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-8b-GGUF",
          "file": "granite-switch-4.1-8b-Q3_K_M.gguf",
          "bytes": 5474645792,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.72,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-8b-GGUF",
          "file": "granite-switch-4.1-8b-Q4_K_M.gguf",
          "bytes": 6412400416,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.43,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-8b-GGUF",
          "file": "granite-switch-4.1-8b-Q5_K_M.gguf",
          "bytes": 7214561056,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 9.0,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-8b-GGUF",
          "file": "granite-switch-4.1-8b-Q8_0.gguf",
          "bytes": 10096444096,
          "checkedAt": "2026-11-23"
        }
      }
    ]
  },
  {
    "id": "granite-switch-4.1-30b",
    "name": "Granite Switch 4.1 30B",
    "family": "IBM Granite",
    "params": 30.551851008,
    "paramLabel": "30B",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac"
    ],
    "contextLength": 131072,
    "arch": {
      "layers": 64,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 128,
      "attention": {
        "compressed": [
          {
            "layers": 1,
            "values": 256,
            "ratio": 1
          }
        ],
        "note": {
          "en": "The 64 GGUF transformer blocks have 8 KV heads each. llama.cpp also keeps one 128-wide key and value per token for its adapter router.",
          "zh": "GGUF 的 64 个 Transformer 层各有 8 个 KV 头。llama.cpp 另外为适配器路由器的每个 token 保留一组 128 维 K 和 V。"
        }
      }
    },
    "addedAt": "2026-11-23",
    "description": {
      "en": "IBM’s larger Granite Switch text GGUFs store 30.55B parameters, including two switchable adapters. Its 64 transformer blocks and single adapter router contribute to the 128K context estimate. IBM’s speech pipeline uses a separate runtime and memory budget.",
      "zh": "IBM 的 Granite Switch 30B 文本 GGUF 含约 305.5 亿参数，内置两个可切换适配器。128K 上下文估算包含 64 层 Transformer 与适配器路由器的缓存。IBM 的语音流程需要另行配置运行时和内存。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.59,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-30b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-30b-GGUF",
          "file": "granite-switch-4.1-30b-Q3_K_M.gguf",
          "bytes": 17512331648,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.51,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-30b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-30b-GGUF",
          "file": "granite-switch-4.1-30b-Q4_K_M.gguf",
          "bytes": 21035547008,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.27,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-30b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-30b-GGUF",
          "file": "granite-switch-4.1-30b-Q5_K_M.gguf",
          "bytes": 23954782592,
          "checkedAt": "2026-11-23"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.92,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ibm-granite/granite-switch-4.1-30b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "ibm-granite/granite-switch-4.1-30b-GGUF",
          "file": "granite-switch-4.1-30b-Q8_0.gguf",
          "bytes": 34047264032,
          "checkedAt": "2026-11-23"
        }
      }
    ]
  },
  {
    "id": "ternary-bonsai-2-5-27b",
    "name": "Ternary Bonsai 2.5 27B",
    "family": "Prism ML Ternary Bonsai",
    "params": 26.895998464,
    "paramLabel": "27B",
    "categories": [
      "general",
      "instruct",
      "code",
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
    "addedAt": "2026-11-25",
    "description": {
      "en": "Prism ML tuned this ternary Qwen3.8 derivative for longer tool-driven tasks. The official Q2_0 file runs with upstream llama.cpp b11556 or later. Sixteen of 64 layers grow the main KV cache, and image input adds the separate BF16 projector. The estimate uses the base Q2_0 file without speculative decoding.",
      "zh": "Prism ML 基于 Qwen3.8 调整了这款三值模型，面向多步骤工具调用。官方 Q2_0 适用于上游 llama.cpp b11556 或更新版本。64 层中有 16 层的主 KV 缓存随上下文增长，图像输入另用 BF16 投影。估算采用基础 Q2_0 文件，未启用推测解码。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q2_0",
        "bpw": 2.282,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "prism-ml/Ternary-Bonsai-2.5-27B-GGUF",
          "file": "Ternary-Bonsai-2.5-27B-Q2_0.gguf",
          "bytes": 7673194848,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 931145856
        }
      }
    ]
  },
  {
    "id": "ccore-web-coder-4b",
    "name": "CCORE Web Coder 4B",
    "family": "CCORE Web Coder",
    "params": 4.205751296,
    "paramLabel": "4B",
    "categories": [
      "instruct",
      "code",
      "multimodal"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 262144,
    "arch": {
      "layers": 32,
      "attHeads": 16,
      "kvHeads": 4,
      "headDim": 256,
      "attention": {
        "fullLayers": 8
      }
    },
    "addedAt": "2026-11-25",
    "description": {
      "en": "The final CCORE checkpoint fine-tunes Qwen3.5-4B-Base to generate editable React pages, slides and infographics as a single HTML file. Eight of 32 layers grow the main KV cache. The publisher supplies the original vision projector for experimental image input. The final Q8_0 replaced the earlier preview at the same filename.",
      "zh": "CCORE 在 Qwen3.5-4B-Base 上微调了这个最终检查点，可将 React 网页、幻灯片或信息图生成为单个可编辑 HTML 文件。32 层中有 8 层的主 KV 缓存随上下文增长。发布方提供原始视觉投影供图像输入实验。最终 Q8_0 已替换同名预览文件。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.153,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ccore/CCORE-Web-Coder-4B",
        "confidence": "estimated",
        "source": {
          "repo": "ccore/CCORE-Web-Coder-4B",
          "file": "ccore-web-coder-Q4_K_M.gguf",
          "bytes": 2708804160,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 672423232
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.526,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/ccore/CCORE-Web-Coder-4B",
        "confidence": "estimated",
        "source": {
          "repo": "ccore/CCORE-Web-Coder-4B",
          "file": "ccore-web-coder-Q8_0.gguf",
          "bytes": 4482402816,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 672423232
        }
      }
    ]
  },
  {
    "id": "minicpm-v-4-6",
    "name": "MiniCPM-V 4.6",
    "family": "OpenBMB MiniCPM-V",
    "params": 0.7521616,
    "paramLabel": "0.75B",
    "categories": [
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
      "layers": 24,
      "attHeads": 8,
      "kvHeads": 2,
      "headDim": 256,
      "attention": {
        "fullLayers": 6
      }
    },
    "addedAt": "2026-11-25",
    "description": {
      "en": "OpenBMB’s compact image and video model. Its 0.75B language weights and the official F16 vision projector are separate downloads. Six of 24 language layers grow the KV cache. The model card documents visual token downsampling for image and video.",
      "zh": "OpenBMB 的小型图像与视频模型。约 7.52 亿语言参数的权重与官方 F16 视觉投影分别下载。24 个语言层中有 6 层的 KV 缓存随上下文增长。模型卡说明了图像和视频的视觉 token 下采样设置。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.628,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-gguf",
          "file": "MiniCPM-V-4_6-Q4_K_M.gguf",
          "bytes": 529101504,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746944
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.146,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-gguf",
          "file": "MiniCPM-V-4_6-Q5_K_M.gguf",
          "bytes": 577802944,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746944
        }
      },
      {
        "format": "GGUF",
        "level": "Q6_K",
        "bpw": 6.696,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-gguf",
          "file": "MiniCPM-V-4_6-Q6_K.gguf",
          "bytes": 629548224,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746944
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.632,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-gguf",
          "file": "MiniCPM-V-4_6-Q8_0.gguf",
          "bytes": 811591616,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746944
        }
      }
    ]
  },
  {
    "id": "minicpm-v-4-6-thinking",
    "name": "MiniCPM-V 4.6 Thinking",
    "family": "OpenBMB MiniCPM-V",
    "params": 0.7521616,
    "paramLabel": "0.75B",
    "categories": [
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
      "layers": 24,
      "attHeads": 8,
      "kvHeads": 2,
      "headDim": 256,
      "attention": {
        "fullLayers": 6
      }
    },
    "addedAt": "2026-11-25",
    "description": {
      "en": "The separate reasoning checkpoint of MiniCPM-V 4.6. It uses 0.75B stored language parameters and a matching F16 vision projector. Six of 24 language layers grow the KV cache. Select this repository to use the Thinking chat template and weights.",
      "zh": "MiniCPM-V 4.6 独立的推理检查点，包含约 7.52 亿语言参数及配套 F16 视觉投影。24 个语言层中有 6 层的 KV 缓存随上下文增长。选用这个仓库即可使用 Thinking 的对话模板和权重。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.628,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-Thinking-gguf",
          "file": "MiniCPM-V-4_6-Thinking-Q4_K_M.gguf",
          "bytes": 529101536,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746976
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.146,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-Thinking-gguf",
          "file": "MiniCPM-V-4_6-Thinking-Q5_K_M.gguf",
          "bytes": 577802976,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746976
        }
      },
      {
        "format": "GGUF",
        "level": "Q6_K",
        "bpw": 6.696,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-Thinking-gguf",
          "file": "MiniCPM-V-4_6-Thinking-Q6_K.gguf",
          "bytes": 629548256,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746976
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.632,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-gguf",
        "confidence": "estimated",
        "source": {
          "repo": "openbmb/MiniCPM-V-4.6-Thinking-gguf",
          "file": "MiniCPM-V-4_6-Thinking-Q8_0.gguf",
          "bytes": 811591648,
          "checkedAt": "2026-11-25",
          "mmprojBytes": 1108746976
        }
      }
    ]
  }
];
