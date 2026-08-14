'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/routing';

type Props = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for `next/link` that keeps a reader inside their
 * language tree. Components are shared between `/` and `/zh/**`, so a bare
 * `href="/cookbook/"` would silently throw a Chinese reader back to English.
 *
 * External hrefs, anchors and already-prefixed paths pass through untouched
 * (see `localizeHref`).
 */
export default function LocalLink({ href, ...rest }: Props) {
  const { lang } = useLanguage();
  const localized = typeof href === 'string' ? localizeHref(href, lang) : href;
  return <NextLink href={localized} {...rest} />;
}
