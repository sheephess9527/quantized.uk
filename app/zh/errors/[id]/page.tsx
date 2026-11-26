import type { Metadata } from 'next';
import { errorById } from '@/lib/data/errors';
import { articles } from '@/lib/data/cookbook';
import { errorMetadata } from '@/lib/utils/error-meta';
import { ErrorDetailView } from '@/components/errors/ErrorViews';

export { generateStaticParams } from '../../../errors/[id]/page';

export default function ZhErrorPage({ params }: { params: { id: string } }) {
  const guides = (errorById(params.id)?.guides ?? []).flatMap(g => {
    const a = articles.find(x => x.id === g);
    return a ? [{ id: a.id, title: a.title, titleZh: a.titleZh }] : [];
  });
  return <ErrorDetailView id={params.id} guides={guides} lang="zh" />;
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return errorMetadata(params.id, 'zh');
}
