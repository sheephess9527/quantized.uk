import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: '量化格式选择向导 | quantized.uk',
  description: '回答三个问题（NVIDIA / AMD / Mac / CPU），获得针对你硬件的 GGUF、AWQ 或 EXL2 推荐。',
  path: '/zh/tools/format-wizard',
});

export { default } from '../../../tools/format-wizard/page';
