import Link from "next/link";
import { SEASON_START } from "@/lib/league";
import {
  isRegistrationOpen,
  REGISTRATION_CLOSED_ANNOUNCEMENT,
} from "@/lib/registration-gate";
import { BTN_PRIMARY_SM, BTN_SECONDARY_SM, SITE_CONTAINER } from "@/lib/site-ui";

export function SiteAnnouncementBar() {
  const open = isRegistrationOpen();

  return (
    <div className="site-announce print:hidden">
      <div className={`${SITE_CONTAINER} site-announce__inner`}>
        <p className="site-announce__text">
          {open ? (
            <>
              <span className="font-extrabold uppercase tracking-wide text-orange-700">Season 1</span>
              <span className="mx-2 text-slate-300" aria-hidden>
                ·
              </span>
              Trials <span className="font-bold text-slate-900">{SEASON_START}</span>
            </>
          ) : (
            <>
              <span className="font-extrabold uppercase tracking-wide text-amber-800">Registration closed</span>
              <span className="mx-2 text-slate-300" aria-hidden>
                ·
              </span>
              <span className="font-semibold text-slate-800">{REGISTRATION_CLOSED_ANNOUNCEMENT}</span>
            </>
          )}
        </p>
        {open ? (
          <Link href="/register" className={`${BTN_PRIMARY_SM} shrink-0`}>
            Book trial slot
          </Link>
        ) : (
          <Link href="/register/status" className={`${BTN_SECONDARY_SM} shrink-0`}>
            Check status
          </Link>
        )}
      </div>
    </div>
  );
}
