import type { APIRoute } from 'astro';
import { searchProductSchema } from '../../../lib/schemas/product';
import { json, unauthorized } from '../../../lib/server/http';
import { PrismaProductRepository } from '../../../lib/server/repositories/prisma-product-repository';

const productRepository = new PrismaProductRepository();

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return unauthorized();
  }

  const parsed = searchProductSchema.safeParse({
    q: url.searchParams.get('q'),
    includeGlobal: url.searchParams.get('includeGlobal')
  });

  if (!parsed.success) {
    return json({ error: 'Invalid search params', issues: parsed.error.flatten() }, 400);
  }

  const products = await productRepository.searchProducts(
    locals.user.id,
    parsed.data.q,
    parsed.data.includeGlobal ?? false
  );

  return json({ products });
};
