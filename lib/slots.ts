import { SlotOption } from "@/lib/types";

/**
 * Returns the next weekday (Mon–Fri) relative to now.
 *
 * Assessment-scope simplification: slots are generated for a single fixed day
 * rather than backed by a real doctor-availability table. A real system would
 * replace this with a query against an availability model. Extracted here (not
 * inline in the route handler) so there is a clear seam to hook into when that
 * feature is added — only this file would change.
 */
export function nextWeekday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** Generates 9:00 AM–5:00 PM in 30-minute increments for the next weekday. */
export function generateSlotTimes(): Date[] {
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

/**
 * Merges generated candidate times with the set of already-booked times,
 * returning a labelled SlotOption array for the client.
 */
export function buildSlotOptions(bookedISOTimes: string[]): SlotOption[] {
  const bookedSet = new Set(bookedISOTimes);
  return generateSlotTimes().map((time) => ({
    time: time.toISOString(),
    label: time.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" }),
    available: !bookedSet.has(time.toISOString()),
  }));
}
