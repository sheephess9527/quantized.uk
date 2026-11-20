import LocalGuidePage from '@/components/guides/LocalGuidePage';
import { localGuides } from '@/lib/data/local-guides';
import { pageMetadata } from '@/lib/seo';

const slug = 'what-llm-can-i-run-locally';
const [title, description] = localGuides[slug].zh;
export const metadata = pageMetadata({ title, description, path: '/zh/what-llm-can-i-run-locally' });

export default function Page() {
  return <LocalGuidePage slug={slug} lang="zh" />;
}
