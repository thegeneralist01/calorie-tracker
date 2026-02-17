import type { MiddlewareHandler } from 'astro';
import { SESSION_COOKIE_NAME, hashSessionToken } from './lib/server/auth';
import { PrismaAuthRepository } from './lib/server/repositories/prisma-auth-repository';
import { resolveLocale } from './lib/i18n';

const authRepository = new PrismaAuthRepository();

function localeFromHeader(header: string | null): 'en' | 'de' {
  if (!header) {
    return 'en';
  }
  return header.toLowerCase().includes('de') ? 'de' : 'en';
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.session = null;
  context.locals.user = null;
  context.locals.locale = localeFromHeader(context.request.headers.get('accept-language'));

  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return next();
  }

  const session = await authRepository.findSession(hashSessionToken(token));
  if (!session) {
    context.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return next();
  }

  context.locals.user = {
    id: session.id,
    username: session.username,
    email: session.email,
    locale: session.locale,
    isAdmin: session.isAdmin
  };
  context.locals.session = {
    id: session.sessionId,
    userId: session.id,
    expiresAt: session.expiresAt,
    recentAuthAt: session.recentAuthAt
  };
  context.locals.locale = resolveLocale(session.locale);

  await authRepository.updateSessionActivity(session.sessionId);

  return next();
};
