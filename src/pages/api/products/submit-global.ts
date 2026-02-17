import type { APIRoute } from 'astro';
import { submitGlobalSchema } from '../../../lib/schemas/product';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaProductRepository } from '../../../lib/server/repositories/prisma-product-repository';
import { prisma } from '../../../lib/server/db/prisma';

const productRepository = new PrismaProductRepository();

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = submitGlobalSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid submission payload', issues: parsed.error.flatten() }, 400);
  }

  const [user, product] = await Promise.all([
    prisma.user.findUnique({ where: { id: locals.user.id }, select: { emailVerifiedAt: true } }),
    prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true, ownerUserId: true, isAiEstimated: true } })
  ]);

  if (!user?.emailVerifiedAt) {
    return json({ error: 'Email verification required before publishing.' }, 403);
  }

  if (!product || product.ownerUserId !== locals.user.id) {
    return json({ error: 'Product not found' }, 404);
  }

  if (product.isAiEstimated) {
    return json({ error: 'AI-estimated products cannot be published globally.' }, 400);
  }

  await productRepository.submitProductForModeration({
    productId: parsed.data.productId,
    userId: locals.user.id,
    labelPhotoUrl: parsed.data.labelPhotoUrl
  });

  return json({ ok: true });
};
