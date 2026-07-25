-- Rapidr Consultation Booking System — schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  -- slug is used only for human-readable URLs (/doctors/<slug>).
  -- The UUID id remains the internal primary key in all API calls and
  -- foreign-key references. Uniqueness is enforced at the DB level;
  -- see Known Limitations in the README for the name-collision edge case.
  slug text unique not null
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  patient_name text not null,
  slot timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- The concurrency guarantee: two requests racing to book the same doctor+slot
-- cannot both succeed. This is a PARTIAL unique index (excludes cancelled rows)
-- rather than a plain unique constraint, so a cancelled booking frees the slot
-- back up for someone else — a plain unique constraint would permanently burn
-- the slot the moment one booking existed, even after cancellation.
create unique index if not exists doctors_slot_active_unique
  on bookings (doctor_id, slot)
  where status <> 'cancelled';

create index if not exists bookings_doctor_id_idx on bookings (doctor_id);
