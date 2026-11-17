import type { QuantModel } from './types';

/** Original cards/configs/licences, official GGUF listings and tensor headers read 2026-11-17.
 * Pocket BF16-derived Q8_0 and QAT Q4_1 have different output-table layouts; never merge them.
 * Params are actual stored GGUF tensor counts, not rounded model names or tokenizer bytes.
 * BotPsy's 6/24 cache layers follow qwen35.cpp; no projector is published in its GGUF pack.
 * Exact revisions, byte counts and limitations: docs/changes/2026-11-17-patrol.md. */
export const extraModels15: QuantModel[] = [
  {
    "family": "Alibaba MNN Pocket",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 32768,
    "arch": {
      "layers": 28,
      "attHeads": 14,
      "kvHeads": 2,
      "headDim": 64
    },
    "addedAt": "2026-11-17",
    "id": "mnn-pocket-0-3b",
    "name": "MNN-Pocket 0.3B Instruct",
    "params": 0.361551232,
    "paramLabel": "0.36B",
    "description": {
      "en": "A compact Chinese/English instruction model from Alibaba MNN. This entry uses the official BF16-derived Q8_0 export with 361,551,232 stored parameters, including its separate output table. The QAT Q4_1 checkpoint has tied embeddings and is indexed separately. The publisher advertises 32K context; config and GGUF headers allow 40,960, but this entry keeps the documented 32K scope. No measured speed or perplexity loss is recorded.",
      "zh": "阿里 MNN 发布的中英双语轻量指令模型。本条采用官方由 BF16 转换的 Q8_0 文件，含独立输出表，共存储 361,551,232 个参数。QAT Q4_1 权重使用共享嵌入，单独收录。发布说明标注 32K 上下文；配置和 GGUF 文件头为 40,960，本条保留文档说明的 32K 范围。未记录实测速度或困惑度损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.557603698056269,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "taobao-mnn/MNN-Pocket-0.3B-GGUF",
          "file": "MNN-Pocket-0.3B-Instruct-Q8_0.gguf",
          "bytes": 386751520,
          "checkedAt": "2026-11-17"
        }
      }
    ]
  },
  {
    "family": "Alibaba MNN Pocket",
    "categories": [
      "general",
      "instruct"
    ],
    "hardwareTags": [
      "consumer-gpu",
      "mac",
      "cpu-vps"
    ],
    "contextLength": 32768,
    "arch": {
      "layers": 28,
      "attHeads": 14,
      "kvHeads": 2,
      "headDim": 64
    },
    "addedAt": "2026-11-17",
    "id": "mnn-pocket-0-3b-qat",
    "name": "MNN-Pocket 0.3B QAT",
    "params": 0.302830976,
    "paramLabel": "0.30B",
    "description": {
      "en": "The official QAT checkpoint converted to GGUF Q4_1 while preserving its trained 4-bit codes. Its tied input/output embeddings leave 302,830,976 stored parameters; this is a distinct checkpoint from the BF16-derived Q8_0 entry. All 28 layers use full GQA attention. Context is conservatively limited to the publisher-documented 32K despite 40,960 in the config and GGUF header. Task benchmark differences are not converted into a perplexity-loss percentage.",
      "zh": "官方 QAT 权重转换的 GGUF Q4_1，保留训练得到的 4-bit 编码。输入、输出嵌入共享，共存储 302,830,976 个参数；与由 BF16 转换的 Q8_0 条目是不同权重。28 层均为完整 GQA 注意力。虽然配置和 GGUF 文件头写明 40,960，本条按发布文档保守限定为 32K 上下文。不把任务跑分差异换算成困惑度损失百分比。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_1",
        "bpw": 5.069406691077732,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "taobao-mnn/MNN-Pocket-0.3B-GGUF",
          "file": "MNN-Pocket-0.3B-Instruct-Q4_1.gguf",
          "bytes": 191896672,
          "checkedAt": "2026-11-17"
        }
      }
    ]
  },
  {
    "id": "botpsy-0-8b",
    "name": "BotPsy 0.8B",
    "family": "QVAC BotPsy",
    "params": 0.752393024,
    "paramLabel": "0.75B",
    "categories": [
      "general",
      "instruct"
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
    "addedAt": "2026-11-17",
    "description": {
      "en": "QVAC/Tether’s Qwen3.5-based model for tool calling and on-device assistant workflows. The published GGUFs contain 752,393,024 language parameters; the original repository’s larger total includes the vision tower. These files are text-only and ship no projector, so image use is not offered here. Six of 24 layers keep growing KV caches; fixed recurrent state is not separately sized. No measured speed or perplexity-loss percentage is recorded.",
      "zh": "QVAC/Tether 基于 Qwen3.5 训练的工具调用、端侧助手模型。已发布 GGUF 含 752,393,024 个语言参数；原始仓库较大的总数还计入视觉网络。这些文件仅含文本权重，未提供视觉投影文件，因此本站不提供读图选项。24 层中只有 6 层保留随上下文增长的 KV 缓存，固定循环状态未单独估算。未记录实测速度或困惑度损失百分比。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.627877379150182,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/qvac/BotPsy-0.8B-GGUFs",
        "confidence": "estimated",
        "source": {
          "repo": "qvac/BotPsy-0.8B-GGUFs",
          "file": "botpsy-0.8b-q4_k_m-imat.gguf",
          "bytes": 529296960,
          "checkedAt": "2026-11-17"
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.632116610374101,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/qvac/BotPsy-0.8B-GGUFs",
        "confidence": "estimated",
        "source": {
          "repo": "qvac/BotPsy-0.8B-GGUFs",
          "file": "botpsy-0.8b-q8_0.gguf",
          "bytes": 811843040,
          "checkedAt": "2026-11-17"
        }
      }
    ]
  }
];
