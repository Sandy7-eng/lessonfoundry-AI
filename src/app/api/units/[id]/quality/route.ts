import { NextRequest, NextResponse } from 'next/server';
import { QualityService, UnitsService } from '@/server/services';
import { CreateQualityIssueSchema, ResolveQualityIssueSchema } from '@/server/schemas';
import { handleApiError, isValidId, parseJsonBody } from '@/server/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/units/[id]/quality
 * Fetch all automated or reported quality issues for a unit.
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

    const issues = await QualityService.getIssuesByUnitId(id);
    return NextResponse.json(issues, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/units/[id]/quality
 * Update status of a quality issue (e.g. resolve or dismiss).
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
      issueId?: string;
      [key: string]: unknown;
    }>(request);

    const issueId =
      request.nextUrl.searchParams.get('issueId') ||
      request.nextUrl.searchParams.get('id') ||
      body.issueId ||
      body.id;

    if (!isValidId(issueId)) {
      return NextResponse.json(
        {
          error: 'Invalid Issue ID',
          message: 'An issue ID must be provided in the query string (?issueId=...) or request body',
        },
        { status: 400 }
      );
    }

    const validated = ResolveQualityIssueSchema.parse(body);

    const unit = await UnitsService.getUnitById(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Not Found', message: `Unit with ID '${id}' was not found` },
        { status: 404 }
      );
    }

    const updatedIssue = await QualityService.updateQualityIssueStatus(issueId, validated);
    return NextResponse.json(updatedIssue, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/units/[id]/quality
 * Create a new quality issue for a unit.
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
    const validated = CreateQualityIssueSchema.parse({
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

    const newIssue = await QualityService.createQualityIssue(validated);
    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
