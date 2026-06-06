import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";
import { RegisterForm } from "@/components/register-form";
import { RegisterPageAside } from "@/components/register-page-aside";
import { RegisterPageInfoBar } from "@/components/register-page-info-bar";
import { SectionHeader } from "@/components/section-header";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { REGISTRATION_FAQ } from "@/lib/faq";
import { getPublicPaymentConfig } from "@/lib/public-payment-config";
import { getRegistrationTrialZonePickerOptions } from "@/lib/public-queries";
import { cricketTeamGame } from "@/lib/remote-images";
import { CARD_PAD } from "@/lib/site-ui";
import { LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";

const heroImage = cricketTeamGame(900);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial Registration · ${LEAGUE_NAME}`,
  description: `Official trial registration for the ${TITLE_SPONSOR} Future Star Under-15 Cricket League (Delhi NCR).`,
};

export default async function RegisterPage() {
  const [trialZones, paymentConfig] = await Promise.all([
    getRegistrationTrialZonePickerOptions(),
    getPublicPaymentConfig(),
  ]);

  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="register-page-section !pb-8">
        <SitePageHero
          variant="light"
          className="register-page-hero site-page-hero--compact"
          title="Trial registration"
          lead={`Official sign-up for the ${TITLE_SPONSOR} Future Star Under-15 Cricket League. Complete the form below.`}
          breadcrumb={[{ label: "Register" }]}
        />

        <RegisterPageInfoBar />

        <div className="register-page-layout mt-6 grid gap-6 lg:mt-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="lg:col-span-4">
            <RegisterPageAside imageSrc={heroImage} />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <RegisterForm trialZones={trialZones} initialPaymentConfig={paymentConfig} />
          </div>
        </div>
      </SiteSection>

      <SiteSection width="content" tone="muted" innerClassName="!py-10 sm:!py-12">
        <SectionHeader title="Common questions" lead="Quick answers before you submit the form." />
        <FaqAccordion items={REGISTRATION_FAQ} className={`mt-6 ${CARD_PAD}`} />
      </SiteSection>
    </>
  );
}
