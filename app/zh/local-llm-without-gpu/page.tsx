import LocalGuidePage from '@/components/guides/LocalGuidePage';
import { localGuides } from '@/lib/data/local-guides';
import { pageMetadata } from '@/lib/seo';

const slug = 'local-llm-without-gpu';
const [title, description] = localGuides[slug].zh;
export const metadata = pageMetadata({ title, description, path: '/zh/local-llm-without-gpu' });

export default function Page() {
  return <LocalGuidePage slug={slug} lang="zh" />;
}
