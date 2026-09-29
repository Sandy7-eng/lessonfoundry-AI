import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import {
  normalizeDifficulty,
  normalizeAnswerRevealPolicy,
  normalizeSourceType,
} from '@/lib/normalizers';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Find or create a default user to own the unit
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'teacher@lessonfoundry.ai', name: 'Demo Teacher', role: 'TEACHER' }
      });
    }

    const constraints = body.constraints ?? {};

    // Create unit and relations
    const unit = await prisma.unit.create({
      data: {
        userId: user.id,
        title: body.title,
        subject: body.subject,
        targetLevel: body.targetLevel,
        status: 'GENERATING',
        constraints: {
          create: {
            difficulty: normalizeDifficulty(constraints.difficulty),
            vocabularyConstraints: constraints.vocabularyConstraints ?? null,
            answerRevealPolicy: normalizeAnswerRevealPolicy(constraints.answerRevealPolicy),
          }
        },
        sources: {
          create: (body.sources ?? []).map((s: { name: string; type?: string; preview?: string }) => ({
            name: s.name,
            type: normalizeSourceType(s.type ?? 'TEXT'),
            preview: s.preview ?? 'No preview',
            trusted: true,
            status: 'READY',
          }))
        },
        objectives: {
          create: (body.objectives ?? []).map((o: { identifier: string; text: string }, i: number) => ({
            identifier: o.identifier,
            text: o.text,
            displayOrder: i,
          }))
        }
      }
    });

    return NextResponse.json({ unitId: unit.id });
  } catch (err: unknown) {
    console.error('Init error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
