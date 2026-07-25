import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { AdminBookingsClient } from "./AdminBookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: bookings, error } = await supabaseServer
    .from("bookings")
    .select("*, doctors(name, specialty)")
    .order("slot", { ascending: true });

  if (error) {
    return <p className="text-red-600">Couldn't load bookings: {error.message}</p>;
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-slate-400 hover:text-slate-600"
      >
        &larr; Back
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Bookings</h1>
      <AdminBookingsClient initialBookings={bookings ?? []} />
    </div>
  );
}
