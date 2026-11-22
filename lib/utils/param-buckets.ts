/**
 * Param-size buckets for the Hub filter and stats, GPU pages, model pickers and
 * the GPU requirements table. `params` are total billions, not marketing labels.
 *
 * The keys are the Hub's `?size=` values and stay stable for old links; readers
 * see `PARAM_RANGE_LABEL`, which is derived from the same bounds, so a column
 * headed "<4B" can never hold a 4B model. `npm run check:param-buckets` checks
 * the bounds, the labels and every model name against them.
 */
export type ParamRange = '≤3B' | '7B' | '14B' | '32B' | '70B+';

/** Half-open [min, max) in billions of parameters, smallest first. */
export const PARAM_RANGE_BOUNDS: Record<ParamRange, readonly [number, number]> = {
  '≤3B': [0, 4],
  '7B': [4, 10],
  '14B': [10, 20],
  '32B': [20, 50],
  '70B+': [50, Infinity],
};

export const PARAM_RANGES = Object.keys(PARAM_RANGE_BOUNDS) as ParamRange[];

/** Upper bound (exclusive) of the smallest bucket: 3.21B / 3.84B models are in it, a 4B is not. */
export const SMALL_PARAM_MAX = PARAM_RANGE_BOUNDS['≤3B'][1];

function boundsLabel([min, max]: readonly [number, number]): string {
  if (min === 0) return `<${max}B`;
  if (max === Infinity) return `${min}B+`;
  return `${min}–${max}B`;
}

export const PARAM_RANGE_LABEL = Object.fromEntries(
  PARAM_RANGES.map(r => [r, boundsLabel(PARAM_RANGE_BOUNDS[r])]),
) as Record<ParamRange, string>;

export function matchesParamRange(params: number, range: ParamRange): boolean {
  const bounds = PARAM_RANGE_BOUNDS[range];
  if (!bounds) return true;
  return params >= bounds[0] && params < bounds[1];
}

export function paramRangeOf(params: number): ParamRange {
  return PARAM_RANGES.find(r => matchesParamRange(params, r)) ?? '70B+';
}

export function paramBucketCounts(models: { params: number }[]) {
  const count = (r: ParamRange) => models.filter(m => matchesParamRange(m.params, r)).length;
  return {
    small: count('≤3B'),
    mid7: count('7B'),
    mid14: count('14B'),
    large32: count('32B'),
    xl: count('70B+'),
  };
}
