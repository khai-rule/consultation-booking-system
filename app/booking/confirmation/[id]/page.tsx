import { StatusBadge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const { data: booking, error } = await supabaseServer
    .from("bookings")
    .select("*, doctors(name, specialty)")
    .eq("id", params.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const slotDate = new Date(booking.slot);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
      <div className="mb-3 text-3xl">✓</div>
      <h1 className="mb-1 text-xl font-semibold">Booking confirmed</h1>
      <p className="mb-4 text-sm text-slate-500">
        {booking.doctors?.name} · {booking.doctors?.specialty}
      </p>

      <div className="mb-4 rounded-md bg-slate-50 p-4 text-sm">
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

      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
        ← Book another
      </Link>
    </div>
  );
}
