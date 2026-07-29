import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const DOCTOR_ID = process.env.TEST_DOCTOR_ID ?? "";

if (!DOCTOR_ID) {
  console.error(
    "TEST_DOCTOR_ID is required. Example: TEST_DOCTOR_ID=<uuid> npm test",
  );
  process.exit(1);
}

function testSlot(offsetMinutes) {
  const d = new Date("2099-01-15T09:00:00.000Z");
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
}

async function postBooking(slot, name) {
  return fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId: DOCTOR_ID, patientName: name, slot }),
  });
}

async function cancelBookingsBySlot(slot) {
  const res = await fetch(`${BASE_URL}/api/bookings`);
  if (!res.ok) return;

  const { bookings } = await res.json();
  const matches = (bookings ?? []).filter((b) => b.slot === slot);

  await Promise.all(
    matches.map((b) =>
      fetch(`${BASE_URL}/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      }),
    ),
  );
}

async function run() {
  const SLOT_A = testSlot(0);
  const SLOT_B = testSlot(30);
  const SLOT_C = testSlot(60);

  try {
    const [same1, same2] = await Promise.all([
      postBooking(SLOT_A, "Patient Alpha"),
      postBooking(SLOT_A, "Patient Beta"),
    ]);

    const statuses = [same1.status, same2.status].sort((a, b) => a - b);
    assert.deepEqual(
      statuses,
      [201, 409],
      "Expected concurrent same-slot result [201, 409]",
    );

    const loser = same1.status === 409 ? same1 : same2;
    const loserBody = await loser.json();
    assert.match(
      loserBody.error ?? "",
      /slot was just booked by someone else/i,
      "Expected conflict message in 409 response",
    );

    const [diff1, diff2] = await Promise.all([
      postBooking(SLOT_B, "Patient Gamma"),
      postBooking(SLOT_C, "Patient Delta"),
    ]);

    assert.equal(
      diff1.status,
      201,
      "Expected first different-slot booking to succeed",
    );
    assert.equal(
      diff2.status,
      201,
      "Expected second different-slot booking to succeed",
    );

    console.log(
      "PASS: double-booking guard behaves correctly under concurrency",
    );
  } finally {
    await Promise.all([
      cancelBookingsBySlot(SLOT_A),
      cancelBookingsBySlot(SLOT_B),
      cancelBookingsBySlot(SLOT_C),
    ]);
  }
}

run().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
