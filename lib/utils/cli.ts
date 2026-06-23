export type Framework = 'llamacpp' | 'ollama' | 'vllm';
export type Env = 'linux' | 'mac' | 'docker' | 'compose';

export interface CLIOptions {
  framework: Framework;
  env: Env;
  modelId: string;
  modelName: string;
  quantLevel: string;
  ggufFilename?: string;
  gpuLayers: number;
  contextLen: number;
  threads: number;
  port: number;
  apiKey?: string;
}

export interface CLIOutput {
  command: string;
  compose?: string;
  notes: string[];
}

export function generateCLI(opts: CLIOptions): CLIOutput {
  const { framework, env, modelName, quantLevel, gpuLayers, contextLen, threads, port, apiKey } = opts;

  if (framework === 'llamacpp') return generateLlamaCpp(opts);
  if (framework === 'ollama')   return generateOllama(opts);
  if (framework === 'vllm')     return generateVLLM(opts);
  return { command: '# Select a framework', notes: [] };
}

function generateLlamaCpp(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, gpuLayers, contextLen, threads, port, apiKey } = opts;
  const modelFile = `${modelName.replace(/[^a-zA-Z0-9._-]/g, '-')}-${quantLevel}.gguf`;
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

  const installCmd = env === 'mac'
    ? `# Install on macOS\nbrew install cmake\ngit clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\ncmake -B build -DLLAMA_METAL=ON\ncmake --build build --config Release -j$(nproc)\n\n# Download model\nhuggingface-cli download <repo-id> --include "${modelFile}" --local-dir ./models\n\n# Run`
    : `# Install on Linux (with CUDA)\nsudo apt install build-essential cmake\ngit clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\ncmake -B build -DLLAMA_CUDA=ON\ncmake --build build --config Release -j$(nproc)\n\n# Download model\nhuggingface-cli download <repo-id> --include "${modelFile}" --local-dir ./models\n\n# Run`;

  return {
    command: `${installCmd}\n${serverCmd}`,
    notes: [
      `-ngl ${gpuLayers}: number of layers offloaded to GPU (set to 99 for full GPU)`,
      `-c ${contextLen}: context length in tokens`,
      `API endpoint: http://localhost:${port}/v1/chat/completions (OpenAI-compatible)`,
    ],
  };
}

function generateOllama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, port } = opts;
  const ollamaModel = modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.-]/g, '');

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
    return { command, compose, notes: ['Open WebUI available at http://localhost:3000', 'OpenAI-compatible API at http://localhost:${port}/v1'] };
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
      `Ollama automatically selects Q4_K_M quantization for the model`,
      `Set OLLAMA_NUM_PARALLEL for concurrent requests`,
    ],
  };
}

function generateVLLM(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, contextLen, port, apiKey } = opts;

  const isAWQ = quantLevel.toLowerCase().includes('awq');
  const isGPTQ = quantLevel.toLowerCase().includes('gptq');
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
      --model ${modelName}${isAWQ ? '\n      --quantization awq' : ''}
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
      `  --model ${modelName}${quantFlag} \\`,
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
    `  --model ${modelName}${quantFlag} \\`,
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
    ],
  };
}
