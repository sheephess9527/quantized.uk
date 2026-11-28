'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';

const STORAGE_KEY = 'qtz_zh_script';
export type ZhScriptMode = 'hans' | 'hant';

function shouldSkipNode(node: Node): boolean {
  const p = node.parentElement;
  if (!p) return true;
  const tag = p.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'KBD' || tag === 'TEXTAREA') {
    return true;
  }
  if (p.closest('[data-no-tc], pre, code')) return true;
  return false;
}

export default function ZhScriptToggle() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [mode, setMode] = useState<ZhScriptMode>('hans');
  const origTextRef = useRef<WeakMap<Node, string>>(new WeakMap());
  const origTitleRef = useRef<string | null>(null);
  const applyingRef = useRef(false);
  const converterRef = useRef<((s: string) => string) | null>(null);

  const convertSubtree = useCallback((root: Node, targetMode: ZhScriptMode, toTrad: (s: string) => string) => {
    if (!root) return;
    applyingRef.current = true;
    try {
      const origText = origTextRef.current;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (shouldSkipNode(node)) continue;
        const cur = node.nodeValue ?? '';
        if (targetMode === 'hant') {
          if (!origText.has(node)) origText.set(node, cur);
          const base = origText.get(node) ?? cur;
          const conv = toTrad(base);
          if (cur !== conv) node.nodeValue = conv;
        } else if (origText.has(node)) {
          const orig = origText.get(node)!;
          if (cur !== orig) node.nodeValue = orig;
        }
      }

      if (root === document.body || root === document.documentElement) {
        if (origTitleRef.current === null) origTitleRef.current = document.title;
        document.title = targetMode === 'hant' ? toTrad(origTitleRef.current) : origTitleRef.current;
        document.documentElement.dataset.zhScript = targetMode;
      }

      const container = (root as Element).querySelectorAll ? (root as Element) : document;
      const els = container.querySelectorAll('[placeholder], [title], [aria-label]');
      els.forEach(el => {
        if (el.closest('[data-no-tc]')) return;
        (['placeholder', 'title', 'aria-label'] as const).forEach(attr => {
          if (!el.hasAttribute(attr)) return;
          const origAttr = `data-orig-${attr}`;
          if (targetMode === 'hant') {
            if (!el.hasAttribute(origAttr)) el.setAttribute(origAttr, el.getAttribute(attr) ?? '');
            const conv = toTrad(el.getAttribute(origAttr) ?? '');
            if (el.getAttribute(attr) !== conv) el.setAttribute(attr, conv);
          } else if (el.hasAttribute(origAttr)) {
            const restored = el.getAttribute(origAttr) ?? '';
            if (el.getAttribute(attr) !== restored) el.setAttribute(attr, restored);
          }
        });
      });
    } finally {
      applyingRef.current = false;
    }
  }, []);

  const runConversion = useCallback(async (targetMode: ZhScriptMode) => {
    if (lang !== 'zh') return;
    if (targetMode === 'hant' && !converterRef.current) {
      const mod = await import('@/lib/i18n/zh-hant-dict');
      converterRef.current = mod.toTraditional;
    }
    const fn = converterRef.current ?? ((s: string) => s);
    convertSubtree(document.body, targetMode, fn);
  }, [lang, convertSubtree]);

  // Read saved preference on mount
  useEffect(() => {
    if (lang !== 'zh') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'hant') {
        setMode('hant');
      }
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  // Apply conversion on mode or route change, and observe dynamic DOM updates when in 'hant'
  useEffect(() => {
    if (lang !== 'zh') return;
    origTitleRef.current = null;
    if (mode === 'hant') {
      void runConversion('hant');
      const observer = new MutationObserver(mutations => {
        if (applyingRef.current || !converterRef.current) return;
        for (const m of mutations) {
          m.addedNodes.forEach(n => {
            if (n.nodeType === Node.ELEMENT_NODE) {
              convertSubtree(n, 'hant', converterRef.current!);
            } else if (n.nodeType === Node.TEXT_NODE && n.parentElement) {
              convertSubtree(n.parentElement, 'hant', converterRef.current!);
            }
          });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    } else if (converterRef.current) {
      convertSubtree(document.body, 'hans', converterRef.current);
    }
  }, [lang, mode, pathname, runConversion, convertSubtree]);

  if (lang !== 'zh') return null;

  const isHant = mode === 'hant';
  const toggle = () => {
    const next: ZhScriptMode = isHant ? 'hans' : 'hant';
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      data-no-tc
      onClick={toggle}
      aria-pressed={isHant}
      title={isHant ? '切换为简体中文' : '切換為繁體中文（正體）'}
      aria-label={isHant ? '切换为简体中文' : '切換為繁體中文（正體）'}
      className="px-2 min-h-[44px] sm:min-h-[30px] inline-flex items-center rounded-lg text-xs font-semibold whitespace-nowrap text-slate-400 hover:text-sky-300 hover:bg-sky-500/12 border border-ink/[0.08] hover:border-sky-500/25 transition-all duration-150"
    >
      {isHant ? '简' : '繁'}
    </button>
  );
}
