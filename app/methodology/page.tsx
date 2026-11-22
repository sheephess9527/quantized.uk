import MethodologyPage from '@/components/MethodologyPage';
import { translations } from '@/lib/i18n/translations';
import { pageMetadata } from '@/lib/seo';

const { metaTitle, metaDescription } = translations.en.methodology;
export const metadata = pageMetadata({ title: metaTitle, description: metaDescription, path: '/methodology' });

export default function Page() {
  return <MethodologyPage lang="en" />;
}
