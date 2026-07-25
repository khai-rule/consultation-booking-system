import { NextResponse } from "next/server";

/**
 * Consistent error response shape across all API routes.
 * Every route that returns an error should go through this so the shape
 * never drifts: { error: string } with an explicit HTTP status.
 */
export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
