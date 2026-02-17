import type { APIRoute } from 'astro';
import { json, unauthorized } from '../../../lib/server/http';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !locals.session) {
    return unauthorized();
  }

  return json({
    user: locals.user,
    session: {
      expiresAt: locals.session.expiresAt,
      recentAuthAt: locals.session.recentAuthAt
    }
  });
};
