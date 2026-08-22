import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUS_FILTERS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Shared grid template so the header row and each data row line up exactly.
const ROW_GRID = "sm:grid-cols-[0.6fr_2fr_1fr_0.9fr_0.9fr_1.1fr_1.1fr]";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "id, application_number, full_name, email, mobile_number, state, class10_percentage, class12_percentage, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    const trimmed = q.trim();
    // A query like "42" or "#42" means "find application number 42" —
    // search that exactly rather than treating it as a name/email fragment.
    const numberMatch = trimmed.match(/^#?(\d+)$/);
    if (numberMatch) {
      query = query.eq("application_number", Number(numberMatch[1]));
    } else {
      // Strip characters with special meaning in PostgREST filter syntax.
      const safeQ = trimmed.replace(/[,%()]/g, " ").trim();
      if (safeQ) {
        query = query.or(`full_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
      }
    }
  }

  const { data, error } = await query;
  const applications = (data ?? []) as Pick<
    Application,
    | "id"
    | "application_number"
    | "full_name"
    | "email"
    | "mobile_number"
    | "state"
    | "class10_percentage"
    | "class12_percentage"
    | "status"
    | "created_at"
  >[];

  return (
    <div className="flex flex-col gap-6">
      <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-2xl font-bold text-brand-950">Applications</h1>
        <form className="flex gap-2" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, email, or #number"
            className="w-64 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 hover:border-slate-400"
          />
          <button
            type="submit"
            className="rounded-full border border-brand-900/10 bg-white px-4 py-2.5 text-sm font-medium text-brand-800 shadow-sm transition-colors duration-200 hover:border-brand-900/20 hover:bg-brand-50"
          >
            Search
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.05} className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const params = new URLSearchParams();
          if (f.value !== "all") params.set("status", f.value);
          if (q) params.set("q", q);
          const href = `/admin${params.toString() ? `?${params.toString()}` : ""}`;
          const active = (status ?? "all") === f.value;
          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-brand-700 text-white shadow-[0_4px_12px_-4px_rgba(15,99,85,0.5)]"
                  : "border border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </Reveal>

      {error && (
        <Reveal className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load applications: {error.message}
        </Reveal>
      )}

      <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-[var(--shadow-elevated)]">
        {!error && (
          <div
            className={`hidden gap-4 border-b border-brand-900/10 bg-brand-50/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-brand-700 sm:grid ${ROW_GRID}`}
          >
            <span>Ref #</span>
            <span>Applicant</span>
            <span>State</span>
            <span>10th %</span>
            <span>12th %</span>
            <span>Status</span>
            <span>Submitted</span>
          </div>
        )}

        {!error && applications.length > 0 && (
          <StaggerContainer className="divide-y divide-brand-900/5">
            {applications.map((app) => (
              <StaggerItem key={app.id}>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className={`group flex flex-col gap-2 px-5 py-4 transition-colors duration-200 hover:bg-brand-50/60 sm:grid sm:items-center sm:gap-4 ${ROW_GRID}`}
                >
                  <div className="text-sm font-semibold text-slate-500">
                    <span className="text-slate-400 sm:hidden">Ref: </span>#{app.application_number}
                  </div>
                  <div>
                    <div className="font-medium text-brand-800 transition-colors group-hover:text-brand-900">
                      {app.full_name}
                    </div>
                    <div className="text-xs text-slate-500">{app.email}</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400 sm:hidden">State: </span>
                    {app.state}
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400 sm:hidden">10th: </span>
                    {app.class10_percentage}%
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400 sm:hidden">12th: </span>
                    {app.class12_percentage}%
                  </div>
                  <div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(app.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {!error && applications.length === 0 && (
          <Reveal className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-400">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7.5 12 3l9 4.5" />
                <path d="M3 7.5v9L12 21l9-4.5v-9" />
                <path d="M3 7.5 12 12l9-4.5" />
                <path d="M12 12v9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">No applications found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search or filter criteria.
            </p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
