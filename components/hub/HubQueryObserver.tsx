'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/** Keep this observer inside its own Suspense boundary, beside the Hub content.
 * Only this null-rendering leaf may opt out of static prerendering; placing the
 * whole Hub below that boundary would remove the model index from the export.
 */
export default function HubQueryObserver({ onChange }: { onChange: (query: string) => void }) {
  const params = useSearchParams();
  const query = params.toString();

  useEffect(() => {
    onChange(query);
  }, [query, onChange]);

  return null;
}
