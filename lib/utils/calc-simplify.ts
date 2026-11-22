export function commonQuantLevels(selected: string, reference?: string): string[] {
  return Array.from(new Set(['Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0', reference, selected].filter((q): q is string => !!q)));
}

export interface AdvancedSettings {
  cards: number;
  extraIds: readonly string[];
  kvType: string;
  batchSize: number;
  mmprojGB: string;
  reverseInput: string;
  sortBy: string;
  includeYellow: boolean;
  bestPerModel: boolean;
}

export function changedAdvancedSettings(mode: 'forward' | 'reverse' | 'finetune', settings: AdvancedSettings): number {
  if (mode === 'finetune') return 0;
  const common = [settings.cards !== 1, settings.extraIds.length > 0, settings.kvType !== 'f16', settings.batchSize !== 1];
  const specific = mode === 'forward'
    ? [Number(settings.mmprojGB) > 0]
    : [settings.reverseInput !== 'text', settings.sortBy !== 'quality', !settings.includeYellow, !settings.bestPerModel];
  return [...common, ...specific].filter(Boolean).length;
}
