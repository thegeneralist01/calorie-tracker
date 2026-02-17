import type { APIRoute } from 'astro';
import { PrismaAuthRepository } from '../../../lib/server/repositories/prisma-auth-repository';
import { json, unauthorized } from '../../../lib/server/http';

const authRepository = new PrismaAuthRepository();

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  await authRepository.undoUserDeletion(locals.user.id);
  return json({ ok: true });
};
