# Calculator run plan · 2026-11-18

The model-to-VRAM result opens with the selected model, quant and context,
estimated memory, hardware budget, fit verdict and remaining memory where
applicable. It places the launch command and visible copy control beside that
decision. The existing memory breakdown, evidence, reports and detailed
hardware views follow.

When a configuration is tight or over budget, the result can suggest a
compatible shipped quant or a shorter context. Each button previews the
recalculated total and fit verdict using the current rig, KV precision,
concurrency and encoder budget. Applying a button updates the selected
settings, share URL and generated commands together.

The launch panel uses the selected quant for each offered runtime. The
llama.cpp CPU split still comes from the existing offload planner. Ollama is
offered when the plan does not need an explicit split and a GGUF source can
be identified. Its native command sets the chosen context with
`PARAMETER num_ctx` in a temporary Modelfile and uses a context-specific
local tag. This behavior is scoped to calculator commands. Advanced
settings such as custom KV precision and vision projector setup have a note
about matching them in the runtime.

Files changed:

- `components/tools/VRAMCalculator.tsx` for the run plan and fit actions.
- `components/tools/LaunchCommands.tsx` and `lib/utils/cli.ts` for command
  placement, runtime selection, copy feedback and Ollama context.
- `lib/i18n/translations.ts`, `lib/data/meta.ts` and
  `lib/data/changelog.ts` for bilingual text and release information.
- `scripts/check-cli-sources.ts` for native Ollama command regression checks.
- `README.md`, `CLAUDE.md` and this record for the change and its conventions.

Ollama syntax was checked against the [v0.40.16 Modelfile documentation](https://github.com/ollama/ollama/blob/v0.40.16/docs/modelfile.mdx).

## Verification

All five `npm test` suites passed. `npm run build` exported 626 pages,
including 312 Chinese pages, and passed metadata, internal links and
structured-data checks.

Chromium exercised both languages at 390 px and checked overflow at 1440 px.
On a 16 GB RTX 4060 Ti, Arete 27B Q4_K_M at 4K displayed 18.25 GiB.
Applying Q3_K_M updated the result to 14.03 GiB, changed the share URL, and
used the exact Q3_K_M file in both launch commands. The 8K tight configuration
offered a 4K context adjustment and regenerated the matching command.
The clipboard matched the command on screen. Advanced settings displayed the
runtime setup note. Commands were inspected and copied in the browser.
The model was not run on a GPU.

The feature shipped with the follow-up. See the [production deployment record](2026-11-19-calculator-fit-followup.md#production-deployment).
