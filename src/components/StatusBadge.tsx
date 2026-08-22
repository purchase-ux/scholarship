import type { ApplicationStatus } from "@/lib/types";

const STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const DOT_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-500",
  under_review: "bg-blue-500",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
};

const LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

const ANIMATED: Record<ApplicationStatus, boolean> = {
  pending: true,
  under_review: true,
  approved: false,
  rejected: false,
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {ANIMATED[status] && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${DOT_STYLES[status]}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      </span>
      {LABELS[status]}
    </span>
  );
}
