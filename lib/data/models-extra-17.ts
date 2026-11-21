import type { QuantModel } from './types';

/** Original cards, configs and GGUF headers/tree sizes checked 2026-11-21.
 * See docs/changes/2026-11-21-patrol.md for exact sources and sizing scope. */
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
  }
];
