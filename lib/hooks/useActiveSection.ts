'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(sectionCount: number, idPrefix: string, offset = 120) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (sectionCount === 0) return;

    const update = () => {
      let active = 0;
      for (let i = 0; i < sectionCount; i++) {
        const el = document.getElementById(`${idPrefix}${i}`);
        if (el && el.getBoundingClientRect().top <= offset) active = i;
      }
      setActiveIndex(active);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sectionCount, idPrefix, offset]);

  return activeIndex;
}