import MethodologyPage from '@/components/MethodologyPage';
import { translations } from '@/lib/i18n/translations';
import { pageMetadata } from '@/lib/seo';

const { metaTitle, metaDescription } = translations.zh.methodology;
export const metadata = pageMetadata({ title: metaTitle, description: metaDescription, path: '/zh/methodology' });

export default function Page() {
  return <MethodologyPage lang="zh" />;
}
