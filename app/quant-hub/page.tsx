'use client';

import { Suspense } from 'react';
import QuantHubContent from '@/components/hub/QuantHubContent';

export default function QuantHubPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="glass rounded-2xl p-8 text-center text-slate-600 text-sm">Loading...</div>
      </div>
    }>
      <QuantHubContent />
    </Suspense>
  );
}