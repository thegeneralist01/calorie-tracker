import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/server/db/prisma';
import { json, unauthorized } from '../../../lib/server/http';
import { goalUpdateSchema } from '../../../lib/schemas/goal';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const goal = await prisma.goal.findUnique({
    where: {
      userId: locals.user.id
    }
  });

  return json({ goal });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = goalUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid goal payload', issues: parsed.error.flatten() }, 400);
  }

  const goal = await prisma.goal.upsert({
    where: {
      userId: locals.user.id
    },
    create: {
      userId: locals.user.id,
      type: parsed.data.type ?? 'MAINTAIN_WEIGHT',
      calorieFormula: parsed.data.calorieFormula ?? 'MIFFLIN_ST_JEOR',
      dailyCalorieTarget: parsed.data.dailyCalorieTarget,
      proteinGramsTarget: parsed.data.proteinGramsTarget,
      carbsGramsTarget: parsed.data.carbsGramsTarget,
      fatGramsTarget: parsed.data.fatGramsTarget,
      adaptiveSuggestions: parsed.data.adaptiveSuggestions ?? true,
      requiresApproval: true
    },
    update: {
      type: parsed.data.type,
      calorieFormula: parsed.data.calorieFormula,
      dailyCalorieTarget: parsed.data.dailyCalorieTarget,
      proteinGramsTarget: parsed.data.proteinGramsTarget,
      carbsGramsTarget: parsed.data.carbsGramsTarget,
      fatGramsTarget: parsed.data.fatGramsTarget,
      adaptiveSuggestions: parsed.data.adaptiveSuggestions
    }
  });

  return json({ goal });
};
