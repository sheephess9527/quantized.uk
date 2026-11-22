import { VRAM_IMAGE_SIZE, type VramPreview } from './vram-result';

const accent = { green: '#6ee7b7', yellow: '#fcd34d', red: '#fda4af', neutral: '#c4b5fd' };
const escapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escape = (s: string) => s.replace(/[&<>"']/g, c => escapes[c]);

function shorten(s: string, limit: number) {
  return s.length > limit ? `${s.slice(0, limit - 1).trimEnd()}…` : s;
}

export function vramSvg(preview: VramPreview): string {
  const { width, height } = VRAM_IMAGE_SIZE;
  const title = shorten(preview.title, 50);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#101024"/>
  <rect x="0" width="12" height="630" fill="#8b5cf6"/>
  <rect x="72" y="64" width="44" height="44" rx="12" fill="#7c3aed"/>
  <g font-family="Noto Sans SC">
    <text x="94" y="95" text-anchor="middle" fill="#ffffff" font-size="28">Q</text>
    <text x="136" y="95" fill="#c4b5fd" font-size="28">${escape(preview.eyebrow)}</text>
    <text x="72" y="227" fill="#f8fafc" font-size="${title.length > 34 ? 48 : title.length > 23 ? 56 : 68}">${escape(title)}</text>
    <text x="72" y="292" fill="#cbd5e1" font-size="32">${escape(shorten(preview.details, 68))}</text>
    <rect x="72" y="345" width="1056" height="130" rx="20" fill="#211b39"/>
    <text x="102" y="${preview.hardware ? 404 : 426}" fill="${accent[preview.tone]}" font-size="38">${escape(preview.answer)}</text>
    ${preview.hardware ? `<text x="102" y="449" fill="#cbd5e1" font-size="28">${escape(shorten(preview.hardware, 65))}</text>` : ''}
    <path d="M72 530H1128" stroke="#342957"/>
    <text x="72" y="579" fill="#a99ada" font-size="27">quantized.uk</text>
  </g>
</svg>`;
}
