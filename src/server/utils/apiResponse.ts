import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Validates that an ID is a non-empty string without whitespace-only content.
 */
export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}

/**
 * Safely parses the JSON body of a request.
 * Throws a friendly SyntaxError if malformed.
 */
export async function parseJsonBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    if (body === null || typeof body !== 'object') {
      throw new SyntaxError('Request body must be a JSON object');
    }
    return body as T;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw err;
    }
    throw new SyntaxError('Invalid or empty JSON body');
  }
}

/**
 * Centralized error handler for Next.js route handlers.
 * Ensures proper HTTP status codes, prevents secret leakage,
 * and masks raw internal database exceptions.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // 1. Zod Validation Error (HTTP 400 Bad Request)
  if (error instanceof ZodError) {
    const flattened = error.flatten();
    return NextResponse.json(
      {
        error: 'Validation failed',
        message: error.issues[0]?.message || 'Invalid request payload',
        details: flattened.fieldErrors,
      },
      { status: 400 }
    );
  }

  // 2. JSON Parsing Syntax Error (HTTP 400 Bad Request)
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: 'Invalid JSON',
        message: error.message || 'Malformed JSON in request body',
      },
      { status: 400 }
    );
  }

  // 3. Prisma Known Request Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Resource not found',
          message: 'The requested resource does not exist',
        },
        { status: 404 }
      );
    }

    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A record with this identifier already exists',
        },
        { status: 409 }
      );
    }

    // Foreign key constraint failure
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Invalid reference',
          message: 'Referenced foreign record does not exist or relation constraint violated',
        },
        { status: 400 }
      );
    }

    // Generic safe DB request error
    console.error(`[Prisma Database Request Error ${error.code}]:`, error.message);
    return NextResponse.json(
      {
        error: 'Database error',
        message: 'A database constraint or request error occurred',
      },
      { status: 400 }
    );
  }

  // 4. Prisma Initialization / Connection Errors (HTTP 503 Service Unavailable)
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    console.error('[Prisma Connection Error]:', error.message);
    return NextResponse.json(
      {
        error: 'Database unavailable',
        message: 'Database connection is unreachable or not configured. Ensure PostgreSQL is running.',
      },
      { status: 503 }
    );
  }

  // 5. Prisma Validation Error (HTTP 400 Bad Request)
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('[Prisma Validation Error]:', error.message);
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        message: 'The query could not be executed due to invalid data parameters',
      },
      { status: 400 }
    );
  }

  // 6. Generic errors
  if (error instanceof Error) {
    console.error('[Unhandled API Error]:', error.message);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected server error occurred',
      },
      { status: 500 }
    );
  }

  // 7. Unknown fallback
  console.error('[Unknown API Error]:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: 'An unexpected internal error occurred',
    },
    { status: 500 }
  );
}
