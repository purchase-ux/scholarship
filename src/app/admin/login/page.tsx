"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { TextField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-gold-50/40 to-white px-6">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 animate-float rounded-full bg-brand-200/30 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-24 h-96 w-96 animate-float rounded-full bg-gold-200/25 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-[var(--shadow-elevated-lg)]"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <Logo size={48} />
          </motion.div>
          <h1 className="mt-4 font-display text-xl font-semibold text-brand-950">
            Trust Admin Login
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to review scholarship applications.
          </p>
        </div>

        <form action={formAction} className="mt-7 flex flex-col gap-4">
          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
            >
              {state.error}
            </motion.div>
          )}
          <TextField label="Email" name="email" type="email" required />
          <TextField label="Password" name="password" type="password" required />
          <SubmitButton label="Sign In" />
        </form>
      </motion.div>
    </div>
  );
}
