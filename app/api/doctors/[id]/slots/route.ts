import { supabaseServer } from "@/lib/supabase/server";
import { SlotOption } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Assessment-scope simplification: slots are generated for the next
// weekday, 9:00 AM–5:00 PM in 30-minute increments, rather than backed by
// a real doctor calendar/availability table. Noted as a known limitation
// in the README — a real system would model doctor availability separately
// from bookings.
function nextWeekday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function generateSlotTimes(): Date[] {
  const day = nextWeekday();
  const slots: Date[] = [];
  for (let hour = 9; hour < 17; hour++) {
    for (const minute of [0, 30]) {
      const slot = new Date(day);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const doctorId = params.id;

  const { data: activeBookings, error } = await supabaseServer
    .from("bookings")
    .select("slot")
    .eq("doctor_id", doctorId)
    .neq("status", "cancelled");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedTimes = new Set(
    (activeBookings ?? []).map((b) => new Date(b.slot).toISOString())
  );

  const slots: SlotOption[] = generateSlotTimes().map((time) => ({
    time: time.toISOString(),
    label: time.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" }),
    available: !bookedTimes.has(time.toISOString()),
  }));

  return NextResponse.json({ slots });
}
