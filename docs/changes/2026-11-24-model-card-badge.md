# 2026-11-24 — Hugging Face model card badge

The badge sits below the quantization variants on the existing English and Chinese model pages. The image is shared; the instructions, copy feedback, image alt text and destination follow the page language. The badge links to the canonical model page rather than a particular quantization or hardware configuration.

Example Markdown copied for Qwen3-8B:

```markdown
[![View VRAM and quantization details on quantized.uk](https://quantized.uk/model-card-badge.svg)](https://quantized.uk/quant-hub/qwen3-8b/)
```

Both URLs are absolute, even when copied from a preview. The SVG is a static asset, not a new page or external badge service. If clipboard access fails, the page shows the exact snippet in a selectable read-only field. No Hugging Face API calls, repository edits or outreach are part of the feature.

## Verification

- Node 20: `npm test` and `npm run build` passed. The export contains 3,741 files, including the badge SVG, and the postbuild checker validated 1,454 HTML pages.
- Open the same model page in English and Chinese at desktop and phone widths. Confirm that the preview loads, one click copies the matching localized Markdown, and the phone layout stays within the viewport.
- Check that a different model produces its own URL and that denying clipboard access shows the same snippet for manual copy. No Hugging Face repository is needed to test the link.
