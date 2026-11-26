import { translations, type Lang } from '@/lib/i18n/translations';
import { dataLastUpdated } from '@/lib/data/meta';

export default function DataFreshness({ className = '', lang = 'en' }: { className?: string; lang?: Lang }) {
  const t = translations[lang];
  return (
    <p className={`text-xs text-slate-600 font-mono ${className}`}>
      {t.home.dataUpdated.replace('{date}', dataLastUpdated)}
    </p>
  );
}
