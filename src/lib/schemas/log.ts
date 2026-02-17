import { z } from 'zod';

export const mealCreateSchema = z.object({
  productId: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']),
  consumedAt: z.string().datetime().optional(),
  quantityValue: z.number().positive(),
  quantityUnit: z.enum(['g', 'ml', 'serving', 'piece']),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  snapshot: z.record(z.any())
});

export const waterCreateSchema = z.object({
  amountMl: z.number().int().positive(),
  consumedAt: z.string().datetime().optional()
});

export const activityCreateSchema = z.discriminatedUnion('method', [
  z.object({
    name: z.string().min(1).max(120),
    method: z.literal('DIRECT_CALORIES'),
    caloriesBurned: z.number().nonnegative(),
    startedAt: z.string().datetime().optional()
  }),
  z.object({
    name: z.string().min(1).max(120),
    method: z.literal('ESTIMATED'),
    durationMinutes: z.number().int().positive().optional(),
    distanceKm: z.number().nonnegative().optional(),
    intensity: z.number().positive().max(3).optional(),
    caloriesBurned: z.number().nonnegative().optional(),
    startedAt: z.string().datetime().optional()
  })
]);
