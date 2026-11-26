import type { Metadata } from 'next';
import { runtimeErrors, errorById } from '@/lib/data/errors';
import { articles } from '@/lib/data/cookbook';
import { errorMetadata } from '@/lib/utils/error-meta';
import { ErrorDetailView } from '@/components/errors/ErrorViews';

export function generateStaticParams() {
  return runtimeErrors.map(e => ({ id: e.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return errorMetadata(params.id, 'en');
}

export default function ErrorPage({ params }: { params: { id: string } }) {
  const guides = (errorById(params.id)?.guides ?? []).flatMap(g => {
    const a = articles.find(x => x.id === g);
    return a ? [{ id: a.id, title: a.title, titleZh: a.titleZh }] : [];
  });
  return <ErrorDetailView id={params.id} guides={guides} lang="en" />;
}
