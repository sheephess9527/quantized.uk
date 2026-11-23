# 2026-11-23 — Cookbook setup guides

The ticket summarized Google Search Console and Bing Webmaster Tools for
2026-08-22 to 2026-11-21, with Cloudflare traffic as context. Both attachment
downloads returned HTTP 401, so these baselines come from the ticket, not a
fresh read of the raw exports. The other guides' precise queries are unknown.

| English guide | Bing impressions / clicks | Google impressions / clicks |
| --- | ---: | ---: |
| Windows CUDA | 603 / 7 | — |
| AMD ROCm | 437 / 2 | ~4,900 / 28 |
| WSL2 Ollama | 205 / 2 | — |
| Intel Arc | 156 / 0 | — |

- **Windows CUDA:** The reported long tail included prebuilt binaries, WinGet,
  CMake flags and missing DLLs. The guide now starts with the matching CUDA and
  runtime ZIPs and keeps the source build as an option. The
  [WinGet b12602 manifest](https://github.com/microsoft/winget-pkgs/blob/master/manifests/g/ggml/llamacpp/b12602/ggml.llamacpp.installer.yaml)
  uses Vulkan for both architectures; it does not install CUDA.
- **AMD ROCm:** Added a Linux HIP, Windows HIP or Vulkan decision, a gfx target
  table, and Windows and Linux instructions. Checked [llama.cpp's pinned build
  docs](https://github.com/ggml-org/llama.cpp/blob/b12409/docs/build.md),
  [AMD's Windows requirements](https://rocm.docs.amd.com/projects/install-on-windows/en/latest/reference/system-requirements.html),
  and the [release workflow](https://github.com/ggml-org/llama.cpp/blob/b12409/.github/workflows/release.yml):
  the Windows ZIP bundles some HIP DLLs, not the full math libraries.
- **WSL2 Ollama:** Added the host, WSL and Ollama GPU checks, a manual server
  fallback, and CPU-fallback triage following the [NVIDIA WSL
  guide](https://docs.nvidia.com/cuda/wsl-user-guide/index.html) and
  [Ollama's Linux docs](https://docs.ollama.com/linux).
- **Intel Arc:** Added official Windows SYCL and Vulkan ZIP steps and a Linux
  Vulkan build; checked against the [pinned SYCL
  docs](https://github.com/ggml-org/llama.cpp/blob/b12409/docs/backend/SYCL.md)
  and upstream Vulkan instructions.

The [b12409 release API](https://api.github.com/repos/ggml-org/llama.cpp/releases/tags/b12409)
listed the Windows x64 CUDA 12.4 and 13.5 binary/runtime ZIPs and the ROCm 10.0,
SYCL, and Vulkan ZIPs. This was a source and export check, not a GPU runtime
test; no guide was marked hardware-verified. Both languages keep the same
slugs and pre-existing section positions, and Chinese titles are unchanged.
Compare each URL's clicks and CTR against this baseline after deployment.
