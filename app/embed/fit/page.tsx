import EmbedFit from '@/components/tools/EmbedFit';
import { pageMetadata } from '@/lib/seo';

export const metadata = { ...pageMetadata({ title: 'GPU fit embed | quantized.uk', description: 'Embed a compact GPU fit card with model, quantization, context and estimated memory requirements, linked to the full quantized.uk calculator.', path: '/embed/fit/' }), robots: { index: false, follow: true } };

export default function EmbedFitPage() { return <EmbedFit />; }
