'use client';

import Link from 'next/link';
import { Clock, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { todayFeed } from '@/lib/data/models';
import { cn } from '@/lib/utils/cn';

const typeConfig = {
  new:  { label: 'new',  className: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  hot:  { label: 'hot',  className: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  upd:  { label: 'upd',  className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
};

export default function TodayBoard() {
  const { t } = useLanguage();

  return (
    <div className="glass rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="section-title text-lg">{t.home.todayBoard.title}</h2>
          </div>
          <p className="section-subtitle text-xs mt-0.5">{t.home.todayBoard.subtitle}</p>
        </div>
        <Link href="/quant-hub" className="card-action text-xs shrink-0">
          {t.common.viewAll} →
        </Link>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {todayFeed.map((item) => {
          const cfg = typeConfig[item.type];
          return (
            <li key={item.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer">
              <span className={cn('badge shrink-0 mt-0.5', cfg.className)}>
                {t.home.todayBoard[item.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-200 truncate">{item.model}</span>
                  <span className={cn('badge text-xs shrink-0', typeConfig[item.type === 'new' ? 'new' : item.type === 'hot' ? 'hot' : 'upd'].className)}>
                    {item.format}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-500">{item.detail}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-slate-600">{item.hardware}</span>
                  <span className="text-slate-700">·</span>
                  <Clock size={9} className="text-slate-700" />
                  <span className="text-xs text-slate-700">{item.hoursAgo}h ago</span>
                </div>
              </div>
              <ArrowUpRight size={12} className="text-slate-700 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
