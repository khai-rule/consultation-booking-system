import { createClient } from "@supabase/supabase-js";

// Public, anon-key client — safe to use in client components.
// Reads only; all writes go through API routes so the concurrency-safe
// insert path (see app/api/bookings/route.ts) is the single write path.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
