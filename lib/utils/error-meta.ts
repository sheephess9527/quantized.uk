import type { Metadata } from 'next';
import { fitTitle, pageMetadata } from '@/lib/seo';
import { errorById } from '@/lib/data/errors';

/** Metadata for `/errors/<id>/` and its `/zh` mirror. */
export function errorMetadata(id: string, lang: 'en' | 'zh'): Metadata {
  const err = errorById(id);
  if (!err) return { title: 'Not found | quantized.uk' };
  return pageMetadata({
    title: fitTitle(err.title[lang]),
    description: err.summary[lang],
    path: `${lang === 'zh' ? '/zh' : ''}/errors/${err.id}`,
  });
}
