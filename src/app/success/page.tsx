"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Reveal, AnimatedCheck } from "@/components/motion";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/40 via-[var(--background)] to-[var(--background)]">
      <PublicHeader variant="minimal" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-elevated)] sm:p-12">
          <Reveal direction="none" duration={0.5}>
            <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center">
              <AnimatedCheck size={72} />
            </div>
          </Reveal>

          <Reveal delay={0.35}>
            <h1 className="mt-6 font-display text-2xl font-bold text-brand-950 sm:text-3xl">
              Application Submitted
            </h1>
          </Reveal>

          <Reveal delay={0.5}>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              Thank you for applying. The Trust will review your application
              and get back to you within seven days. The final decision rests
              with the Trust.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <motion.div
              className="mt-8 inline-block"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/"
                className="inline-block rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-elevated)] transition hover:bg-brand-800"
              >
                Back to home
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
