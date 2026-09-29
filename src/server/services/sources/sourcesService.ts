import prisma from '@/lib/db/prisma';
import { CreateSourceSchema, UpdateSourceSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateSourceInput = z.infer<typeof CreateSourceSchema>;
export type UpdateSourceInput = z.infer<typeof UpdateSourceSchema>;

export class SourcesService {
  static async getSourcesByUnitId(unitId: string) {
    return prisma.source.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSourceById(id: string) {
    return prisma.source.findUnique({
      where: { id },
      include: {
        provenances: true,
      },
    });
  }

  static async createSource(input: CreateSourceInput) {
    const validated = CreateSourceSchema.parse(input);
    return prisma.source.create({
      data: validated,
    });
  }

  static async updateSource(id: string, input: UpdateSourceInput) {
    const validated = UpdateSourceSchema.parse(input);
    return prisma.source.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteSource(id: string) {
    return prisma.source.delete({
      where: { id },
    });
  }
}
