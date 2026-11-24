import { importFromHub, type ImportedShape } from '@/lib/utils/hf-import';

const HUB = 'https://huggingface.co';
const shardPattern = /-(\d{5})-of-(\d{5})(?=\.gguf$)/i;

export interface QuantFileRef {
  repo: string;
  revision: string;
  path: string;
}

export interface HubQuantFile extends QuantFileRef {
  bytes: number;
}

function validRef({ repo, revision, path }: QuantFileRef): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(repo) &&
    [...repo.split('/'), ...revision.split('/'), ...path.split('/')].every(
      p => p && p !== '.' && p !== '..' && !/[\\\u0000-\u001f]/.test(p),
    ) && path.length <= 1024 && revision.length <= 256 &&
    /\.gguf$/i.test(path);
}

function isAuxiliaryFile(path: string): boolean {
  return /(?:^|[\/\s._-])(?:mmproj|mtp[\s._-]+heads?|draft|imatrix)(?=$|[\/\s._-])/i.test(path);
}

function nonMtpCounterpart(path: string): string | undefined {
  const name = path.split('/').at(-1)!;
  const other = name.replace(/^mtp[\s._-]+|[\s._-]+mtp(?=[\s._-])/i, '');
  if (other !== name) return path.slice(0, -name.length) + other;
}

async function hasLargerShardedCounterpart(
  { repo, revision }: QuantFileRef, counterpart: string, bytes: number, fetchImpl: typeof fetch,
): Promise<boolean> {
  const res = await fetchImpl(`${HUB}/api/models/${repo}/revision/${encodeURIComponent(revision)}?blobs=true`);
  if (!res.ok) return false;
  const listing: { siblings?: { rfilename: string; size: number }[] } = await res.json();
  const groups = new Map<number, Map<number, number>>();
  for (const { rfilename, size } of listing.siblings ?? []) {
    if (typeof rfilename !== 'string' || !Number.isSafeInteger(size) || size <= 0) continue;
    const suffix = shardPattern.exec(rfilename);
    if (!suffix || rfilename.replace(shardPattern, '') !== counterpart) continue;
    const part = Number(suffix[1]);
    const count = Number(suffix[2]);
    if (part < 1 || part > count) continue;
    if (!groups.has(count)) groups.set(count, new Map());
    groups.get(count)!.set(part, size);
  }
  return Array.from(groups).some(([count, parts]) =>
    parts.size === count && Array.from(parts.values()).reduce((total, size) => total + size, 0) > 4 * bytes);
}

function parseFileRef(input: string): QuantFileRef | null {
  const raw = input.trim();
  let ref: QuantFileRef;
  try {
    if (/^(?:https?:\/\/|(?:www\.)?(?:huggingface\.co|hf\.co)\/)/i.test(raw)) {
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!['huggingface.co', 'www.huggingface.co', 'hf.co', 'www.hf.co'].includes(url.host) ||
          url.username || url.password) return null;
      const [, org, name, kind, revision, ...path] = url.pathname.split('/');
      if (kind !== 'blob' && kind !== 'resolve') return null;
      ref = { repo: `${org}/${name}`, revision: decodeURIComponent(revision ?? ''), path: path.map(decodeURIComponent).join('/') };
    } else {
      const m = /^([\w.-]+\/[\w.-]+)(?:\s+|\/)(.+)$/.exec(raw);
      if (!m) return null;
      ref = { repo: m[1], revision: 'main', path: m[2] };
    }
    return validRef(ref) ? ref : null;
  } catch {
    return null;
  }
}

export function isQuantFileInput(input: string): boolean {
  return parseFileRef(input) !== null;
}

export function parseQuantFile(input: string): QuantFileRef | null {
  const ref = parseFileRef(input);
  return ref && !isAuxiliaryFile(ref.path) ? ref : null;
}

export function quantFileUrl(file: QuantFileRef): string {
  return `${HUB}/${file.repo}/blob/${encodeURIComponent(file.revision)}/${file.path.split('/').map(encodeURIComponent).join('/')}`;
}

export function quantFromFilename(path: string): string | undefined {
  const name = path.split('/').at(-1) ?? '';
  const quant = /(?:^|[._-])((?:UD-)?[IT]?Q[1-8]_[A-Z0-9]+(?:_[A-Z0-9]+)*(?:-expsIQ[1-8]_[A-Z0-9_]+)?|MXFP4(?:_MOE)?|BF16|F(?:P)?(?:16|32))(?=[.-]|$)/i.exec(name);
  return quant?.[1].toUpperCase().replace(/^F(16|32)$/, 'FP$1').replace('-EXPS', '-exps');
}

export function shardCount(path: string): number {
  return Number(shardPattern.exec(path)?.[2] ?? 1);
}

export function readHubQuantFile(params: URLSearchParams): HubQuantFile | undefined {
  const url = params.get('hfFile');
  const bytes = Number(params.get('hfBytes'));
  const file = url && parseQuantFile(url);
  if (file && Number.isSafeInteger(bytes) && bytes > 0) return { ...file, bytes };
}

export function hasQuantFileShape(layers: string, kv: string, hd: string): boolean {
  return [layers, kv, hd].map(Number).every(n => Number.isSafeInteger(n) && n > 0 && n <= 1_000_000);
}

export type QuantFileError = 'badInput' | 'auxiliaryFile' | 'notFound' | 'missingShards' | 'network';
type QuantFileResult = { ok: true; file: HubQuantFile; shape?: ImportedShape } | { ok: false; error: QuantFileError };

export async function importQuantFile(input: string, fetchImpl: typeof fetch = fetch): Promise<QuantFileResult> {
  const ref = parseFileRef(input);
  if (!ref) return { ok: false, error: 'badInput' };
  if (isAuxiliaryFile(ref.path)) return { ok: false, error: 'auxiliaryFile' };
  const shard = shardPattern.exec(ref.path);
  const count = shardCount(ref.path);
  if (shard && (!count || count > 1000 || Number(shard[1]) < 1 || Number(shard[1]) > count)) {
    return { ok: false, error: 'badInput' };
  }
  const paths = shard ? Array.from({ length: count }, (_, i) =>
    ref.path.replace(shardPattern, `-${String(i + 1).padStart(5, '0')}-of-${shard[2]}`)) : [ref.path];
  const counterpart = nonMtpCounterpart(ref.path)?.replace(shardPattern, '');
  const lookups = counterpart ? [...paths, counterpart] : paths;
  const url = `${HUB}/api/models/${ref.repo}/paths-info/${encodeURIComponent(ref.revision)}`;
  try {
    const sizes = new Map<string, number>();
    for (let offset = 0; offset < lookups.length; offset += 100) {
      const batch = lookups.slice(offset, offset + 100);
      const form = new URLSearchParams();
      batch.forEach(path => form.append('paths', path));
      const res = await fetchImpl(url, { method: 'POST', body: form });
      if ([401, 403, 404].includes(res.status)) return { ok: false, error: 'notFound' };
      if (!res.ok) return { ok: false, error: 'network' };
      const rows: { type?: string; path?: string; size?: number }[] = await res.json();
      for (const { type, path, size } of rows) {
        if (type === 'file' && path && size && Number.isSafeInteger(size) && size > 0) sizes.set(path, size);
      }
    }
    if (!sizes.has(ref.path)) return { ok: false, error: 'notFound' };
    if (paths.some(path => !sizes.has(path))) return { ok: false, error: 'missingShards' };
    const bytes = paths.reduce((total, path) => total + sizes.get(path)!, 0);
    if (!Number.isSafeInteger(bytes)) return { ok: false, error: 'network' };
    if (counterpart) {
      const mainBytes = sizes.get(counterpart);
      if (mainBytes ? mainBytes > 4 * bytes : await hasLargerShardedCounterpart(ref, counterpart, bytes, fetchImpl)) {
        return { ok: false, error: 'auxiliaryFile' };
      }
    }
    const result = await importFromHub(ref.repo, fetchImpl, ref.revision);
    return { ok: true, file: { ...ref, bytes }, shape: result.ok ? result.shape : undefined };
  } catch {
    return { ok: false, error: 'network' };
  }
}
