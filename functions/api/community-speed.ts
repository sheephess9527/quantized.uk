import type { D1Database, PagesFunction, Request as PagesRequest, Response as PagesResponse } from '@cloudflare/workers-types';
import { validateSpeedSubmission } from '@/lib/data/community-speed';

declare const Response: typeof PagesResponse;

interface Env {
  COMMUNITY_SPEED_DB?: D1Database;
  COMMUNITY_SPEED_RATE_SECRET?: string;
}

const MAX_BODY = 8192;

function result(status: number) {
  return Response.json({ ok: status === 201 }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

async function readPayload(request: PagesRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return;
  const bytes = new Uint8Array(MAX_BODY);
  let offset = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (offset + value.length > MAX_BODY) {
      await reader.cancel();
      return;
    }
    bytes.set(value, offset);
    offset += value.length;
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, offset)));
}

const insertPending = `INSERT INTO pending_speed (id, received_at, day, client_tag, payload)
SELECT ?1, ?2, ?3, ?4, ?5
WHERE (SELECT count(*) FROM pending_speed WHERE day = ?3 AND client_tag = ?4) < 3
  AND (SELECT count(*) FROM pending_speed WHERE day = ?3) < 100`;

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return new Response(null, {
    status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
  });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return result(403);
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return result(415);
  const db = env.COMMUNITY_SPEED_DB;
  const secret = env.COMMUNITY_SPEED_RATE_SECRET;
  const ip = request.headers.get('CF-Connecting-IP');
  if (!db || !secret || !ip) return result(503);
  const submission = validateSpeedSubmission(await readPayload(request).catch(() => undefined));
  if (!submission) return result(400);

  try {
    const receivedAt = new Date().toISOString();
    const day = receivedAt.slice(0, 10);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(`${day}:${ip}`));
    const clientTag = Array.from(new Uint8Array(mac), n => n.toString(16).padStart(2, '0')).join('');
    const write = await db.prepare(insertPending).bind(crypto.randomUUID(), receivedAt, day, clientTag, JSON.stringify(submission)).run();
    if (!write.success) return result(503);
    return result(write.meta.changes === 1 ? 201 : 429);
  } catch {
    return result(503);
  }
};
