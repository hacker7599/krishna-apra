import Link from "next/link";
import { SEASON_START, TRIAL_FEE_INR } from "@/lib/league";
import { SITE_CONTAINER } from "@/lib/site-ui";

export function SiteAnnouncementBar() {
  return (
    <div className="border-b border-orange-200/80 bg-gradient-to-r from-orange-50 via-white to-orange-50 print:hidden">
      <div className={`${SITE_CONTAINER} flex flex-col gap-2 py-2.5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left`}>
        <p className="text-xs font-semibold text-slate-800 sm:text-sm">
          <span className="font-bold uppercase tracking-wide text-orange-700">Season 1</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            ·
          </span>
          Trials from <span className="font-bold text-slate-900">{SEASON_START}</span>
          <span className="hidden sm:inline">
            <span className="mx-2 text-slate-300">·</span>
            Registration ₹{TRIAL_FEE_INR.toLocaleString("en-IN")}
          </span>
        </p>
        <Link
          href="/register"
          className="inline-flex min-h-9 items-center justify-center self-center rounded-md bg-orange-600 px-4 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-700 sm:self-auto"
        >
          Book trial slot
        </Link>
      </div>
    </div>
  );
}
