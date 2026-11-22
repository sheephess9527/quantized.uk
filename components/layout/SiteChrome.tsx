'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SkipToContent from './SkipToContent';
import Plausible from '@/components/analytics/Plausible';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (/^\/(zh\/)?embed\//.test(pathname ?? '')) return <main id="main-content">{children}</main>;
  return <><Plausible /><SkipToContent /><Navbar /><main id="main-content" tabIndex={-1} className="min-h-screen pt-[env(safe-area-inset-top)]">{children}</main><Footer /></>;
}
