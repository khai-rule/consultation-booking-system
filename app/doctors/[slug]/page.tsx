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
        className="mb-6 inline-block text-muted-foreground hover:text-foreground"
      >
        &larr; Back
      </Link>

      <div className="mb-6">
        <h1 className="text-heading">{doctor.name}</h1>
        <p className="text-muted-foreground">{doctor.specialty}</p>
      </div>

      {/* doctorId is the UUID — used by the booking API and slots route */}
      <DoctorBookingClient doctorId={doctor.id} />
    </div>
  );
}

