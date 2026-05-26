import type { Metadata } from "next";
import { RegistrationCompletionForm } from "@/components/registration-completion-form";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { getPublishedTrialZoneOptions } from "@/lib/public-queries";
import { LEAGUE_NAME } from "@/lib/league";
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
  const { token } = await searchParams;
  const trialZones = await getPublishedTrialZoneOptions();

  if (!token?.trim()) {
    return (
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
        <SitePageHero title="Complete registration" lead="This link is missing or invalid." breadcrumb={[{ label: "Register", href: "/register" }, { label: "Complete" }]} />
        <div className={`${CARD} mt-8 p-6 text-sm font-semibold text-rose-800`}>
          Ask the league desk to send you a new completion link by email.
        </div>
      </SiteSection>
    );
  }

  return (
    <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
      <SitePageHero
        title="Complete your registration"
        lead="Your trial fee payment was received. Fill in the remaining details below — this secure link works once."
        breadcrumb={[{ label: "Register", href: "/register" }, { label: "Complete" }]}
      />
      <div className={`${CARD} mt-8 min-w-0 p-4 sm:p-6`}>
        <RegistrationCompletionForm token={token.trim()} trialZones={trialZones} />
      </div>
    </SiteSection>
  );
}
