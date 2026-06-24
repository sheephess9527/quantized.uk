import { extraArticles } from './cookbook-extra';

export interface Article {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  category: 'edge' | 'server' | 'docker' | 'mac';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  tags: string[];
  publishedAt: string;
  content: Section[];
}

interface Section {
  heading: string;
  headingZh: string;
  body: string;
  bodyZh: string;
  code?: { lang: string; content: string };
}

const baseArticles: Article[] = [
  {
    id: 'llama-vps-llamacpp',
    title: 'Run Llama 3.1 8B on a €20/month VPS',
    titleZh: '在 €20/月 VPS 上运行 Llama 3.1 8B',
    description: 'A complete guide to running a private LLM API on a budget Linux VPS using llama.cpp server mode.',
    descriptionZh: '使用 llama.cpp 服务模式在低价 Linux VPS 上搭建私有 LLM API 的完整教程。',
    category: 'server',
    difficulty: 'beginner',
    readTime: 8,
    tags: ['llama.cpp', 'VPS', 'Linux', 'GGUF', 'API'],
    publishedAt: '2025-06-10',
    content: [
      {
        heading: 'Requirements',
        headingZh: '环境要求',
        body: 'You need a Linux VPS with at least 16 GB RAM (32 GB recommended). CPU-only inference is surprisingly usable for personal use.',
        bodyZh: '需要至少 16GB 内存的 Linux VPS（推荐 32GB）。纯 CPU 推理对于个人用途完全可用。',
        code: { lang: 'bash', content: '# Tested on Ubuntu 22.04 LTS\n# RAM: 16–32 GB | CPU: 4–8 cores\n# Monthly cost: ~€15–25 (Hetzner CX32 / OVH Advance)' },
      },
      {
        heading: 'Install llama.cpp',
        headingZh: '安装 llama.cpp',
        body: 'Build from source for best CPU performance with OpenBLAS acceleration.',
        bodyZh: '从源码编译以获得最佳 CPU 性能，启用 OpenBLAS 加速。',
        code: { lang: 'bash', content: 'sudo apt update && sudo apt install -y build-essential cmake libopenblas-dev\ngit clone https://github.com/ggerganov/llama.cpp\ncd llama.cpp\ncmake -B build -DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS\ncmake --build build --config Release -j$(nproc)' },
      },
      {
        heading: 'Download the model',
        headingZh: '下载模型',
        body: 'Use Q4_K_M for the best accuracy/size tradeoff on limited RAM. The 8B model fits easily in 16 GB.',
        bodyZh: '内存有限时使用 Q4_K_M，8B 模型轻松放入 16GB 内存。',
        code: { lang: 'bash', content: 'pip install huggingface_hub\nhuggingface-cli download bartowski/Meta-Llama-3.1-8B-Instruct-GGUF \\\n  --include "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf" \\\n  --local-dir ./models' },
      },
      {
        heading: 'Start the server',
        headingZh: '启动服务',
        body: 'Run llama.cpp in server mode on port 8080. Add an API key for basic auth.',
        bodyZh: '在 8080 端口以服务模式运行 llama.cpp，添加 API 密钥进行基础鉴权。',
        code: { lang: 'bash', content: './build/bin/llama-server \\\n  -m ./models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\\n  --host 0.0.0.0 --port 8080 \\\n  -c 8192 \\\n  -t $(nproc) \\\n  --api-key "your-secret-key"' },
      },
    ],
  },
  {
    id: 'mac-ollama-setup',
    title: 'Mac M3 Max: The Ultimate Local LLM Setup',
    titleZh: 'Mac M3 Max：本地大模型终极配置',
    description: 'Maximise your Apple Silicon with Ollama. Run multiple models, set up an OpenAI-compatible API, and tune Metal GPU layers.',
    descriptionZh: '用 Ollama 榨干苹果芯片性能，运行多个模型，搭建 OpenAI 兼容 API，调优 Metal GPU 层数。',
    category: 'mac',
    difficulty: 'beginner',
    readTime: 6,
    tags: ['Ollama', 'Mac', 'Apple Silicon', 'Metal', 'GGUF'],
    publishedAt: '2025-06-14',
    content: [
      {
        heading: 'Install Ollama',
        headingZh: '安装 Ollama',
        body: 'One command install. Ollama automatically detects your Apple Silicon and uses Metal GPU acceleration.',
        bodyZh: '一行命令安装。Ollama 自动检测苹果芯片并启用 Metal GPU 加速。',
        code: { lang: 'bash', content: 'curl -fsSL https://ollama.com/install.sh | sh' },
      },
      {
        heading: 'Pull and run a model',
        headingZh: '拉取并运行模型',
        body: 'Ollama defaults to Q4_K_M GGUF which is ideal for most use cases.',
        bodyZh: 'Ollama 默认使用 Q4_K_M GGUF，适合大多数使用场景。',
        code: { lang: 'bash', content: '# Pull Llama 3.1 8B (default Q4_K_M, ~5.7 GB)\nollama pull llama3.1:8b\n\n# Or pull Qwen2.5 7B for better multilingual\nollama pull qwen2.5:7b\n\n# Run interactively\nollama run llama3.1:8b' },
      },
      {
        heading: 'OpenAI-compatible API',
        headingZh: 'OpenAI 兼容 API',
        body: 'Ollama exposes an OpenAI-compatible API at port 11434 — drop-in replacement for any app using OpenAI SDK.',
        bodyZh: 'Ollama 在 11434 端口暴露 OpenAI 兼容 API，可直接替换任何使用 OpenAI SDK 的应用。',
        code: { lang: 'bash', content: 'curl http://localhost:11434/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d \'{"model":"llama3.1:8b","messages":[{"role":"user","content":"Hello!"}]}\'' },
      },
    ],
  },
  {
    id: 'rtx4090-vllm-api',
    title: 'Multi-Model API Server on RTX 4090 with vLLM',
    titleZh: '用 vLLM 在 RTX 4090 上搭建多模型 API 服务',
    description: 'Serve multiple AWQ-quantized models with vLLM\'s continuous batching for production-grade throughput.',
    descriptionZh: '用 vLLM 的连续批处理技术，在单张 RTX 4090 上提供生产级多模型 API 服务。',
    category: 'server',
    difficulty: 'intermediate',
    readTime: 12,
    tags: ['vLLM', 'AWQ', 'NVIDIA', 'RTX 4090', 'API', 'Docker'],
    publishedAt: '2025-06-18',
    content: [
      {
        heading: 'Why vLLM + AWQ?',
        headingZh: '为什么选 vLLM + AWQ？',
        body: 'vLLM\'s PagedAttention and continuous batching deliver 3-5x throughput over naive inference. AWQ gives the best accuracy at INT4 for NVIDIA.',
        bodyZh: 'vLLM 的 PagedAttention 和连续批处理比朴素推理吞吐高 3-5 倍。AWQ 是 NVIDIA INT4 下精度最优的量化格式。',
        code: { lang: 'text', content: 'Model: Qwen2.5-7B-Instruct-AWQ\nHardware: RTX 4090 24GB\nThroughput: ~220 tok/s (batch=1), ~1400 tok/s (batch=8)\nVRAM used: 4.8 GB weights + KV cache' },
      },
      {
        heading: 'Install vLLM',
        headingZh: '安装 vLLM',
        body: 'Install inside a virtual environment with CUDA 12.1.',
        bodyZh: '在 CUDA 12.1 虚拟环境中安装 vLLM。',
        code: { lang: 'bash', content: 'python3 -m venv venv && source venv/bin/activate\npip install vllm --extra-index-url https://download.pytorch.org/whl/cu121' },
      },
      {
        heading: 'Serve the model',
        headingZh: '启动服务',
        body: 'Start an OpenAI-compatible server with quantization support.',
        bodyZh: '启动支持量化的 OpenAI 兼容服务器。',
        code: { lang: 'bash', content: 'python -m vllm.entrypoints.openai.api_server \\\n  --model Qwen/Qwen2.5-7B-Instruct-AWQ \\\n  --quantization awq \\\n  --max-model-len 32768 \\\n  --gpu-memory-utilization 0.85 \\\n  --port 8000' },
      },
    ],
  },
  {
    id: 'docker-llm-compose',
    title: 'Docker Compose LLM Stack: Ollama + Open WebUI',
    titleZh: 'Docker Compose LLM 全家桶：Ollama + Open WebUI',
    description: 'A production-ready Docker Compose stack that gives you a local ChatGPT experience with one command.',
    descriptionZh: '一键部署的 Docker Compose 方案，给你一个本地 ChatGPT 体验。',
    category: 'docker',
    difficulty: 'beginner',
    readTime: 5,
    tags: ['Docker', 'Ollama', 'Open WebUI', 'Compose', 'GGUF'],
    publishedAt: '2025-06-20',
    content: [
      {
        heading: 'The complete docker-compose.yml',
        headingZh: '完整 docker-compose.yml',
        body: 'This stack runs Ollama as the backend and Open WebUI as the ChatGPT-like frontend.',
        bodyZh: '此方案以 Ollama 为后端，Open WebUI 为类 ChatGPT 前端。',
        code: {
          lang: 'yaml',
          content: `version: "3.8"
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    # For NVIDIA GPU:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

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
  webui_data:`,
        },
      },
      {
        heading: 'Start and pull a model',
        headingZh: '启动并拉取模型',
        body: 'Bring up the stack, then pull your first model into the running Ollama container.',
        bodyZh: '启动服务后，向运行中的 Ollama 容器拉取模型。',
        code: { lang: 'bash', content: 'docker compose up -d\n# Open http://localhost:3000 in your browser\n\n# Pull a model into the running container\ndocker exec ollama ollama pull llama3.1:8b' },
      },
    ],
  },
];

export const articles: Article[] = [...baseArticles, ...extraArticles];
