# VRAM estimation consistency

Baseline: cf1469fff185f1be46affc90fd2a1a9716d522b2, including PR #60.

## Accounting

Prefer recorded language-model file bytes (sum all GGUF parts, exclude the optional projector). Otherwise use total parameters × BPW / 8. Of 475 rows, 240 have structured file listings and two Beam rows have exact multipart byte totals in historical repository notes. The candidate retains those totals without inventing a file path or a verification date. Another 17 BPWs have documented published-size evidence, 213 use the table rate without such an annotation, and three GPT-OSS model-specific rates have unverified size provenance. A numerical difference alone cannot establish where a historical rate came from.

The weight budget includes one 2% planning allowance on either basis. Exact file bytes already reflect the file's tensors and metadata; there is no second embedding surcharge. The allowance is a conservative policy choice, without per-runtime peak-memory calibration. The total is (weight budget + architecture-specific KV + requested encoder) × 1.10. The existing 88% comfortable ceiling and hardware-specific upper limits apply to usable capacity. The UI reports weight allowance as a component of the weight budget. Parts round independently; the total uses unrounded terms.

Homepage and budget tiers share GPU fits. Reverse lookup, GPU/pair pages, model details, upgrades, context reach, indexed forward inputs, file imports, embeds and share previews now carry the same weight basis. A unique default-branch file match on repository, full path (first shard for splits) and combined size reuses catalog KV layout and context limit. Unmatched files and explicit revisions use the importer's existing config path. Mixed-rig reverse lookup, links and share previews retain the extra devices. Over-budget advice remains available inside the yellow range.

## Controlled comparison

One hardware profile, 4096 tokens inside the model window, one sequence, FP16 KV, text only, supported formats. Includes legacy models and four CPU profiles. One row per model, format, level and hardware ID; comparable baselines are evaluated separately. Grades use the site's rounded two-decimal total.

| Former path | Eligible rows | Green to yellow | Yellow to red | Red to yellow |
| --- | ---: | ---: | ---: | ---: |
| Indexed BPW | 55,766 | 0 | 6 | 1 |
| File bytes, with catalog shape held fixed | 30,366 | 206 | 166 | 0 |

The seven indexed transitions are Qwen3.8 27B Q6_K on six 24-GiB-usable devices (25.20 → 25.21 GiB) and ERNIE 4.5 21B-A3B Q4_K_M on Mac M3 Pro 18G (14.18 → 14.17 GiB). On RTX 4060 Ti 16G that ERNIE file changes from the old import's green 13.90 to the common yellow 14.17 GiB. The green cutoff is 14.08 GiB. The 372 import transitions include 10 CPU rows and represent 362 distinct model/device pairs. They are simulated settings, not visitor imports or GPU runs.

## Verification

The offline regression compares exact-file inputs, indexed estimates, embedded results, reverse recommendations and bilingual share previews, exercises a mixed rig, and checks all catalog rows against the shared formula. The file-import suite covers summed shards and the matched catalog cache layout. Existing data validation continues checking bilingual fixed descriptions against the formula.
