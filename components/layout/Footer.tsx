'use client';

import Link from 'next/link';
import { Zap, Github, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function Footer() {
  const { t } = useLanguage();

  const sections = [
    {
      title: 'Navigate',
      links: [
        { label: t.nav.quantHub,    href: '/quant-hub' },
        { label: t.nav.benchmarks,  href: '/benchmarks' },
        { label: t.nav.cookbook,    href: '/cookbook' },
      ],
    },
    {
      title: t.nav.tools,
      links: [
        { label: t.nav.vramCalc,      href: '/tools/vram-calc' },
        { label: t.nav.cliGen,        href: '/tools/cli-gen' },
        { label: t.nav.formatWizard,  href: '/tools/format-wizard' },
        { label: t.nav.modelCompare,  href: '/tools/compare' },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { label: 'Hugging Face',  href: 'https://huggingface.co', external: true },
        { label: 'llama.cpp',     href: 'https://github.com/ggerganov/llama.cpp', external: true },
        { label: 'Ollama',        href: 'https://ollama.com', external: true },
        { label: 'vLLM',          href: 'https://github.com/vllm-project/vllm', external: true },
        { label: 'ExLlamaV2',     href: 'https://github.com/turboderp/exllamav2', external: true },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-100">
                quantized<span className="text-violet-400">.uk</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-48">
              {t.nav.tagline}. Bridging research and real deployment.
            </p>
          </div>

          {/* Links */}
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
          <p className="text-xs text-slate-600">
            © 2026 quantized.uk —{' '}
            <Link href="/legal/" className="hover:text-slate-400 transition-colors underline underline-offset-2">
              {t.legal.linkLabel}
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/legal/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t.legal.linkLabel}
            </Link>
            <a
              href="https://github.com/sheephess9527/quantized.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Github size={12} />
              {t.common.githubLink}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
