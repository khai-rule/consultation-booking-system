/**
 * Concurrency integration tests for the double-booking guard.
 *
 * These tests make real HTTP requests against a running Next.js server and
 * exercise the actual Postgres partial unique index. They must NOT be run
 * against a mocked database — the race condition only manifests at the DB level.
 *
 * Prerequisites:
 *   1. A running Next.js server (npm run dev or npm run start)
 *   2. TEST_BASE_URL env var pointing to it (default: http://localhost:3000)
 *   3. TEST_DOCTOR_ID env var: the UUID of any doctor in the test database
 *      (copy from Supabase Table Editor, or run:
 *       SELECT id FROM doctors LIMIT 1;)
 *
 * Run: npm test
 */

import { afterEach, beforeAll, describe, expect, it } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const DOCTOR_ID = process.env.TEST_DOCTOR_ID ?? "";

// A slot time far enough in the future that it won't collide with real bookings.
// Each test uses a distinct minute so tests don't interfere with each other.
function testSlot(offsetMinutes: number): string {
  const d = new Date("2099-01-15T09:00:00.000Z");
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
}

async function postBooking(slot: string, name: string) {
  return fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId: DOCTOR_ID, patientName: name, slot }),
  });
}

async function cancelBookingsBySlot(slot: string) {
  // Fetch all bookings and cancel any matching this test slot so each run
  // starts clean. Admin-only route — fine for tests.
  const res = await fetch(`${BASE_URL}/api/bookings`);
  if (!res.ok) return;
  const { bookings } = await res.json();
  const matches = (bookings ?? []).filter(
    (b: { slot: string; id: string }) => b.slot === slot
  );
  await Promise.all(
    matches.map((b: { id: string }) =>
      fetch(`${BASE_URL}/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
    )
  );
}

beforeAll(() => {
  if (!DOCTOR_ID) {
    throw new Error(
      "TEST_DOCTOR_ID is not set. " +
        "Set it to the UUID of any doctor in your test database. " +
        "Example: TEST_DOCTOR_ID=<uuid> npm test"
    );
  }
});

describe("Double-booking guard", () => {
  const SLOT_A = testSlot(0);
  const SLOT_B = testSlot(30);
  const SLOT_C = testSlot(60);

  afterEach(async () => {
    await Promise.all([
      cancelBookingsBySlot(SLOT_A),
      cancelBookingsBySlot(SLOT_B),
      cancelBookingsBySlot(SLOT_C),
    ]);
  });

  it(
    "two concurrent requests for the SAME slot: exactly one succeeds (201) and the other is rejected (409)",
    async () => {
      // Fire both requests simultaneously — Promise.all, not sequential awaits,
      // so they genuinely race at the network and DB level.
      const [res1, res2] = await Promise.all([
        postBooking(SLOT_A, "Patient Alpha"),
        postBooking(SLOT_A, "Patient Beta"),
      ]);

      const statuses = [res1.status, res2.status].sort(); // [201, 409] in either order

      expect(statuses).toEqual([201, 409]);

      // The 409 body must contain the conflict message — not a generic 500
      const loser = res1.status === 409 ? res1 : res2;
      const body = await loser.json();
      expect(body.error).toContain("slot was just booked by someone else");
    }
  );

  it(
    "two concurrent requests for DIFFERENT slots on the same doctor: both succeed (201)",
    async () => {
      // This proves the constraint is scoped to (doctor_id, slot) — it does
      // not accidentally block all concurrent writes to the same doctor.
      const [res1, res2] = await Promise.all([
        postBooking(SLOT_B, "Patient Gamma"),
        postBooking(SLOT_C, "Patient Delta"),
      ]);

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
    }
  );
});
