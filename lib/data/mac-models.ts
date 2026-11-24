export const macModelRepos: Readonly<Partial<Record<string, string>>> = {
  'qwen3-4b': 'mlx-community/Qwen3-4B-4bit',
  'qwen3-8b': 'mlx-community/Qwen3-8B-4bit',
  'qwen3-14b': 'mlx-community/Qwen3-14B-4bit',
};

export function macModelOptions(modelId: string) {
  if (!Object.hasOwn(macModelRepos, modelId)) return;
  const repo = macModelRepos[modelId]!;
  return {
    repo,
    repoUrl: `https://huggingface.co/${repo}`,
    command: `mlx_lm.generate --model ${repo} --prompt "Hello"`,
    studioUrl: `lmstudio://open_from_hf?model=${repo}`,
  };
}
