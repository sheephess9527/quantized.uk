export const localGuides = {
  'what-llm-can-i-run-locally': {
    en: ['What LLM Can I Run Locally? Check Your GPU', 'Select your GPU to find local models, quantization levels and context lengths within its memory budget. Compare options before downloading weights.'],
    zh: ['我的显卡能跑哪些本地大模型？', '选择显卡，按显存查找可运行的大模型、量化版本和上下文长度。支持按设备反查，并可调整输入类型、量化档位与上下文后重新估算。'],
  },
  'best-llm-to-run-locally': {
    en: ['Best Local LLMs for 8–32 GB GPUs', 'Compare up to three catalog picks per GPU memory tier for chat, coding and multimodal tasks, with quantization levels and estimated memory at 4K context.'],
    zh: ['8G 到 32G 显存，本地大模型怎么选？', '按显存容量和用途选模型，查看对应量化档位和预计占用。覆盖五种显存容量，比较对话、编程和多模态用途，并可进入每档的详细推荐。'],
  },
  'local-llm-gpu-requirements': {
    en: ['Local LLM GPU Requirements by Model Size', 'Compare five GPUs across model sizes at 4K context. Each populated cell links to a model and its quantization details.'],
    zh: ['本地部署大模型需要多少显存？', '对照常见显卡和模型参数规模，查看 4K 上下文时的量化档位和预计显存。表中每个示例都链接到模型详情，方便继续查看其他量化版本的内存开销。'],
  },
  'local-llm-without-gpu': {
    en: ['Run a Local LLM Without a Dedicated GPU', 'Find GGUF models for CPU-only PCs by system RAM and for Apple silicon Macs by unified memory, with quantization levels and 4K memory estimates.'],
    zh: ['没有独立显卡，能跑多大的本地模型？', '按内存容量查看纯 CPU 电脑和苹果芯片 Mac 可选的 GGUF 模型。分别对照系统内存与统一内存，查看四千上下文下的量化版本和预计内存占用。'],
  },
} as const;

export type LocalGuide = keyof typeof localGuides;
export const localGuideSlugs = Object.keys(localGuides) as LocalGuide[];
