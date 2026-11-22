export const LIVEBENCH_RELEASE_URL = 'https://livebench.ai/#/release/';

// Published Overall scores, keyed by exact indexed checkpoint. Releases use
// different tests; never combine their scores into a ranking or backfill gaps.
export const liveBenchScores: ReadonlyMap<string, readonly [score: number, release: string]> = new Map([
  ['gemma-4-31b', [32.4, '2026-11-06']],
  ['mimo-v2-6-pro', [66.1, '2026-11-06']],
  ['mistral-large-4', [60.3, '2026-11-06']], // Open-weight 1029, not the separate API row.
  ['muse-spark-open-816b-a42b', [48.5, '2026-11-06']],
  ['nemotron-3.5-super-vl-120b-a12b', [47.0, '2026-11-06']], // BF16, not NVFP4.
  ['qwen3-8-27b', [54.0, '2026-11-06']],
  ['nemotron-3.5-lightning-30b-a3b', [44.5, '2026-06-25']],
  ['qwen3-6-27b', [64.0, '2026-06-25']],
  ['qwen3-8-flash-next', [76.2, '2026-06-25']],
  ['gpt-oss-120b', [46.1, '2026-01-08']],
  ['qwen3-30b-a3b', [39.0, '2026-01-08']],
  ['qwen3-32b', [43.6, '2026-01-08']],
  ['glm-4.5-air', [60.5, '2025-05-30']],
  ['qwen3-235b-a22b', [63.4, '2025-05-30']], // Original hybrid checkpoint in thinking mode, not 2507.
  ['deepseek-r1-distill-llama-70b', [55.5, '2025-04-25']],
  ['deepseek-r1-distill-qwen-32b', [47.5, '2025-04-25']],
  ['gemma-3-27b-it', [48.4, '2025-04-25']],
  ['llama-3.3-70b', [48.9, '2025-04-25']],
  ['llama-4-maverick-17b', [55.2, '2025-04-25']],
  ['qwen2.5-7b', [34.4, '2025-04-25']],
  ['qwen2.5-72b', [49.0, '2025-04-25']],
  ['qwen3-14b', [68.2, '2025-04-25']],
  ['deepseek-r1', [67.5, '2025-04-02']], // Original R1, not 0528.
  ['gemma-3-4b-it', [30.1, '2025-04-02']],
  ['gemma-3-12b-it', [41.3, '2025-04-02']],
  ['llama-3.1-8b', [24.9, '2025-04-02']],
  ['llama-3.1-70b', [40.5, '2025-04-02']],
  ['llama-3.1-405b', [47.5, '2025-04-02']],
  ['phi-4', [40.7, '2025-04-02']],
  ['deepseek-v3', [60.5, '2024-11-25']], // Original V3, not 0324.
  ['gemma-2-9b', [28.7, '2024-11-25']],
  ['gemma-2-27b', [38.2, '2024-11-25']],
  ['qwen2.5-coder-32b', [46.2, '2024-11-25']],
  ['mistral-nemo-12b', [28.4, '2024-08-31']],
  ['phi-3.5-mini', [27.4, '2024-08-31']],
]);
