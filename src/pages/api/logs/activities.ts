import type { APIRoute } from 'astro';
import { activityCreateSchema } from '../../../lib/schemas/log';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaLogRepository } from '../../../lib/server/repositories/prisma-log-repository';
import { estimateCaloriesBurned } from '../../../lib/domain/activity';
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

  const entries = await prisma.activityEntry.findMany({
    where: {
      userId: locals.user.id,
      startedAt: {
        gte: dayStart,
        lt: dayEnd
      }
    },
    orderBy: {
      startedAt: 'asc'
    }
  });

  const burned = entries.reduce(
    (sum: number, entry: { caloriesBurned: number }) => sum + entry.caloriesBurned,
    0
  );
  return json({ entries, burned });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = activityCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid activity payload', issues: parsed.error.flatten() }, 400);
  }

  const caloriesBurned =
    parsed.data.method === 'DIRECT_CALORIES'
      ? parsed.data.caloriesBurned
      : parsed.data.caloriesBurned ??
        estimateCaloriesBurned({
          durationMinutes: parsed.data.durationMinutes,
          distanceKm: parsed.data.distanceKm,
          intensity: parsed.data.intensity
        });

  await logRepository.createActivityEntry({
    userId: locals.user.id,
    name: parsed.data.name,
    method: parsed.data.method,
    durationMinutes: parsed.data.method === 'ESTIMATED' ? parsed.data.durationMinutes : undefined,
    distanceKm: parsed.data.method === 'ESTIMATED' ? parsed.data.distanceKm : undefined,
    intensity: parsed.data.method === 'ESTIMATED' ? parsed.data.intensity : undefined,
    caloriesBurned,
    startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date()
  });

  return json({ ok: true, caloriesBurned }, 201);
};
