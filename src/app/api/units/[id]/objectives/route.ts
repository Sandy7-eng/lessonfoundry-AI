import { NextRequest, NextResponse } from 'next/server';
import { ObjectivesService, UnitsService } from '@/server/services';
import { CreateObjectiveSchema, UpdateObjectiveSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/objectives
 * Fetch all learning objectives and alignments for a unit.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'A valid unit ID must be provided' },
        { status: 400 }
      );
    }

    const unit = await UnitsService.getUnitById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Not Found', message: `Unit with ID '${id}' was not found` },
        { status: 404 }
      );
    }

    const objectives = await ObjectivesService.getObjectivesByUnitId(id);
    return NextResponse.json(objectives, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/objectives
 * Create a new learning objective for a unit.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'A valid unit ID must be provided' },
        { status: 400 }
      );
    }

    const body = await parseJsonBody(request);
    const validated = CreateObjectiveSchema.parse({
      ...body,
      unitId: id,
    });

    const unit = await UnitsService.getUnitById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Not Found', message: `Unit with ID '${id}' was not found` },
        { status: 404 }
      );
    }

    const newObjective = await ObjectivesService.createObjective(validated);
    return NextResponse.json(newObjective, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/units/[id]/objectives
 * Update an objective (ID provided via ?objectiveId=... or body.id/body.objectiveId).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'A valid unit ID must be provided' },
        { status: 400 }
      );
    }

    const body = await parseJsonBody<{
      id?: string;
      objectiveId?: string;
      [key: string]: unknown;
    }>(request);

    const objectiveId =
      request.nextUrl.searchParams.get('objectiveId') ||
      request.nextUrl.searchParams.get('id') ||
      body.objectiveId ||
      body.id;

    if (!isValidId(objectiveId)) {
      return NextResponse.json(
        {
          error: 'Invalid Objective ID',
          message: 'An objective ID must be provided in the query string (?objectiveId=...) or request body',
        },
        { status: 400 }
      );
    }

    const validated = UpdateObjectiveSchema.parse(body);
    const updatedObjective = await ObjectivesService.updateObjective(objectiveId, validated);
    return NextResponse.json(updatedObjective, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/units/[id]/objectives
 * Delete an objective (ID provided via ?objectiveId=... or body.id/body.objectiveId).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'A valid unit ID must be provided' },
        { status: 400 }
      );
    }

    let objectiveId: string | null | undefined =
      request.nextUrl.searchParams.get('objectiveId') ||
      request.nextUrl.searchParams.get('id');

    if (!objectiveId) {
      try {
        const body = await parseJsonBody<{ id?: string; objectiveId?: string }>(request);
        objectiveId = body.objectiveId || body.id;
      } catch {
        // Body was optional if query param was present
      }
    }

    if (!isValidId(objectiveId)) {
      return NextResponse.json(
        {
          error: 'Invalid Objective ID',
          message: 'An objective ID must be provided in the query string (?objectiveId=...) or request body',
        },
        { status: 400 }
      );
    }

    await ObjectivesService.deleteObjective(objectiveId);
    return NextResponse.json(
      { success: true, message: 'Objective deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
