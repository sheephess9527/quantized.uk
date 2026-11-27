import Link from '@/components/i18n/LocalLink';
import { Calculator } from 'lucide-react';
import type { QuantModel } from '@/lib/data/types';
import { translations, type Lang } from '@/lib/i18n/translations';
import { referenceQuant } from '@/lib/utils/quality';
import { sizeAt4K } from '@/lib/utils/quant-source';
import { quantLevelKey } from '@/lib/utils/recommend';
import { activeParamsB, isMoE, isRecentModel } from '@/lib/utils/model-meta';
import { hasImageInput, licenceOf } from '@/lib/utils/model-facts';
import { LIVEBENCH_RELEASE_URL, liveBenchScores } from '@/lib/data/model-quality';
import { cn } from '@/lib/utils/cn';

const licenceClassColors = {
  commercial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  restricted: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  noncommercial: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

export default function ModelTable({ models, lang }: { models: QuantModel[]; lang: Lang }) {
  const t = translations[lang];
  const tv = t.hub.tableView;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111218] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-4 py-3 font-semibold">{tv.colModel}</th>
              <th className="text-right px-3 py-3 font-semibold">{tv.colParams}</th>
              <th className="text-right px-3 py-3 font-semibold">{tv.colContext}</th>
              <th className="text-right px-3 py-3 font-semibold">{tv.colQuantVram}</th>
              <th className="text-right px-3 py-3 font-semibold">{tv.colSpeed}</th>
              <th className="text-right px-3 py-3 font-semibold">{tv.colScore}</th>
              <th className="text-left px-3 py-3 font-semibold">{tv.colLicence}</th>
              <th className="text-right px-4 py-3 font-semibold">{tv.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => {
              const ref = referenceQuant(model.quants);
              const vram4k = sizeAt4K(model, ref);
              const level = quantLevelKey(ref);
              const active = isMoE(model) ? activeParamsB(model) : undefined;
              const lic = licenceOf(model.id);
              const lb = liveBenchScores.get(model.id);
              const ctx = model.contextLength >= 1048576
                ? `${(model.contextLength / 1048576).toFixed(0)}M`
                : `${(model.contextLength / 1024).toFixed(0)}K`;

              return (
                <tr key={model.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors">
                  <td className="px-4 py-3 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/quant-hub/${model.id}/`}
                        className="font-semibold text-slate-200 hover:text-violet-300 transition-colors"
                      >
                        {model.name}
                      </Link>
                      {isRecentModel(model) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          {t.common.new}
                        </span>
                      )}
                      {hasImageInput(model.id) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                          VL
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-slate-500 mt-0.5">{model.family}</span>
                  </td>

                  <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                    <span className="text-slate-200">{model.paramLabel}</span>
                    {active !== undefined && !model.paramLabel.includes('-A') && (
                      <span className="block text-[11px] text-cyan-400/80">A{active}B</span>
                    )}
                  </td>

                  <td className="px-3 py-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {ctx}
                  </td>

                  <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                    <span className="text-violet-300 font-medium">{vram4k.toFixed(1)} GB</span>
                    <span className="block text-[11px] text-slate-500">{ref.format} {ref.level}</span>
                  </td>

                  <td className="px-3 py-3 text-right font-mono text-orange-300 whitespace-nowrap">
                    {ref.speedRTX4090 ? `${ref.speedRTX4090} tok/s` : '—'}
                  </td>

                  <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                    {lb ? (
                      <a
                        href={`${LIVEBENCH_RELEASE_URL}${lb[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:underline"
                        title={`LiveBench Overall (${lb[1]})`}
                      >
                        {lb[0].toFixed(1)}
                        <span className="block text-[10px] text-slate-500">{lb[1]}</span>
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap">
                    {lic ? (
                      <a
                        href={lic.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('badge text-[11px]', licenceClassColors[lic.class])}
                      >
                        {lic.short}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/tools/vram-calc/?mode=forward&model=${model.id}&quant=${encodeURIComponent(level)}&ctx=4096&batch=1`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 transition-colors"
                    >
                      <Calculator size={11} aria-hidden />
                      {tv.colAction}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
