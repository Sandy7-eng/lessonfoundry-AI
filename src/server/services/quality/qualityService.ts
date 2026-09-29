import prisma from '@/lib/db/prisma';
import { CreateQualityIssueSchema, ResolveQualityIssueSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateQualityIssueInput = z.infer<typeof CreateQualityIssueSchema>;
export type ResolveQualityIssueInput = z.infer<typeof ResolveQualityIssueSchema>;

export class QualityService {
  static async getIssuesByUnitId(unitId: string) {
    return prisma.qualityIssue.findMany({
      where: { unitId },
      include: {
        asset: { select: { id: true, title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createQualityIssue(input: CreateQualityIssueInput) {
    const validated = CreateQualityIssueSchema.parse(input);
    return prisma.qualityIssue.create({
      data: validated,
    });
  }

  static async updateQualityIssueStatus(id: string, input: ResolveQualityIssueInput) {
    const validated = ResolveQualityIssueSchema.parse(input);
    return prisma.qualityIssue.update({
      where: { id },
      data: {
        status: validated.status,
        resolvedAt: validated.status === 'RESOLVED' ? new Date() : null,
      },
    });
  }

  static async deleteQualityIssue(id: string) {
    return prisma.qualityIssue.delete({
      where: { id },
    });
  }
}
