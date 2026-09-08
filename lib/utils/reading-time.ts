import type { Article } from '@/lib/data/cookbook';
import type { Lang } from '@/lib/i18n/translations';

/**
 * Reading time, derived from the article's own body.
 *
 * It used to be a hand-typed `readTime` field, and it had drifted into
 * fiction: 22 of 23 guides claimed 5–12 minutes for bodies of 14–75 words.
 * A number nobody recomputes when the content changes is not an estimate, it
 * is decoration — and this one was also quietly advertising depth the guides
 * did not have.
 *
 * Rates are the conventional ones: ~200 words per minute for English prose,
 * ~400 characters per minute for Chinese. Code is not read at prose speed, so
 * it is counted by the line (20 lines/min) rather than by its tokens. The
 * floor is 1 minute — "0 min read" tells the reader nothing.
 */
const WORDS_PER_MIN = 200;
const ZH_CHARS_PER_MIN = 400;
const CODE_LINES_PER_MIN = 20;

export function readingMinutes(article: Article, lang: Lang): number {
  let prose = 0;
  let codeLines = 0;

  for (const section of article.content) {
    if (lang === 'zh') {
      // Count CJK characters, not whitespace-separated tokens: Chinese prose
      // has almost no spaces, so a word count returns ~1 for a whole section.
      prose += ((section.headingZh + section.bodyZh).match(/[一-鿿]/g) ?? []).length / ZH_CHARS_PER_MIN;
    } else {
      prose += (section.heading + ' ' + section.body).trim().split(/\s+/).length / WORDS_PER_MIN;
    }
    if (section.code) codeLines += section.code.content.split('\n').length;
  }

  return Math.max(1, Math.round(prose + codeLines / CODE_LINES_PER_MIN));
}
