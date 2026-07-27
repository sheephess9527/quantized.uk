# Contributing to quantized.uk

Thank you for helping build the most practical LLM quantization reference on the web. This site is **fully static** — all content lives in TypeScript data files under `lib/data/`. No database, no API server.

Also read **`CLAUDE.md`** (working agreement) and the **README.md** handoff box before large changes.

## Quick start

```bash
git clone https://github.com/sheephess9527/quantized.uk.git
cd quantized.uk
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
```

Analytics: Plausible defaults to domain `quantized.uk` in code (optional override via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`). See `.env.example`.

---

## What you can contribute

| Area | Files | Notes |
|------|-------|-------|
| **Models** | `lib/data/models-extra-6.ts` (or new pack) + import in `models.ts` | Primary data moat — see below |
| **HF live stats** | `lib/data/hf-repos.mjs` only | `hf-repos.ts` re-exports; do not duplicate in the fetch script |
| **Cookbook articles** | `lib/data/cookbook.ts`, `cookbook-extra.ts`, `cookbook-extra-2.ts` | Prefer `verifiedAt` + `verifiedStack` on high-traffic guides |
| **Benchmarks** | `lib/data/benchmarks.ts` | Speed / PPL matrix data |
| **GPUs** | `lib/data/gpus.ts` | Hardware database for VRAM calculator |
| **Translations** | `lib/i18n/translations.ts` | EN + ZH required for UI strings |
| **Changelog** | `lib/data/meta.ts` | Bump `dataLastUpdated` + top `changelog` entry |

---

## Adding a model

### 1. Pick the right file

- **Core / flagship models** → `lib/data/models.ts` (`baseModels`) only if truly foundational
- **Batch additions** → latest pack (`models-extra-6.ts` as of 2026-07) or new `models-extra-N.ts` imported from `models.ts`

Keep each file manageable (~20 entries).

### 2. Model entry schema

See `lib/data/types.ts`:

```typescript
{
  id: 'qwen2.5-7b',              // URL slug — lowercase, hyphens, unique
  name: 'Qwen2.5 7B Instruct',   // Display name
  family: 'Alibaba Qwen2.5',
  params: 7.62,                  // Billions (total, not active for MoE)
  paramLabel: '7B',
  categories: ['general', 'instruct', 'code'],  // general | instruct | code | multimodal
  hardwareTags: ['consumer-gpu', 'mac', 'cpu-vps'],  // consumer-gpu | pro-gpu | mac | cpu-vps
  contextLength: 131072,
  arch: { layers: 28, attHeads: 28, kvHeads: 4, headDim: 128 },
  description: { en: '...', zh: '...' },
  addedAt: '2026-07-22',         // optional YYYY-MM-DD — Hub “Recently added” (45 days)
  // status: 'superseded', supersededBy: 'qwen3-8b',  // optional legacy redirect
  quants: [
    {
      format: 'GGUF',            // GGUF | AWQ | EXL2 | GPTQ | HQQ
      level: 'Q4_K_M',
      bpw: 4.85,
      vramGB: 5.4,               // Total VRAM incl. ~10% overhead at ctx=4096, batch=1
      pplLossPercent: 3.0,       // WikiText-2 PPL loss vs FP16 baseline
      speedRTX4090: 155,         // tokens/sec on RTX 4090 (optional)
      confidence: 'community',   // optional: measured | estimated | community
      hfSearchUrl: 'https://huggingface.co/models?search=...',
    },
  ],
}
```

### 3. Data quality guidelines

- **VRAM**: Use the site calculator to sanity-check. Round to one decimal.
- **PPL loss**: Cite a source (your own run, published benchmark, or model card). If estimated, leave `confidence` unset or set `estimated`.
- **Speed**: RTX 4090, llama.cpp CUDA or ExLlamaV2, prompt_len=128, gen_len=128, batch=1 — match `lib/data/meta.ts` methodology.
- **At least 2 quant variants** per model when community quants exist (e.g. Q4_K_M + AWQ).
- **Bilingual descriptions** required (EN + ZH).
- **Freshness**: set `addedAt` on new models so they appear under Hub `?recency=recent` and homepage weekly block.

### 4. Wire up Hugging Face stats (optional but preferred)

Add a primary repo id to **`lib/data/hf-repos.mjs` only** (e.g. `bartowski/...` or official `Qwen/...-GGUF`).

Build-time fetch merges with existing `hf-stats.json` on failure — no token required.

### 5. Ship checklist

```bash
npm run build
```

Confirm:

- New page at `/quant-hub/<your-model-id>/`
- Model appears in Quant Hub filters and VRAM calculator dropdown
- Homepage stats count increments
- If user-visible: `meta.ts` changelog + `dataLastUpdated`
- Hardcoded “N+ models” copy in SEO/layouts/`llms.txt` if you care about marketing numbers
- README §9 changelog + CLAUDE.md if conventions changed

---

## Cookbook guides

- Add articles in `cookbook-extra-2.ts` (or a new pack) and export through `cookbook.ts`.
- High-traffic guides should set:

```typescript
verifiedAt: '2026-07-22',
verifiedStack: {
  en: 'Ollama 0.6+ · llama.cpp CUDA · …',
  zh: 'Ollama 0.6+ · llama.cpp CUDA · …',
},
```

---

## Docs discipline

Same as `CLAUDE.md`: behaviour change without README/CLAUDE update is incomplete.

---

## Deploy

Push to `main` → Cloudflare Pages builds `npm run build` → publishes `out/`.

Do **not** put private GitHub profile/repo URLs on live site pages (Footer / About / marketing copy).

Questions? Site feedback: `hello@quantized.uk` (Footer).
