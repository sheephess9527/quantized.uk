# MoE offload and host memory · 2026-11-26

Based on a001a4d. The existing offload planner selects either whole layers or expert-only placement. Both memory readouts and llama.cpp use that choice. RAM bandwidth continues to inform the planner internally. Installed RAM is a separate optional input. The host reserve is an estimated 4 GiB. The heavy expert tier starts at one half of the verified expert layers. Unknown placements have no expert percentage.

## Handoff notes

- Coverage increased from 30/53 to 44/53 tagged models. The per-model math, config sources and residual parameters are in [data corrections](../data-corrections.md). Test coverage includes the pre-change Qwen3 30B-A3B plan and missing-layout fallback.
- Publisher config access was gated or unavailable for DBRX, Jamba Mini, Maverick, Muse Spark Open and Mistral Large 3 at the indexed repo path. Nemotron Bolt has varying expert counts and widths per layer. K2 MoVA adds a second expert mechanism. Metis Praxis and Logos use adaptive routing and repeated passes. Leave these on the whole-layer path until their llama.cpp routed tensors can be represented and verified.
- Hy4 Flash stays pending. Tencent’s config and weight index are accessible, but the SSD-backed Engram table, runtime port and sparse cache residency need a documented load. No throughput number was adopted.
- No systemOverheadGB field exists at this base. The TODO in moeOffload marks where to account for it once supplied by the environment selector. Host RAM reserve and the existing per-card fit margin serve different purposes.
