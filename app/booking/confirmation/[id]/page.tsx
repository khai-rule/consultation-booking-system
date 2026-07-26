import { StatusBadge } from "@/components/ui/badge";
import { getBooking } from "@/lib/data/bookings";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);

  if (!booking) {
    notFound();
  }

  const slotDate = new Date(booking.slot);

  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-center">
      <div className="mb-3 text-3xl">&#10003;</div>
      <h1 className="mb-1 text-heading">Booking confirmed</h1>
      <p className="mb-4 text-muted-foreground">
        {booking.doctors?.name} &middot; {booking.doctors?.specialty}
      </p>

      <div className="mb-4 rounded-md bg-background p-4">
        <p>
          {slotDate.toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <p className="font-medium">
          {slotDate.toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>

      <div className="mb-6">
        <StatusBadge status={booking.status} />
      </div>

      <Link href="/" className="text-muted-foreground hover:text-foreground">
        &larr; Book another
      </Link>
    </div>
  );
}

