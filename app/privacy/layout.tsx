import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | quantized.uk',
  description: 'How quantized.uk handles analytics, local storage, cookies, and third-party services: which analytics run and what stays in your browser.',
  path: '/privacy',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}