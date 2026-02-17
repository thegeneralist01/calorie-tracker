import type { APIContext } from 'astro';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

export function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401);
}

export function parseIp(context: APIContext): string {
  return context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
