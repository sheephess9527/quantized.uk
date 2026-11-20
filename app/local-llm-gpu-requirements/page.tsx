import LocalGuidePage from '@/components/guides/LocalGuidePage';
import { localGuides } from '@/lib/data/local-guides';
import { pageMetadata } from '@/lib/seo';

const slug = 'local-llm-gpu-requirements';
const [title, description] = localGuides[slug].en;
export const metadata = pageMetadata({ title, description, path: '/local-llm-gpu-requirements' });

export default function Page() {
  return <LocalGuidePage slug={slug} lang="en" />;
}
