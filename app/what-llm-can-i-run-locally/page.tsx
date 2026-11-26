import LocalGuidePage from '@/components/guides/LocalGuidePage';
import { localGuides } from '@/lib/data/local-guides';
import { fitTitle, pageMetadata } from '@/lib/seo';

const slug = 'what-llm-can-i-run-locally';
const [title, description] = localGuides[slug].en;
export const metadata = pageMetadata({ title: fitTitle(title), description, path: '/what-llm-can-i-run-locally' });

export default function Page() {
  return <LocalGuidePage slug={slug} lang="en" />;
}
