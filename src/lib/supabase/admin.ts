import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this into client components — it bypasses
// Row Level Security entirely. Only used from server actions / route handlers
// for the public application submission flow.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
