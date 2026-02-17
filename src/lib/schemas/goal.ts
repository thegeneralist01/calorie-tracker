import { z } from 'zod';

export const goalUpdateSchema = z.object({
  type: z.enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT', 'BUILD_MUSCLE', 'JUST_TRACKING']).optional(),
  calorieFormula: z.enum(['MIFFLIN_ST_JEOR', 'HARRIS_BENEDICT', 'KATCH_MCARDLE']).optional(),
  dailyCalorieTarget: z.number().int().positive().optional(),
  proteinGramsTarget: z.number().int().nonnegative().optional(),
  carbsGramsTarget: z.number().int().nonnegative().optional(),
  fatGramsTarget: z.number().int().nonnegative().optional(),
  adaptiveSuggestions: z.boolean().optional()
});
