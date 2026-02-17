import { z } from 'zod';

const nutrientSchema = z.number().nonnegative().optional();

export const createProductSchema = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().max(120).optional(),
  barcode: z.string().max(80).optional(),
  qrCode: z.string().max(120).optional(),
  region: z.string().max(64).optional(),
  packageSizeLabel: z.string().max(64).optional(),
  servingSizeLabel: z.string().max(64).optional(),
  calories: nutrientSchema,
  protein: nutrientSchema,
  carbs: nutrientSchema,
  fat: nutrientSchema,
  source: z.enum(['MANUAL', 'VERIFIED_LABEL', 'BARCODE_DB', 'USER_EDITED', 'AI_ESTIMATE']).default('MANUAL'),
  isAiEstimated: z.boolean().default(false)
});

export const submitGlobalSchema = z.object({
  productId: z.string().min(1),
  labelPhotoUrl: z.string().url().optional()
});

export const contributionSchema = z.object({
  productId: z.string().min(1),
  payload: z.record(z.any())
});

export const deleteProductSchema = z.object({
  productId: z.string().min(1)
});

export const searchProductSchema = z.object({
  q: z.string().min(1),
  includeGlobal: z
    .string()
    .optional()
    .transform((value) => value === 'true')
});
