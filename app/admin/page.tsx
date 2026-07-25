import { listBookings } from "@/lib/data/bookings";
import Link from "next/link";
import { AdminBookingsClient } from "./AdminBookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let bookings;
  try {
    bookings = await listBookings();
  } catch {
    return <p className="text-red-600">Couldn&apos;t load bookings.</p>;
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
      <AdminBookingsClient initialBookings={bookings} />
    </div>
  );
}

