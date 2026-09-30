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
    return prisma.$transaction(async (transaction) => {
      const review = await transaction.review.create({
        data: validated,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await transaction.asset.update({
        where: { id: validated.assetId },
        data: { status: validated.status },
      });

      return review;
    });
  }

  static async reviewAsset(
    unitId: string,
    assetId: string,
    status: CreateReviewInput['status'],
    comment?: string
  ) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, unitId },
      select: { id: true, unit: { select: { userId: true } } },
    });

    if (!asset) {
      throw new Error('Asset not found in this unit');
    }

    return prisma.$transaction(async (transaction) => {
      const review = await transaction.review.create({
        data: {
          assetId,
          userId: asset.unit.userId,
          status,
          comment,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await transaction.asset.update({
        where: { id: assetId },
        data: { status },
      });

      return review;
    });
  }

  static async updateReview(id: string, input: UpdateReviewInput) {
    const validated = UpdateReviewSchema.parse(input);
    return prisma.$transaction(async (transaction) => {
      const review = await transaction.review.update({
        where: { id },
        data: validated,
      });

      if (validated.status) {
        await transaction.asset.update({
          where: { id: review.assetId },
          data: { status: validated.status },
        });
      }

      return review;
    });
  }

  static async deleteReview(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }
}
