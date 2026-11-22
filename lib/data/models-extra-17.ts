import type { QuantModel } from './types';

/** See docs/changes/2026-11-21-patrol.md for the November 21 entries' sources and sizing. */
export const extraModels17: QuantModel[] = [
  {
    "id": "clairic-27b",
    "name": "Clairic 27B",
    "family": "Cloudflare Clairic",
    "params": 26.895998464,
    "paramLabel": "27B",
    "categories": [
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
    "addedAt": "2026-11-21",
    "description": {
      "en": "Cloudflare’s Qwen3.8 27B derivative produces typed structured outputs from text and images. Its documented schema helpers use Transformers and XGrammar. The indexed Xylolabs GGUF sizes cover the language weights and a separate BF16 projector. The calculator uses the 16 layers that grow the main KV cache. No per-quant speed or perplexity loss is recorded.",
      "zh": "Cloudflare 基于 Qwen3.8 27B 训练，从文本和图像生成带类型的结构化输出。官方 schema 辅助流程使用 Transformers 和 XGrammar。本条记录 Xylolabs 的 GGUF 语言权重和独立 BF16 投影文件，主 KV 缓存按其中 16 层估算。 未记录各档速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.029414588235455,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-GGUF",
          "file": "clairic-Q3_K_M.gguf",
          "bytes": 13546891072,
          "mmprojBytes": 931146336,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.989873036899352,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-GGUF",
          "file": "clairic-Q4_K_M.gguf",
          "bytes": 16775952192,
          "mmprojBytes": 931146336,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.759170594217951,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-GGUF",
          "file": "clairic-Q5_K_M.gguf",
          "bytes": 19362330432,
          "mmprojBytes": 931146336,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.512159048879994,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-GGUF",
          "file": "clairic-Q8_0.gguf",
          "bytes": 28617877088,
          "mmprojBytes": 931146336,
          "checkedAt": "2026-11-21"
        }
      }
    ]
  },
  {
    "id": "clairic-flash-9b",
    "name": "Clairic Flash 9B",
    "family": "Cloudflare Clairic",
    "params": 8.953803264,
    "paramLabel": "9B",
    "categories": [
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
      "layers": 32,
      "attHeads": 16,
      "kvHeads": 4,
      "headDim": 256,
      "attention": {
        "fullLayers": 8
      }
    },
    "addedAt": "2026-11-21",
    "description": {
      "en": "Cloudflare’s smaller Clairic checkpoint derives from Qwen3.5 9B and handles structured extraction from text and images. The official schema helpers use Transformers and XGrammar. This entry tracks the Xylolabs language GGUF and its separate BF16 projector. Eight of 32 layers grow the main KV cache. No per-quant speed or perplexity loss is recorded.",
      "zh": "Cloudflare 基于 Qwen3.5 9B 训练的小型 Clairic 权重，用于文本和图像结构化提取。官方 schema 辅助流程使用 Transformers 和 XGrammar。本条使用 Xylolabs 的 GGUF 语言权重及独立 BF16 投影，32 层中有 8 层主 KV 缓存随上下文增长。 未记录各档速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.191357399920642,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-flash-GGUF",
          "file": "clairic-flash-Q3_K_M.gguf",
          "bytes": 4691073696,
          "mmprojBytes": 921704960,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.083922583716041,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-flash-GGUF",
          "file": "clairic-flash-Q4_K_M.gguf",
          "bytes": 5690055328,
          "mmprojBytes": 921704960,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.810236102145387,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-flash-GGUF",
          "file": "clairic-flash-Q5_K_M.gguf",
          "bytes": 6502963872,
          "mmprojBytes": 921704960,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.517853147236629,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/Xylolabs/clairic-flash-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "Xylolabs/clairic-flash-GGUF",
          "file": "clairic-flash-Q8_0.gguf",
          "bytes": 9533397664,
          "mmprojBytes": 921704960,
          "checkedAt": "2026-11-21"
        }
      }
    ]
  },
  {
    "id": "shot-reader-8b",
    "name": "Shot Reader 8B",
    "family": "Voyager Shot Reader",
    "params": 8.19073536,
    "paramLabel": "8B",
    "categories": [
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
      "layers": 36,
      "attHeads": 32,
      "kvHeads": 8,
      "headDim": 128
    },
    "addedAt": "2026-11-21",
    "description": {
      "en": "Voyager’s Qwen3-VL 8B fine-tune outputs a structured shot description from sampled frames. The indexed GGUF and f16 projector come from mradermacher. The calculator covers the language file, KV cache and optional projector. The publisher’s multi-frame pipeline has additional preprocessing and runtime costs. No per-quant speed or perplexity loss is recorded.",
      "zh": "Voyager 基于 Qwen3-VL 8B 微调，通过抽取视频帧生成结构化镜头描述。本条使用 mradermacher 的 GGUF 和 f16 视觉投影。计算器覆盖语言权重、KV 缓存和可选投影；官方多帧流程另有预处理与运行开销。 未记录各档速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.028125185575523,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mradermacher/shot-reader-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mradermacher/shot-reader-8b-GGUF",
          "file": "shot-reader-8b.Q3_K_M.gguf",
          "bytes": 4124163424,
          "mmprojBytes": 1159030560,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.9107054339013585,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mradermacher/shot-reader-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mradermacher/shot-reader-8b-GGUF",
          "file": "shot-reader-8b.Q4_K_M.gguf",
          "bytes": 5027786080,
          "mmprojBytes": 1159030560,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 5.714861575505719,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mradermacher/shot-reader-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mradermacher/shot-reader-8b-GGUF",
          "file": "shot-reader-8b.Q5_K_M.gguf",
          "bytes": 5851114848,
          "mmprojBytes": 1159030560,
          "checkedAt": "2026-11-21"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.506704566267418,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/mradermacher/shot-reader-8b-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "mradermacher/shot-reader-8b-GGUF",
          "file": "shot-reader-8b.Q8_0.gguf",
          "bytes": 8709520736,
          "mmprojBytes": 1159030560,
          "checkedAt": "2026-11-21"
        }
      }
    ]
  },
  {
    "id": "kormo-web-4b",
    "name": "KORMo-Web-4B",
    "family": "KORMo-Web",
    "params": 4.841450496,
    "paramLabel": "4B",
    "categories": ["instruct", "multimodal"],
    "hardwareTags": ["consumer-gpu", "mac", "cpu-vps"],
    "contextLength": 262144,
    "arch": {
      "layers": 32,
      "attHeads": 16,
      "kvHeads": 4,
      "headDim": 256,
      "attention": { "fullLayers": 8 }
    },
    "addedAt": "2026-11-22",
    "description": {
      "en": "KORMo-VL fine-tuned Qwen3.5-4B to understand browser screenshots in Korean and English. The GGUFs store 4.84B language parameters; image input uses a separate BF16 projector. Only 8 of 32 layers grow the main KV cache. The calculator estimates model memory, not memory for the publisher’s browser harness.",
      "zh": "KORMo-VL 在 Qwen3.5-4B 基础上微调了这款模型，用于理解韩语和英语网页截图。GGUF 存有约 48.4 亿语言参数；图像输入另需 BF16 投影文件。32 层中只有 8 层的主 KV 缓存随上下文增长。计算器估算的是模型内存，不含发布方的浏览器工具。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 4.01,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
          "file": "KORMo-VL_KORMo-Web-4B-Q3_K_M.gguf",
          "bytes": 2427130688,
          "mmprojBytes": 675569408,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.23,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
          "file": "KORMo-VL_KORMo-Web-4B-Q4_K_M.gguf",
          "bytes": 3166776128,
          "mmprojBytes": 675569408,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.15,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
          "file": "KORMo-VL_KORMo-Web-4B-Q5_K_M.gguf",
          "bytes": 3720637248,
          "mmprojBytes": 675569408,
          "checkedAt": "2026-11-22"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.52,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/KORMo-VL_KORMo-Web-4B-GGUF",
          "file": "KORMo-VL_KORMo-Web-4B-Q8_0.gguf",
          "bytes": 5157831488,
          "mmprojBytes": 675569408,
          "checkedAt": "2026-11-22"
        }
      }
    ]
  }
];
