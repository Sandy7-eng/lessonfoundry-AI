import { NextResponse } from 'next/server';
import { generateLearningPack } from '@/server/services/ai/generationService';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const result = await generateLearningPack(id);
    return NextResponse.json({ success: true, unitId: id, result });
  } catch (error: unknown) {
    console.error('Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate learning pack' },
      { status: 500 }
    );
  }
}
