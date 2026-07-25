export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  slug: string;
}

/**
 * A booking row with its joined doctor fields, as returned by
 * `.select("*, doctors(name, specialty)")`. Used by the admin view and
 * confirmation page — declared here so it isn't re-invented per file.
 */
export interface BookingWithDoctor extends Booking {
  doctors: Pick<Doctor, "name" | "specialty"> | null;
}

export interface Booking {
  id: string;
  doctor_id: string;
  patient_name: string;
  slot: string; // ISO timestamp
  status: BookingStatus;
  created_at: string;
}

export interface SlotOption {
  time: string; // ISO timestamp
  label: string; // e.g. "9:00 AM"
  available: boolean;
}

// Valid transitions, enforced server-side in the bookings PATCH route.
// Keeping this as a single source of truth avoids the state machine drifting
// out of sync between the UI and the API as the app grows.
export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
