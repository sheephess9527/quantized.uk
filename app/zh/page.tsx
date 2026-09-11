import type { Metadata } from 'next';
import { pageMetadata, MODEL_COUNT } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  // 与英文站同一逻辑：写读者会搜的问题，而不是站点的自我描述。
  title: `我的显卡能跑什么大模型？— 显存计算器与 ${MODEL_COUNT} 个模型索引 | quantized.uk`,
  description: `选一张显卡，看看 ${MODEL_COUNT} 个量化模型里哪些真的装得下 —— 用哪个量化档位、还剩多少显存，以及每个模型可直接运行的命令。`,
  path: '/zh',
});

export { default } from '../page';
