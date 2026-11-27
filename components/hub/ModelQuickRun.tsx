'use client';

import { useState } from 'react';
import Link from '@/components/i18n/LocalLink';
import { Check, Copy, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface QuickRunTab {
  id: string;
  label: string;
  command: string;
  isTemplate: boolean;
}

interface Props {
  tabs: QuickRunTab[];
  title: string;
  subtitle: string;
  copyLabel: string;
  copyTemplateLabel: string;
  copiedLabel: string;
  cliHref: string;
  openCliLabel: string;
}

export default function ModelQuickRun({
  tabs,
  title,
  subtitle,
  copyLabel,
  copyTemplateLabel,
  copiedLabel,
  cliHref,
  openCliLabel,
}: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (tabs.length === 0) return null;
  const active = tabs.find(t => t.id === activeId) ?? tabs[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.command);
      setCopiedId(active.id);
      setTimeout(() => setCopiedId(prev => (prev === active.id ? null : prev)), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Terminal size={14} className="text-cyan-400 shrink-0" aria-hidden />
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {tabs.length > 1 && (
            <div className="inline-flex rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.07]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active.id === tab.id}
                  onClick={() => setActiveId(tab.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    active.id === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-colors"
          >
            {copiedId === active.id ? (
              <>
                <Check size={13} className="text-emerald-400" aria-hidden />
                {copiedLabel}
              </>
            ) : (
              <>
                <Copy size={13} aria-hidden />
                {active.isTemplate ? copyTemplateLabel : copyLabel}
              </>
            )}
          </button>
        </div>
      </div>

      <pre className="p-4 sm:px-5 text-xs font-mono text-slate-300 bg-[#0b0c11] overflow-x-auto leading-relaxed max-h-56">
        <code>{active.command}</code>
      </pre>

      <div className="px-4 sm:px-5 py-2.5 border-t border-white/[0.05] bg-white/[0.015] flex justify-end">
        <Link href={cliHref} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          {openCliLabel}
        </Link>
      </div>
    </section>
  );
}
