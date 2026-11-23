# 2026-11-24 mobile layout and contrast

- **Calculator:** Short introductory copy on phones. Reverse mode puts the GPU picker and current compatible-configuration count ahead of sharing and the reranker cross-link. The jump link focuses the result; the forward pinned estimate and desktop placement are unchanged.
- **Touch and contrast:** Phone mode/share controls, context choices and home/GPU context and batch presets have 44 px minimum targets. The calculator's advanced batch slider has a 44 px touch area. Home recommendation details, Cookbook tags and Hub result counts use existing brighter colors, and the main home pickers, reverse GPU picker and Hub search have clearer borders.
- **Model index and home:** Mobile search sits under the Hub heading; quick GPU picks stay available and secondary filters and scale stats are collapsed by default. Home hero spacing brings the hardware and task picker closer without changing its options. Both languages share the layout; all routes, Chinese search titles and the dark palette are retained.

## Verification

The Hub uses “Search models” / “搜索模型” and “GPU filter off” / “已关闭 GPU 筛选”. The saved-GPU action is unchanged. The full index count still includes legacy models, while the results count reflects the current filters and excludes legacy models by default.

Run `npm test` and `npm run build`, then serve the export with `npm start` and run `npm run check:live -- --phone-ui http://localhost:3000`. The browser check covers the reverse jump and filter disclosure in both languages at 390×844. Confirm that the export stays below 4,000 files.

Local export verification (2026-11-23 UTC): 3,738 files. At 390×844 in English and Chinese, choosing RTX 4090 put the calculator jump at y=462 px and the results heading at y=760 px. Following the jump moved the heading to 117 px from the viewport top. Hub search moved from y=683/659 px on the live site to y=180 px locally; the home picker heading moved from y=636/580 px to y=548/492 px. The three contrast samples measured 5.67:1 (home recommendation detail), 5.54:1 (Cookbook tag) and 6.90:1 (Hub count). Sampled touch controls were at least 44 px in both dimensions, and the home, Cookbook, Hub, calculator and RTX 4090 pages had no horizontal document overflow.
