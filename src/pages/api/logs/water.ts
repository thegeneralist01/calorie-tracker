import type { APIRoute } from 'astro';
import { waterCreateSchema } from '../../../lib/schemas/log';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaLogRepository } from '../../../lib/server/repositories/prisma-log-repository';
import { prisma } from '../../../lib/server/db/prisma';
import { getUserDayWindow } from '../../../lib/server/day-window';

const logRepository = new PrismaLogRepository();

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const requestedDate = url.searchParams.get('date');
  const now = requestedDate ? new Date(requestedDate) : new Date();
  if (Number.isNaN(now.getTime())) {
    return json({ error: 'Invalid date' }, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: locals.user.id },
    select: { dayCutoffMinutes: true }
  });
  const { dayStart, dayEnd } = getUserDayWindow(now, user?.dayCutoffMinutes ?? 0);

  const entries = await prisma.waterEntry.findMany({
    where: {
      userId: locals.user.id,
      consumedAt: {
        gte: dayStart,
        lt: dayEnd
      }
    }
  });
  const totalMl = entries.reduce((sum: number, entry: { amountMl: number }) => sum + entry.amountMl, 0);

  return json({ entries, totalMl });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = waterCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid water payload', issues: parsed.error.flatten() }, 400);
  }

  await logRepository.createWaterEntry({
    userId: locals.user.id,
    amountMl: parsed.data.amountMl,
    consumedAt: parsed.data.consumedAt ? new Date(parsed.data.consumedAt) : new Date()
  });

  return json({ ok: true }, 201);
};
