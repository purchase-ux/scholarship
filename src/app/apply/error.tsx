"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

// Segment-level error boundary for /apply. Catches uncaught client
// exceptions anywhere in the application wizard (rendering, effects) that
// would otherwise fall through to Next's built-in crash screen — the exact
// failure mode reported in production when the requestSubmit() crash below
// this file had no boundary to land in. Kept deliberately simple and
// self-contained (no shared components) so this fallback can't itself throw.
export default function ApplyError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[apply] Uncaught client error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-elevated)] sm:p-10">
        <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
          We hit an unexpected error loading the application form. Please try
          again — if you had already selected any documents, you may need to
          choose them again.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="w-full rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-elevated)] transition hover:bg-brand-800 sm:w-auto"
          >
            Try again
          </button>
          <Link
            href="/apply"
            className="w-full rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 sm:w-auto"
          >
            Reload the form
          </Link>
        </div>
      </div>
    </div>
  );
}
