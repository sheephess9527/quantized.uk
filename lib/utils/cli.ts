export type Framework = 'llamacpp' | 'ollama' | 'vllm' | 'exllama';
export type Env = 'linux' | 'mac' | 'docker' | 'compose';

export interface CLIOptions {
  framework: Framework;
  env: Env;
  modelId: string;
  modelName: string;
  quantLevel: string;
  ggufFilename?: string;
  /**
   * GGUF repo id from `lib/data/hf-repos.mjs`, e.g.
   * `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF`.
   *
   * Without it these commands can only guess, and a guess derived from the
   * display name is wrong more often than not — "Llama 3.1 8B Instruct" is not
   * the repo, not the filename, and not an Ollama tag.
   */
  hfRepo?: string;
  gpuLayers: number;
  contextLen: number;
  threads: number;
  port: number;
  apiKey?: string;
}

/**
 * `hfRepoMap` exists to source HF download/like stats, so for ~14 models it
 * points at the *original weights* (`openai/gpt-oss-20b`,
 * `deepseek-ai/DeepSeek-R1`) rather than a GGUF conversion. Handing one of
 * those to `huggingface-cli download --include "*.gguf"` or to `ollama run
 * hf.co/…` produces a command that looks right and downloads nothing, so a
 * repo only counts here if it is actually a GGUF repo.
 */
function ggufRepoId(hfRepo?: string): string | undefined {
  return hfRepo && /-GGUF$/i.test(hfRepo) ? hfRepo : undefined;
}

/** `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF` → `Meta-Llama-3.1-8B-Instruct`. */
function ggufBase(hfRepo: string): string {
  return (hfRepo.split('/')[1] ?? hfRepo).replace(/-GGUF$/i, '');
}

/** `nproc` is GNU coreutils — it does not exist on a stock macOS. */
function coreCount(env: Env): string {
  return env === 'mac' ? '$(sysctl -n hw.ncpu)' : '$(nproc)';
}

export interface CLIOutput {
  command: string;
  compose?: string;
  notes: string[];
}

export function generateCLI(opts: CLIOptions): CLIOutput {
  const { framework } = opts;

  if (framework === 'llamacpp') return generateLlamaCpp(opts);
  if (framework === 'ollama')   return generateOllama(opts);
  if (framework === 'vllm')     return generateVLLM(opts);
  if (framework === 'exllama')  return generateExLlama(opts);
  return { command: '# Select a framework', notes: [] };
}

function generateExLlama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, contextLen, port, apiKey } = opts;
  const bpw = quantLevel.replace(/[^0-9.]/g, '') || '4.65';
  const modelDir = modelName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';

  const serverCmd = [
    `python -m exllamav2.server \\`,
    `  -m ./models/${modelDir}-exl2-${bpw}bpw \\`,
    `  -c ${contextLen} \\`,
    `  -host 0.0.0.0 -port ${port}${apiKeyFlag}`,
  ].join('\n');

  if (env === 'docker') {
    const command = [
      `docker run --rm -it \\`,
      `  --gpus all \\`,
      `  -p ${port}:${port} \\`,
      `  -v $(pwd)/models:/models \\`,
      `  ghcr.io/turboderp/exllamav2:latest \\`,
      `  -m /models/${modelDir}-exl2-${bpw}bpw \\`,
      `  -c ${contextLen} \\`,
      `  -host 0.0.0.0 -port ${port}`,
    ].join('\n');
    return { command, notes: ['Requires NVIDIA GPU (Ampere+ recommended)', 'Model must be in EXL2 format from turboderp or equivalent'] };
  }

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  exllama:
    image: ghcr.io/turboderp/exllamav2:latest
    container_name: exllama-server
    ports:
      - "${port}:${port}"
    volumes:
      - ./models:/models
    command: >
      -m /models/${modelDir}-exl2-${bpw}bpw
      -c ${contextLen}
      -host 0.0.0.0
      -port ${port}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped`;
    return { command: serverCmd, compose, notes: ['Fastest inference for NVIDIA consumer GPUs', 'Download EXL2 quants from Hugging Face (turboderp repos)'] };
  }

  const installCmd = env === 'mac'
    ? `# ExLlamaV2 requires NVIDIA CUDA — not supported on Apple Silicon\n# Use Ollama with GGUF instead`
    : `# Install ExLlamaV2\npip install exllamav2\n\n# Download EXL2 model (example)\nhuggingface-cli download <hf-exl2-repo-id> --include "*${bpw}bpw*" --local-dir ./models/${modelDir}-exl2-${bpw}bpw\n\n# Run`;

  return {
    command: `${installCmd}\n${serverCmd}`,
    notes: [
      'ExLlamaV2 is NVIDIA-only — fastest consumer GPU inference for EXL2 quants',
      `Recommended quant: ${quantLevel} (adjust bpw in model path)`,
      'Replace <hf-exl2-repo-id> with this model\'s EXL2 repo — EXL2 quants are per-model (turboderp, LoneStriker, bartowski), not derivable from the name',
      `OpenAI-compatible API: http://localhost:${port}/v1/chat/completions`,
      'Alternative: TabbyAPI wraps ExLlamaV2 with a polished web UI',
    ],
  };
}

function generateLlamaCpp(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, gpuLayers, contextLen, threads, port, apiKey } = opts;
  const hfRepo = ggufRepoId(opts.hfRepo);
  // GGUF repos name their files after the *source* repo, not the display name:
  // bartowski/Meta-Llama-3.1-8B-Instruct-GGUF ships
  // Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf. Deriving the filename from the
  // display name drops the "Meta-" and `--include` then matches nothing —
  // huggingface-cli downloads zero files and exits 0.
  const modelFile = hfRepo
    ? `${ggufBase(hfRepo)}-${quantLevel}.gguf`
    : `${modelName.replace(/[^a-zA-Z0-9._-]/g, '-')}-${quantLevel}.gguf`;
  const repoId = hfRepo ?? '<hf-gguf-repo-id>';
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';

  const serverCmd = [
    `./build/bin/llama-server \\`,
    `  -m ./models/${modelFile} \\`,
    `  --host 0.0.0.0 --port ${port} \\`,
    `  -ngl ${gpuLayers} \\`,
    `  -c ${contextLen} \\`,
    `  -t ${threads}${apiKeyFlag}`,
  ].join('\n');

  if (env === 'docker') {
    const command = [
      `docker run --rm -it \\`,
      `  --gpus all \\`,
      `  -p ${port}:${port} \\`,
      `  -v $(pwd)/models:/models \\`,
      `  ghcr.io/ggerganov/llama.cpp:server \\`,
      `  -m /models/${modelFile} \\`,
      `  --host 0.0.0.0 --port ${port} \\`,
      `  -ngl ${gpuLayers} \\`,
      `  -c ${contextLen}${apiKey ? ` \\\n  --api-key "${apiKey}"` : ''}`,
    ].join('\n');
    return { command, notes: ['Requires NVIDIA Container Toolkit for GPU passthrough', 'Model file must be in ./models/ directory'] };
  }

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  llama-server:
    image: ghcr.io/ggerganov/llama.cpp:server
    container_name: llama-server
    ports:
      - "${port}:${port}"
    volumes:
      - ./models:/models
    command: >
      -m /models/${modelFile}
      --host 0.0.0.0
      --port ${port}
      -ngl ${gpuLayers}
      -c ${contextLen}${apiKey ? `\n      --api-key ${apiKey}` : ''}
    restart: unless-stopped
    # Uncomment for NVIDIA GPU:
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]`;
    return { command: serverCmd, compose, notes: ['GPU support requires NVIDIA Container Toolkit', 'Edit the compose file to mount your model directory'] };
  }

  // Build flags: llama.cpp renamed every LLAMA_* CMake option to GGML_* well
  // before the b4000-series this site targets. The old names are silently
  // ignored by CMake, which yields a CPU-only build that "works" and is 20×
  // slower — the worst possible failure mode for a copy-paste command.
  const downloadCmd = `# Download model\nhuggingface-cli download ${repoId} --include "${modelFile}" --local-dir ./models`;
  const installCmd = env === 'mac'
    ? `# Install on macOS\nbrew install cmake\ngit clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_METAL=ON\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`
    : `# Install on Linux (with CUDA)\nsudo apt install build-essential cmake\ngit clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_CUDA=ON\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`;

  return {
    command: `${installCmd}\n${serverCmd}`,
    notes: [
      `-ngl ${gpuLayers}: number of layers offloaded to GPU (set to 99 for full GPU)`,
      `-c ${contextLen}: context length in tokens`,
      `API endpoint: http://localhost:${port}/v1/chat/completions (OpenAI-compatible)`,
      'Large models ship sharded (…-00001-of-00002.gguf) — point -m at the first shard',
      ...(hfRepo
        ? []
        : [`Replace ${repoId}/the filename: no GGUF conversion is mapped for this model, only its original weights`]),
    ],
  };
}

function generateOllama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, port } = opts;
  const hfRepo = ggufRepoId(opts.hfRepo);
  // Ollama library tags are curated and short (`qwen2.5:7b`) — they are not
  // derivable from a display name, so the old slug ("llama-3.1-8b-instruct")
  // simply 404s on pull. Ollama can run any GGUF repo straight from Hugging
  // Face, which works for every model in the index and pins the exact quant.
  const ollamaModel = hfRepo
    ? `hf.co/${hfRepo}:${quantLevel}`
    : modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.-]/g, '');

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "${port}:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    # Uncomment for NVIDIA GPU:
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    volumes:
      - webui_data:/app/backend/data
    restart: unless-stopped

volumes:
  ollama_data:
  webui_data:`;

    const command = `# After docker compose up -d:\ndocker exec ollama ollama pull ${ollamaModel}`;
    return { command, compose, notes: ['Open WebUI available at http://localhost:3000', `OpenAI-compatible API at http://localhost:${port}/v1`] };
  }

  if (env === 'docker') {
    const command = [
      `# Start Ollama container`,
      `docker run -d \\`,
      `  --gpus all \\`,
      `  -p ${port}:11434 \\`,
      `  -v ollama:/root/.ollama \\`,
      `  --name ollama \\`,
      `  ollama/ollama`,
      ``,
      `# Pull the model`,
      `docker exec ollama ollama pull ${ollamaModel}`,
    ].join('\n');
    return { command, notes: ['Remove --gpus all if running CPU-only', `API available at http://localhost:${port}/v1`] };
  }

  const installCmd = env === 'mac'
    ? `curl -fsSL https://ollama.com/install.sh | sh`
    : `curl -fsSL https://ollama.com/install.sh | sh`;

  const command = [
    `# Install Ollama`,
    installCmd,
    ``,
    `# Pull and run ${modelName}`,
    `ollama pull ${ollamaModel}`,
    `ollama run ${ollamaModel}`,
    ``,
    `# Or start as API server`,
    `OLLAMA_HOST=0.0.0.0:${port} ollama serve`,
  ].join('\n');

  return {
    command,
    notes: [
      `OpenAI-compatible API: http://localhost:${port}/v1/chat/completions`,
      ...(hfRepo
        ? [
            `hf.co/… pulls the GGUF directly and pins the quant to ${quantLevel}`,
            'If this model has a curated library tag (e.g. `ollama run qwen2.5:7b`), that works too — but it picks the quant for you',
          ]
        : ['No GGUF conversion is mapped for this model — replace the tag with a real Ollama library tag or an hf.co/<user>/<repo>-GGUF tag']),
      `Set OLLAMA_NUM_PARALLEL for concurrent requests`,
    ],
  };
}

function generateVLLM(opts: CLIOptions): CLIOutput {
  const { env, quantLevel, contextLen, port, apiKey } = opts;

  const isAWQ = quantLevel.toLowerCase().includes('awq');
  const isGPTQ = quantLevel.toLowerCase().includes('gptq');
  // vLLM takes a Hugging Face *repo id*, and it serves FP16/AWQ/GPTQ weights —
  // not the GGUF repos this site maps. The display name used to be pasted in
  // here verbatim, which produced `--model Llama 3.1 8B Instruct`: three stray
  // argv entries and a server that never starts. An explicit placeholder is
  // the honest output when the right repo is not something we can derive.
  const repoId = isAWQ ? '<hf-awq-repo-id>' : isGPTQ ? '<hf-gptq-repo-id>' : '<hf-repo-id>';
  const quantFlag = isAWQ ? ' \\\n  --quantization awq' : isGPTQ ? ' \\\n  --quantization gptq' : '';
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm
    ports:
      - "${port}:${port}"
    volumes:
      - huggingface_cache:/root/.cache/huggingface
    command: >
      --model ${repoId}${isAWQ ? '\n      --quantization awq' : ''}
      --max-model-len ${contextLen}
      --port ${port}
      --gpu-memory-utilization 0.85${apiKey ? `\n      --api-key ${apiKey}` : ''}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped
    environment:
      - HF_TOKEN=\${HF_TOKEN}

volumes:
  huggingface_cache:`;

    const command = `# Start vLLM server\ndocker compose up -d\n\n# Test the API\ncurl http://localhost:${port}/v1/models`;
    return { command, compose, notes: ['Requires NVIDIA Container Toolkit', 'Set HF_TOKEN env var for gated models', 'Recommended: Ampere or newer GPU (RTX 3090+)'] };
  }

  if (env === 'docker') {
    const command = [
      `docker run --gpus all \\`,
      `  -p ${port}:${port} \\`,
      `  -v ~/.cache/huggingface:/root/.cache/huggingface \\`,
      `  -e HF_TOKEN=$HF_TOKEN \\`,
      `  vllm/vllm-openai:latest \\`,
      `  --model ${repoId}${quantFlag} \\`,
      `  --max-model-len ${contextLen} \\`,
      `  --gpu-memory-utilization 0.85 \\`,
      `  --port ${port}${apiKeyFlag}`,
    ].join('\n');
    return { command, notes: ['Requires NVIDIA Container Toolkit', 'Ampere+ GPU strongly recommended for best performance'] };
  }

  const command = [
    `# Install vLLM (requires CUDA 12.1+)`,
    `pip install vllm`,
    ``,
    `# Serve the model`,
    `python -m vllm.entrypoints.openai.api_server \\`,
    `  --model ${repoId}${quantFlag} \\`,
    `  --max-model-len ${contextLen} \\`,
    `  --gpu-memory-utilization 0.85 \\`,
    `  --port ${port}${apiKeyFlag}`,
  ].join('\n');

  return {
    command,
    notes: [
      `OpenAI-compatible API at http://localhost:${port}/v1`,
      `Adjust --gpu-memory-utilization (0.7–0.95) based on your GPU`,
      `Add --tensor-parallel-size N for multi-GPU setups`,
      `Replace ${repoId} with the ${isAWQ ? 'AWQ' : isGPTQ ? 'GPTQ' : 'FP16'} repo — vLLM does not serve the GGUF repos linked from the model page`,
    ],
  };
}
