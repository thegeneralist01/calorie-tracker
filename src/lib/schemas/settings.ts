import { z } from 'zod';

const unitNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z][a-z0-9_-]{0,31}$/);

const customUnitAliasSchema = z.object({
  fromAmount: z.number().positive(),
  fromUnit: unitNameSchema,
  toAmount: z.number().positive(),
  toUnit: unitNameSchema
});

export const settingsUpdateSchema = z.object({
  locale: z.enum(['en', 'de']).optional(),
  dayCutoffMinutes: z.number().int().min(0).max(1439).optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  waterGoalLiters: z.number().positive().max(10).optional(),
  useMetricDistance: z.boolean().optional(),
  precisionMode: z.enum(['BASIC', 'ADVANCED']).optional(),
  remindersEnabled: z.boolean().optional(),
  reminderQuietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reminderQuietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  aiPhotoEstimationEnabled: z.boolean().optional(),
  customUnitAliases: z.array(customUnitAliasSchema).max(50).optional()
});
