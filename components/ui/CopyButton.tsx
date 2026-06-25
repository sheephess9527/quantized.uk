'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function CopyButton({ text, label, copiedLabel, className, size = 'md' }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [text]);

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
      {copied ? <Check size={iconSize} className="text-emerald-400" /> : <Copy size={iconSize} />}
      {copied ? copiedLabel : label}
    </button>
  );
}