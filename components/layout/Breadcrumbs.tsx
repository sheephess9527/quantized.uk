'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { canonical } from '@/lib/seo';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: canonical(item.href) } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={10} className="text-slate-700 shrink-0" />}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-violet-300 transition-colors truncate max-w-[12rem] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'text-slate-400 truncate max-w-[14rem] sm:max-w-xs' : 'truncate'}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}