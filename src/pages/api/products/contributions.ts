import type { APIRoute } from 'astro';
import { contributionSchema } from '../../../lib/schemas/product';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaProductRepository } from '../../../lib/server/repositories/prisma-product-repository';

const productRepository = new PrismaProductRepository();

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = contributionSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid contribution payload', issues: parsed.error.flatten() }, 400);
  }

  await productRepository.addContribution({
    productId: parsed.data.productId,
    userId: locals.user.id,
    payloadJson: JSON.stringify(parsed.data.payload)
  });

  return json({ ok: true }, 201);
};
