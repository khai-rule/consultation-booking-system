import { listDoctors } from "@/lib/data/doctors";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DoctorListPage() {
  let doctors;
  try {
    doctors = await listDoctors();
  } catch {
    return <p className="text-red-600">Couldn&apos;t load doctors.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Book a consultation</h1>
      <p className="mb-6 text-sm text-slate-500">Choose a doctor to see available slots.</p>

      <div className="space-y-3">
        {(doctors ?? []).map((doctor) => (
          <Link
            key={doctor.id}
            href={`/doctors/${doctor.slug}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="font-medium">{doctor.name}</div>
            <div className="text-sm text-slate-500">{doctor.specialty}</div>
          </Link>
        ))}
        {(doctors ?? []).length === 0 && (
          <p className="text-sm text-slate-500">
            No doctors yet — run <code>supabase/seed.sql</code> against your project.
          </p>
        )}
      </div>

      <Link href="/admin" className="mt-8 inline-block text-sm text-slate-400 hover:text-slate-600">
        Admin →
      </Link>
    </div>
  );
}
