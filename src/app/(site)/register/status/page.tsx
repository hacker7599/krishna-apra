import type { Metadata } from "next";
import { RegistrationStatusFlow } from "@/components/registration-status-flow";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";

export const metadata: Metadata = {
  title: "Check registration & payment",
  description: "Verify your email to view trial registration and payment status on Future Star U-15.",
  robots: { index: false, follow: false },
};

export default function RegisterStatusPage() {
  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-12">
        <SitePageHero
          title="Check registration & payment"
          lead="Enter the email you used at registration. We will send a one-time code to view your printable form and payment status."
          breadcrumb={[{ label: "Register", href: "/register" }, { label: "Verify email" }]}
        />
      </SiteSection>
      <SiteSection width="content" tone="muted" innerClassName="!py-10 sm:!py-14">
        <RegistrationStatusFlow embedded />
      </SiteSection>
    </>
  );
}
