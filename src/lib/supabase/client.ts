import { createBrowserClient } from "@supabase/ssr";

// Storage uploads run entirely client-side and, unlike a normal server
// round-trip, have no framework-level timeout — a stalled connection would
// otherwise hang the "Uploading documents…" state indefinitely with no way
// out but a hard refresh. Bound every request this client makes. A plain
// AbortController (rather than the newer AbortSignal.timeout()) keeps this
// working on older WebKit, since this client is also relied on from browsers
// too old for requestSubmit().
const UPLOAD_TIMEOUT_MS = 60_000;

function timeoutFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  if (init.signal) return fetch(input, init); // caller already controls cancellation
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Browser client, used only to PUT file bytes straight to Supabase Storage
// via a short-lived signed upload URL (see src/app/apply/actions.ts). The
// anon key alone can't read or write the private `documents` bucket — the
// signed token is what authorizes each individual upload.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: timeoutFetch } }
  );
}
