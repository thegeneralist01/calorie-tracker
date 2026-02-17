import type { APIRoute } from 'astro';
import { prisma } from '../../../lib/server/db/prisma';
import { json, unauthorized } from '../../../lib/server/http';
import { settingsUpdateSchema } from '../../../lib/schemas/settings';
import {
  parseUnitAliasesJson,
  validateUnitAliases
} from '../../../lib/domain/unit-aliases';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: locals.user.id },
      select: {
        locale: true,
        dayCutoffMinutes: true,
        weekStartsOn: true
      }
    }),
    prisma.userSettings.findUnique({
      where: { userId: locals.user.id }
    })
  ]);

  const customUnitAliases = parseUnitAliasesJson(settings?.customUnitAliasesJson);

  return json({
    user,
    settings: settings
      ? {
          ...settings,
          customUnitAliases
        }
      : null
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid settings payload', issues: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;
  const aliasesValidation = validateUnitAliases(data.customUnitAliases ?? []);
  if (!aliasesValidation.ok) {
    return json({ error: aliasesValidation.error }, 400);
  }
  const customUnitAliasesJson = JSON.stringify(aliasesValidation.aliases);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: locals.user.id },
      data: {
        locale: data.locale,
        dayCutoffMinutes: data.dayCutoffMinutes,
        weekStartsOn: data.weekStartsOn
      }
    }),
    prisma.userSettings.upsert({
      where: { userId: locals.user.id },
      create: {
        userId: locals.user.id,
        waterGoalLiters: data.waterGoalLiters ?? 2,
        useMetricDistance: data.useMetricDistance ?? true,
        precisionMode: data.precisionMode ?? 'BASIC',
        remindersEnabled: data.remindersEnabled ?? true,
        reminderQuietHoursStart: data.reminderQuietHoursStart,
        reminderQuietHoursEnd: data.reminderQuietHoursEnd,
        aiPhotoEstimationEnabled: data.aiPhotoEstimationEnabled ?? false,
        customUnitAliasesJson
      },
      update: {
        waterGoalLiters: data.waterGoalLiters,
        useMetricDistance: data.useMetricDistance,
        precisionMode: data.precisionMode,
        remindersEnabled: data.remindersEnabled,
        reminderQuietHoursStart: data.reminderQuietHoursStart,
        reminderQuietHoursEnd: data.reminderQuietHoursEnd,
        aiPhotoEstimationEnabled: data.aiPhotoEstimationEnabled,
        customUnitAliasesJson
      }
    })
  ]);

  return json({ ok: true });
};
