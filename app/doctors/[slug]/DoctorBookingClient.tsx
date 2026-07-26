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
      body: JSON.stringify({ doctorId, patientName: patientName.trim(), slot: selected }),
    });

    if (res.status === 409) {
      // Someone else took the slot between page load and click. Re-fetch so
      // the UI reflects reality instead of just showing a dead error toast.
      const json = await res.json();
      setErrorMessage(json.error);
      setSelected(null);
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
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-surface-sunken" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 font-medium text-foreground">Available slots</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => setSelected(slot.time)}
            className={cn(
              "rounded-md border px-3 py-2 text-body transition-colors",
              !slot.available &&
                "cursor-not-allowed border-border-disabled bg-background text-disabled-foreground",
              slot.available &&
                selected !== slot.time &&
                "border-border bg-surface hover:border-border-hover",
              slot.available &&
                selected === slot.time &&
                "border-primary bg-primary text-primary-fg"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 space-y-3 rounded-lg border border-border bg-surface p-4">
          <label className="block">
            <span className="mb-1 block font-medium text-foreground">Your name</span>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body outline-none transition-colors focus:border-primary"
            />
          </label>

          {errorMessage && <p className="text-body text-error">{errorMessage}</p>}

          <Button
            onClick={handleBook}
            disabled={!patientName.trim() || phase === "booking"}
            className="w-full"
          >
            {phase === "booking" ? "Booking..." : "Book this slot"}
          </Button>
        </div>
      )}
    </div>
  );
}

