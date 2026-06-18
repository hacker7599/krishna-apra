import type { Metadata } from "next";
import { RegistrationClosedPage } from "@/components/registration-closed-page";
import { RegistrationCompletionForm } from "@/components/registration-completion-form";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { getRegistrationTrialZonePickerOptions } from "@/lib/public-queries";
import { SupportContactLinks } from "@/components/support-contact-links";
import { LEAGUE_NAME } from "@/lib/league";
import { isRegistrationOpen } from "@/lib/registration-gate";
import { CARD } from "@/lib/site-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Complete registration · ${LEAGUE_NAME}`,
  description: "Finish your trial registration after payment.",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RegisterCompletePage({ searchParams }: Props) {
  if (!isRegistrationOpen()) {
    return <RegistrationClosedPage breadcrumb={[{ label: "Register", href: "/register" }, { label: "Complete" }]} />;
  }

  const { token } = await searchParams;
  const trialZones = await getRegistrationTrialZonePickerOptions();

  if (!token?.trim()) {
    return (
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
        <SitePageHero variant="light" title="Complete registration" lead="This link is missing or invalid." breadcrumb={[{ label: "Register", href: "/register" }, { label: "Complete" }]} />
        <div className={`${CARD} mt-8 space-y-3 p-6 text-sm font-semibold text-rose-800`}>
          <p>This link is missing or invalid. For new registrations, use the main form with QR payment.</p>
          <p>
            <a href="/register" className="font-bold text-orange-700 underline">
              Go to trial registration →
            </a>
          </p>
          <p className="font-medium text-slate-700">
            Need help? Contact <SupportContactLinks linkClassName="font-bold text-orange-700 underline" />.
          </p>
        </div>
      </SiteSection>
    );
  }

  return (
    <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
      <SitePageHero
        variant="light"
        title="Complete your registration"
        lead="Legacy payment-completion link. If you already registered with QR payment on the main form, you do not need this page. Otherwise fill in the details below — this secure link works once."
        breadcrumb={[{ label: "Register", href: "/register" }, { label: "Complete" }]}
      />
      <div className={`${CARD} mt-8 min-w-0 p-4 sm:p-6`}>
        <RegistrationCompletionForm token={token.trim()} trialZones={trialZones} />
      </div>
    </SiteSection>
  );
}
