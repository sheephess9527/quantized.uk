/** Param-size buckets for Quant Hub filters and stats (params are billions, not marketing labels). */
export type ParamRange = '≤3B' | '7B' | '14B' | '32B' | '70B+';

/** Upper bound for the "≤3B" bucket — includes 3.21B / 3.82B style "3B" models. */
export const SMALL_PARAM_MAX = 4;

export function matchesParamRange(params: number, range: ParamRange): boolean {
  if (range === '≤3B') return params <= SMALL_PARAM_MAX;
  if (range === '7B') return params > SMALL_PARAM_MAX && params <= 9;
  if (range === '14B') return params > 9 && params <= 20;
  if (range === '32B') return params > 20 && params <= 50;
  if (range === '70B+') return params > 50;
  return true;
}

export function paramBucketCounts(models: { params: number }[]) {
  return {
    small: models.filter(m => m.params <= SMALL_PARAM_MAX).length,
    mid7: models.filter(m => m.params > SMALL_PARAM_MAX && m.params <= 9).length,
    mid14: models.filter(m => m.params > 9 && m.params <= 20).length,
    large32: models.filter(m => m.params > 20 && m.params <= 50).length,
    xl: models.filter(m => m.params > 50).length,
  };
}