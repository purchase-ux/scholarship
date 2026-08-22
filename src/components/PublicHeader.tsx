"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "./Logo";

export function PublicHeader({ variant = "default" }: { variant?: "default" | "minimal" }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-40 border-b border-brand-900/[0.06] bg-[var(--background)]/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <Logo size={38} />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[13px] font-bold tracking-wide text-brand-900 sm:text-sm">
              RAMADEVI OMPRAKASH KEJRIWAL
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-700 sm:text-[11px]">
              Family Private Trust
            </span>
          </span>
        </Link>

        {variant === "default" && (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/apply"
              className="rounded-full px-4 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Apply
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-brand-900/10 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-brand-900/20 hover:text-brand-800"
            >
              Trust Admin
            </Link>
          </nav>
        )}
      </div>
    </motion.header>
  );
}
