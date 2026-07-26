# Consultation Booking System

A simplified booking flow: patients pick a doctor, book an available slot, and get a
confirmation. Staff manage bookings from an admin view.

## Stack

Next.js 14 (App Router) + TypeScript + Supabase (Postgres) + Tailwind.

One repo for UI, API, and data layer — no separate backend to stand up. Postgres over
a NoSQL store was deliberate: the double-booking guard needs a database-level unique
constraint, which doesn't work in a document store.

## Setup

1. Create a Supabase project, run `supabase/schema.sql` then `supabase/seed.sql`
2. Copy `.env.example` → `.env.local`, fill in your Supabase URL + anon key + service role key
3. `npm install && npm run dev` → http://localhost:3000

**Tests:**
```bash
npm run dev              # in one terminal
```

## The three things the brief asks about

**Double-booking.** The database prevents it, not the application. `bookings` has a
partial unique index on `(doctor_id, slot) WHERE status <> 'cancelled'` — the insert
itself is the atomic claim on a slot, so two concurrent requests can't both succeed.
The loser gets a Postgres `23505` error, which the API turns into a `409`. Partial
(not a plain unique constraint) so a cancelled booking frees the slot back up.


**Booking states.** `pending → confirmed → completed`, or `→ cancelled` from either
`pending` or `confirmed`. Defined once in `lib/types.ts`, enforced server-side in the
PATCH route (the actual guard), and mirrored in the admin UI so it only offers valid
next states.

**Staying correct as it grows.** Three things do the work here: a data-access layer
(`lib/data/`) so no query is written inline in a route handler; the state machine and
slot logic living in `lib/` instead of scattered across routes; and one consistent
error shape across every API response. None of this is exotic — it's just the
difference between a second developer finding things and re-deriving them.

## What's out of scope, on purpose

Auth, payments, notifications, calendar sync, doctor-availability management, rate
limiting. None of these change the concurrency or state-machine story the brief is
actually testing, and the brief itself rewards a smaller well-reasoned scope over a
larger rushed one.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/:id/slots` | Available slots, taken ones marked unavailable |
| POST | `/api/bookings` | Create a booking; `409` on conflict |
| GET | `/api/bookings` | List bookings (admin) |
| PATCH | `/api/bookings/:id` | Change status; rejects invalid transitions |

## Known limitations

- Admin page has no access control
- `patientName` is free text — no identity verification
- Slug collisions between same-named doctors aren't auto-resolved (DB rejects the
  duplicate; would need manual disambiguation)
- Slot-generation is computed per request, not cached — fine at this scale, first
  thing to revisit if traffic grew

## AI use

Built with Claude via Antigravity — scaffolding, boilerplate, and styling iteration.
I drove the architectural calls myself: the partial-index approach to concurrency,
the state machine, and the data-access layer, including working through the
trade-off between a unique index and `SELECT ... FOR UPDATE`.