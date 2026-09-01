import type { Metadata } from 'next';
import FormatIndexView from '@/components/formats/FormatIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '量化格式对比 — GGUF、AWQ、EXL2、GPTQ | quantized.uk',
  description: 'GGUF 与 AWQ、GGUF 与 EXL2、AWQ 与 GPTQ 等对比：从硬件支持、运行时、质量，以及本索引各格式实际收录的模型出发。',
  path: '/zh/formats/',
});

export default function ZhFormatIndexPage() {
  return <FormatIndexView />;
}
