import { apiError } from "@/lib/api";
import { createBooking, listBookings } from "@/lib/data/bookings";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await listBookings();
    return NextResponse.json({ bookings });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Server error", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { doctorId, patientName, slot } = body ?? {};

  if (!doctorId || !patientName || !slot) {
    return apiError("doctorId, patientName, and slot are required", 400);
  }

  // The double-booking guard: we don't check-then-insert (that's a race —
  // two requests can both pass the check before either inserts). We rely on
  // the database's partial unique index on (doctor_id, slot) to be the
  // single source of truth, and treat the insert itself as the atomic
  // "claim" of the slot. If two requests race, Postgres guarantees only one
  // insert succeeds; the loser gets a unique-violation error, which
  // createBooking() surfaces as conflict: true and we translate to 409.
  const result = await createBooking({ doctorId, patientName, slot });

  if (result.conflict) {
    return apiError(result.error, 409);
  }
  if (result.error) {
    return apiError(result.error, 500);
  }

  // Invalidate the admin page router cache so the new booking is visible
  // immediately on next navigation, without requiring a manual refresh.
  revalidatePath("/admin");

  return NextResponse.json({ booking: result.data }, { status: 201 });
}

