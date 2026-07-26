import { apiError } from "@/lib/api";
import { listDoctors } from "@/lib/data/doctors";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doctors = await listDoctors();
    return NextResponse.json({ doctors });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Server error", 500);
  }
}

