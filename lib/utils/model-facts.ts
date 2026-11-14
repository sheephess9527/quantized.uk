import { LICENCES, MODEL_LICENCE, IMAGE_INPUT_MODEL_IDS } from '@/lib/data/model-facts';
import type { LicenceClass, LicenceInfo } from '@/lib/data/model-facts';

/**
 * The Hub's two capability/terms lookups.
 *
 * Both read `lib/data/model-facts.ts`, which is the one place a licence or an
 * image-input claim is written down. Nothing else may re-state either: a second
 * copy of a licence classification is how the same model ends up "commercial" on
 * the Hub and "restricted" in the docs.
 */

const IMAGE_INPUT = new Set(IMAGE_INPUT_MODEL_IDS);

/** True when the model takes images (or more) as input, not just text. */
export function hasImageInput(modelId: string): boolean {
  return IMAGE_INPUT.has(modelId);
}

/** The licence record, or undefined when no licence was recorded for this model. */
export function licenceOf(modelId: string): LicenceInfo | undefined {
  const id = MODEL_LICENCE[modelId];
  return id ? LICENCES[id] : undefined;
}

/**
 * `commercial` / `restricted` / `noncommercial`, or null when the model has no
 * recorded licence. Null is not a fourth class to filter on — a model whose
 * licence could not be read stays out of every licence filter rather than being
 * guessed into one.
 */
export function licenceClassOf(modelId: string): LicenceClass | null {
  return licenceOf(modelId)?.class ?? null;
}

/**
 * Gate for `dataProblems()`: a licence or capability claim must point at a model
 * this index actually ships. A typo'd id would otherwise silently drop a licence
 * — the filter would just return fewer models and nobody would notice.
 */
export function factTableProblems(modelIds: readonly string[]): string[] {
  const out: string[] = [];
  const known = new Set(modelIds);

  for (const id of Object.keys(MODEL_LICENCE)) {
    if (!known.has(id)) out.push(`model-facts: licence recorded for unknown model id '${id}'`);
    if (!(MODEL_LICENCE[id] in LICENCES)) out.push(`model-facts: '${id}' uses licence '${MODEL_LICENCE[id]}', which is not in LICENCES`);
  }

  const seen = new Set<string>();
  for (const id of IMAGE_INPUT_MODEL_IDS) {
    if (!known.has(id)) out.push(`model-facts: image-input flag for unknown model id '${id}'`);
    if (seen.has(id)) out.push(`model-facts: '${id}' listed twice as image-input`);
    seen.add(id);
  }

  return out;
}
