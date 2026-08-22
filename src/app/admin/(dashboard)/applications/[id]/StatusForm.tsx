"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SubmitButton } from "@/components/SubmitButton";
import { updateStatusAction, type UpdateStatusState } from "../../actions";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const initialState: UpdateStatusState = {};

const fieldClasses =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 hover:border-slate-400";

export function StatusForm({
  applicationId,
  currentStatus,
  currentNotes,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentNotes: string | null;
}) {
  const [state, formAction] = useActionState(updateStatusAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="application_id" value={applicationId} />

      <AnimatePresence initial={false} mode="wait">
        {state.error && (
          <motion.div
            key="status-form-error"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </motion.div>
        )}
        {state.success && (
          <motion.div
            key="status-form-success"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            Application updated.
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="status" className="text-sm font-medium text-slate-800">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className={fieldClasses}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="admin_notes" className="text-sm font-medium text-slate-800">
          Admin notes (internal)
        </label>
        <textarea
          id="admin_notes"
          name="admin_notes"
          rows={4}
          defaultValue={currentNotes ?? ""}
          className={fieldClasses}
        />
      </div>

      <SubmitButton label="Save" />
    </form>
  );
}
