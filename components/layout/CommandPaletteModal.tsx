'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Cpu, BookOpen, AlertTriangle, Wrench, Box, CornerDownLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/routing';
import { models } from '@/lib/data/models';
import { gpuDatabase, gpuDisplayName } from '@/lib/data/gpus';
import { gpuSlug } from '@/lib/utils/gpu-page';
import { articles } from '@/lib/data/cookbook';
import { runtimeErrors } from '@/lib/data/errors';
import { modelMatchesQuery } from '@/lib/utils/model-search';
import { isSuperseded } from '@/lib/utils/model-meta';
import { readingMinutes } from '@/lib/utils/reading-time';
import { cn } from '@/lib/utils/cn';

interface PaletteItem {
  id: string;
  group: 'tools' | 'models' | 'gpus' | 'guides' | 'errors';
  title: string;
  meta?: string;
  href: string;
}

export default function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const toolItems: PaletteItem[] = useMemo(() => [
    { id: 'tool-vram', group: 'tools', title: t.nav.vramCalc, meta: '/tools/vram-calc/', href: '/tools/vram-calc/' },
    { id: 'tool-cli', group: 'tools', title: t.nav.cliGen, meta: '/tools/cli-gen/', href: '/tools/cli-gen/' },
    { id: 'tool-compare', group: 'tools', title: t.nav.modelCompare, meta: '/tools/compare/', href: '/tools/compare/' },
    { id: 'tool-wizard', group: 'tools', title: t.nav.formatWizard, meta: '/tools/format-wizard/', href: '/tools/format-wizard/' },
    { id: 'tool-feel', group: 'tools', title: t.nav.feelSpeed, meta: '/tools/feel/', href: '/tools/feel/' },
    { id: 'tool-errors', group: 'tools', title: t.nav.errors, meta: '/errors/', href: '/errors/' },
    { id: 'tool-speed', group: 'tools', title: t.nav.speedQ, meta: '/tools/speed/', href: '/tools/speed/' },
    { id: 'tool-quant', group: 'tools', title: t.nav.quantQ, meta: '/tools/which-quant/', href: '/tools/which-quant/' },
    { id: 'tool-ctx', group: 'tools', title: t.nav.contextQ, meta: '/tools/context-length/', href: '/tools/context-length/' },
  ], [t]);

  const results = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const topModels = ['inkling-2-mini', 'qwen3-8b', 'qwen3-30b-a3b', 'deepseek-v4-1-flash-1017', 'gemma-4-12b']
        .map(id => models.find(m => m.id === id))
        .filter((m): m is NonNullable<typeof m> => !!m)
        .map<PaletteItem>(m => ({
          id: `m-${m.id}`,
          group: 'models',
          title: m.name,
          meta: `${m.paramLabel} · ${m.family}`,
          href: `/quant-hub/${m.id}/`,
        }));
      const topGpus = ['rtx4090', 'rtx5090', 'rtx4060ti16', 'm4-max-64']
        .map(id => gpuDatabase.find(g => g.id === id))
        .filter((g): g is NonNullable<typeof g> => !!g)
        .map<PaletteItem>(g => ({
          id: `g-${g.id}`,
          group: 'gpus',
          title: gpuDisplayName(g, lang),
          meta: `${g.vram} GB`,
          href: `/gpu/${gpuSlug(g)}/`,
        }));
      return [...toolItems.slice(0, 4), ...topModels, ...topGpus];
    }

    const matchedTools = toolItems.filter(item =>
      item.title.toLowerCase().includes(q) || (item.meta ?? '').toLowerCase().includes(q),
    ).slice(0, 4);

    const matchedModels = models
      .filter(m => !isSuperseded(m) && modelMatchesQuery(m, q))
      .slice(0, 8)
      .map<PaletteItem>(m => ({
        id: `m-${m.id}`,
        group: 'models',
        title: m.name,
        meta: `${m.paramLabel} · ${m.family}`,
        href: `/quant-hub/${m.id}/`,
      }));

    const matchedGpus = gpuDatabase
      .filter(g => {
        const hay = `${g.name} ${g.nameZh ?? ''} ${g.id} ${g.vram}gb ${g.vram}g`.toLowerCase();
        return q.split(/\s+/).every(tok => hay.includes(tok));
      })
      .slice(0, 6)
      .map<PaletteItem>(g => ({
        id: `g-${g.id}`,
        group: 'gpus',
        title: gpuDisplayName(g, lang),
        meta: `${g.vram} GB`,
        href: `/gpu/${gpuSlug(g)}/`,
      }));

    const matchedGuides = articles
      .filter(a => {
        const title = lang === 'zh' ? a.titleZh : a.title;
        const desc = lang === 'zh' ? a.descriptionZh : a.description;
        const hay = `${title} ${desc} ${a.tags.join(' ')}`.toLowerCase();
        return q.split(/\s+/).every(tok => hay.includes(tok));
      })
      .slice(0, 4)
      .map<PaletteItem>(a => ({
        id: `c-${a.id}`,
        group: 'guides',
        title: lang === 'zh' ? a.titleZh : a.title,
        meta: `${readingMinutes(a, lang)} ${t.cookbook.readTime}`,
        href: `/cookbook/${a.id}/`,
      }));

    const matchedErrors = runtimeErrors
      .filter(e => {
        const hay = `${e.id} ${e.title.en} ${e.title.zh} ${e.summary.en} ${e.summary.zh}`.toLowerCase();
        return q.split(/\s+/).every(tok => hay.includes(tok));
      })
      .slice(0, 4)
      .map<PaletteItem>(e => ({
        id: `e-${e.id}`,
        group: 'errors',
        title: e.title[lang],
        meta: e.runtime,
        href: `/errors/${e.id}/`,
      }));

    return [...matchedTools, ...matchedModels, ...matchedGpus, ...matchedGuides, ...matchedErrors];
  }, [query, toolItems, lang, t.cookbook.readTime]);

  const safeIdx = results.length === 0 ? -1 : Math.min(activeIdx, results.length - 1);

  const openItem = (item: PaletteItem) => {
    onClose();
    router.push(localizeHref(item.href, lang));
  };

  const groupIcon = (g: PaletteItem['group']) => {
    switch (g) {
      case 'tools': return <Wrench size={13} className="text-cyan-400 shrink-0" />;
      case 'models': return <Box size={13} className="text-violet-400 shrink-0" />;
      case 'gpus': return <Cpu size={13} className="text-emerald-400 shrink-0" />;
      case 'guides': return <BookOpen size={13} className="text-amber-400 shrink-0" />;
      case 'errors': return <AlertTriangle size={13} className="text-rose-400 shrink-0" />;
    }
  };

  // Group items preserving order
  const grouped = useMemo(() => {
    const order: PaletteItem['group'][] = ['tools', 'models', 'gpus', 'guides', 'errors'];
    let flatIndex = 0;
    return order
      .map(group => {
        const items = results.filter(r => r.group === group).map(item => ({ item, idx: flatIndex++ }));
        return { group, items };
      })
      .filter(g => g.items.length > 0);
  }, [results]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.searchPlaceholder}
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4"
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (results.length > 0) setActiveIdx(i => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (results.length > 0) setActiveIdx(i => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && safeIdx >= 0 && results[safeIdx]) {
          e.preventDefault();
          openItem(results[safeIdx]);
        }
      }}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#111218] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
          <Search size={16} className="text-violet-400 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder={t.nav.searchPlaceholder}
            aria-label={t.nav.searchPlaceholder}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveIdx(0); inputRef.current?.focus(); }}
              className="p-1 rounded-md text-slate-500 hover:text-slate-200"
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 rounded border border-white/[0.1] text-[11px] font-mono text-slate-400 hover:text-slate-200"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              {t.nav.searchEmpty.replace('{q}', query.trim())}
            </p>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {t.nav.searchGroups[group]}
                </p>
                <ul>
                  {items.map(({ item, idx }) => {
                    const active = idx === safeIdx;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => openItem(item)}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors',
                            active ? 'bg-violet-500/15 text-slate-100' : 'text-slate-300 hover:bg-white/[0.04]',
                          )}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            {groupIcon(item.group)}
                            <span className="truncate font-medium">{item.title}</span>
                          </span>
                          <span className="flex items-center gap-2 shrink-0">
                            {item.meta && (
                              <span className="text-xs font-mono text-slate-500 max-w-[11rem] truncate">
                                {item.meta}
                              </span>
                            )}
                            {active && <CornerDownLeft size={12} className="text-violet-400" aria-hidden />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.015] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{t.nav.searchHint}</span>
          <span>⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
