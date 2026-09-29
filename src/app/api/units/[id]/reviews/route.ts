import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService, UnitsService } from '@/server/services';
import { CreateReviewSchema, UpdateReviewSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/reviews
 * Fetch reviews for assets within a unit, optionally filtered by ?assetId=...
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

    const assetId = request.nextUrl.searchParams.get('assetId');
    if (assetId) {
      const reviews = await ReviewsService.getReviewsByAssetId(assetId);
      return NextResponse.json(reviews, { status: 200 });
    }

    const reviews = await ReviewsService.getReviewsByUnitId(id);
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/reviews
 * Submit a new review or update status/comments of an existing review.
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

    const unit = await UnitsService.getUnitById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Not Found', message: `Unit with ID '${id}' was not found` },
        { status: 404 }
      );
    }

    const body = await parseJsonBody<{
      id?: string;
      reviewId?: string;
      [key: string]: unknown;
    }>(request);

    const reviewId =
      request.nextUrl.searchParams.get('reviewId') ||
      request.nextUrl.searchParams.get('id') ||
      body.reviewId ||
      body.id;

    // If an existing review ID is provided, update it
    if (reviewId && isValidId(reviewId)) {
      const validated = UpdateReviewSchema.parse(body);
      const updatedReview = await ReviewsService.updateReview(reviewId, validated);
      return NextResponse.json(updatedReview, { status: 200 });
    }

    // Otherwise create a new review
    const validated = CreateReviewSchema.parse(body);
    const newReview = await ReviewsService.createReview(validated);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/units/[id]/reviews
 * Update review status or comments directly via PATCH.
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
      reviewId?: string;
      [key: string]: unknown;
    }>(request);

    const reviewId =
      request.nextUrl.searchParams.get('reviewId') ||
      request.nextUrl.searchParams.get('id') ||
      body.reviewId ||
      body.id;

    if (!isValidId(reviewId)) {
      return NextResponse.json(
        {
          error: 'Invalid Review ID',
          message: 'A review ID must be provided in the query string (?reviewId=...) or request body',
        },
        { status: 400 }
      );
    }

    const validated = UpdateReviewSchema.parse(body);
    const updatedReview = await ReviewsService.updateReview(reviewId, validated);
    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
