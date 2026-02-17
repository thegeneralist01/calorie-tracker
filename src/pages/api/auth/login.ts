import type { APIRoute } from 'astro';
import { PrismaAuthRepository } from '../../../lib/server/repositories/prisma-auth-repository';
import { loginSchema } from '../../../lib/schemas/auth';
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiresAt,
  setSessionCookie,
  verifyPassword
} from '../../../lib/server/auth';
import { buildRateLimitKey, checkRateLimit } from '../../../lib/server/rate-limit';
import { json, parseIp } from '../../../lib/server/http';

const authRepository = new PrismaAuthRepository();

export const POST: APIRoute = async (context) => {
  const payload = await context.request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid login payload', issues: parsed.error.flatten() }, 400);
  }

  const limiter = checkRateLimit(
    buildRateLimitKey('auth-login', [parseIp(context), parsed.data.email]),
    10,
    60_000
  );
  if (!limiter.ok) {
    return new Response(JSON.stringify({ error: 'Too many attempts' }), {
      status: 429,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'retry-after': String(limiter.retryAfter ?? 60)
      }
    });
  }

  const user = await authRepository.findAuthUserByEmail(parsed.data.email);
  if (!user) {
    return json({ error: 'Invalid email or password' }, 401);
  }

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValidPassword) {
    return json({ error: 'Invalid email or password' }, 401);
  }

  const token = generateSessionToken();
  const expiresAt = sessionExpiresAt();

  await authRepository.createSession({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    rememberDevice: true,
    expiresAt
  });

  setSessionCookie(context.cookies, token, expiresAt);

  return json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      locale: user.locale
    }
  });
};
