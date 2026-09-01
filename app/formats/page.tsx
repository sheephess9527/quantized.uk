import type { Metadata } from 'next';
import FormatIndexView from '@/components/formats/FormatIndexView';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quantization format comparisons — GGUF, AWQ, EXL2, GPTQ | quantized.uk',
  description:
    'GGUF vs AWQ, GGUF vs EXL2, AWQ vs GPTQ and more — compared on hardware support, runtime, quality and the models this index actually ships in each format.',
  path: '/formats/',
});

export default function FormatIndexPage() {
  return <FormatIndexView />;
}
