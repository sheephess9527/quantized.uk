# Calculator fit follow-up · 2026-11-19

The forward result puts eligible quant and context changes before launch
commands when the estimate exceeds the usable GPU capacity. It excludes
alternatives that still exceed that capacity, even if the site's existing
tight verdict allows a small overrun for CPU offload. A separate, collapsed
llama.cpp option holds the CPU-offload command. It shows the planner's
reserve across GPUs, the resulting GPU budget, and the estimated system RAM
for the offloaded portion. The normal fit shows estimated headroom before
any offload reserve. The existing memory model and system-wide fit
thresholds stay in effect.

Commands with an unresolved source file or required placeholder are labelled
templates. The selected model, quant and context continue to feed the shared
command generator. The calculator uses the exact GGUF filename where
recorded. Ollama sets its context via the existing local Modelfile flow.

The changes cover `VRAMCalculator.tsx`, `LaunchCommands.tsx`,
`calc-insights.ts`, the bilingual translations and changelog, and the
corresponding README and CLAUDE guidance.

## Hardware validation still needed

No NVIDIA or AMD GPU device was exposed in the workspace. Both 18.25 GiB
and 14.03 GiB are calculator estimates. No measured peak, guaranteed fit,
or conclusion about calibration error is published here.

Start with the 16 GB RTX 4060 Ti and Arete 27B at 4096 context, f16 K/V,
single sequence and llama.cpp b12409. Use the exact Q4_K_M and Q3_K_M
files from the calculator. Run one short fixed prompt plus a fixed output
length with both configurations. For a full GPU test, explicitly request
all layers and confirm the device placement in the load log. Record an OOM
or unexpected offload as its own outcome. Test the displayed CPU-offload
command separately and record the estimated and actual split. If a 24 GB
card is available, repeat Q4_K_M there to compare a full GPU load with
the unsuccessful or split 16 GB test. For Ollama, validate the generated
command separately and capture the loaded model's context and device
placement so that Ollama and llama.cpp measurements remain attributable
to their respective runtime.

Record GPU, OS, driver, runtime build, exact file/revision, idle free VRAM,
loaded and peak GPU memory, observed GPU layers, context, KV type,
sequence count and outcome. Record whether memory was measured for the
process or the whole device. The existing calculator report form can
capture the settings, observations and runtime logs as Markdown.

## Verification

- All five `npm test` suites passed. `npm run build` exported 626 pages and
  passed localization, metadata, internal-link and structured-data checks.
- Chromium passed the forward flow in English and Chinese at 390 px, with
  a 1440 px overflow check. Arete 27B Q4_K_M at 4K shows 18.25 GiB and
  prioritizes the Q3_K_M option at 14.03 GiB. The CPU fallback is closed by
  default. Expanding it shows 1.00 GiB reserved, a 15.00 GiB GPU allocation
  budget, and a llama.cpp command with `-ngl 52 -c 4096`.
- Q3_K_M at 4K shows 1.97 GiB estimated headroom. Windows and Linux
  commands use `-c 4096`, `-ngl 99` and the recorded GGUF. The Ollama
  command uses the exact HF filename and sets `num_ctx 4096`. Clipboard text
  matched the rendered command. A Q3_K_M estimate of 16.51 GiB also took
  the over-budget path on the 16 GiB card. The AWQ placeholder was clearly
  labelled a template.
- Both Arete files were confirmed in the publisher's [GGUF file listing](https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF/tree/main).
- The feature remains on `feature/calculator-run-plan`. Verification used
  the local production export.
