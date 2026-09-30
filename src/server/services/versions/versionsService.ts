import prisma from '@/lib/db/prisma';
import { normalizeAssetStatus, normalizeUnitStatus } from '@/lib/normalizers';
import { CreateUnitVersionSchema, CreateProvenanceSchema } from '@/server/schemas';
import type { z } from 'zod';

export type CreateUnitVersionInput = z.infer<typeof CreateUnitVersionSchema>;
export type CreateProvenanceInput = z.infer<typeof CreateProvenanceSchema>;

export class VersionsService {
  static async getVersionHistory(unitId: string) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        sources: { select: { id: true, name: true, version: true } },
        unitVersions: { orderBy: { createdAt: 'desc' } },
        assets: {
          select: {
            id: true,
            title: true,
            assetVersions: { orderBy: { createdAt: 'desc' } },
            provenances: {
              include: { source: { select: { id: true, name: true, version: true } } },
              orderBy: { generatedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!unit) return [];

    const unitEntries = unit.unitVersions.map((version) => ({
      id: version.id,
      recordType: 'unit' as const,
      versionNumber: version.versionNumber,
      timestamp: version.createdAt.toISOString(),
      sourceVersion: version.sourceVersion,
      sourceReference: unit.sources.map((source) => source.name).join(', '),
      assetVersion: version.assetVersionCount,
      status: normalizeUnitStatus(version.status),
      modelIdentifier: version.modelIdentifier ?? 'Unknown',
      generationVersion: version.generationVersion ?? 'Unknown',
      teacherAction: version.teacherAction ?? undefined,
      note: version.note ?? undefined,
    }));

    const assetEntries = unit.assets.flatMap((asset) => asset.assetVersions.map((version) => {
      const provenance = asset.provenances.reduce<(typeof asset.provenances)[number] | undefined>(
        (closest, candidate) => {
          if (!closest) return candidate;
          const closestDistance = Math.abs(closest.generatedAt.getTime() - version.createdAt.getTime());
          const candidateDistance = Math.abs(candidate.generatedAt.getTime() - version.createdAt.getTime());
          return candidateDistance < closestDistance ? candidate : closest;
        },
        undefined
      );
      const provenanceDistance = provenance
        ? Math.abs(provenance.generatedAt.getTime() - version.createdAt.getTime())
        : undefined;
      const matchingProvenances = provenanceDistance === undefined
        ? []
        : asset.provenances.filter((candidate) =>
            Math.abs(candidate.generatedAt.getTime() - version.createdAt.getTime()) === provenanceDistance
          );
      const sourceReferences = [...new Set(matchingProvenances.map((record) => record.source?.name ?? record.sourceId).filter(Boolean))];

      return {
        id: version.id,
        recordType: 'asset' as const,
        versionNumber: version.versionNumber,
        timestamp: version.createdAt.toISOString(),
        sourceVersion: provenance?.source?.version ?? 1,
        sourceReference: sourceReferences.join(', ') || provenance?.sourceId || 'Source reference unavailable',
        assetVersion: version.versionNumber,
        status: normalizeAssetStatus(version.status),
        modelIdentifier: provenance?.modelIdentifier ?? 'Unknown',
        generationVersion: provenance?.generationVersion ?? 'Unknown',
        assetId: asset.id,
        assetTitle: asset.title,
        contentSnapshot: version.contentSnapshot ?? undefined,
        note: version.note ?? undefined,
      };
    }));

    return [...unitEntries, ...assetEntries].sort(
      (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
    );
  }

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
        generationConfig: validated.generationConfig,
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
