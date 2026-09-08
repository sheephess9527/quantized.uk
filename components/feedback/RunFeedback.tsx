'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useHardwareProfile } from '@/lib/hardware-profile/context';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils/cn';

const CONTACT = 'hello@quantized.uk';

/**
 * "Did this actually run?" — the only outcome signal on the site that is not a
 * proxy for one.
 *
 * Copying a command is not success; it is the moment before you find out. The
 * CLI generator already records a `CLI Copy` event, and reading that as
 * "worked" would turn the most common click on the page into evidence for
 * something nobody observed. This asks afterwards instead.
 *
 * There is no backend. "It ran" records a single anonymous count; "I hit a
 * problem" opens a correction email in the reader's own client — and shows the
 * exact text first, because a prefilled mailto that carries the reader's setup
 * without displaying it is not something to spring on anyone. Only the page
 * and the configuration already visible in the UI go into it: no identifiers,
 * no storage contents, nothing the reader has not already seen.
 */
export default function RunFeedback({ subject, context }: { subject: string; context?: string }) {
  const { t } = useLanguage();
  const { config, hydrated } = useHardwareProfile();
  const [outcome, setOutcome] = useState<'ok' | 'problem' | null>(null);
  const f = t.feedback;

  const setup = hydrated
    ? [
        config.gpuId && `GPU: ${config.gpuId}`,
        config.modelId && `Model: ${config.modelId}`,
        config.quantLevel && `Quant: ${config.quantLevel}`,
        config.contextLen && `Context: ${config.contextLen}`,
      ].filter(Boolean).join('\n')
    : '';

  const body = [
    `${f.bodyPage}: ${typeof window === 'undefined' ? '' : window.location.href}`,
    context ? `${f.bodyContext}: ${context}` : '',
    setup ? `\n${f.bodySetup}:\n${setup}` : '',
    `\n${f.bodyPrompt}\n`,
  ].filter(Boolean).join('\n');

  const href = `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const record = (o: 'ok' | 'problem') => {
    setOutcome(o);
    // Named for what it is. `CLI Copy` stays a copy; this is the only event
    // that claims anything about a run, and only a person can produce it.
    trackEvent('Run Outcome', { outcome: o, subject });
  };

  return (
    <section className="glass rounded-2xl p-5 mt-6">
      <h2 className="text-sm font-semibold text-slate-300">{f.title}</h2>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.subtitle}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => record('ok')}
          aria-pressed={outcome === 'ok'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 min-h-[44px] text-xs font-medium transition-all',
            outcome === 'ok'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
              : 'text-slate-400 border-white/[0.08] hover:text-slate-200 hover:border-white/15',
          )}
        >
          <CheckCircle2 size={13} /> {f.itRan}
        </button>
        <button
          type="button"
          onClick={() => record('problem')}
          aria-pressed={outcome === 'problem'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 min-h-[44px] text-xs font-medium transition-all',
            outcome === 'problem'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
              : 'text-slate-400 border-white/[0.08] hover:text-slate-200 hover:border-white/15',
          )}
        >
          <AlertTriangle size={13} /> {f.hadProblem}
        </button>
      </div>

      {outcome === 'ok' && <p className="text-xs text-emerald-300/90 mt-3">{f.thanks}</p>}

      {outcome === 'problem' && (
        <div className="mt-3">
          <p className="text-xs text-slate-400 leading-relaxed">{f.willSend}</p>
          <pre className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[11px] font-mono text-slate-400 whitespace-pre-wrap break-words">
{body.trim()}
          </pre>
          <a
            href={href}
            className="inline-flex items-center gap-1.5 min-h-[44px] mt-2 text-xs font-medium text-amber-300 hover:text-amber-200"
          >
            <Mail size={12} /> {f.openMail}
          </a>
          <p className="text-xs text-slate-500 mt-1">{f.mailNote}</p>
        </div>
      )}
    </section>
  );
}
