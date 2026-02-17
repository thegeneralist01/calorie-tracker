import type { APIRoute } from 'astro';
import { PrismaAuthRepository } from '../../../lib/server/repositories/prisma-auth-repository';
import { registerSchema } from '../../../lib/schemas/auth';
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  sessionExpiresAt,
  setSessionCookie
} from '../../../lib/server/auth';
import { buildRateLimitKey, checkRateLimit } from '../../../lib/server/rate-limit';
import { json, parseIp } from '../../../lib/server/http';

const authRepository = new PrismaAuthRepository();

export const POST: APIRoute = async (context) => {
  const payload = await context.request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid registration payload', issues: parsed.error.flatten() }, 400);
  }

  const key = buildRateLimitKey('auth-register', [parseIp(context), parsed.data.email]);
  const limiter = checkRateLimit(key, 8, 60_000);
  if (!limiter.ok) {
    return new Response(JSON.stringify({ error: 'Too many attempts' }), {
      status: 429,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'retry-after': String(limiter.retryAfter ?? 60)
      }
    });
  }

  const [existingByEmail, existingByUsername] = await Promise.all([
    authRepository.findUserByEmail(parsed.data.email),
    authRepository.findUserByUsername(parsed.data.username)
  ]);
  if (existingByEmail || existingByUsername) {
    return json({ error: 'Email or username already in use' }, 409);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await authRepository.createUser({
    username: parsed.data.username,
    email: parsed.data.email,
    passwordHash,
    locale: parsed.data.locale,
    goalType: parsed.data.goalType
  });

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
    user
  });
};
