"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SlotOption } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Phase = "loading" | "idle" | "booking" | "booked";

export function DoctorBookingClient({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // True after a 409: the currently-selected slot is known to be taken.
  // Keeps the slot visually selected (so the user sees which one failed)
  // but disables the book button. Cleared when the user picks a different slot.
  const [slotConflict, setSlotConflict] = useState(false);

  async function loadSlots() {
    const res = await fetch(`/api/doctors/${doctorId}/slots`);
    const json = await res.json();
    setSlots(json.slots ?? []);
    setPhase("idle");
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  async function handleBook() {
    if (!selected || !patientName.trim()) return;

    setPhase("booking");
    setErrorMessage(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        patientName: patientName.trim(),
        slot: selected,
      }),
    });

    if (res.status === 409) {
      // Someone else took the slot between page load and click. Re-fetch so
      // the slot grid reflects reality (the slot will go grey). Keep `selected`
      // so the user can see which slot the error refers to, but flag it as
      // conflicted so the book button is disabled until they pick another slot.
      const json = await res.json();
      setErrorMessage(json.error);
      setSlotConflict(true);
      setPhase("idle");
      loadSlots();
      return;
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErrorMessage(json.error ?? "Something went wrong. Please try again.");
      setPhase("idle");
      return;
    }

    const { booking } = await res.json();
    setPhase("booked");
    router.push(`/booking/confirmation/${booking.id}`);
  }

  if (phase === "loading") {
    return (
      <div className='grid grid-cols-3 gap-2'>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className='h-10 animate-pulse rounded-md bg-surface-sunken'
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className='mb-2 font-medium text-foreground'>Available slots</p>
      <div className='grid grid-cols-3 gap-2'>
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => {
              setSelected(slot.time);
              // Clear any conflict error from a previous attempt when the
              // user deliberately picks a different slot.
              setErrorMessage(null);
              setSlotConflict(false);
            }}
            className={cn(
              "rounded-md border px-3 py-2 text-body transition-colors",
              !slot.available &&
                "cursor-not-allowed border-border-disabled bg-background text-disabled-foreground",
              slot.available &&
                selected !== slot.time &&
                "border-border bg-surface hover:border-border-hover",
              slot.available &&
                selected === slot.time &&
                "border-primary bg-primary text-primary-fg",
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Error shown outside {selected} so a 409 is visible immediately,
          even before the user re-selects a slot. */}
      {errorMessage && (
        <p className="mt-4 text-body text-error">{errorMessage}</p>
      )}

      {selected && (
        <div className='mt-4 space-y-3 rounded-lg border border-border bg-surface p-4'>
          <label className='block'>
            <span className='mb-1 block font-medium text-foreground'>
              Your name
            </span>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder='Enter your full name'
              className='w-full rounded-md border border-border bg-surface px-3 py-2 text-body outline-none transition-colors focus:border-primary'
            />
          </label>

          <Button
            onClick={handleBook}
            disabled={!patientName.trim() || phase === "booking" || slotConflict}
            className='w-full'
          >
            {phase === "booking" ? "Booking..." : "Book this slot"}
          </Button>
        </div>
      )}
    </div>
  );
}
