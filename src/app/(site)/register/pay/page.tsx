import type { Metadata } from "next";
import { RegistrationClosedPage } from "@/components/registration-closed-page";
import {
  RegisterPaymentPhoneLookup,
  RegisterPaymentResume,
} from "@/components/register-payment-resume";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { getPublicPaymentConfig } from "@/lib/public-payment-config";
import { LEAGUE_NAME } from "@/lib/league";
import { isRegistrationOpen } from "@/lib/registration-gate";
import { CARD } from "@/lib/site-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Complete payment · ${LEAGUE_NAME}`,
  description: "Secure payment for your Future Star U-15 trial registration.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RegisterPayPage({ searchParams }: Props) {
  if (!isRegistrationOpen()) {
    return <RegistrationClosedPage breadcrumb={[{ label: "Register", href: "/register" }, { label: "Pay" }]} />;
  }

  const { token } = await searchParams;
  const paymentConfig = await getPublicPaymentConfig();
  const trimmed = token?.trim();

  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-12">
        <SitePageHero
          variant="light"
          title="Complete your payment"
          lead="Your registration details are saved. Pay securely below to confirm your trial spot."
          breadcrumb={[{ label: "Register", href: "/register" }, { label: "Pay" }]}
        />
        <div className="mt-8 min-w-0">
          {trimmed ? (
            <RegisterPaymentResume token={trimmed} initialPaymentConfig={paymentConfig} />
          ) : (
            <div className="mx-auto max-w-lg space-y-6">
              <div className={`${CARD} border-2 border-orange-200/60 bg-gradient-to-b from-orange-50/50 to-white p-6 text-center sm:p-8`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">Future Star U-15</p>
                <h2 className="mt-2 font-display text-2xl font-black italic uppercase tracking-tight text-[#0c1f3d]">
                  Resume payment
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Use the link from your email, or enter your registered mobile number.
                </p>
              </div>
              <RegisterPaymentPhoneLookup />
            </div>
          )}
        </div>
      </SiteSection>
    </>
  );
}
