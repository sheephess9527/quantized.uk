import { vllmRocmSupported } from '@/lib/utils/gpu-page';

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
  /**
   * The reader's GPU backend (`backendFor()` of the hardware profile). Only
   * the container commands use it: a CUDA image with `--gpus all` on an AMD
   * card, or a GPU block commented out on an NVIDIA one, both start cleanly
   * and run everything on the CPU. Defaults to CUDA.
   */
  backend?: 'cuda' | 'rocm' | 'metal' | 'cpu';
  /** Language of `notes` — they render as visible text on both trees. Defaults to English. */
  lang?: 'en' | 'zh';
  /** Display name of the reader's GPU — vLLM's ROCm build supports only some Radeon/Instinct parts. */
  gpuName?: string;
}

type Lang = NonNullable<CLIOptions['lang']>;
/** One note in both languages; every note goes through this so `/zh` never shows an English one. */
function L(lang: Lang, en: string, zh: string): string {
  return lang === 'zh' ? zh : en;
}

/**
 * `hfRepoMap` exists to source HF download/like stats, so for ~14 models it
 * points at the *original weights* (`openai/gpt-oss-20b`,
 * `deepseek-ai/DeepSeek-R1`) rather than a GGUF conversion. Handing one of
 * those to `hf download --include "*.gguf"` or to `ollama run
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

type Backend = NonNullable<CLIOptions['backend']>;

/** `docker run` lines that hand the container the GPU (llama.cpp / Ollama docker docs). */
function dockerGpuLines(backend: Backend): string[] {
  if (backend === 'cuda') return ['  --gpus all \\'];
  if (backend === 'rocm') return ['  --device /dev/kfd \\', '  --device /dev/dri \\'];
  return [];
}

/** The compose equivalent, indented for a service at two spaces. */
function composeGpuBlock(backend: Backend): string {
  if (backend === 'cuda') return `
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]`;
  if (backend === 'rocm') return `
    devices:
      - /dev/kfd
      - /dev/dri`;
  return '';
}

/** llama.cpp server image per backend (docs/docker.md): `:server` alone is the CPU build. */
function llamaImageTag(backend: Backend): string {
  return backend === 'cuda' ? 'server-cuda' : backend === 'rocm' ? 'server-rocm' : 'server';
}

/** Notes every container command carries for the reader's backend. */
function containerNotes(backend: Backend, lang: Lang): string[] {
  if (backend === 'cuda') return [L(lang, 'Requires the NVIDIA Container Toolkit on the host', '主机需要安装 NVIDIA Container Toolkit')];
  if (backend === 'rocm') return [L(lang, 'AMD GPU: needs ROCm drivers on the host; /dev/kfd and /dev/dri are passed through', 'AMD 显卡：主机需要安装 ROCm 驱动；命令已透传 /dev/kfd 和 /dev/dri')];
  if (backend === 'metal') return [L(lang, 'Docker on macOS cannot reach the Apple GPU — this container runs on the CPU. Choose "macOS Terminal" to run natively on Metal', 'macOS 上的 Docker 无法使用苹果 GPU——这个容器会跑在 CPU 上。想用 Metal 加速，请选择 "macOS 终端" 直接在本机运行')];
  return [L(lang, 'CPU-only container', '纯 CPU 容器')];
}

/** Every container port here is published on loopback only; say how to widen it. */
function exposureNote(lang: Lang): string {
  return L(lang, 'Port published on 127.0.0.1 only — a bare -p PORT:PORT would expose this unauthenticated API on every network interface. To reach it from other machines, put an authenticating proxy in front first', '端口只发布在 127.0.0.1 上——如果写成 -p 端口:端口，这个没有鉴权的接口会暴露在所有网卡上。要从其他机器访问，先在前面加一层带鉴权的反向代理');
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

/**
 * ExLlamaV2's chat template for a model, from the names `examples/chat.py`
 * accepts (`-modes` lists them). A wrong template still runs and answers
 * badly, so anything unrecognised falls back to `chatml` with a note.
 */
function exllamaMode(modelName: string): { mode: string; guessed: boolean } {
  const n = modelName.toLowerCase();
  if (/llama[ -]?3|llama 4/.test(n)) return { mode: 'llama3', guessed: false };
  if (/qwq/.test(n)) return { mode: 'qwq', guessed: false };
  if (/qwen|yi-|hermes/.test(n)) return { mode: 'chatml', guessed: false };
  if (/gemma/.test(n)) return { mode: 'gemma', guessed: false };
  if (/phi-?3|phi-?4/.test(n)) return { mode: 'phi3', guessed: false };
  if (/deepseek/.test(n)) return { mode: 'deepseek', guessed: false };
  if (/command[ -]?r|cohere/.test(n)) return { mode: 'cohere', guessed: false };
  if (/glm/.test(n)) return { mode: 'glm', guessed: false };
  return { mode: 'chatml', guessed: true };
}

/**
 * ExLlamaV2 as it actually stands (checked 2026-10-02): its README marks the
 * project archived, development has moved to ExLlamaV3, and the servers that
 * used to load EXL2 — TabbyAPI (`pyproject.toml` depends on exllamav3 only)
 * and text-generation-webui (ExLlamav3 loaders only) — no longer do. The repo
 * has no `__main__` server and no Dockerfile, so the `python -m
 * exllamav2.server` command and `ghcr.io/turboderp/exllamav2` image this used
 * to print did not exist. What does run is the library's own chat example.
 */
function generateExLlama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, contextLen } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const bpw = quantLevel.replace(/[^0-9.]/g, '') || '4.65';
  const modelDir = modelName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const { mode, guessed } = exllamaMode(modelName);
  const status = L(lang,
    'ExLlamaV2 is archived (its README says development continues in ExLlamaV3), and TabbyAPI and text-generation-webui now load EXL3, not EXL2 — so there is no maintained OpenAI-compatible server for EXL2 any more. These commands run the model locally with ExLlamaV2\'s own chat script',
    'ExLlamaV2 已归档（README 写明开发转到 ExLlamaV3），TabbyAPI 和 text-generation-webui 现在加载的是 EXL3 而不是 EXL2 —— 所以 EXL2 已经没有仍在维护的 OpenAI 兼容服务端。下面的命令用 ExLlamaV2 自带的聊天脚本在本机运行模型');
  const apiAlt = L(lang,
    'Need an API? Serve the same model as GGUF with llama.cpp, or as AWQ/GPTQ with vLLM — both still maintained',
    '需要 API？用 llama.cpp 跑这个模型的 GGUF 版本，或用 vLLM 跑 AWQ/GPTQ 版本 —— 两者都仍在维护');

  if (env === 'mac') {
    return {
      command: `# ExLlamaV2 requires an NVIDIA GPU (CUDA) — it does not run on Apple silicon.\n# Use llama.cpp or Ollama with the GGUF build instead.`,
      notes: [status],
    };
  }

  if (env === 'docker' || env === 'compose') {
    return {
      command: `# ExLlamaV2 publishes no Docker image, and the maintained servers that used to\n# load EXL2 (TabbyAPI, text-generation-webui) now load EXL3 only.\n# Choose "Linux / Ubuntu" for a local run, or switch to llama.cpp / vLLM for a container.`,
      notes: [status, apiAlt],
    };
  }

  const command = [
    `# Install ExLlamaV2 from source (the chat script lives in the repo)`,
    `git clone https://github.com/turboderp-org/exllamav2 && cd exllamav2`,
    `pip install -r requirements.txt`,
    `pip install .`,
    ``,
    `# Download the EXL2 build — each bitrate is a separate branch of the repo`,
    `pip install -U huggingface_hub`,
    `hf download <hf-exl2-repo-id> --revision ${bpw}bpw --local-dir ../models/${modelDir}-exl2-${bpw}bpw`,
    ``,
    `# Chat locally (-gs auto splits across GPUs; -l sets the context length)`,
    `python examples/chat.py -m ../models/${modelDir}-exl2-${bpw}bpw -mode ${mode} -l ${contextLen} -gs auto`,
  ].join('\n');

  return {
    command,
    notes: [
      status,
      L(lang, 'NVIDIA only — ExLlamaV2 has no ROCm or Metal path', '仅支持 NVIDIA —— ExLlamaV2 没有 ROCm 或 Metal 路径'),
      L(lang, 'Replace <hf-exl2-repo-id> with this model\'s EXL2 repo — EXL2 quants are per-model (turboderp, LoneStriker, bartowski), not derivable from the name. Check the branch name matches the bitrate', '把 <hf-exl2-repo-id> 换成这个模型的 EXL2 仓库——EXL2 量化按模型单独发布（turboderp、LoneStriker、bartowski 等），无法从名字推出。请确认分支名与比特率一致'),
      guessed
        ? L(lang, `-mode ${mode} is a guess for this model — run python examples/chat.py -modes to list the templates and pick the model's own`, `-mode ${mode} 是对这个模型的猜测 —— 运行 python examples/chat.py -modes 列出所有模板，选与模型匹配的那个`)
        : L(lang, `-mode ${mode} is the chat template; python examples/chat.py -modes lists the others`, `-mode ${mode} 是聊天模板；python examples/chat.py -modes 可列出其他模板`),
      apiAlt,
    ],
  };
}

function generateLlamaCpp(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, gpuLayers, contextLen, threads, port, apiKey } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
  const hfRepo = ggufRepoId(opts.hfRepo);
  // GGUF repos name their files after the *source* repo, not the display name:
  // bartowski/Meta-Llama-3.1-8B-Instruct-GGUF ships
  // Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf. Deriving the filename from the
  // display name drops the "Meta-" and `--include` then matches nothing —
  // `hf download` downloads zero files and exits 0.
  const modelFile = hfRepo
    ? `${ggufBase(hfRepo)}-${quantLevel}.gguf`
    : `${modelName.replace(/[^a-zA-Z0-9._-]/g, '-')}-${quantLevel}.gguf`;
  const repoId = hfRepo ?? '<hf-gguf-repo-id>';
  const apiKeyFlag = apiKey ? ` \\\n  --api-key "${apiKey}"` : '';

  // Loopback by default. `--host 0.0.0.0` publishes an unauthenticated
  // inference server to every interface on the machine, which is not what
  // "run it on my laptop" should mean. Inside a container the server must
  // bind 0.0.0.0 to be reachable through the port mapping at all, so exposure
  // is decided by the mapping: a bare `-p 8080:8080` publishes on every host
  // interface (and Docker's own iptables rules bypass ufw), so every mapping
  // here is `127.0.0.1:` — see `exposureNote`.
  const serverCmd = [
    `./build/bin/llama-server \\`,
    `  -m ./models/${modelFile} \\`,
    `  --host 127.0.0.1 --port ${port} \\`,
    `  -ngl ${gpuLayers} \\`,
    `  -c ${contextLen} \\`,
    `  -t ${threads}${apiKeyFlag}`,
  ].join('\n');

  if (env === 'docker') {
    const command = [
      `docker run --rm -it \\`,
      ...dockerGpuLines(backend),
      `  -p 127.0.0.1:${port}:${port} \\`,
      `  -v $(pwd)/models:/models \\`,
      `  ghcr.io/ggml-org/llama.cpp:${llamaImageTag(backend)} \\`,
      `  -m /models/${modelFile} \\`,
      `  --host 0.0.0.0 --port ${port} \\`,
      `  -ngl ${gpuLayers} \\`,
      `  -c ${contextLen}${apiKey ? ` \\\n  --api-key "${apiKey}"` : ''}`,
    ].join('\n');
    // `:server` is the CPU-only image (llama.cpp docs/docker.md); with it,
    // `--gpus all -ngl` starts cleanly and silently runs everything on the CPU.
    return { command, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, `Image :${llamaImageTag(backend)} — :server is CPU-only, :server-cuda is NVIDIA, :server-rocm is AMD`, `镜像 :${llamaImageTag(backend)}——:server 是纯 CPU 版，:server-cuda 用于 NVIDIA，:server-rocm 用于 AMD`), L(lang, 'Model file must be in ./models/ directory', '模型文件需放在 ./models/ 目录下')] };
  }

  if (env === 'compose') {
    const compose = `version: "3.8"
services:
  llama-server:
    image: ghcr.io/ggml-org/llama.cpp:${llamaImageTag(backend)}
    container_name: llama-server
    ports:
      - "127.0.0.1:${port}:${port}"
    volumes:
      - ./models:/models
    command: >
      -m /models/${modelFile}
      --host 0.0.0.0
      --port ${port}
      -ngl ${gpuLayers}
      -c ${contextLen}${apiKey ? `\n      --api-key ${apiKey}` : ''}
    restart: unless-stopped${composeGpuBlock(backend)}`;
    return { command: serverCmd, compose, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, 'Edit the compose file to mount your model directory', '修改 compose 文件，挂载你的模型目录')] };
  }

  // Build flags: llama.cpp renamed every LLAMA_* CMake option to GGML_*. Its
  // CMakeLists maps the old names (LLAMA_CUDA warns and still enables CUDA,
  // LLAMA_CUBLAS is a fatal error), but a *misspelt* -D is only reported as an
  // unused variable and yields a CPU-only build — emit the current names.
  const downloadCmd = [
    `# Download the model (installs the hf CLI the next line needs)`,
    `pip install -U huggingface_hub`,
    `hf download ${repoId} --include "${modelFile}" --local-dir ./models`,
  ].join('\n');
  const installCmd = env === 'mac'
    ? `# Prerequisites: Xcode command line tools, Homebrew, Python 3\n# Install on macOS\nbrew install cmake git\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_METAL=ON\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`
    : `# Prerequisites: a CUDA toolkit matching your driver (nvcc --version), Python 3\n# Install on Linux (with CUDA)\nsudo apt install -y build-essential cmake git\ngit clone https://github.com/ggml-org/llama.cpp && cd llama.cpp\ncmake -B build -DGGML_CUDA=ON\ncmake --build build --config Release -j${coreCount(env)}\n\n${downloadCmd}\n\n# Run`;

  return {
    command: `${installCmd}\n${serverCmd}`,
    notes: [
      L(lang, `-ngl ${gpuLayers}: number of layers offloaded to GPU (set to 99 for full GPU)`, `-ngl ${gpuLayers}：放到 GPU 上的层数（设为 99 即全部放到 GPU）`),
      L(lang, `-c ${contextLen}: context length in tokens`, `-c ${contextLen}：上下文长度（token 数）`),
      L(lang, `API endpoint: http://127.0.0.1:${port}/v1/chat/completions (OpenAI-compatible)`, `接口地址：http://127.0.0.1:${port}/v1/chat/completions（OpenAI 兼容）`),
      L(lang, `Health check once it starts: curl -s http://127.0.0.1:${port}/health — expect {"status":"ok"}`, `启动后检查：curl -s http://127.0.0.1:${port}/health——应返回 {"status":"ok"}`),
      L(lang, 'To reach it from another machine, replace 127.0.0.1 with 0.0.0.0 and put it behind auth first', '要从其他机器访问，把 127.0.0.1 换成 0.0.0.0，并先加上身份验证'),
      L(lang, 'Large models ship sharded (…-00001-of-00002.gguf) — point -m at the first shard', '大模型会分片发布（…-00001-of-00002.gguf）——-m 指向第一个分片即可'),
      ...(hfRepo
        ? []
        : [L(lang, `Replace ${repoId}/the filename: no GGUF conversion is mapped for this model, only its original weights`, `请替换 ${repoId} 和文件名：本站没有为这个模型对应的 GGUF 转换版本，只有原始权重`)]),
    ],
  };
}

function generateOllama(opts: CLIOptions): CLIOutput {
  const { env, modelName, quantLevel, port } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
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
    image: ollama/ollama:${backend === 'rocm' ? 'rocm' : 'latest'}
    container_name: ollama
    ports:
      - "127.0.0.1:${port}:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped${composeGpuBlock(backend)}

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "127.0.0.1:3000:8080"
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
    return { command, compose, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, 'Open WebUI available at http://localhost:3000', 'Open WebUI 地址：http://localhost:3000'), L(lang, `OpenAI-compatible API at http://localhost:${port}/v1`, `OpenAI 兼容接口：http://localhost:${port}/v1`)] };
  }

  if (env === 'docker') {
    const command = [
      `# Start Ollama container`,
      `docker run -d \\`,
      ...dockerGpuLines(backend),
      `  -p 127.0.0.1:${port}:11434 \\`,
      `  -v ollama:/root/.ollama \\`,
      `  --name ollama \\`,
      `  ollama/ollama${backend === 'rocm' ? ':rocm' : ''}`,
      ``,
      `# Pull the model`,
      `docker exec ollama ollama pull ${ollamaModel}`,
    ].join('\n');
    return { command, notes: [...containerNotes(backend, lang), exposureNote(lang), L(lang, `API available at http://localhost:${port}/v1`, `接口地址：http://localhost:${port}/v1`)] };
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
    env === 'mac'
      ? `# The Ollama app already serves the API on 127.0.0.1:11434 while it is open.`
      : `# The Linux installer already runs the API on 127.0.0.1:11434 as a service.`,
    ...(port === 11434
      ? env === 'mac'
        ? [`# To run it in the foreground instead, quit the Ollama app first, then:`, `#   ollama serve`]
        : [`# To run it in the foreground instead, stop the service first:`, `#   sudo systemctl stop ollama && ollama serve`]
      : [`# To serve on port ${port} instead (loopback only):`, `OLLAMA_HOST=127.0.0.1:${port} ollama serve`]),
  ].join('\n');

  return {
    command,
    notes: [
      L(lang, `OpenAI-compatible API: http://localhost:${port}/v1/chat/completions`, `OpenAI 兼容接口：http://localhost:${port}/v1/chat/completions`),
      ...(hfRepo
        ? [
            L(lang, `hf.co/… pulls the GGUF directly and pins the quant to ${quantLevel}`, `hf.co/… 会直接拉取 GGUF，并固定为 ${quantLevel} 量化`),
            L(lang, 'If this model has a curated library tag (e.g. `ollama run qwen2.5:7b`), that works too — but it picks the quant for you', '如果这个模型在 Ollama 库里有官方标签（如 `ollama run qwen2.5:7b`），也可以用——但量化档位由它替你选'),
          ]
        : [L(lang, 'No GGUF conversion is mapped for this model — replace the tag with a real Ollama library tag or an hf.co/<user>/<repo>-GGUF tag', '本站没有为这个模型对应的 GGUF 转换版本——请换成真实的 Ollama 库标签，或 hf.co/<用户>/<仓库>-GGUF 形式的标签')]),
      L(lang, `Set OLLAMA_NUM_PARALLEL for concurrent requests`, `需要并发请求时设置 OLLAMA_NUM_PARALLEL`),
    ],
  };
}

function generateVLLM(opts: CLIOptions): CLIOutput {
  const { env, quantLevel, contextLen, port, apiKey } = opts;
  const lang: Lang = opts.lang ?? 'en';
  const backend: Backend = opts.backend ?? 'cuda';
  const rocm = backend === 'rocm';
  // Notes that depend on the reader's hardware, shared by every vLLM output.
  const hwNotes: string[] =
    backend === 'metal' || backend === 'cpu'
      ? [L(lang, 'These vLLM commands are for NVIDIA and AMD GPUs — on a Mac or a CPU-only machine, llama.cpp or Ollama is the practical choice', '这些 vLLM 命令面向 NVIDIA 和 AMD 显卡——在 Mac 或纯 CPU 机器上，更实际的选择是 llama.cpp 或 Ollama')]
      : rocm && !vllmRocmSupported(opts.gpuName)
        ? [L(lang, `vLLM's ROCm build lists Radeon RX 7900/7800/7700 and RX 9000 cards and Instinct MI200+; ${opts.gpuName} is not on that list — llama.cpp or Ollama will run it`, `vLLM 的 ROCm 版本支持名单只有 Radeon RX 7900/7800/7700、RX 9000 系列和 Instinct MI200 及以上；${opts.gpuName} 不在名单上——用 llama.cpp 或 Ollama 可以运行`)]
        : [];

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
    image: vllm/vllm-openai${rocm ? '-rocm' : ''}:latest
    container_name: vllm
    ports:
      - "127.0.0.1:${port}:${port}"
    volumes:
      - huggingface_cache:/root/.cache/huggingface
    command: >
      --model ${repoId}${isAWQ ? '\n      --quantization awq' : ''}
      --max-model-len ${contextLen}
      --port ${port}
      --gpu-memory-utilization 0.85${apiKey ? `\n      --api-key ${apiKey}` : ''}${rocm ? `
    devices:
      - /dev/kfd
      - /dev/dri
    group_add:
      - video
    cap_add:
      - SYS_PTRACE
    security_opt:
      - seccomp=unconfined` : `
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]`}
    ipc: host
    restart: unless-stopped
    environment:
      - HF_TOKEN=\${HF_TOKEN}

volumes:
  huggingface_cache:`;

    const command = `# Start vLLM server\ndocker compose up -d\n\n# Test the API\ncurl http://localhost:${port}/v1/models`;
    return { command, compose, notes: [...hwNotes, exposureNote(lang), rocm ? L(lang, 'AMD: official vllm/vllm-openai-rocm image; needs ROCm drivers on the host', 'AMD：使用官方 vllm/vllm-openai-rocm 镜像；主机需要安装 ROCm 驱动') : L(lang, 'Requires NVIDIA Container Toolkit', '需要 NVIDIA Container Toolkit'), L(lang, 'Set HF_TOKEN env var for gated models', '需要授权的模型请设置 HF_TOKEN 环境变量')] };
  }

  if (env === 'docker') {
    const command = [
      // ROCm flags as vLLM's ROCm install docs give them; --ipc=host as both
      // vLLM docker examples use it (PyTorch shared memory).
      ...(rocm
        ? [`docker run \\`, `  --group-add=video \\`, `  --cap-add=SYS_PTRACE \\`, `  --security-opt seccomp=unconfined \\`, `  --device /dev/kfd \\`, `  --device /dev/dri \\`]
        : [`docker run --gpus all \\`]),
      `  --ipc=host \\`,
      `  -p 127.0.0.1:${port}:${port} \\`,
      `  -v ~/.cache/huggingface:/root/.cache/huggingface \\`,
      `  -e HF_TOKEN=$HF_TOKEN \\`,
      `  vllm/vllm-openai${rocm ? '-rocm' : ''}:latest \\`,
      `  --model ${repoId}${quantFlag} \\`,
      `  --max-model-len ${contextLen} \\`,
      `  --gpu-memory-utilization 0.85 \\`,
      `  --port ${port}${apiKeyFlag}`,
    ].join('\n');
    return { command, notes: [...hwNotes, exposureNote(lang), rocm ? L(lang, 'AMD: official vllm/vllm-openai-rocm image; needs ROCm drivers on the host', 'AMD：使用官方 vllm/vllm-openai-rocm 镜像；主机需要安装 ROCm 驱动') : L(lang, 'Requires NVIDIA Container Toolkit', '需要 NVIDIA Container Toolkit'), L(lang, 'Set HF_TOKEN env var for gated models', '需要授权的模型请设置 HF_TOKEN 环境变量')] };
  }

  const command = [
    // Install and entrypoint as vLLM's quickstart documents them: uv picks the
    // torch build for the CUDA driver; AMD installs from vLLM's ROCm index.
    ...(rocm
      ? [`# Install vLLM's ROCm build (Python 3.12, ROCm 7.0)`, `uv venv --python 3.12 --seed && source .venv/bin/activate`, `uv pip install vllm --extra-index-url https://wheels.vllm.ai/rocm/`]
      : [`# Install vLLM (uv picks the torch build for your CUDA driver)`, `pip install --upgrade uv`, `uv pip install vllm --torch-backend=auto`]),
    ``,
    `# Serve the model`,
    `vllm serve ${repoId}${quantFlag} \\`,
    `  --max-model-len ${contextLen} \\`,
    `  --gpu-memory-utilization 0.85 \\`,
    // `--host` defaults to None (every interface) in vllm serve; loopback, as
    // the llama.cpp command does.
    `  --host 127.0.0.1 --port ${port}${apiKeyFlag}`,
  ].join('\n');

  return {
    command,
    notes: [
      ...hwNotes,
      L(lang, `OpenAI-compatible API at http://localhost:${port}/v1`, `OpenAI 兼容接口：http://localhost:${port}/v1`),
      L(lang, `Adjust --gpu-memory-utilization (0.7–0.95) based on your GPU`, `根据显卡调整 --gpu-memory-utilization（0.7–0.95）`),
      L(lang, `Add --tensor-parallel-size N for multi-GPU setups`, `多卡时加上 --tensor-parallel-size N`),
      L(lang, `Replace ${repoId} with the ${isAWQ ? 'AWQ' : isGPTQ ? 'GPTQ' : 'FP16'} repo — vLLM does not serve the GGUF repos linked from the model page`, `把 ${repoId} 换成 ${isAWQ ? 'AWQ' : isGPTQ ? 'GPTQ' : 'FP16'} 仓库——vLLM 不能直接加载模型页链接的 GGUF 仓库`),
    ],
  };
}
