'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  text: string;
  label: string;
  copiedLabel: string;
  failedLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CopyButton({ text, label, copiedLabel, failedLabel, className, size = 'md' }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
      setTimeout(() => setStatus(current => current === 'copied' ? 'idle' : current), 2000);
    } catch {
      if (failedLabel) setStatus('failed');
    }
  }, [text, failedLabel]);

  const iconSize = size === 'sm' ? 10 : 14;

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        size === 'sm'
          ? 'text-xs text-slate-500 hover:text-slate-300'
          : 'px-4 py-2 rounded-xl glass glass-hover text-slate-300 text-sm font-semibold',
        className,
      )}
    >
      {status === 'copied' ? <Check size={iconSize} className="text-emerald-400" /> : <Copy size={iconSize} />}
      {failedLabel ? (
        <span aria-live="polite">{status === 'failed' ? failedLabel : status === 'copied' ? copiedLabel : label}</span>
      ) : status === 'copied' ? copiedLabel : label}
    </button>
  );
}