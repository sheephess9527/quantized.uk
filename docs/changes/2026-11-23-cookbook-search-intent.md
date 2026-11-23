# 2026-11-23 — Cookbook setup guides

## Checked against the actual exports

Read the Bing Webmaster Tools and Google Search Console web exports for
2026-08-22 to 2026-11-21. The page reports give URL-level baselines for the
English guides. A dash means no page row was returned, not zero traffic.

| English guide | Bing impressions / clicks | Google impressions / clicks |
| --- | ---: | ---: |
| Windows CUDA | 603 / 7 | — |
| AMD ROCm | 437 / 2 | 4,859 / 28 |
| WSL2 Ollama | 205 / 2 | — |
| Intel Arc | 156 / 0 | — |

The keyword/query CSVs contain 1,868 Bing and 194 Google rows, respectively,
aggregated across the site. Neither includes a landing URL, so the counts
below are **matching query rows by topic**, not counts attributed to a guide.
Matches may overlap; Google also omits anonymized queries.

| Guide topic | Bing query rows | Google query rows | Match signals |
| --- | ---: | ---: | --- |
| Windows CUDA | 154 | 0 | llama.cpp or ggml with CUDA, cuBLAS, WinGet, nvcc, Pascal or SM 61; also exact llama.cpp Windows variants |
| AMD ROCm | 170 | 24 | ROCm, relevant Radeon/RX models or gfx targets, 780M, or Ollama with AMD GPU |
| WSL2 Ollama | 86 | 0 | Ollama plus WSL or WSL2 |
| Intel Arc | 45 | 1 | Intel Arc, named Arc models, llama.cpp with SYCL, or Ollama with Vulkan |

The follow-up answers CUDA detection and Pascal 6.1 ZIP selection using the
[pinned release workflow](https://github.com/ggml-org/llama.cpp/blob/b12409/.github/workflows/release.yml)
and [CUDA architecture defaults](https://github.com/ggml-org/llama.cpp/blob/b12409/ggml/src/ggml-cuda/CMakeLists.txt).
It covers Radeon multi-GPU selection and the Windows 780M rocBLAS error using
the [pinned multi-GPU guide](https://github.com/ggml-org/llama.cpp/blob/b12409/docs/multi-gpu.md),
[AMD target definitions](https://github.com/ROCm/TheRock/blob/main/cmake/therock_amdgpu_targets.cmake)
and Windows support requirements. Ollama's [Windows](https://docs.ollama.com/windows),
[GPU](https://docs.ollama.com/gpu), and [Docker](https://docs.ollama.com/docker)
docs and the [Docker Desktop WSL 2 GPU docs](https://docs.docker.com/desktop/features/gpu/)
cover native versus WSL use, NVIDIA containers and the defaults for Vulkan.
[Intel's Arc 140V specs](https://www.intel.com/content/www/us/en/products/sku/240961/intel-core-ultra-7-processor-258v-12m-cache-up-to-4-80-ghz/specifications.html)
identify the Lunar Lake GPU; the pinned SYCL support table covers Lunar Lake
integrated Arc but does not name Arc Pro B70, so no B70 support claim is made.

## Guide changes

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
SYCL, and Vulkan ZIPs. The Windows CUDA ZIP path was checked against upstream
sources, not run on hardware. The guide's original stack describes the source
build, not the ZIPs. No guide was newly marked hardware-verified. Both languages
keep the same slugs and pre-existing section positions, and Chinese titles are unchanged.
Compare each URL's clicks and CTR against this baseline after deployment.

The Windows CUDA, ROCm, SYCL and Vulkan ZIPs do not bundle the Microsoft
Visual C++ runtime. Both languages now point readers to
[Microsoft's x64 Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
before running the ZIP binaries.
