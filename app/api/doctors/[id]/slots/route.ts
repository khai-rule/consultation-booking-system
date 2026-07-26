import { apiError } from "@/lib/api";
import { getActiveSlotTimesForDoctor } from "@/lib/data/bookings";
import { buildSlotOptions } from "@/lib/slots";
import { NextRequest, NextResponse } from "next/server";

// Disable Next.js fetch caching — slot availability must always reflect the
// current state of the database, not a cached snapshot.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookedTimes = await getActiveSlotTimesForDoctor(params.id);
    return NextResponse.json({ slots: buildSlotOptions(bookedTimes) });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Server error", 500);
  }
}

