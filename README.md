# Consultation Booking System

Patients can view doctor slots and make bookings. Staff can manage booking status from an admin page.

## Tech stack and why

- Next.js 14 + TypeScript: fast full-stack delivery in one codebase
- Supabase Postgres: relational constraints for correctness under concurrency
- Tailwind: quick, consistent UI styling

Main trade-off: this keeps architecture simple and easy to reason about, but skips advanced production concerns like auth and rate limiting.

## Local setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` then `supabase/seed.sql` in Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill values.
4. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Required variables are defined in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Implemented features

### 1) Slot booking with double-booking protection

Assumption: bookings are the source of truth for slot occupancy.

What is implemented:

- Partial unique index on `(doctor_id, slot)` where status is not `cancelled`
- API maps Postgres unique-violation to `409 Conflict`

Known limitation:

- Slot generation is simplified (generated time windows, not doctor-defined calendar availability).

### 2) Booking states and transitions

Assumption: valid statuses are `pending`, `confirmed`, `completed`, `cancelled`.

What is implemented:

- Server-side transition guard:
  - `pending -> confirmed|cancelled`
  - `confirmed -> completed|cancelled`
  - `completed` and `cancelled` are terminal

Known limitation:

- No audit trail of who changed status and when.

### 3) Structure for scalability/correctness

Assumption: assessment scope prioritizes correctness and maintainability over feature breadth.

What is implemented:

- Separate data-access layer in `lib/data`
- Shared domain types/state machine in `lib/types.ts`
- Dedicated API routes for reads/writes

Known limitation:

- No auth, multi-tenant separation, or background job system.

## API overview

| Method | Route                    | Purpose                                          |
| ------ | ------------------------ | ------------------------------------------------ |
| GET    | `/api/doctors`           | List doctors                                     |
| GET    | `/api/doctors/:id/slots` | List slot availability                           |
| POST   | `/api/bookings`          | Create booking (`409` on conflict)               |
| GET    | `/api/bookings`          | List bookings (admin)                            |
| PATCH  | `/api/bookings/:id`      | Update booking status with transition validation |

## Tests

This repo includes a concurrency test for booking correctness.

Prerequisites:

1. App running (`npm run dev`)
2. `TEST_DOCTOR_ID` set to an existing doctor UUID
3. Optional: `TEST_BASE_URL` (defaults to `http://localhost:3000`)

Run:

```bash
TEST_DOCTOR_ID=<doctor-uuid> npm test
```

## Out of scope

- Authentication/authorization
- Payments/notifications/calendar sync
- Rate limiting and observability pipeline

## Submission checklist

- Public Git repository link
- This README with setup, API overview, assumptions, and limitations
- Private sharing of working `.env.local` values in submission email
