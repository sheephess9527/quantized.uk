'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useTheme, type ThemeMode } from '@/lib/theme/context';
import { cn } from '@/lib/utils/cn';

const OPTIONS: { id: ThemeMode; Icon: typeof Sun; key: 'themeLight' | 'themeDark' | 'themeSystem' }[] = [
  { id: 'light',  Icon: Sun,     key: 'themeLight'  },
  { id: 'dark',   Icon: Moon,    key: 'themeDark'   },
  { id: 'system', Icon: Monitor, key: 'themeSystem' },
];

export default function ThemeToggle({ expanded = false }: { expanded?: boolean }) {
  const { mode, hydrated, setMode } = useTheme();
  const { t } = useLanguage();

  if (expanded) {
    return (
      <div role="group" aria-label={t.nav.themeLabel} className="grid grid-cols-3 gap-1.5">
        {OPTIONS.map(({ id, Icon, key }) => {
          const active = hydrated && mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={active}
              className={cn(
                'min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 border transition-colors',
                active
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'bg-ink/[0.03] text-slate-400 border-ink/[0.08] hover:text-slate-200',
              )}
            >
              <Icon size={13} aria-hidden />
              <span>{t.nav[key]}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t.nav.themeLabel}
      className="hidden sm:inline-flex items-center p-0.5 rounded-lg border border-ink/[0.08] bg-ink/[0.03]"
    >
      {OPTIONS.map(({ id, Icon, key }) => {
        const active = hydrated && mode === id;
        const label = t.nav[key];
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={active}
            aria-label={`${t.nav.themeLabel}: ${label}`}
            title={`${t.nav.themeLabel}: ${label}`}
            className={cn(
              'w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors',
              active
                ? 'bg-sky-500/15 text-sky-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-ink/[0.05]',
            )}
          >
            <Icon size={13} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
