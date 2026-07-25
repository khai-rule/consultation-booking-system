import { supabaseServer } from "@/lib/supabase/server";
import { Booking, BookingStatus, BookingWithDoctor } from "@/lib/types";

const POSTGRES_UNIQUE_VIOLATION = "23505";

/** Returns all bookings with joined doctor fields, ordered by slot time. Throws on DB error. */
export async function listBookings(): Promise<BookingWithDoctor[]> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, doctors(name, specialty)")
    .order("slot", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetches a single booking with its joined doctor fields.
 * Returns null if not found or on DB error — callers should treat null as 404.
 */
export async function getBooking(id: string): Promise<BookingWithDoctor | null> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, doctors(name, specialty)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

/**
 * Creates a booking. Returns the created row, or an error descriptor.
 * The `conflict` flag is true when the slot was already taken — callers
 * should map this to a 409 response so the client can re-fetch the slot list.
 */
export async function createBooking(input: {
  doctorId: string;
  patientName: string;
  slot: string;
}): Promise<
  | { data: Booking; conflict: false; error: null }
  | { data: null; conflict: boolean; error: string }
> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .insert({
      doctor_id: input.doctorId,
      patient_name: input.patientName,
      slot: input.slot,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return {
        data: null,
        conflict: true,
        error: "This slot was just booked by someone else. Please pick another.",
      };
    }
    return { data: null, conflict: false, error: error.message };
  }

  return { data, conflict: false, error: null };
}

/**
 * Reads only the status of a booking — used by the PATCH route to validate
 * the transition before running the update.
 */
export async function getBookingStatus(
  id: string
): Promise<{ status: BookingStatus } | null> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as { status: BookingStatus };
}

/**
 * Applies a status update to a booking and returns the updated row.
 * Returns null on DB error — callers should treat null as a 500.
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return data;
}

/**
 * Returns the ISO timestamps of all non-cancelled bookings for a doctor.
 * Used by the slots route to mark times as unavailable. Throws on DB error.
 */
export async function getActiveSlotTimesForDoctor(doctorId: string): Promise<string[]> {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("slot")
    .eq("doctor_id", doctorId)
    .neq("status", "cancelled");
  if (error) throw new Error(error.message);
  return (data ?? []).map((b) => new Date(b.slot).toISOString());
}
