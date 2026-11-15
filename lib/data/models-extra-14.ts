import type { QuantModel } from './types';

/** Primary configs, metadata, licences and GGUF listings read 2026-11-15.
 * Arete: NousResearch/Arete-27B (revision 108f0afbdcfaa1ceeda4a635004304dfff6d4da2).
 * params is the publisher's Hub safetensors total; bpw is derived from language-GGUF
 * bytes over that same count, so the projector is never added to weight memory twice.
 * Its 16/64 growing-cache layout is confirmed in llama.cpp b12409 qwen35.cpp.
 * TwIL: webAI-Official/TwIL-8B (revision 9563ba7dfb70eeca4a26654b195011cbf818e7d9), balanced only.
 * 2*4096*100352 + 40*(2*4096^2 + 2*4096*8*128 + 3*4096*12800 + 2*4096) + 4096
 * = 8,791,592,960, matching official safetensors. Granite cache is conventional GQA.
 * No measured speed or perplexity is inferred from file bytes or a parent model.
 */
export const extraModels14: QuantModel[] = [
  {
    "id": "arete-27b",
    "name": "Arete 27B",
    "family": "Nous Research Arete",
    "params": 27.35672856,
    "paramLabel": "27B",
    "categories": [
      "general",
      "instruct",
      "code",
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
        "fullLayers": 16,
        "note": {
          "en": "16 full-attention layers grow a KV cache; 48 Gated DeltaNet layers keep fixed recurrent state, which is not separately sized.",
          "zh": "16 层全注意力保留随上下文增长的 KV 缓存；48 层 Gated DeltaNet 保留固定循环状态，未单独估算。"
        }
      }
    },
    "addedAt": "2026-11-15",
    "description": {
      "en": "Nous Research post-trained Qwen3.8 27B for general assistance and agentic use without changing its architecture. Only 16 of 64 layers grow a KV cache. Memory is estimated from bartowski GGUF files; the separate vision projector is optional and its bytes are recorded. Quantization quality loss and speed for these files have not been verified.",
      "zh": "Nous Research 在 Qwen3.8 27B 上做后训练，用于通用助手和智能体任务，架构保持不变。64 层中只有 16 层的 KV 缓存随上下文增长。内存按 bartowski GGUF 文件估算；另有可选的视觉编码器，已记录字节数。尚未核实这些文件的量化质量损失和速度。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q3_K_M",
        "bpw": 3.849895205159721,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/NousResearch_Arete-27B-GGUF",
          "file": "NousResearch_Arete-27B-Q3_K_M.gguf",
          "bytes": 13165067264,
          "checkedAt": "2026-11-15",
          "mmprojBytes": 927607104
        }
      },
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 5.030840153644453,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/NousResearch_Arete-27B-GGUF",
          "file": "NousResearch_Arete-27B-Q4_K_M.gguf",
          "bytes": 17203416064,
          "checkedAt": "2026-11-15",
          "mmprojBytes": 927607104
        }
      },
      {
        "format": "GGUF",
        "level": "Q5_K_M",
        "bpw": 6.048937653823034,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/NousResearch_Arete-27B-GGUF",
          "file": "NousResearch_Arete-27B-Q5_K_M.gguf",
          "bytes": 20684893184,
          "checkedAt": "2026-11-15",
          "mmprojBytes": 927607104
        }
      },
      {
        "format": "GGUF",
        "level": "Q8_0",
        "bpw": 8.382601298581587,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF",
        "confidence": "estimated",
        "source": {
          "repo": "bartowski/NousResearch_Arete-27B-GGUF",
          "file": "NousResearch_Arete-27B-Q8_0.gguf",
          "bytes": 28665068544,
          "checkedAt": "2026-11-15",
          "mmprojBytes": 927607104
        }
      }
    ]
  },
  {
    "id": "twil-8b-balanced",
    "name": "TwIL 8B balanced",
    "family": "webAI TwIL",
    "params": 8.79159296,
    "paramLabel": "8.8B",
    "categories": [
      "general",
      "instruct",
      "code"
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
      "headDim": 128
    },
    "addedAt": "2026-11-15",
    "description": {
      "en": "A reasoning model for maths, code and instruction following, post-trained from IBM Granite 4.2 8B. This entry is the balanced checkpoint only; verbose is a distinct set of weights and its files are not mixed into these levels. All 40 layers keep a growing KV cache. The webAI licence permits non-commercial research and education only. Quantization quality loss has not been published.",
      "zh": "基于 IBM Granite 4.2 8B 后训练的推理模型，用于数学、代码与指令遵循。本条只收录 balanced 权重；verbose 是另一套权重，不混入本条量化档位。40 层均保留随上下文增长的 KV 缓存。webAI 许可仅允许非商业研究和教育用途。未公布量化质量损失。"
    },
    "quants": [
      {
        "format": "GGUF",
        "level": "Q4_K_M",
        "bpw": 4.866392329428318,
        "vramGB": 0,
        "hfSearchUrl": "https://huggingface.co/webAI-Official/TwIL-8B",
        "confidence": "estimated",
        "source": {
          "repo": "webAI-Official/TwIL-8B",
          "file": "TwIL-8B-Q4_K_M-balanced.gguf",
          "bytes": 5347917568,
          "checkedAt": "2026-11-15"
        }
      }
    ]
  }
];
