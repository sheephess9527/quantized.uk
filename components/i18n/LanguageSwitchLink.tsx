'use client';

import { useEffect, useState, type ComponentProps, type SyntheticEvent } from 'react';
import { usePathname } from 'next/navigation';
import { mirrorPath } from '@/lib/i18n/routing';

export default function LanguageSwitchLink(props: ComponentProps<'a'>) {
  const pathname = usePathname();
  const [suffix, setSuffix] = useState('');
  const href = mirrorPath(pathname ?? '/');

  useEffect(() => {
    const update = () => setSuffix(window.location.search + window.location.hash);
    update();
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, [pathname]);

  const updateHref = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = href + window.location.search + window.location.hash;
  };

  return <a {...props} href={href + suffix} onFocus={updateHref} onPointerDown={updateHref} onClick={updateHref} onAuxClick={updateHref} />;
}
