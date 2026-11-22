import { pageMetadata } from '@/lib/seo';

export const metadata = { ...pageMetadata({ title: '显存适配嵌入卡片 | quantized.uk', description: '在网站嵌入紧凑的模型显存适配卡片：展示模型、量化、上下文、显卡与预计内存需求，并链接到 quantized.uk 完整计算器以查看详细估算。', path: '/zh/embed/fit/' }), robots: { index: false, follow: true } };

export { default } from '../../../embed/fit/page';
