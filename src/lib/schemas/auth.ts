import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  locale: z.enum(['en', 'de']).default('en'),
  goalType: z
    .enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT', 'BUILD_MUSCLE', 'JUST_TRACKING'])
    .default('MAINTAIN_WEIGHT')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
