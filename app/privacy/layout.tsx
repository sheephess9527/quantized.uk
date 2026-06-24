import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | quantized.uk',
  description: 'How quantized.uk handles data, cookies, analytics, and local storage.',
  openGraph: { title: 'Privacy Policy | quantized.uk' },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}