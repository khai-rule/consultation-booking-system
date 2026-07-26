import { listDoctors } from "@/lib/data/doctors";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DoctorListPage() {
  let doctors;
  try {
    doctors = await listDoctors();
  } catch {
    return <p className="text-error">Couldn&apos;t load doctors.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-heading">Book a consultation</h1>
      <p className="mb-6 text-muted-foreground">Choose a doctor to see available slots.</p>

      <div className="space-y-3">
        {(doctors ?? []).map((doctor) => (
          <Link
            key={doctor.id}
            href={`/doctors/${doctor.slug}`}
            className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hover hover:bg-background"
          >
            <div className="font-medium">{doctor.name}</div>
            <div className="text-muted-foreground">{doctor.specialty}</div>
          </Link>
        ))}
        {(doctors ?? []).length === 0 && (
          <p className="text-muted-foreground">
            No doctors yet &mdash; run <code>supabase/seed.sql</code> against your project.
          </p>
        )}
      </div>

      <Link href="/admin" className="mt-8 inline-block text-muted-foreground hover:text-foreground">
        Admin &rarr;
      </Link>
    </div>
  );
}

