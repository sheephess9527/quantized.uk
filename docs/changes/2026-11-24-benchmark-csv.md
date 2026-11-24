# 2026-11-24 — Measured benchmark filters and CSV

On the existing English and Chinese benchmark pages, the measured hardware matrix is above the charts. Hardware, model, runtime and quantization filters combine; clearing them shows the full matrix. The CSV contains the same rows as the table, in the same order, with localized notes, quantized.uk attribution, the language-specific source page and CC BY 4.0 license. It uses a UTF-8 BOM for spreadsheet compatibility.

The CSV contains historical throughput and memory measurements from `matrixData` only. The date is first publication, not the unknown exact measurement date. No measurements were added or changed; the chart-only data, estimates and visitor submissions are outside the export. No routes, Chinese titles or paid services were added.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. The measured-speed suite checks combined and empty filters, the full export, both languages' citation data and provenance, and CSV escaping. Serve the build and check both pages at desktop and 375 px: filter by M3 Max 48G and Ollama and download the single visible row; then try an empty combination and reset filters. Confirm the static export stays below 4,000 files.

Local verification: the production export contains 3,739 files. In Chromium at 1440×1000 and mobile emulation at 375×812, both languages narrowed 16 runs to one, downloaded that row with the recorded runtime and first publication date plus its citation fields, disabled download with zero matches, and restored all 16 rows on reset. The phone controls met the 44 px touch target and the page had no horizontal overflow.
