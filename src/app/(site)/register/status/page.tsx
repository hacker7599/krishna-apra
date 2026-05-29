import type { Metadata } from "next";
import { RegistrationStatusFlow } from "@/components/registration-status-flow";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";

export const metadata: Metadata = {
  title: "Check registration & payment",
  description: "Look up your Future Star U-15 trial registration with email and your unique registration code.",
  robots: { index: false, follow: false },
};

export default function RegisterStatusPage() {
  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-12">
        <SitePageHero
          title="Check registration & payment"
          lead="Enter the email and registration code from your confirmation email or receipt (FSU15-R-XXXXXX)."
          breadcrumb={[{ label: "Register", href: "/register" }, { label: "Check status" }]}
        />
      </SiteSection>
      <SiteSection width="content" tone="muted" innerClassName="!py-10 sm:!py-14">
        <RegistrationStatusFlow embedded />
      </SiteSection>
    </>
  );
}
