import { listBookings } from "@/lib/data/bookings";
import Link from "next/link";
import { AdminBookingsClient } from "./AdminBookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let bookings;
  try {
    bookings = await listBookings();
  } catch {
    return <p className="text-error">Couldn&apos;t load bookings.</p>;
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-muted-foreground hover:text-foreground"
      >
        &larr; Back
      </Link>

      <h1 className="mb-6 text-heading">Bookings</h1>
      <AdminBookingsClient initialBookings={bookings} />
    </div>
  );
}


