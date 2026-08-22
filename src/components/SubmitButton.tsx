"use client";

import { useFormStatus } from "react-dom";
import { motion } from "motion/react";

export function SubmitButton({
  label = "Submit Application",
  busyLabel = "Submitting…",
  fullWidthOnMobile = true,
  busy = false,
  onClick,
}: {
  label?: string;
  busyLabel?: string;
  fullWidthOnMobile?: boolean;
  // Set while the caller is doing async work (e.g. uploading documents)
  // before the form's action has actually been dispatched — useFormStatus's
  // `pending` alone doesn't cover that window.
  busy?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const { pending: actionPending } = useFormStatus();
  const pending = actionPending || busy;

  return (
    <motion.button
      type="submit"
      disabled={pending}
      onClick={onClick}
      whileHover={pending ? undefined : { scale: 1.015, y: -1 }}
      whileTap={pending ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(15,99,85,0.55)] transition-colors duration-200 hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 ${
        fullWidthOnMobile ? "w-full sm:w-auto" : ""
      }`}
    >
      {pending && (
        <motion.span
          className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      )}
      {pending ? (busy ? busyLabel : "Submitting…") : label}
    </motion.button>
  );
}
