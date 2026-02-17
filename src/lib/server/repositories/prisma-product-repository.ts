import { prisma } from '../db/prisma';
import type { ProductRepository } from '../../domain/repositories/product-repository';

function mapProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    packageSizeLabel: product.packageSizeLabel,
    servingSizeLabel: product.servingSizeLabel,
    calories: product.calories,
    protein: product.protein,
    carbs: product.carbs,
    fat: product.fat,
    isGlobal: product.isGlobal,
    publicationStatus: product.publicationStatus,
    isAiEstimated: product.isAiEstimated
  };
}

export class PrismaProductRepository implements ProductRepository {
  async createLocalProduct(userId: string, draft: any) {
    const created = await prisma.product.create({
      data: {
        ownerUserId: userId,
        name: draft.name,
        brand: draft.brand,
        barcode: draft.barcode,
        qrCode: draft.qrCode,
        region: draft.region,
        packageSizeLabel: draft.packageSizeLabel,
        servingSizeLabel: draft.servingSizeLabel,
        calories: draft.calories,
        protein: draft.protein,
        carbs: draft.carbs,
        fat: draft.fat,
        source: draft.source,
        isAiEstimated: draft.isAiEstimated,
        isGlobal: false,
        publicationStatus: 'LOCAL_ONLY'
      }
    });

    return mapProduct(created);
  }

  async listLocalProducts(userId: string) {
    const rows = await prisma.product.findMany({
      where: {
        ownerUserId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return rows.map(mapProduct);
  }

  async deleteLocalProduct(userId: string, productId: string) {
    const result = await prisma.product.deleteMany({
      where: {
        id: productId,
        ownerUserId: userId,
        isGlobal: false
      }
    });

    return result.count > 0;
  }

  async searchProducts(userId: string, query: string, includeGlobal: boolean) {
    const rows = await prisma.product.findMany({
      where: {
        OR: [
          {
            ownerUserId: userId
          },
          ...(includeGlobal
            ? [
                {
                  isGlobal: true,
                  publicationStatus: {
                    equals: 'PUBLISHED' as any
                  }
                }
              ]
            : [])
        ],
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { brand: { contains: query } },
              { barcode: { contains: query } }
            ]
          }
        ]
      },
      orderBy: [{ ownerUserId: 'desc' }, { updatedAt: 'desc' }],
      take: 30
    });

    return rows.map(mapProduct);
  }

  async cloneGlobalProductToLocal(userId: string, productId: string) {
    const source = await prisma.product.findFirst({
      where: {
        id: productId,
        isGlobal: true,
        publicationStatus: 'PUBLISHED'
      }
    });

    if (!source) {
      throw new Error('Global product not found');
    }

    const cloned = await prisma.product.create({
      data: {
        ownerUserId: userId,
        name: source.name,
        brand: source.brand,
        barcode: source.barcode,
        qrCode: source.qrCode,
        region: source.region,
        packageSizeLabel: source.packageSizeLabel,
        servingSizeLabel: source.servingSizeLabel,
        calories: source.calories,
        protein: source.protein,
        carbs: source.carbs,
        fat: source.fat,
        source: 'USER_EDITED',
        isAiEstimated: source.isAiEstimated,
        publicationStatus: 'LOCAL_ONLY',
        isGlobal: false
      }
    });

    return mapProduct(cloned);
  }

  async submitProductForModeration(input: { productId: string; userId: string; labelPhotoUrl?: string }) {
    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        ownerUserId: input.userId
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: {
          publicationStatus: 'PENDING_REVIEW'
        }
      }),
      prisma.productSubmission.create({
        data: {
          productId: product.id,
          submittedById: input.userId,
          labelPhotoUrl: input.labelPhotoUrl,
          status: 'PENDING'
        }
      })
    ]);
  }

  async addContribution(input: { productId: string; userId: string; payloadJson: string }) {
    await prisma.productContribution.create({
      data: {
        productId: input.productId,
        contributorId: input.userId,
        payloadJson: input.payloadJson,
        status: 'PENDING'
      }
    });
  }
}
