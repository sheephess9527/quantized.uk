'use client';

import dynamic from 'next/dynamic';

// Recharts is ~90 kB of the first-load bundle; the radar sits below the fold,
// so load it after hydration. Skeleton mirrors FormatRadar's layout to avoid CLS.
const FormatRadar = dynamic(() => import('./FormatRadar'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4">
        <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-56 rounded bg-white/[0.04] animate-pulse mt-2" />
      </div>
      <div className="h-8 rounded bg-white/[0.03] animate-pulse mb-4" />
      <div className="h-64 rounded-xl bg-white/[0.03] animate-pulse" />
    </div>
  ),
});

export default FormatRadar;
