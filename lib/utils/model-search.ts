import type { QuantModel } from '@/lib/data/types';

/**
 * The words people type are not the values the data uses: a reader searching
 * a quantization index types "coding" and "vision", while `categories` holds
 * `code` and `multimodal`. Without this, "coding" returned zero of the 81
 * models — the box looked broken on a query the placeholder invites. Chinese
 * readers (the larger half of the calculator's traffic) type vendor and task
 * names in Chinese, which no field in the data carries.
 */
const ALIASES: Record<string, string[]> = {
  coding: ['code'],
  coder: ['code'],
  programming: ['code'],
  vision: ['multimodal'],
  image: ['multimodal'],
  chat: ['general', 'instruct'],
  apple: ['mac'],
  nvidia: ['consumer-gpu'],
  cpu: ['cpu-vps'],
  代码: ['code'],
  编程: ['code'],
  写代码: ['code'],
  视觉: ['multimodal'],
  图像: ['multimodal'],
  多模态: ['multimodal'],
  对话: ['general', 'instruct'],
  千问: ['qwen'],
  通义: ['qwen'],
  谷歌: ['gemma'],
  小米: ['mimo'],
  百度: ['ernie'],
  文心: ['ernie'],
  智谱: ['glm'],
  月之暗面: ['kimi'],
  微软: ['phi'],
  深度求索: ['deepseek'],
};

// Keeps CJK: stripping it turned "千问 27b" into "27b" before any alias ran.
const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]/g, '');

/**
 * Name, family, id, size, categories, hardware tags, formats and levels, with
 * punctuation stripped so "qwen3.8" and "qwen 3 8" both reach `qwen3-8`. The
 * one matcher behind the Hub search box and the calculator's model search.
 */
export function modelMatchesQuery(m: QuantModel, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    m.name,
    m.family,
    m.id,
    m.paramLabel,
    ...m.categories,
    ...m.hardwareTags,
    ...m.quants.map(v => v.format),
    ...m.quants.map(v => v.level),
  ];
  const termHits = (word: string) =>
    [word, ...(ALIASES[word] ?? [])].some(
      term =>
        haystack.some(h => h.toLowerCase().includes(term)) ||
        // Punctuation-free matching ("qwen38" → qwen3-8) only from four
        // characters: at three, "27b" matched "WizardLM-2 7B" across the dash.
        (loose(term).length >= 4 && haystack.some(h => loose(h).includes(loose(term)))),
    );
  // "qwen 27b" is two words that each appear in "Qwen3.6 27B" but not as one
  // string, so a multi-word query also passes when every word matches.
  // A one-character word ("gemma 4") must be a whole word of the name, or "4"
  // would match every model through its Q4_K_M level.
  const words = q.split(/\s+/);
  const nameWords = nameTokens(m.name);
  return termHits(q) || (words.length > 1 && words.every(w => (w.length <= 1 ? nameWords.includes(w) : termHits(w))));
}

const nameTokens = (name: string) => name.toLowerCase().split(/[\s\-_()]+/).filter(Boolean);

/**
 * Matches ranked for a picker: a hit in the name beats a hit in a tag, and
 * among equals the newer index entry comes first (the model a reader is
 * looking up this week is more often the new one).
 */
export function searchModels(list: QuantModel[], query: string, limit: number): QuantModel[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const score = (m: QuantModel) => {
    const tokens = nameTokens(m.name);
    // Every word is a word of the name ("8b" → "Llama 3.1 8B"), then a looser
    // hit in the name, then a hit only in tags; a legacy model sorts last.
    const base = words.length && words.every(w => tokens.some(t => t === w || t.startsWith(w))) ? 0
      : words.length && words.every(w => loose(m.name).includes(loose(w)) && loose(w).length > 0) ? 1
      : 2;
    return base + (m.status === 'superseded' ? 3 : 0);
  };
  return list
    .filter(m => modelMatchesQuery(m, query))
    .map(m => ({ m, s: score(m) }))
    .sort((a, b) => a.s - b.s || (b.m.addedAt ?? '').localeCompare(a.m.addedAt ?? ''))
    .slice(0, limit)
    .map(x => x.m);
}
