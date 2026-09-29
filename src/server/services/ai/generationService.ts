import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/db/prisma';
import {
  normalizeAssetType,
  normalizeAssetStatus,
  normalizeQuestionDifficulty,
} from '@/lib/normalizers';

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
  try {
    data = await makeCall(primaryModel);
  } catch (err: unknown) {
    console.error('Primary model failed:', err);
    try {
      data = await makeCall(fallbackModel);
    } catch (fallbackErr: unknown) {
      console.error('Fallback model failed, retrying once...', fallbackErr);
      data = await makeCall(fallbackModel);
    }
  }

  const createdAssets = [];

  for (const assetData of data.assets) {
    // Normalize all enum fields coming from Gemini
    const assetType = normalizeAssetType(assetData.type);
    const assetStatus = normalizeAssetStatus(assetData.status);

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
          create: {
            sourceId: unit.sources[0]?.id,
            modelIdentifier: process.env.GEMINI_MODEL || 'gemini',
            generationVersion: '1.0.0',
            generationConfig: JSON.stringify({ constraints })
          }
        },
        assetVersions: {
          create: {
            versionNumber: 1,
            status: 'DRAFT',
            contentSnapshot: assetData.content ?? ''
          }
        }
      }
    });
    createdAssets.push(asset);
  }

  await prisma.unit.update({
    where: { id: unit.id },
    data: { status: 'GENERATED' }
  });

  return createdAssets;
}
