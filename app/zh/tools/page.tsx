import type { Metadata } from 'next';
import ToolIndexView from '@/components/tools/ToolIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '本地大模型工具 — 显存计算器、启动命令、格式选择 | quantized.uk',
  description:
    '四个跑本地量化模型的工具：估算任意「模型 × 量化 × 上下文」的显存、生成可直接运行的 llama.cpp / Ollama / vLLM 命令、按硬件挑量化格式、逐项对比两个模型。',
  path: '/zh/tools/',
});

export default function ZhToolIndexPage() {
  return <ToolIndexView />;
}
