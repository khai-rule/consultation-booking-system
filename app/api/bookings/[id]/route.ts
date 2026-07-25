import { apiError } from "@/lib/api";
import { getBooking, getBookingStatus, updateBookingStatus } from "@/lib/data/bookings";
import { BookingStatus, isValidTransition } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const booking = await getBooking(params.id);
  if (!booking) return apiError("Booking not found", 404);
  return NextResponse.json({ booking });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status: nextStatus } = (await req.json()) as { status: BookingStatus };

  const current = await getBookingStatus(params.id);
  if (!current) return apiError("Booking not found", 404);

  if (!isValidTransition(current.status, nextStatus)) {
    return apiError(`Cannot move a ${current.status} booking to ${nextStatus}`, 422);
  }

  const updated = await updateBookingStatus(params.id, nextStatus);
  if (!updated) return apiError("Failed to update booking", 500);

  return NextResponse.json({ booking: updated });
}

