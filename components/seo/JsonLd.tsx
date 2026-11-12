/**
 * Kept free of data imports: client components (Breadcrumbs, tool pages) import this, and the
 * site-wide block that reads the changelog used to live here — which put the whole changelog
 * (~205 kB) into every page's JavaScript. That block is `SiteJsonLd.tsx` now.
 */
interface Props {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
