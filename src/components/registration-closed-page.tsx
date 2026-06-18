import Link from "next/link";
import { SupportContactLinks } from "@/components/support-contact-links";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import {
  REGISTRATION_CLOSED_HEADLINE,
  REGISTRATION_CLOSED_LEAD,
} from "@/lib/registration-gate";
import { SEASON_START } from "@/lib/league";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "@/lib/site-ui";

type Props = {
  breadcrumb?: { label: string; href?: string }[];
};

export function RegistrationClosedPage({ breadcrumb = [{ label: "Register" }] }: Props) {
  return (
    <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
      <SitePageHero
        variant="light"
        title={REGISTRATION_CLOSED_HEADLINE}
        lead={REGISTRATION_CLOSED_LEAD}
        breadcrumb={breadcrumb}
      />

      <div className={`${CARD} mt-8 space-y-6 p-6 sm:p-8`}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          Season 1 trial window: <span className="text-slate-900">{SEASON_START}</span>
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-700">
          Already registered? You can still check your application status. For questions about an existing registration,
          contact the league desk.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/register/status" className={BTN_PRIMARY}>
            Check registration status
          </Link>
          <Link href="/schedule" className={BTN_SECONDARY}>
            View trial schedule
          </Link>
          <Link href="/trials" className={BTN_SECONDARY}>
            Trial zones
          </Link>
          <Link href="/contact" className={BTN_SECONDARY}>
            Contact us
          </Link>
        </div>

        <p className="border-t border-slate-200 pt-5 text-sm font-medium text-slate-600">
          League desk: <SupportContactLinks linkClassName="font-semibold text-orange-700 hover:text-orange-800" />
        </p>
      </div>
    </SiteSection>
  );
}
