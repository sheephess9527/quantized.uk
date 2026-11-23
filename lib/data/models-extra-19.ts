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
  }
];
