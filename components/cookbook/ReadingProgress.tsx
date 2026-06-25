'use client';

import { useEffect, useState } from 'react';

interface Props {
  targetId: string;
}

export default function ReadingProgress({ targetId }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.scrollY;
      const elHeight = el.offsetHeight;
      const viewH = window.innerHeight;
      const scrollable = elHeight - viewH * 0.4;
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }
      const scrolled = window.scrollY - elTop + viewH * 0.25;
      setProgress(Math.min(100, Math.max(0, (scrolled / scrollable) * 100)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetId]);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-14 left-0 right-0 h-0.5 z-50 pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}