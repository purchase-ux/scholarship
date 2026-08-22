"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Reveal, StaggerContainer, StaggerItem, CountUp } from "@/components/motion";

const MotionLink = motion.create(Link);

const eligibility = [
  "Only candidates with 95% or higher marks are eligible to apply.",
  "Open to students anywhere in India.",
  "Answers may be written in Hindi, English, or any language you prefer.",
  "You will be informed within seven days of submitting the form.",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <PublicHeader variant="default" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pb-28 sm:pt-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/70 via-[var(--background)] to-[var(--background)]"
          />
          <div
            aria-hidden="true"
            className="animate-float pointer-events-none absolute -right-20 -top-16 -z-10 h-72 w-72 rounded-full bg-gold-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="animate-float pointer-events-none absolute -left-28 top-1/4 -z-10 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl"
            style={{ animationDelay: "-3s" }}
          />

          <div className="mx-auto max-w-3xl text-center">
            <Reveal direction="down">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/60 bg-gold-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-800 sm:text-xs">
                Shrimati Ramadevi Omprakash Kejriwal Family Private Trust
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl md:text-6xl">
                Scholarship for Students&apos; Higher Education
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
                Shrimati Ramadevi Omprakash Kejriwal Family Private Trust supports
                high-achieving students across India in pursuing higher education.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MotionLink
                  href="/apply"
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(15,99,85,0.55)] transition-colors duration-200 hover:bg-brand-800 sm:w-auto"
                >
                  Apply Now
                  <span aria-hidden="true">→</span>
                </MotionLink>
              </div>
            </Reveal>
          </div>

          {/* Stat callouts */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:gap-6">
            <Reveal delay={0.4}>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-center shadow-[var(--shadow-elevated)] backdrop-blur-sm sm:p-6">
                <CountUp
                  to={95}
                  suffix="%"
                  className="font-display text-3xl font-bold text-brand-700 sm:text-4xl"
                />
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  Marks required to apply
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-center shadow-[var(--shadow-elevated)] backdrop-blur-sm sm:p-6">
                <CountUp
                  to={7}
                  suffix=" days"
                  className="font-display text-3xl font-bold text-brand-700 sm:text-4xl"
                />
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                  Average response time
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Eligibility */}
        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-brand-950 sm:text-3xl">
                Eligibility &amp; How It Works
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A few simple facts before you begin your application.
              </p>
            </Reveal>

            <StaggerContainer className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)] sm:p-8">
              {eligibility.map((item) => (
                <StaggerItem key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    ✓
                  </span>
                  <span className="text-sm text-slate-700 sm:text-base">{item}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal delay={0.1}>
              <p className="mt-5 text-xs text-slate-400">
                The final decision on all applications rests with the Trust.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 pb-24">
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl border border-brand-900/10 bg-brand-900 p-8 text-center shadow-[var(--shadow-elevated-lg)] sm:p-10">
              <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                Questions about your application?
              </h2>
              <p className="mt-3 text-sm text-brand-200 sm:text-base">
                Naveen Kejriwal · +91 94133 67369
              </p>
              <p className="mt-1 text-sm text-brand-300">
                Jhunjhunu, Rajasthan 333001
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
