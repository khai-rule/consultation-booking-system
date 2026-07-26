"use client";

import { StatusBadge } from "@/components/ui/badge";
import { BookingStatus, BookingWithDoctor, VALID_TRANSITIONS } from "@/lib/types";
import { useState } from "react";

export function AdminBookingsClient({ initialBookings }: { initialBookings: BookingWithDoctor[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    setErrorId(null);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const { booking } = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: booking.status } : b)));
    } else {
      setErrorId(id);
    }
    setUpdatingId(null);
  }

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const nextOptions = VALID_TRANSITIONS[booking.status];
        return (
          <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
            <div>
              <div className="font-medium">{booking.patient_name}</div>
              <div className="text-label text-muted-foreground">
                {booking.doctors?.name} &middot; {new Date(booking.slot).toLocaleString("en-SG")}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
              {errorId === booking.id && (
                <span className="text-label text-error">Update failed</span>
              )}
              {nextOptions.length > 0 && (
                <select
                  disabled={updatingId === booking.id}
                  value=""
                  onChange={(e) => updateStatus(booking.id, e.target.value as BookingStatus)}
                  className="rounded-md border border-border px-2 py-1 text-body disabled:opacity-50"
                >
                  <option value="" disabled>
                    {updatingId === booking.id ? "Updating..." : "Change status"}
                  </option>
                  {nextOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
