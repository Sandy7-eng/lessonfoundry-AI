import prisma from '@/lib/db/prisma';
import { CreateReviewSchema, UpdateReviewSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

export class ReviewsService {
  static async getReviewsByAssetId(assetId: string) {
    return prisma.review.findMany({
      where: { assetId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getReviewsByUnitId(unitId: string) {
    return prisma.review.findMany({
      where: {
        asset: {
          unitId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        asset: { select: { id: true, title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createReview(input: CreateReviewInput) {
    const validated = CreateReviewSchema.parse(input);
    return prisma.review.create({
      data: validated,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async updateReview(id: string, input: UpdateReviewInput) {
    const validated = UpdateReviewSchema.parse(input);
    return prisma.review.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteReview(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }
}
