import type { APIRoute } from 'astro';
import { z } from 'zod';
import { prisma } from '../../../../lib/server/db/prisma';
import { json, unauthorized } from '../../../../lib/server/http';

const reviewSchema = z.object({
  submissionId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).optional()
});

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorized();
  }
  if (!locals.user.isAdmin) {
    return json({ error: 'Forbidden' }, 403);
  }

  const submissions = await prisma.productSubmission.findMany({
    where: { status: 'PENDING' },
    include: {
      product: true,
      submittedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return json({ submissions });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorized();
  }
  if (!locals.user.isAdmin) {
    return json({ error: 'Forbidden' }, 403);
  }

  const payload = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'Invalid review payload', issues: parsed.error.flatten() }, 400);
  }

  const submission = await prisma.productSubmission.findUnique({
    where: {
      id: parsed.data.submissionId
    },
    include: {
      product: true
    }
  });

  if (!submission) {
    return json({ error: 'Submission not found' }, 404);
  }

  const before = {
    product: {
      publicationStatus: submission.product.publicationStatus,
      isGlobal: submission.product.isGlobal
    },
    submissionStatus: submission.status
  };

  await prisma.$transaction([
    prisma.productSubmission.update({
      where: { id: submission.id },
      data: {
        status: parsed.data.status,
        reason: parsed.data.reason,
        reviewedAt: new Date(),
        reviewedById: locals.user.id
      }
    }),
    prisma.product.update({
      where: { id: submission.productId },
      data:
        parsed.data.status === 'APPROVED'
          ? {
              publicationStatus: 'PUBLISHED',
              isGlobal: true,
              publishedAt: new Date()
            }
          : {
              publicationStatus: 'REJECTED'
            }
    }),
    prisma.moderationAuditLog.create({
      data: {
        actorUserId: locals.user.id,
        targetType: 'PRODUCT_SUBMISSION',
        targetId: submission.id,
        action: parsed.data.status,
        reason: parsed.data.reason,
        beforeJson: JSON.stringify(before),
        afterJson: JSON.stringify({
          publicationStatus: parsed.data.status === 'APPROVED' ? 'PUBLISHED' : 'REJECTED',
          submissionStatus: parsed.data.status
        })
      }
    })
  ]);

  return json({ ok: true });
};
