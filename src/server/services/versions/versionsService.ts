import prisma from '@/lib/db/prisma';
import { CreateUnitVersionSchema, CreateProvenanceSchema } from '@/server/schemas';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';

export type CreateUnitVersionInput = z.infer<typeof CreateUnitVersionSchema>;
export type CreateProvenanceInput = z.infer<typeof CreateProvenanceSchema>;

export class VersionsService {
  static async getUnitVersions(unitId: string) {
    return prisma.unitVersion.findMany({
      where: { unitId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  static async createUnitVersion(input: CreateUnitVersionInput) {
    const validated = CreateUnitVersionSchema.parse(input);
    return prisma.unitVersion.create({
      data: validated,
    });
  }

  static async getAssetVersions(assetId: string) {
    return prisma.assetVersion.findMany({
      where: { assetId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  static async createProvenance(input: CreateProvenanceInput) {
    const validated = CreateProvenanceSchema.parse(input);
    return prisma.provenance.create({
      data: {
        assetId: validated.assetId,
        sourceId: validated.sourceId,
        modelIdentifier: validated.modelIdentifier,
        generationVersion: validated.generationVersion,
        generationConfig: validated.generationConfig
          ? (validated.generationConfig as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  static async getProvenancesByAssetId(assetId: string) {
    return prisma.provenance.findMany({
      where: { assetId },
      orderBy: { generatedAt: 'desc' },
    });
  }
}
