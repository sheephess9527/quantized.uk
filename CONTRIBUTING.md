# Contributing to quantized.uk

Thank you for helping build the most practical LLM quantization reference on the web. This site is **fully static** — all content lives in TypeScript data files under `lib/data/`. No database, no API server.

## Quick start

```bash
git clone https://github.com/sheephess9527/quantized.uk.git
cd quantized.uk
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
```

Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=quantized.uk` in your environment (or Cloudflare Pages) to enable privacy-friendly analytics. See `.env.example`.

---

## What you can contribute

| Area | Files | Notes |
|------|-------|-------|
| **Models** | `lib/data/models.ts`, `models-extra.ts`, `models-extra-2.ts` | Primary data moat — see below |
| **HF live stats** | `lib/data/hf-repos.ts`, `scripts/fetch-hf-stats.mjs` | Keep both maps in sync |
| **Cookbook articles** | `lib/data/cookbook.ts`, `cookbook-extra.ts`, `cookbook-extra-2.ts` | Standalone pages at `/cookbook/[slug]/` |
| **Benchmarks** | `lib/data/benchmarks.ts` | Speed / PPL matrix data |
| **GPUs** | `lib/data/gpus.ts` | Hardware database for VRAM calculator |
| **Translations** | `lib/i18n/translations.ts` | EN + ZH required for UI strings |
| **Changelog** | `lib/data/meta.ts` | Add entry for user-visible data changes |

---

## Adding a model

### 1. Pick the right file

- **Core / flagship models** → `lib/data/models.ts` (`baseModels`)
- **Batch additions** → `lib/data/models-extra.ts` or `models-extra-2.ts`

Keep each file manageable (~20 entries). Add a new `models-extra-N.ts` when a file grows large.

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
  quants: [
    {
      format: 'GGUF',            // GGUF | AWQ | EXL2 | GPTQ | HQQ
      level: 'Q4_K_M',
      bpw: 4.85,
      vramGB: 5.4,               // Total VRAM incl. ~10% overhead at ctx=4096, batch=1
      pplLossPercent: 3.0,       // WikiText-2 PPL loss vs FP16 baseline
      speedRTX4090: 155,         // tokens/sec on RTX 4090 (optional)
      hfSearchUrl: 'https://huggingface.co/models?search=...',
    },
  ],
}
```

### 3. Data quality guidelines

- **VRAM**: Use the site calculator to sanity-check. Round to one decimal.
- **PPL loss**: Cite a source (your own run, published benchmark, or model card). If estimated, say so in the PR.
- **Speed**: RTX 4090, llama.cpp CUDA or ExLlamaV2, prompt_len=128, gen_len=128, batch=1 — match `lib/data/meta.ts` methodology.
- **At least 2 quant variants** per model when community quants exist (e.g. Q4_K_M + AWQ).
- **Bilingual descriptions** required (EN + ZH).

### 4. Wire up Hugging Face stats (optional but preferred)

Add a primary GGUF repo to **both**:

- `lib/data/hf-repos.ts`
- `scripts/fetch-hf-stats.mjs` (`hfRepoMap`)

Use the most popular community quant (often `bartowski/...` or official `Qwen/...-GGUF`).

### 5. Verify

```bash
npm run build
```

Confirm:

- New page at `/quant-hub/<your-model-id>/`
- Model appears in Quant Hub filters and VRAM calculator dropdown
- `getSiteStats()` homepage count increments

---

## Adding a cookbook article

1. Add an `Article` object to `lib/data/cookbook.ts` or `cookbook-extra.ts`
2. Required fields: `id`, bilingual title/description, `category`, `difficulty`, `readTime`, `tags`, `publishedAt`, `content[]`
3. Each content section needs bilingual `heading` + `body`; `code` blocks are optional
4. Static page auto-generates via `app/cookbook/[slug]/page.tsx`
5. Add slug to sitemap (automatic if imported in `lib/data/cookbook.ts`)

**Categories:** `edge` | `server` | `docker` | `mac`  
**Difficulty:** `beginner` | `intermediate` | `advanced`

Focus on **battle-tested, reproducible** guides — exact commands, hardware tested, gotchas included.

---

## Submitting benchmark data

Edit `lib/data/benchmarks.ts`. Include:

- Model + quant level tested
- Hardware (GPU, driver, framework version)
- Metric (tok/s or PPL)
- Test conditions matching our methodology panel on `/benchmarks`

---

## i18n

All user-facing strings go in `lib/i18n/translations.ts` under both `en` and `zh`. The type system uses `as const` — mirror structure exactly.

---

## PR checklist

- [ ] `npm run build` passes with no errors
- [ ] New model IDs are unique and URL-safe
- [ ] EN + ZH descriptions provided
- [ ] `lib/data/meta.ts` changelog entry added (for data changes)
- [ ] HF repo map updated if applicable
- [ ] No unrelated refactors

---

## Code of conduct

Be constructive. Quantization data is often approximate — cite sources, flag estimates, and prefer reproducible measurements over hype.

Questions? Open a [GitHub issue](https://github.com/sheephess9527/quantized.uk/issues).