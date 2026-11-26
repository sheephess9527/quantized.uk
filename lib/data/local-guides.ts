export const localGuides = {
  'what-llm-can-i-run-locally': {
    en: ['Which Local LLM Fits My GPU?', 'Select your exact GPU and context length to find local LLM sizes and quantization levels within its memory budget. Compare options before downloading.'],
    zh: ['我的显存能跑多大的本地大模型？', '选择显卡，按可用显存和上下文估算本地大模型能跑多大、哪些量化档位有余量。也可切换图像输入后重新估算。'],
  },
  'best-llm-to-run-locally': {
    en: ['Local LLM Picks for 8–32GB VRAM', 'Start with your GPU memory tier, then compare local LLM picks for chat, coding and images. See quantization levels and estimated memory at 4K.'],
    zh: ['8–32GB 显存能跑多大的本地大模型？', '按显存容量和用途，对照能跑多大的本地大模型、建议量化档位和 4K 上下文显存估算。可进入各档位查看详细推荐。'],
  },
  'local-llm-gpu-requirements': {
    en: ['Local LLM VRAM Requirements by Model Size', 'Compare five GPUs with different local LLM sizes at 4K context. Each example names a model and quantization that fits with estimated memory headroom.'],
    zh: ['本地大模型显存对照表：能跑多大？', '按显卡和模型参数量对照，估算 4K 上下文能跑多大的本地大模型。每个示例列出量化档位和预计显存，并链接到模型详情。'],
  },
  'local-llm-without-gpu': {
    en: ['Run a Local LLM Without a Dedicated GPU', 'Find GGUF models for CPU-only PCs by system RAM and for Apple silicon Macs by unified memory, with quantization levels and 4K memory estimates.'],
    zh: ['没有独立显卡，能跑多大的本地模型？', '按内存容量查看纯 CPU 电脑和苹果芯片 Mac 可选的 GGUF 模型。分别对照系统内存与统一内存，查看四千上下文下的量化版本和预计内存占用。'],
  },
} as const;

export type LocalGuide = keyof typeof localGuides;
export const localGuideSlugs = Object.keys(localGuides) as LocalGuide[];
