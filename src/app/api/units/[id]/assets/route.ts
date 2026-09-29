import { NextRequest, NextResponse } from 'next/server';
import { AssetsService, UnitsService } from '@/server/services';
import { CreateAssetSchema, UpdateAssetSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/assets
 * Fetch all learning assets (guides, quizzes, practice, etc.) for a unit.
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

    const assets = await AssetsService.getAssetsByUnitId(id);
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/assets
 * Create a new asset, or update an existing asset if assetId or id is specified.
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

    const body = await parseJsonBody<{
      id?: string;
      assetId?: string;
      [key: string]: unknown;
    }>(request);

    const assetId =
      request.nextUrl.searchParams.get('assetId') ||
      request.nextUrl.searchParams.get('id') ||
      body.assetId ||
      body.id;

    // If an asset identifier is supplied, treat as update
    if (assetId && isValidId(assetId)) {
      const validated = UpdateAssetSchema.parse(body);
      const updatedAsset = await AssetsService.updateAsset(assetId, validated);
      return NextResponse.json(updatedAsset, { status: 200 });
    }

    // Otherwise create new asset
    const validated = CreateAssetSchema.parse({
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

    const newAsset = await AssetsService.createAsset(validated);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/units/[id]/assets
 * Update an existing asset directly via PATCH.
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
      assetId?: string;
      [key: string]: unknown;
    }>(request);

    const assetId =
      request.nextUrl.searchParams.get('assetId') ||
      request.nextUrl.searchParams.get('id') ||
      body.assetId ||
      body.id;

    if (!isValidId(assetId)) {
      return NextResponse.json(
        {
          error: 'Invalid Asset ID',
          message: 'An asset ID must be provided in the query string (?assetId=...) or request body',
        },
        { status: 400 }
      );
    }

    const validated = UpdateAssetSchema.parse(body);
    const updatedAsset = await AssetsService.updateAsset(assetId, validated);
    return NextResponse.json(updatedAsset, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
