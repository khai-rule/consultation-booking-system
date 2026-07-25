import { supabaseServer } from "@/lib/supabase/server";
import { Doctor } from "@/lib/types";

/** Returns all doctors ordered by name. Throws on DB error. */
export async function listDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabaseServer
    .from("doctors")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Looks up a single doctor by their URL slug.
 * Returns null if not found or on DB error — callers should treat null as 404.
 */
export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const { data, error } = await supabaseServer
    .from("doctors")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}
