export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
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
