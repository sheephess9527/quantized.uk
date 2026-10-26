import type { Metadata } from 'next';
import { errorMetadata } from '@/lib/utils/error-meta';

export { generateStaticParams, default } from '../../../errors/[id]/page';

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return errorMetadata(params.id, 'zh');
}
