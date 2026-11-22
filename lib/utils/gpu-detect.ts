import { gpuDatabase, type GPU } from '@/lib/data/gpus';

/**
 * Guess the reader's GPU from the WebGL renderer string, entirely in the
 * browser: the string is never stored or sent, only the matched index row is
 * used. Firefox and Safari often mask it ("Apple GPU", "Radeon R9 200 Series"),
 * and a laptop part shares its name with a desktop card that has more memory,
 * so a miss is the normal outcome and the reader always confirms.
 */
export interface GpuDetection {
  /** The chip, named as the index names it without a memory size ("RTX 4060 Ti", "Mac M3 Pro"). */
  label: string;
  /** Index rows with that chip, smallest memory first. More than one when only the size differs. */
  candidates: GPU[];
  /**
   * True when one row is the answer. Never for a Mac: the browser names the chip
   * but not the unified-memory size, which is what decides the fit.
   */
  certain: boolean;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\((r|tm)\)/g, ' ')
    .replace(/\b(nvidia|geforce|amd|radeon|intel|mac|apple)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The chip part of an index name: "RTX 4060 Ti 16G" → "rtx 4060 ti", "Mac M3 Pro 36G" → "m3 pro". */
function chipName(g: GPU): string {
  return g.name.replace(/\s\d+\s?GB?\b/g, '').trim();
}

function chipKey(g: GPU): string {
  return normalize(chipName(g));
}

export function matchRenderer(renderer: string): GpuDetection | null {
  if (!renderer || /laptop|mobile|max-q|\bmx\d/i.test(renderer)) return null;
  // ANGLE wraps the device: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 …)",
  // "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)".
  const inner = renderer.replace(/^ANGLE \(/, '').replace(/\(0x[0-9a-f]+\)/gi, ' ');
  const text = ` ${normalize(inner)} `;
  let best: GPU[] = [];
  let bestLen = 0;
  for (const g of gpuDatabase) {
    if (g.isCPU) continue;
    const key = chipKey(g);
    if (!key || !text.includes(` ${key} `)) continue;
    if (key.length > bestLen) {
      best = [g];
      bestLen = key.length;
    } else if (key.length === bestLen) {
      best.push(g);
    }
  }
  if (best.length === 0) return null;
  const candidates = best.sort((a, b) => a.vram - b.vram);
  return { label: chipName(candidates[0]), candidates, certain: candidates.length === 1 && candidates[0].type !== 'apple' };
}

export function detectGpu(): GpuDetection | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return matchRenderer(renderer);
  } catch {
    return null;
  }
}
