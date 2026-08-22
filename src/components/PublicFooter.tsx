import { Logo } from "./Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-950 text-brand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Logo size={40} />
          <div>
            <p className="font-display text-sm font-bold tracking-wide text-white">
              Shrimati Ramadevi Omprakash Kejriwal
              <br />
              Family Private Trust
            </p>
            <p className="mt-1 text-xs text-brand-300">
              Jhunjhunu, Rajasthan 333001, India
            </p>
          </div>
        </div>

        <div className="text-sm text-brand-200">
          <p className="font-semibold text-white/90">Contact</p>
          <p className="mt-2">Naveen Kejriwal</p>
          <p>+91 94133 67369</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-400">
        © {new Date().getFullYear()} Shrimati Ramadevi Omprakash Kejriwal Family Private Trust. All decisions rest solely with the Trust.
      </div>
    </footer>
  );
}
