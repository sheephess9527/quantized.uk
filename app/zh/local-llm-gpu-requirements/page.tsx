import LocalGuidePage from '@/components/guides/LocalGuidePage';
import { localGuides } from '@/lib/data/local-guides';
import { fitTitle, pageMetadata } from '@/lib/seo';

const slug = 'local-llm-gpu-requirements';
const [title, description] = localGuides[slug].zh;
export const metadata = pageMetadata({ title: fitTitle(title), description, path: '/zh/local-llm-gpu-requirements' });

export default function Page() {
  return <LocalGuidePage slug={slug} lang="zh" />;
}
