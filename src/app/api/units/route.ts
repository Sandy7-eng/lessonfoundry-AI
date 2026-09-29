import { NextRequest, NextResponse } from 'next/server';
import { UnitsService } from '@/server/services';
import { CreateUnitSchema } from '@/server/schemas';
import { handleApiError, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * GET /api/units
 * Retrieve all learning units with associated metadata.
 */
export async function GET() {
  try {
    const units = await UnitsService.getAllUnits();
    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units
 * Create a new learning unit.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    const validated = CreateUnitSchema.parse(body);
    const newUnit = await UnitsService.createUnit(validated);
    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
