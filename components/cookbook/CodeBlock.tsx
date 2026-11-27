'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface Props {
  lang: string;
  content: string;
}

export default function CodeBlock({ lang, content }: Props) {
  const { t } = useLanguage();
  const c = t.cookbook.code;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* denied */ }
  }, [content]);

  return (
    <div className="code-block">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-ink/[0.07]">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-400 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? c.copied : c.copy}
        </button>
      </div>
      <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
        <code>{content}</code>
      </pre>
    </div>
  );
}