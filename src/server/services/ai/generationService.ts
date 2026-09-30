import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/db/prisma';
import {
  normalizeAssetType,
  normalizeAssetStatus,
  normalizeQuestionDifficulty,
} from '@/lib/normalizers';
import { ObjectivesService } from '@/server/services/objectives/objectivesService';
import { QualityService } from '@/server/services/quality/qualityService';

const tokenize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((token) => token.length > 2);

const scoreObjectiveMatch = (objectiveText: string, assetText: string) => {
  const objectiveTokens = new Set(tokenize(objectiveText));
  const assetTokens = tokenize(assetText);
  return assetTokens.reduce((total, token) => total + (objectiveTokens.has(token) ? 1 : 0), 0);
};

const similarity = (left: string, right: string) => {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const max = Math.max(leftTokens.size, rightTokens.size, 1);
  return overlap / max;
};

const normalizeAnswer = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export async function generateLearningPack(unitId: string) {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      sources: true,
      objectives: true,
      constraints: true,
    }
  });

  if (!unit) throw new Error('Unit not found');
  if (!unit.sources || unit.sources.length === 0) throw new Error('No sources found');

  const sourceContent = unit.sources.map(s => `Title: ${s.name}\nContent: ${s.preview}`).join('\n\n');
  const objectivesText = unit.objectives.map(o => `- ${o.identifier}: ${o.text}`).join('\n');
  const constraints = unit.constraints;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are an AI generating a pedagogical learning pack strictly based on the provided source content. Do NOT hallucinate. Do NOT fabricate information. If the source lacks information to cover an objective, state it as a gap.

Target Level: ${unit.targetLevel}
Difficulty: ${constraints?.difficulty ?? 'CORE'}
Answer Reveal Policy: ${constraints?.answerRevealPolicy ?? 'AFTER_ATTEMPT'}

Objectives:
${objectivesText}

Source Content:
${sourceContent}

Respond with ONLY valid JSON (no markdown, no code fences) matching this exact structure.
Use ONLY these exact string values for "type" - do not vary them:
  CONCEPT_EXPLANATION, WORKED_EXAMPLE, FORMATIVE_QUIZ,
  DIFFERENTIATED_PRACTICE_FOUNDATION, DIFFERENTIATED_PRACTICE_EXTENSION, REVISION_SHEET
Use ONLY these exact values for question "difficulty": FOUNDATION, CORE, EXTENSION

{
  "assets": [
    {
      "type": "CONCEPT_EXPLANATION",
      "title": "Concept Explanation",
      "content": "Detailed markdown explanation based ONLY on source content."
    },
    {
      "type": "WORKED_EXAMPLE",
      "title": "Worked Example",
      "content": "Step-by-step example problem and solution."
    },
    {
      "type": "FORMATIVE_QUIZ",
      "title": "Formative Quiz",
      "content": "Quiz instructions and overview.",
      "questions": [
        {"content": "Question text...", "answer": "Answer text...", "difficulty": "CORE"}
      ]
    },
    {
      "type": "DIFFERENTIATED_PRACTICE_FOUNDATION",
      "title": "Foundation Practice",
      "content": "Easier practice questions."
    },
    {
      "type": "DIFFERENTIATED_PRACTICE_EXTENSION",
      "title": "Extension Practice",
      "content": "Harder practice questions."
    },
    {
      "type": "REVISION_SHEET",
      "title": "Revision Sheet",
      "content": "Summary sheet for revision."
    }
  ]
}`;

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash';

  const makeCall = async (model: string) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    const text = (response.text ?? '').trim();
    // Strip any accidental markdown code fences
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      throw new Error(`Model returned invalid JSON: ${clean.slice(0, 200)}`);
    }
    if (!data.assets || !Array.isArray(data.assets)) {
      throw new Error('Invalid JSON format: missing assets array');
    }
    return data;
  };

  let data;
  let generatedModel = primaryModel;
  try {
    data = await makeCall(primaryModel);
  } catch (err: unknown) {
    console.error('Primary model failed:', err);
    generatedModel = fallbackModel;
    try {
      data = await makeCall(fallbackModel);
    } catch (fallbackErr: unknown) {
      console.error('Fallback model failed, retrying once...', fallbackErr);
      data = await makeCall(fallbackModel);
    }
  }

  const createdAssets = [];

  for (const assetData of data.assets) {
    const assetType = normalizeAssetType(assetData.type);
    const assetStatus = normalizeAssetStatus(assetData.status);
    const generatedAt = new Date();

    const asset = await prisma.asset.create({
      data: {
        unitId: unit.id,
        type: assetType,
        title: assetData.title ?? assetType,
        content: assetData.content ?? '',
        status: assetStatus,
        version: 1,
        questions: {
          create: (assetData.questions ?? []).map(
            (q: { content: string; answer: string; difficulty?: string }, index: number) => ({
              content: q.content,
              answer: q.answer,
              difficulty: normalizeQuestionDifficulty(q.difficulty),
              displayOrder: index,
            })
          )
        },
        provenances: {
          create: unit.sources.map((source) => ({
            sourceId: source.id,
            modelIdentifier: generatedModel,
            generationVersion: '1.0.0',
            generationConfig: JSON.stringify({ constraints }),
            generatedAt,
          })),
        },
        assetVersions: {
          create: {
            versionNumber: 1,
            status: assetStatus,
            contentSnapshot: assetData.content ?? '',
            createdAt: generatedAt,
          }
        }
      },
      include: {
        questions: { orderBy: { displayOrder: 'asc' } },
      },
    });

    const assetText = [asset.title, asset.content, ...(asset.questions ?? []).map((question) => `${question.content} ${question.answer}`)].join(' ');
    const scoredObjectives = unit.objectives
      .map((objective) => ({
        objective,
        score: scoreObjectiveMatch(objective.text, assetText),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    const matchedObjectives = scoredObjectives.length > 0
      ? scoredObjectives.slice(0, Math.min(3, scoredObjectives.length)).map((entry) => entry.objective)
      : unit.objectives.slice(0, 1);

    for (const objective of matchedObjectives) {
      const status = scoreObjectiveMatch(objective.text, assetText) >= 2 ? 'COVERED' : 'PARTIAL';
      await ObjectivesService.ensureAlignment({
        objectiveId: objective.id,
        assetId: asset.id,
        status,
      });
    }

    for (const question of asset.questions ?? []) {
      const questionText = `${question.content} ${question.answer}`;
      const scoredQuestionObjectives = unit.objectives
        .map((objective) => ({
          objective,
          score: scoreObjectiveMatch(objective.text, questionText),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score);

      const relevantObjectives = scoredQuestionObjectives.length > 0
        ? scoredQuestionObjectives.slice(0, Math.min(2, scoredQuestionObjectives.length)).map((entry) => entry.objective)
        : matchedObjectives;

      for (const objective of relevantObjectives) {
        const status = scoreObjectiveMatch(objective.text, questionText) >= 1 ? 'COVERED' : 'PARTIAL';
        await ObjectivesService.ensureAlignment({
          objectiveId: objective.id,
          assetId: asset.id,
          questionId: question.id,
          status,
        });
      }
    }

    const issueBatch: Array<{
      assetId: string;
      questionId?: string;
      type: string;
      severity: 'ERROR' | 'WARNING' | 'INFO';
      description: string;
      explanation: string;
      suggestedAction: string;
      status?: 'OPEN' | 'RESOLVED' | 'DISMISSED';
    }> = [];

    const duplicateQuestions = new Map<string, string>();
    (asset.questions ?? []).forEach((question) => {
      const normalized = normalizeAnswer(question.content);
      if (duplicateQuestions.has(normalized)) {
        issueBatch.push({
          assetId: asset.id,
          questionId: question.id,
          type: 'Duplicate Question',
          severity: 'WARNING',
          description: `Duplicate question detected in ${asset.title}.`,
          explanation: 'Two nearly identical questions were generated, which reduces assessment validity and inflates assessment volume.',
          suggestedAction: 'Remove or merge the duplicate item and keep a single, unique question version.',
        });
      } else {
        duplicateQuestions.set(normalized, question.id);
      }
    });

    (asset.questions ?? []).forEach((question) => {
      const answerText = normalizeAnswer(question.answer);
      if (!answerText || answerText.length < 3) {
        issueBatch.push({
          assetId: asset.id,
          questionId: question.id,
          type: 'Malformed Answer Key',
          severity: 'ERROR',
          description: `Answer key is malformed for ${question.content.slice(0, 80)}.`,
          explanation: 'The generated answer contains too little information or is missing, which prevents accurate marking.',
          suggestedAction: 'Add a complete answer key with the expected response and review the question for clarity.',
        });
      }

      if (
        asset.type === 'FORMATIVE_QUIZ' &&
        (question.content.toLowerCase().includes(answerText) || question.content.toLowerCase().includes('answer') && answerText.length > 0)
      ) {
        issueBatch.push({
          assetId: asset.id,
          questionId: question.id,
          type: 'Answer Leakage Risk',
          severity: 'ERROR',
          description: `Question ${question.content.slice(0, 80)} may expose the answer before submission.`,
          explanation: 'The answer wording appears embedded in the question prompt or nearby content, creating answer leakage risk.',
          suggestedAction: 'Rewrite the prompt to avoid revealing answer cues and keep the answer key hidden until submission.',
        });
      }

      if (question.difficulty === 'FOUNDATION' && asset.type === 'DIFFERENTIATED_PRACTICE_EXTENSION') {
        issueBatch.push({
          assetId: asset.id,
          questionId: question.id,
          type: 'Difficulty Mismatch',
          severity: 'WARNING',
          description: `Foundation-level difficulty appears in a differentiated extension asset.`,
          explanation: 'The question difficulty is inconsistent with the asset type and expected challenge level.',
          suggestedAction: 'Review the question difficulty to ensure it matches the extension asset target.',
        });
      }
    });

    if ((asset.questions ?? []).length === 0 && asset.content.length > 120) {
      issueBatch.push({
        assetId: asset.id,
        type: 'Missing Objective Coverage',
        severity: 'WARNING',
        description: `${asset.title} has no question coverage and may not be aligned to the learning objectives.`,
        explanation: 'The asset contains explanatory content but no assessable question items for objective checking.',
        suggestedAction: 'Add scaffolded questions or a brief formative task that directly assesses the target learning objectives.',
      });
    }

    if (unit.objectives.length > 0) {
      const objectiveCoverage = unit.objectives.filter((objective) => scoreObjectiveMatch(objective.text, assetText) === 0).slice(0, 1);
      objectiveCoverage.forEach((objective) => {
        issueBatch.push({
          assetId: asset.id,
          type: 'Missing Objective Coverage',
          severity: 'WARNING',
          description: `Objective ${objective.identifier} is not represented in ${asset.title}.`,
          explanation: 'The asset content does not strongly align with the objective and may leave a curriculum gap.',
          suggestedAction: `Add a section or question that explicitly targets ${objective.identifier} and reinforces the objective outcome.`,
        });
      });
    }

    const sourceText = sourceContent.toLowerCase();
    const unsupportedTextTokens = tokenize(assetText).filter((token) => /\d/.test(token) && !sourceText.includes(token));
    if (unsupportedTextTokens.length > 0) {
      issueBatch.push({
        assetId: asset.id,
        type: 'Unsupported Claim',
        severity: 'INFO',
        description: `${asset.title} contains numeric or specific claims that are not clearly supported by the source material.`,
        explanation: 'The claim appears to include evidence or data points that are not directly traceable to the source content.',
        suggestedAction: 'Cross-check the claim against the uploaded curriculum document before publishing.',
      });
    }

    for (let index = 0; index < (asset.questions ?? []).length; index += 1) {
      const left = (asset.questions ?? [])[index];
      for (let compareIndex = index + 1; compareIndex < (asset.questions ?? []).length; compareIndex += 1) {
        const right = (asset.questions ?? [])[compareIndex];
        if (similarity(left.content, right.content) > 0.8) {
          issueBatch.push({
            assetId: asset.id,
            questionId: right.id,
            type: 'Near-Identical Question Variant',
            severity: 'WARNING',
            description: `Question variants in ${asset.title} are unusually similar.`,
            explanation: 'Two questions differ only slightly in wording, creating redundant assessment items.',
            suggestedAction: 'Refine one question or remove the duplicate variant to maintain assessment diversity.',
          });
        }
      }
    }

    const dedupedIssues = issueBatch.filter((issue, index, allIssues) =>
      allIssues.findIndex((candidate) =>
        candidate.type === issue.type &&
        candidate.assetId === issue.assetId &&
        (candidate.questionId ?? 'none') === (issue.questionId ?? 'none')
      ) === index
    );

    if (dedupedIssues.length > 0) {
      await QualityService.auditGeneratedIssueSet(
        unit.id,
        dedupedIssues.map((issue) => ({
          assetId: issue.assetId,
          questionId: issue.questionId,
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          explanation: issue.explanation,
          suggestedAction: issue.suggestedAction,
        }))
      );
    }

    createdAssets.push(asset);
  }

  await prisma.unit.update({
    where: { id: unit.id },
    data: { status: 'GENERATED' }
  });

  return createdAssets;
}
