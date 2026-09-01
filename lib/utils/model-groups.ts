import { models } from '@/lib/data/models';
import { matchesParamRange, type ParamRange } from '@/lib/utils/param-buckets';
import type { QuantModel } from '@/lib/data/types';

/**
 * The 79 models grouped for a `<select>`, largest bucket first, sorted by name
 * inside each.
 *
 * A flat list of 79 options in data-entry order (Llama 3.1 → Qwen2.5 → … →
 * Seed-OSS) is close to unusable: nothing tells you where to look, and the
 * order carries no meaning to a reader. Native `<optgroup>` is deliberate over
 * a custom combobox — it keeps keyboard behaviour, screen-reader semantics and
 * the platform pickers on iOS and Android, all of which a hand-rolled listbox
 * has to reimplement and usually gets wrong.
 */
export const MODEL_GROUP_ORDER: ParamRange[] = ['≤3B', '7B', '14B', '32B', '70B+'];

export function groupedModels(): { bucket: ParamRange; models: QuantModel[] }[] {
  return MODEL_GROUP_ORDER.map(bucket => ({
    bucket,
    models: models
      .filter(m => matchesParamRange(m.params, bucket))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(group => group.models.length > 0);
}
