import type { APIRoute } from 'astro';
import { createProductSchema } from '../../../lib/schemas/product';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaProductRepository } from '../../../lib/server/repositories/prisma-product-repository';

const productRepository = new PrismaProductRepository();

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const products = await productRepository.listLocalProducts(locals.user.id);
  return json({ products });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const payload = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid product payload', issues: parsed.error.flatten() }, 400);
  }

  const product = await productRepository.createLocalProduct(locals.user.id, parsed.data);
  return json({ product }, 201);
};
