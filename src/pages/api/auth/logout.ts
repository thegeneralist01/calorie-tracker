import type { APIRoute } from 'astro';
import { PrismaAuthRepository } from '../../../lib/server/repositories/prisma-auth-repository';
import { SESSION_COOKIE_NAME, clearSessionCookie, hashSessionToken } from '../../../lib/server/auth';
import { json } from '../../../lib/server/http';

const authRepository = new PrismaAuthRepository();

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await authRepository.deleteSession(hashSessionToken(token));
  }

  clearSessionCookie(cookies);
  return json({ ok: true });
};
