# Dual-Theme Design System (`B4` Day / `B1` Night / Auto) & De-Rainbowed Engineering Palette — 2026-11-26

## Summary

Replaced the single pitch-black (`#0a0a0f` / `#111218`) + AI-template violet (`#7c3aed`) color scheme with a zero-FOUC **dual-theme engineering palette** defaulting to **System (`prefers-color-scheme`)** with instant **Day (`B4` · Clean Lab Light)** / **Night (`B1` · GitHub Dark Dimmed)** / **Auto** switching in the navbar:

1. **Dual-theme CSS custom property token system (`tailwind.config.ts`, `app/globals.css`, `lib/theme/context.tsx`, `components/layout/ThemeToggle.tsx`, `app/layout.tsx`)**:
   - **Night (`B1` · GitHub Dark Dimmed)**: lifted canvas `#1c2128`, card surface `#22272e`, recessed/code `#161b22`, softened foreground `#cdd9e5` (eliminating OLED pitch-black halation).
   - **Day (`B4` · Clean Lab Light)**: fog-slate canvas `#f4f6f9`, pure white card `#ffffff` with `#dce3ec` hairlines and subtle elevation shadow, recessed/code `#eef2f6`, crisp slate foreground `#0f172a`.
   - **Zero-FOUC first paint**: synchronous `<head>` inline script in `app/layout.tsx` resolves `localStorage.getItem('qtz-theme')` + `prefers-color-scheme` before first paint, setting `html[data-theme="light|dark"]` and `colorScheme`; `viewport.themeColor` provides media-matched `#f4f6f9` / `#1c2128` defaults and `ThemeProvider` updates `<meta name="theme-color">` dynamically on manual toggle.
   - **Semantic `ink` & inverted chromatic text ramps**: `ink` (`205 217 229` in Night, `15 23 42` in Day) powers translucent borders/tints across both modes, while chromatic `200–400` text tokens invert between luminous tints in Night and deep ink shades in Day so `text-sky-400`, `text-emerald-400`, `text-amber-300`, and `text-rose-400` pass WCAG AA (`≥ 4.5:1`) in **both** themes.
2. **Direction B — Engineering Sky/Cyan/Teal Accent (`violet-*` → `sky-*`)**:
   - Replaced AI-template violet accents across `app/`, `components/`, `lib/data/formats.ts`, `lib/data/benchmarks.ts`, `BenchCharts.tsx`, and `ShareCard.tsx` with calm engineering Sky (`#0369a1` Day / `#58a6ff` Night; primary button `#0369a1` Day / `#1f6feb` Night).
3. **60-30-10 Color Discipline & Card/Table De-Rainbowing**:
   - Neutralized decorative hardware pills (`consumer-gpu`, `mac`, `cpu-vps`, `pro-gpu`) in `ModelCard`, `ModelDetail`, and `SimilarModels` to uniform neutral slate pills (`pro-gpu` is no longer red).
   - Unified non-verdict numeric readouts (4K VRAM, Max Context, RTX 4090 `tok/s`) in `ModelCard`, `ModelDetail`, `ModelTable`, and `SimilarModels` to high-contrast tabular `slate-100` / `slate-200`.
   - Harmonized quantization format colors (`GGUF`: `sky`, `AWQ`: `cyan`, `GPTQ`: `teal`, `EXL2` / `HQQ`: `slate`) so **Emerald / Amber / Rose** remain strictly reserved for VRAM fit verdicts (`Comfortable` / `Tight` / `Won't Fit`), measured provenance badges, licence restrictions, and superseded warnings.
   - Kept `public/model-card-badge.svg` untouched per standing convention and pinned explicit light-card hexes in `components/tools/EmbedFit.tsx` so third-party iframe embeds remain independent of host theme state.

## WCAG 2.1 AA Contrast Verification

| Token | Night (`B1` `#22272e` card / `#1c2128` bg) | Day (`B4` `#ffffff` card / `#eef2f6` code) | Floor |
| :--- | :--- | :--- | :--- |
| `slate-100` | `#cdd9e5` — **10.48:1** / **11.29:1** | `#0f172a` — **17.85:1** / **15.87:1** | ≥ 4.5:1 AA |
| `slate-400` | `#9eadbd` — **6.40:1** / **6.89:1** | `#475569` — **7.58:1** / **6.74:1** | ≥ 4.5:1 AA |
| `slate-600` (muted body floor) | `#8090a2` — **4.60:1** / **4.95:1** | `#5f7086` — **5.06:1** / **4.50:1** | ≥ 4.5:1 AA |
| `slate-700` (decorative non-text) | `#637282` — **3.05:1** / **3.28:1** | `#7c8ca1` — **3.43:1** / **3.05:1** | ≥ 3.0:1 AA |
| `sky-400` / `sky-300` (accent text) | `#58a6ff` (**5.95:1**) / `#79c0ff` (**7.72:1**) | `#0369a1` (**5.93:1**) / `#075985` (**7.56:1**) | ≥ 4.5:1 AA |
| `sky-600` (`#ffffff` button text) | `#1f6feb` — **4.63:1** | `#0369a1` — **5.93:1** | ≥ 4.5:1 AA |
| `emerald-400` / `amber-300` / `rose-400` | **5.91:1** / **7.72:1** / **5.38:1** | **5.48:1** / **7.09:1** / **6.29:1** | ≥ 4.5:1 AA |

## Verification

- `npm run typecheck` (`tsc --noEmit`): passed with 0 errors.
- `npm run lint` (`next lint`): passed with 0 warnings or errors.
- `npm test`: all unit, data-integrity, CLI-source, feed, and LLMs checks passed.
- `npx next build && npm run postbuild`: full static export + `localize-export.mjs` + `check-export-size.mjs` passed cleanly.

## Handoff notes

- **Theme tokens**: Always use `bg-bg`, `bg-bg-surface`, `bg-bg-recessed`, `bg-ink/[0.0x]`, `border-ink/[0.0x]`, `text-slate-*`, and `sky-*` / `cyan-*` / `teal-*` instead of hardcoded `#0a0a0f`, `#111218`, `bg-white/[0.0x]`, `border-white/[0.0x]`, `hover:text-white`, or `violet-*` so new UI automatically supports both Day (`B4`) and Night (`B1`) modes.
- **Standalone embeds & badges**: Do not modify `public/model-card-badge.svg`, and keep `components/tools/EmbedFit.tsx` pinned to explicit hex values so framed embeds do not invert unexpectedly.
