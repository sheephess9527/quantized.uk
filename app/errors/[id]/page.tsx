import type { Metadata } from 'next';
import { runtimeErrors } from '@/lib/data/errors';
import { errorMetadata } from '@/lib/utils/error-meta';
import { ErrorDetailView } from '@/components/errors/ErrorViews';

export function generateStaticParams() {
  return runtimeErrors.map(e => ({ id: e.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  return errorMetadata(params.id, 'en');
}

export default function ErrorPage({ params }: { params: { id: string } }) {
  return <ErrorDetailView id={params.id} />;
}
