import type { APIRoute } from 'astro';
import { PrismaAuthRepository } from '../../../lib/server/repositories/prisma-auth-repository';
import { json, unauthorized } from '../../../lib/server/http';

const authRepository = new PrismaAuthRepository();

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const scheduledDeletionAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await authRepository.scheduleUserDeletion(locals.user.id, scheduledDeletionAt);

  return json({
    ok: true,
    scheduledDeletionAt
  });
};
