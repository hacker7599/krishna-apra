import type { Metadata } from "next";
import { RegistrationStatusOtpFlow } from "@/components/registration-status-otp-flow";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";

export const metadata: Metadata = {
  title: "Verify registration by email code",
  description: "Receive a one-time code by email to view your Future Star U-15 registration receipt.",
  robots: { index: false, follow: false },
};

export default function RegisterStatusOtpPage() {
  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-12">
        <SitePageHero
          title="Email verification code"
          lead="Alternative to registration code — we email you a 6-digit OTP."
          breadcrumb={[
            { label: "Register", href: "/register" },
            { label: "Status", href: "/register/status" },
            { label: "Email OTP" },
          ]}
        />
      </SiteSection>
      <SiteSection width="content" tone="muted" innerClassName="!py-10 sm:!py-14">
        <RegistrationStatusOtpFlow embedded />
      </SiteSection>
    </>
  );
}
