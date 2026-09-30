import { NextRequest, NextResponse } from 'next/server';
import { UnitsService, VersionsService } from '@/server/services';
import { CreateUnitVersionSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/versions
 * Fetch all audit snapshots / version history for a learning unit.
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

    const versions = await VersionsService.getVersionHistory(id);
    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/versions
 * Create an immutable snapshot / version entry for a unit.
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
    const validated = CreateUnitVersionSchema.parse({
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

    const newVersion = await VersionsService.createUnitVersion(validated);
    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
