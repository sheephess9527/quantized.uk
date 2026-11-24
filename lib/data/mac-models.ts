export const macModelRepos: Readonly<Partial<Record<string, string>>> = {
  'llama-3.2-3b': 'mlx-community/Llama-3.2-3B-Instruct-4bit',
  'mistral-7b-v0.3': 'mlx-community/Mistral-7B-Instruct-v0.3-4bit',
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
