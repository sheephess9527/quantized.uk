export const macModelRepos: Readonly<Partial<Record<string, string>>> = {
  'qwen3-4b': 'mlx-community/Qwen3-4B-4bit',
  'qwen3-8b': 'mlx-community/Qwen3-8B-4bit',
  'qwen3-14b': 'mlx-community/Qwen3-14B-4bit',
  'qwen3-32b': 'mlx-community/Qwen3-32B-4bit',
  'qwen3-30b-a3b': 'mlx-community/Qwen3-30B-A3B-4bit',
  'qwen3-235b-a22b': 'mlx-community/Qwen3-235B-A22B-4bit',
  'qwen3-coder-30b-a3b': 'mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit',
  'qwen2.5-72b': 'mlx-community/Qwen2.5-72B-Instruct-4bit',
  'glm-4.5-air': 'mlx-community/GLM-4.5-Air-4bit',
  'glm-4.7-flash': 'mlx-community/GLM-4.7-Flash-4bit',
  'qwen3-6-35b-a3b': 'mlx-community/Qwen3.6-35B-A3B-4bit',
  'gemma-4-26b-a4b': 'mlx-community/gemma-4-26B-A4B-it-4bit',
  'gemma-4-31b': 'mlx-community/gemma-4-31B-it-4bit',
  'qwen3-8-27b': 'mlx-community/Qwen3.8-27B-4bit',
  'qwen3-8-flash-next': 'mlx-community/Qwen3.8-Flash-Next-4bit',
};

/** Exact combined `.safetensors` bytes from the Hugging Face API (`?blobs=true`), verified 2026-11-27. */
export const macModelWeightBytes: Readonly<Partial<Record<string, { bytes: number; shards: number; groupSize: number }>>> = {
  'qwen3-4b': { bytes: 2_263_022_529, shards: 1, groupSize: 64 },
  'qwen3-8b': { bytes: 4_607_835_174, shards: 1, groupSize: 64 },
  'qwen3-14b': { bytes: 8_307_898_514, shards: 2, groupSize: 64 },
  'qwen3-32b': { bytes: 18_429_850_874, shards: 4, groupSize: 64 },
  'qwen3-30b-a3b': { bytes: 17_174_780_668, shards: 4, groupSize: 64 },
  'qwen3-235b-a22b': { bytes: 132_241_627_602, shards: 26, groupSize: 64 },
  'qwen3-coder-30b-a3b': { bytes: 17_181_071_994, shards: 4, groupSize: 64 },
  'qwen2.5-72b': { bytes: 40_900_550_929, shards: 8, groupSize: 64 },
  'glm-4.5-air': { bytes: 60_140_026_344, shards: 12, groupSize: 64 },
  'glm-4.7-flash': { bytes: 16_852_441_819, shards: 4, groupSize: 64 },
  'qwen3-6-35b-a3b': { bytes: 20_402_204_271, shards: 4, groupSize: 64 },
  'gemma-4-26b-a4b': { bytes: 15_341_205_776, shards: 3, groupSize: 64 },
  'gemma-4-31b': { bytes: 18_412_016_676, shards: 4, groupSize: 64 },
  'qwen3-8-27b': { bytes: 16_054_541_349, shards: 3, groupSize: 64 },
  'qwen3-8-flash-next': { bytes: 111_519_423_247, shards: 22, groupSize: 32 },
};

export function macModelOptions(modelId: string) {
  if (!Object.hasOwn(macModelRepos, modelId)) return;
  const repo = macModelRepos[modelId]!;
  const weights = macModelWeightBytes[modelId];
  return {
    repo,
    repoUrl: `https://huggingface.co/${repo}`,
    command: `mlx_lm.generate --model ${repo} --prompt "Hello"`,
    serverCommand: `mlx_lm.server --model ${repo} --port 8080`,
    studioUrl: `lmstudio://open_from_hf?model=${repo}`,
    weightGiB: weights ? Number((weights.bytes / 1024 ** 3).toFixed(2)) : undefined,
    shards: weights?.shards,
    groupSize: weights?.groupSize,
  };
}

