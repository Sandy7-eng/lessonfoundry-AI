import { NextRequest, NextResponse } from 'next/server';
import { SourcesService, UnitsService } from '@/server/services';
import { CreateSourceSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/sources
 * Fetch all source documents linked to a unit.
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

    const sources = await SourcesService.getSourcesByUnitId(id);
    return NextResponse.json(sources, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/sources
 * Create/register a new source document for a unit.
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
    const validated = CreateSourceSchema.parse({
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

    const newSource = await SourcesService.createSource(validated);
    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
