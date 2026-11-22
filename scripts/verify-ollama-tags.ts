// Re-reads every row of lib/data/ollama-tags.ts from registry.ollama.ai (network; not part of
// `npm test`). For each bare tag it checks the default file type against the row's level; for
// each quant stem it checks that `<stem>-<level>` is the same model file as the bare tag, so a
// pasted explicit-quant tag and the bare tag are the same checkpoint. Run: npm run verify:ollama
import { ollamaLibrary, OLLAMA_TAGS_CHECKED } from '../lib/data/ollama-tags';

const REGISTRY = 'https://registry.ollama.ai/v2/library';
const FILE_TYPE: Record<string, string> = { F16: 'FP16', F32: 'FP32' };

interface Tag { model: string; fileType: string; params: string }

async function readTag(name: string, tag: string): Promise<Tag | null> {
  const res = await fetch(`${REGISTRY}/${name}/manifests/${tag || 'latest'}`, {
    headers: { Accept: 'application/vnd.docker.distribution.manifest.v2+json' },
  });
  if (!res.ok) return null;
  const manifest = await res.json() as { config: { digest: string }; layers: { mediaType: string; digest: string }[] };
  const model = manifest.layers.find(l => l.mediaType.endsWith('.model'))?.digest ?? '';
  const config = await (await fetch(`${REGISTRY}/${name}/blobs/${manifest.config.digest}`)).json() as { file_type?: string; model_type?: string };
  const ft = config.file_type ?? '';
  return { model, fileType: FILE_TYPE[ft] ?? ft, params: config.model_type ?? '' };
}

const ollamaQuant = (level: string) => (/^(FP|BF)\d+$|^MXFP4$/.test(level) ? level.toLowerCase() : `q${level.slice(1)}`);

async function main() {
  const problems: string[] = [];
  for (const entry of ollamaLibrary) {
    if (entry.latest !== undefined) {
      const [latest, target] = await Promise.all([readTag(entry.name, 'latest'), readTag(entry.name, entry.latest)]);
      if (!latest || latest.model !== target?.model) problems.push(`${entry.name}:latest is no longer :${entry.latest}`);
    }
    for (const row of entry.rows) {
      const bare = await Promise.all(row.tags.map(t => readTag(entry.name, t)));
      bare.forEach((b, i) => {
        const tag = `${entry.name}:${row.tags[i] || 'latest'}`;
        if (!b) problems.push(`${tag} missing`);
        else if (b.fileType !== row.level) problems.push(`${tag} is ${b.fileType}, table says ${row.level}`);
        else if (b.model !== bare[0]?.model) problems.push(`${tag} differs from ${entry.name}:${row.tags[0]}`);
      });
      for (const stem of row.quantStems) {
        const prefix = stem ? `${stem}-` : '';
        let tag = `${prefix}${ollamaQuant(row.level)}`;
        let q = await readTag(entry.name, tag);
        // Older library uploads spell half precision `f16`.
        if (!q && row.level === 'FP16') q = await readTag(entry.name, (tag = `${prefix}f16`));
        if (!q) problems.push(`${entry.name}:${tag} missing`);
        else if (!row.bareIsNewer && q.model !== bare[0]?.model) problems.push(`${entry.name}:${tag} is not the same file as :${row.tags[0]}`);
      }
      console.log(`${entry.name}:${row.tags.join('|')} → ${row.modelId} ${row.level} (${bare[0]?.params ?? '?'})`);
    }
  }
  if (problems.length) {
    console.error(`\n${problems.length} problem(s) since ${OLLAMA_TAGS_CHECKED}:\n${problems.join('\n')}`);
    process.exit(1);
  }
  console.log(`\nAll ${ollamaLibrary.length} libraries still match (table checked ${OLLAMA_TAGS_CHECKED}).`);
}

main();
