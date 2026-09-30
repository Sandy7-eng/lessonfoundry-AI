import prisma from '@/lib/db/prisma';
import { CreateAssetSchema, UpdateAssetSchema, CreateQuestionSchema, UpdateQuestionSchema } from '@/server/schemas';
import { QualityService } from '@/server/services/quality/qualityService';
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
        reviews: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
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

    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (validated.status !== undefined) {
      throw new Error('Asset status must be changed through the review API');
    }

    const result = await prisma.asset.updateMany({
      where: { id, status: { not: 'APPROVED' } },
      data: validated,
    });

    if (result.count === 0) {
      throw new Error('Approved assets cannot be modified');
    }

    return prisma.asset.findUniqueOrThrow({ where: { id } });
  }

  static async deleteAsset(id: string) {
    return prisma.asset.delete({
      where: { id },
    });
  }

  static async regenerateAsset(unitId: string, assetId: string, questionId?: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        questions: { orderBy: { displayOrder: 'asc' } },
        assetVersions: { orderBy: { versionNumber: 'desc' } },
        provenances: { orderBy: { generatedAt: 'desc' } },
        unit: {
          include: {
            objectives: { orderBy: { displayOrder: 'asc' } },
            sources: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!asset || asset.unitId !== unitId) {
      throw new Error('Asset not found in this unit');
    }

    if (asset.status === 'APPROVED') {
      throw new Error('Approved assets cannot be regenerated');
    }

    const nextVersion = Math.max(asset.version, asset.assetVersions[0]?.versionNumber ?? 0) + 1;
    const previousProvenance = asset.provenances[0];
    const generatedAt = new Date();
    const timestamp = generatedAt.toISOString();

    const regeneratedContent = questionId
      ? (() => {
          const question = asset.questions.find((item) => item.id === questionId);
          if (!question) throw new Error('Question not found');
          return `${question.content}\n\n[Regenerated question version ${nextVersion}]\n${question.answer}`;
        })()
      : `${asset.content}\n\n[Regenerated asset version ${nextVersion}]\nUpdated for curriculum fidelity at ${timestamp}.`;

    const nextStatus = questionId ? asset.status : 'DRAFT';

    const sourceIds = asset.unit.sources.map((source) => source.id);
    const provenanceSourceIds = sourceIds.length > 0
      ? sourceIds
      : [...new Set(asset.provenances.map((provenance) => provenance.sourceId).filter((sourceId): sourceId is string => Boolean(sourceId)))];
    const updatedAsset = await prisma.$transaction(async (transaction) => {
      const updateResult = await transaction.asset.updateMany({
        where: { id: assetId, unitId, status: { not: 'APPROVED' } },
        data: {
          content: questionId ? asset.content : regeneratedContent,
          status: nextStatus,
          version: nextVersion,
          updatedAt: generatedAt,
        },
      });

      if (updateResult.count === 0) {
        throw new Error('Approved assets cannot be regenerated');
      }

      const updated = await transaction.asset.findUniqueOrThrow({
        where: { id: assetId },
        include: {
          questions: { orderBy: { displayOrder: 'asc' } },
        },
      });

      await transaction.assetVersion.create({
        data: {
          assetId,
          versionNumber: nextVersion,
          status: nextStatus,
          note: questionId ? 'Regenerated question item' : 'Controlled asset regeneration',
          contentSnapshot: regeneratedContent,
          createdAt: generatedAt,
        },
      });

      const sourcesToRecord: Array<string | null> = provenanceSourceIds.length > 0
        ? provenanceSourceIds
        : [null];
      for (const sourceId of sourcesToRecord) {
        await transaction.provenance.create({
          data: {
            assetId,
            sourceId,
            modelIdentifier: previousProvenance?.modelIdentifier ?? process.env.GEMINI_MODEL ?? 'lf-generator-v1',
            generationVersion: previousProvenance?.generationVersion ?? '1.0.0',
            generationConfig: previousProvenance?.generationConfig ?? JSON.stringify({ regeneratedAt: timestamp }),
            generatedAt,
          },
        });
      }

      return updated;
    });

    const objectiveMatches = await prisma.objective.findMany({
      where: { unitId },
      orderBy: { displayOrder: 'asc' },
    });

    await prisma.objectiveAlignment.deleteMany({ where: { assetId } });

    for (const objective of objectiveMatches) {
      const objectiveText = objective.text.toLowerCase();
      const assetText = `${updatedAsset.title} ${updatedAsset.content}`.toLowerCase();
      const matches = assetText.includes(objectiveText.toLowerCase()) || objectiveText.split(/\s+/).filter(Boolean).some((token) => token.length > 3 && assetText.includes(token));
      if (matches) {
        await prisma.objectiveAlignment.create({
          data: {
            objectiveId: objective.id,
            assetId,
            status: 'COVERED',
          },
        });
      }
    }

    const issueList = [] as Array<{
      assetId: string;
      questionId?: string;
      type: string;
      severity: 'ERROR' | 'WARNING' | 'INFO';
      description: string;
      explanation: string;
      suggestedAction: string;
    }>;

    if (objectiveMatches.length > 0 && !objectiveMatches.some((objective) => `${updatedAsset.title} ${updatedAsset.content}`.toLowerCase().includes(objective.text.toLowerCase().slice(0, 25)))) {
      issueList.push({
        assetId,
        type: 'Missing Objective Coverage',
        severity: 'WARNING',
        description: `Regenerated asset may not yet satisfy learning objective coverage.`,
        explanation: 'The regenerated content should be checked for direct coverage of the target objective.',
        suggestedAction: 'Refresh the asset wording to address the relevant learning objective explicitly.',
      });
    }

    if (issueList.length > 0) {
      await QualityService.auditGeneratedIssueSet(unitId, issueList);
    }

    return updatedAsset;
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
