import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { signOut } from "./actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-brand-900/[0.06] bg-[var(--background)]/85 shadow-[0_1px_2px_rgba(10,40,35,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/admin" className="group flex items-center gap-3">
            <Logo size={34} />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[13px] font-bold tracking-wide text-brand-900 sm:text-sm">
                Trust Admin
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-700 sm:text-[11px]">
                Scholarship Applications
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <PushNotificationToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-brand-900/10 px-4 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:border-brand-900/20 hover:bg-brand-50 hover:text-brand-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 animate-fade-in">{children}</main>
    </div>
  );
}
