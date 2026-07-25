import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DoctorBookingClient } from "./DoctorBookingClient";

export const dynamic = "force-dynamic";

export default async function DoctorPage({ params }: { params: { id: string } }) {
  const { data: doctor, error } = await supabaseServer
    .from("doctors")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !doctor) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{doctor.name}</h1>
        <p className="text-sm text-slate-500">{doctor.specialty}</p>
      </div>
      <DoctorBookingClient doctorId={doctor.id} />
    </div>
  );
}
