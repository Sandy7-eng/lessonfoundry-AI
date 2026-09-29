import prisma from '@/lib/db/prisma';
import { CreateAssetSchema, UpdateAssetSchema, CreateQuestionSchema, UpdateQuestionSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export class AssetsService {
  static async getAssetsByUnitId(unitId: string) {
    return prisma.asset.findMany({
      where: { unitId },
      include: {
        questions: { orderBy: { displayOrder: 'asc' } },
        alignments: true,
        reviews: true,
        qualityIssues: true,
        assetVersions: { orderBy: { versionNumber: 'desc' } },
        provenances: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getAssetById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { displayOrder: 'asc' } },
        alignments: {
          include: {
            objective: true,
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        qualityIssues: true,
        assetVersions: { orderBy: { versionNumber: 'desc' } },
        provenances: true,
      },
    });
  }

  static async createAsset(input: CreateAssetInput) {
    const validated = CreateAssetSchema.parse(input);
    return prisma.asset.create({
      data: validated,
    });
  }

  static async updateAsset(id: string, input: UpdateAssetInput) {
    const validated = UpdateAssetSchema.parse(input);
    return prisma.asset.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteAsset(id: string) {
    return prisma.asset.delete({
      where: { id },
    });
  }

  static async createQuestion(input: CreateQuestionInput) {
    const validated = CreateQuestionSchema.parse(input);
    return prisma.question.create({
      data: validated,
    });
  }

  static async updateQuestion(id: string, input: UpdateQuestionInput) {
    const validated = UpdateQuestionSchema.parse(input);
    return prisma.question.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteQuestion(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }
}
