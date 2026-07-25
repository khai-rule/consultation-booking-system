import { supabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const POSTGRES_UNIQUE_VIOLATION = "23505";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { doctorId, patientName, slot } = body ?? {};

  if (!doctorId || !patientName || !slot) {
    return NextResponse.json(
      { error: "doctorId, patientName, and slot are required" },
      { status: 400 }
    );
  }

  // The double-booking guard: we don't check-then-insert (that's a race —
  // two requests can both pass the check before either inserts). We rely on
  // the database's partial unique index on (doctor_id, slot) to be the
  // single source of truth, and treat the insert itself as the atomic
  // "claim" of the slot. If two requests race, Postgres guarantees only one
  // insert succeeds; the loser gets a unique-violation error, which we
  // translate into a 409.
  const { data, error } = await supabaseServer
    .from("bookings")
    .insert({
      doctor_id: doctorId,
      patient_name: patientName,
      slot,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return NextResponse.json(
        { error: "This slot was just booked by someone else. Please pick another." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}
