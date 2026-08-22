"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type LoginState = { error?: string };

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const normalizedEmail = email.toLowerCase();
  const admin = createAdminClient();
  const now = new Date();

  // Rate-limit failed attempts per email: this login gates real Aadhaar
  // numbers, family income, and contact details, so a weak/short admin
  // password (a real, accepted tradeoff for this Trust) must not also be
  // freely brute-forceable.
  const { data: attempt } = await admin
    .from("login_attempts")
    .select("attempt_count, first_attempt_at, locked_until")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (attempt?.locked_until && new Date(attempt.locked_until) > now) {
    const minutesLeft = Math.ceil(
      (new Date(attempt.locked_until).getTime() - now.getTime()) / 60000
    );
    return {
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const windowExpired =
      !attempt ||
      new Date(attempt.first_attempt_at).getTime() + WINDOW_MINUTES * 60_000 < now.getTime();

    const newCount = windowExpired ? 1 : attempt.attempt_count + 1;
    const firstAttemptAt = windowExpired ? now.toISOString() : attempt.first_attempt_at;
    const lockedUntil =
      newCount >= MAX_ATTEMPTS
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60_000).toISOString()
        : null;

    await admin.from("login_attempts").upsert({
      email: normalizedEmail,
      attempt_count: newCount,
      first_attempt_at: firstAttemptAt,
      locked_until: lockedUntil,
    });

    return { error: "Invalid email or password." };
  }

  await admin.from("login_attempts").delete().eq("email", normalizedEmail);
  redirect("/admin");
}
