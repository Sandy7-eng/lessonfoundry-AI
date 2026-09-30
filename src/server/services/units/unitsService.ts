import prisma from '@/lib/db/prisma';
import { CreateUnitSchema, UpdateUnitSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;

export class UnitsService {
  static async getAllUnits() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.unit.updateMany({
      where: {
        status: 'GENERATING',
        updatedAt: { lt: fiveMinutesAgo },
      },
      data: { status: 'DRAFT' },
    });

    return prisma.unit.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        sources: true,
        objectives: { orderBy: { displayOrder: 'asc' } },
        constraints: true,
        assets: { select: { id: true, type: true, title: true, status: true, version: true } },
        qualityIssues: { where: { status: 'OPEN' } },
        unitVersions: { orderBy: { versionNumber: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getUnitById(id: string) {
    return prisma.unit.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        sources: true,
        objectives: { orderBy: { displayOrder: 'asc' } },
        constraints: true,
        assets: {
          include: {
            questions: { orderBy: { displayOrder: 'asc' } },
            alignments: true,
            reviews: {
              include: { user: { select: { id: true, name: true, email: true } } },
              orderBy: { createdAt: 'desc' },
            },
            qualityIssues: true,
            assetVersions: true,
            provenances: true,
          },
        },
        qualityIssues: true,
        unitVersions: { orderBy: { versionNumber: 'desc' } },
      },
    });
  }

  static async createUnit(input: CreateUnitInput) {
    const validated = CreateUnitSchema.parse(input);
    return prisma.unit.create({
      data: validated,
      include: {
        user: { select: { id: true, name: true, email: true } },
        sources: true,
        objectives: true,
        constraints: true,
      },
    });
  }

  static async updateUnit(id: string, input: UpdateUnitInput) {
    const validated = UpdateUnitSchema.parse(input);
    return prisma.unit.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteUnit(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }
}
