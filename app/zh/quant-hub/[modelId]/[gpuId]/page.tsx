import PairPage, {
  pairMetadata,
} from '../../../../quant-hub/[modelId]/[gpuId]/page';
export { generateStaticParams } from '../../../../quant-hub/[modelId]/[gpuId]/page';
type Params = { modelId: string; gpuId: string };
export function generateMetadata({ params }: { params: Params }) {
  return pairMetadata(params, 'zh');
}
export default function ZhPairPage({ params }: { params: Params }) {
  return <PairPage params={params} lang="zh" />;
}
