'use client';

import Link from '@/components/i18n/LocalLink';
import { Zap, ExternalLink, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { trackEvent } from '@/lib/analytics';

const FEEDBACK_EMAIL = 'hello@quantized.uk';

export default function Footer() {
  const { t } = useLanguage();

  const sections = [
    {
      title: 'Navigate',
      links: [
        { label: t.nav.quantHub,   href: '/quant-hub/' },
        { label: t.gpuPage.allGpus, href: '/gpu/' },
        { label: t.nav.benchmarks, href: '/benchmarks/' },
        { label: t.nav.cookbook,   href: '/cookbook/' },
        { label: t.about.linkLabel, href: '/about/' },
      ],
    },
    {
      title: t.nav.tools,
      links: [
        { label: t.nav.vramCalc,     href: '/tools/vram-calc/' },
        { label: t.nav.cliGen,       href: '/tools/cli-gen/' },
        { label: t.nav.formatWizard, href: '/tools/format-wizard/' },
        { label: t.nav.modelCompare, href: '/tools/compare/' },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { label: 'Hugging Face', href: 'https://huggingface.co', external: true },
        { label: 'llama.cpp',    href: 'https://github.com/ggerganov/llama.cpp', external: true },
        { label: 'Ollama',       href: 'https://ollama.com', external: true },
        { label: 'vLLM',         href: 'https://github.com/vllm-project/vllm', external: true },
        { label: 'ExLlamaV2',    href: 'https://github.com/turboderp/exllamav2', external: true },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-100">
                quantized<span className="text-violet-400">.uk</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-48 mb-3">
              {t.nav.tagline}. {t.footer.brandExtra}
            </p>
            <a
              href={`mailto:${FEEDBACK_EMAIL}?subject=quantized.uk%20feedback`}
              onClick={() => trackEvent('Feedback Click')}
              className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Mail size={12} />
              {t.footer.feedback}: {FEEDBACK_EMAIL}
            </a>
          </div>

          {sections.map(section => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                        <ExternalLink size={10} className="opacity-50" />
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© 2026 quantized.uk</p>
          <div className="flex items-center gap-4">
            <Link href="/legal/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t.legal.linkLabel}
            </Link>
            <Link href="/privacy/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t.privacy.linkLabel}
            </Link>
            <Link href="/about/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t.about.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
