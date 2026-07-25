import { getDoctorBySlug } from "@/lib/data/doctors";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorBookingClient } from "./DoctorBookingClient";

export const dynamic = "force-dynamic";

export default async function DoctorPage({ params }: { params: { slug: string } }) {
  const doctor = await getDoctorBySlug(params.slug);

  if (!doctor) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-slate-400 hover:text-slate-600"
      >
        &larr; Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{doctor.name}</h1>
        <p className="text-sm text-slate-500">{doctor.specialty}</p>
      </div>

      {/* doctorId is the UUID — used by the booking API and slots route */}
      <DoctorBookingClient doctorId={doctor.id} />
    </div>
  );
}
