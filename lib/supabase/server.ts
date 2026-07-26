import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Never import this file
// from a client component — it must only ever run in route handlers.
//
// The `global.fetch` override passes `cache: 'no-store'` to every HTTP call
// supabase-js makes internally. Next.js 14 patches the global `fetch` and
// applies its own data cache to those calls — `force-dynamic` on a route
// prevents the *route response* from being cached, but without `no-store`
// here the individual Supabase reads can still be served from a stale
// Next.js fetch cache. This is why status changes reverted on refresh and
// booked slots continued to appear available after a booking was made.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: {
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  }
);
