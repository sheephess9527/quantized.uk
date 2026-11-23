# 2026-11-23 — GPU and VRAM-tier pages answer "能跑多大的模型"

## Evidence (Bing Webmaster Tools export, 2026-08-22 to 2026-11-21, Web)

- Bing sent 1,710 clicks from 22,291 impressions over the period; Google Search Console showed
  110 clicks. Chinese pages took 1,020 of the 1,058 page-report clicks (96%).
- 239 keyword rows ask what a card or memory size can run ("能跑 / 可以跑 / 能运行 / 跑什么 /
  跑多大 / 跑哪些"): 696 impressions and 195 of the 565 keyword-report clicks. 84 of them name
  only a memory size (345 impressions, 67 clicks).
- The most common shape asks **how big** (多大 / 多少b / 多大参数), which the pages answered only
  with a model name at its best-quality quant, not with a parameter count.

Queries this change was built from (impressions / clicks):

| Query | Impr. | Clicks |
|---|---:|---:|
| 16g显存能跑多大的模型 | 119 | 8 |
| 8g显存可以跑多大的模型 | 31 | 2 |
| 8g显存能跑什么模型 | 26 | 3 |
| 12g显存能跑多大模型 | 11 | 1 |
| 5060ti 16g能跑多大的模型 | 10 | 3 |
| 5080能跑多大的模型 | 10 | 6 |
| 5060可以跑多大的模型 | 8 | 0 |
| 4070显卡能跑什么大模型 | 8 | 3 |
| 5070能跑多大模型 | 8 | 3 |
| 5070 显卡可以跑什么大模型 | 8 | 0 |
| 5090可以跑多大的模型 | 7 | 1 |
| 32g显存能跑多大的模型 | 6 | 1 |
| 128g显存能跑什么模型 | 6 | 3 |
| 4070ti能跑什么模型 | 6 | 2 |
| 5080 可以跑什么模型 | 6 | 3 |
| 8g4060能跑多大参数的模型 | 4 | 2 |
| 5090显卡可以跑多少b的大模型 | 4 | 1 |
| 4070能跑多大的模型 | 4 | 1 |

Page side: `/zh/best/8gb-vram/` 841 impressions at 5.1% CTR (position 7.1), `/zh/best/16gb-vram/`
356 at 7.0%, `/zh/gpu/rtx-5060/` 60 impressions and 0 clicks, `/zh/gpu/rtx-4060/` 28 and 0,
against 28% for `/zh/gpu/rtx-5070/` and 24% for `/zh/gpu/rtx-5080/`.

## Change

- New `largestAtQ4(gpu)` (`lib/utils/gpu-page.ts`): the largest current (non-superseded) model
  whose GGUF Q4_K_M build fits comfortably at 4K, batch 1 — one level for every card so the
  parameter count compares across pages. Sizing is `calcVRAM` + `getVerdict`, as everywhere else.
- `/gpu/{card}/` and `/zh/gpu/{card}/`: English title `RTX 5060: what LLMs can it run? Up to 9B at Q4`;
  both languages' meta description leads with the same answer,
  and a first FAQ "{card} 能跑多大的模型？" / "How big a model can a {card} run?" (visible and in
  JSON-LD). Titles too wide for the size keep the old question.
- `/best/{N}gb-vram/` and `/zh/best/{N}gb-vram/`: same title, description lead and FAQ. The Apple
  tier spans 8–512 GB and keeps its old copy.

Example: `/zh/best/16gb-vram/` was "16G 显存能跑的最好的本地大模型 —— 86 个装得下" with a
description leading with Xing4.0 29B-A4B at Q2_K; it is now "16G 显存能跑多大的模型？Q4 最大约
21B MoE，86 个装得下", leading with GPT-OSS 20B at Q4_K_M, about 11.3 GB.

## Scope: `/zh/gpu/` titles unchanged

The `/zh/gpu/` titles stay `{显卡} 能跑哪些大模型？`, exactly as live before this change. They
already win most of the site's Bing clicks (RTX 5070 28% CTR, 5080 24%, 5090 14%), MoE labels
would read awkwardly there ("Q4 最大约 16B-A2.4B" on 12 GB cards), and the change shipped
overnight with nobody watching CTR. Two zh GPU pages do get impressions without clicks
(`/zh/gpu/rtx-5060/` 60 / 0, `/zh/gpu/rtx-4060/` 28 / 0); retitle only after a fresh export
confirms that, and say so before changing anything.

## Pages not added

Every card Bing names with more than two impressions already has a GPU page. Memory sizes named
without a tier page: 128G (11 impressions, already served by the DGX Spark 128G, Mac M5 Max 128G and
Ryzen AI Max+ 395 128G pages), 64G (6), 4G (6), 10G (4). None justified a new page under the owner's
small-site rule, so the export stays at **3,737 files**.

## Checks

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build` (postbuild: 1,452 titles and
descriptions unique and within budget; `check-export-size`: 3,737 files).

## Limits

Parameter counts follow each model's `paramLabel`, so MoE models read "21B MoE" or "30B-A3B".
The ceiling is at 4K context; the FAQ says it drops as context grows. Bing's keyword report is
Web only and covers 2026-08-22 to 11-21; re-read it after a few weeks to see whether CTR moved.
