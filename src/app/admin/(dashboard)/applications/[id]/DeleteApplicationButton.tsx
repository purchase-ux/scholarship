"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { deleteApplicationAction } from "../../actions";

const UNDO_WINDOW_MS = 5000;

export function DeleteApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startDelete() {
    setError(null);
    setPendingDelete(true);
    // The actual delete only runs once this timer fires — clicking Undo
    // before then just cancels it, so nothing has touched the server yet.
    timerRef.current = setTimeout(async () => {
      setDeleting(true);
      const result = await deleteApplicationAction(applicationId);
      if (result.error) {
        setError(result.error);
        setPendingDelete(false);
        setDeleting(false);
        return;
      }
      router.push("/admin");
    }, UNDO_WINDOW_MS);
  }

  function undoDelete() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPendingDelete(false);
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {error && <p className="mb-2 text-xs font-medium text-red-600">{error}</p>}

      <AnimatePresence mode="wait" initial={false}>
        {!pendingDelete ? (
          <motion.button
            key="delete-button"
            type="button"
            onClick={startDelete}
            className="w-full rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
          >
            Delete Application
          </motion.button>
        ) : (
          <motion.div
            key="undo-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-xl border border-red-200 bg-red-50"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-sm text-red-700">
                {deleting ? "Deleting…" : "Application deleted."}
              </span>
              {!deleting && (
                <button
                  type="button"
                  onClick={undoDelete}
                  className="text-sm font-semibold text-red-700 underline hover:text-red-900"
                >
                  Undo
                </button>
              )}
            </div>
            {!deleting && (
              <motion.div
                className="h-1 bg-red-300"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: UNDO_WINDOW_MS / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
