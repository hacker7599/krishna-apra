import Link from "next/link";
import { SEASON_START, TRIAL_FEE_INR } from "@/lib/league";
import { BTN_PRIMARY_SM, SITE_CONTAINER } from "@/lib/site-ui";

export function SiteAnnouncementBar() {
  return (
    <div className="site-announce print:hidden">
      <div className={`${SITE_CONTAINER} site-announce__inner`}>
        <p className="site-announce__text">
          <span className="font-extrabold uppercase tracking-wide text-orange-700">Season 1</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            ·
          </span>
          Trials <span className="font-bold text-slate-900">{SEASON_START}</span>
          <span className="hidden sm:inline">
            <span className="mx-2 text-slate-300">·</span>
            Registration <span className="font-bold text-slate-900">₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</span>
          </span>
        </p>
        <Link href="/register" className={`${BTN_PRIMARY_SM} shrink-0`}>
          Book trial slot
        </Link>
      </div>
    </div>
  );
}
