import type { APIRoute } from 'astro';
import { z } from 'zod';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaProductRepository } from '../../../lib/server/repositories/prisma-product-repository';

const schema = z.object({
  productId: z.string().min(1)
});

const productRepository = new PrismaProductRepository();

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid import payload', issues: parsed.error.flatten() }, 400);
  }

  const product = await productRepository.cloneGlobalProductToLocal(locals.user.id, parsed.data.productId);
  return json({ product }, 201);
};
