import { supabaseServer } from "@/lib/supabase/server";
import { BookingStatus, isValidTransition } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, doctors(name, specialty)")
    .order("slot", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status: nextStatus } = (await req.json()) as { status: BookingStatus };

  const { data: current, error: fetchError } = await supabaseServer
    .from("bookings")
    .select("status")
    .eq("id", params.id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!isValidTransition(current.status, nextStatus)) {
    return NextResponse.json(
      { error: `Cannot move a ${current.status} booking to ${nextStatus}` },
      { status: 422 }
    );
  }

  const { data, error } = await supabaseServer
    .from("bookings")
    .update({ status: nextStatus })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}
