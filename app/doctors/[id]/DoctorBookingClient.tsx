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
          <div key={i} className="h-10 animate-pulse rounded-md bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Available slots</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => setSelected(slot.time)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition-colors",
              !slot.available && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              slot.available && selected !== slot.time && "border-slate-200 bg-white hover:border-slate-400",
              slot.available && selected === slot.time && "border-slate-900 bg-slate-900 text-white"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Your name</span>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

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
