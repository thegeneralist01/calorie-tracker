import type { APIRoute } from 'astro';
import { mealCreateSchema } from '../../../lib/schemas/log';
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
  const range = url.searchParams.get('range');
  const userId = locals.user.id;
  const now = requestedDate ? new Date(requestedDate) : new Date();
  if (Number.isNaN(now.getTime())) {
    return json({ error: 'Invalid date' }, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: locals.user.id },
    select: { dayCutoffMinutes: true }
  });

  const { dayStart, dayEnd } = getUserDayWindow(now, user?.dayCutoffMinutes ?? 0);

  if (range === 'week') {
    const dayCutoffMinutes = user?.dayCutoffMinutes ?? 0;
    const days = await Promise.all(
      Array.from({ length: 7 }, async (_, offset) => {
        const date = new Date(now);
        date.setDate(date.getDate() - offset);
        const window = getUserDayWindow(date, dayCutoffMinutes);
        const rows = await logRepository.listMealEntriesByDay({
          userId,
          dayStart: window.dayStart,
          dayEnd: window.dayEnd
        });

        const summary = rows.reduce(
          (acc: { calories: number; protein: number; carbs: number; fat: number }, entry: { calories: number; protein: number; carbs: number; fat: number }) => {
            acc.calories += entry.calories;
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fat += entry.fat;
            return acc;
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return {
          date: date.toISOString(),
          dayStart: window.dayStart,
          dayEnd: window.dayEnd,
          summary
        };
      })
    );

    return json({ days });
  }

  const entries = await logRepository.listMealEntriesByDay({
    userId,
    dayStart,
    dayEnd
  });

  const summary = entries.reduce(
    (acc: { calories: number; protein: number; carbs: number; fat: number }, entry: { calories: number; protein: number; carbs: number; fat: number }) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return json({
    dayStart,
    dayEnd,
    entries,
    summary
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = mealCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid meal payload', issues: parsed.error.flatten() }, 400);
  }

  await logRepository.createMealEntry({
    userId: locals.user.id,
    productId: parsed.data.productId,
    mealType: parsed.data.mealType,
    consumedAt: parsed.data.consumedAt ? new Date(parsed.data.consumedAt) : new Date(),
    quantityValue: parsed.data.quantityValue,
    quantityUnit: parsed.data.quantityUnit,
    calories: parsed.data.calories,
    protein: parsed.data.protein,
    carbs: parsed.data.carbs,
    fat: parsed.data.fat,
    snapshotJson: JSON.stringify(parsed.data.snapshot)
  });

  return json({ ok: true }, 201);
};
