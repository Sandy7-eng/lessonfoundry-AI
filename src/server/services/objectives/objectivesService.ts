import prisma from '@/lib/db/prisma';
import { CreateObjectiveSchema, UpdateObjectiveSchema, CreateObjectiveAlignmentSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateObjectiveInput = z.infer<typeof CreateObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof UpdateObjectiveSchema>;
export type CreateObjectiveAlignmentInput = z.infer<typeof CreateObjectiveAlignmentSchema>;

export class ObjectivesService {
  static async getObjectivesByUnitId(unitId: string) {
    return prisma.objective.findMany({
      where: { unitId },
      include: {
        alignments: {
          include: {
            asset: { select: { id: true, title: true, type: true } },
            question: { select: { id: true, content: true, difficulty: true } },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async createObjective(input: CreateObjectiveInput) {
    const validated = CreateObjectiveSchema.parse(input);
    return prisma.objective.create({
      data: validated,
    });
  }

  static async updateObjective(id: string, input: UpdateObjectiveInput) {
    const validated = UpdateObjectiveSchema.parse(input);
    return prisma.objective.update({
      where: { id },
      data: validated,
    });
  }

  static async deleteObjective(id: string) {
    return prisma.objective.delete({
      where: { id },
    });
  }

  static async createAlignment(input: CreateObjectiveAlignmentInput) {
    const validated = CreateObjectiveAlignmentSchema.parse(input);
    return prisma.objectiveAlignment.create({
      data: validated,
    });
  }
}
