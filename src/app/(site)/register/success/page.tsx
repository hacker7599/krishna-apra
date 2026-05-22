import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterSuccessPageContent } from "@/components/register-success-page-content";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Registration confirmed · ${LEAGUE_NAME}`,
  description: "Print or save your trial registration and payment confirmation.",
  robots: { index: false, follow: false },
};

export default function RegisterSuccessPage() {
  return (
    <>
      <div className="print-only-hide">
        <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
          <SitePageHero
            title="Registration confirmed"
            lead="Your trial registration has been saved. Print or save as PDF below (A4)."
            breadcrumb={[{ label: "Register", href: "/register" }, { label: "Confirmation" }]}
          />
        </SiteSection>
      </div>
      <SiteSection width="content" tone="white" innerClassName="!py-6 sm:!py-8 print:!py-0">
        <div className="flex justify-center print:block">
          <Suspense fallback={<p className="text-sm font-semibold text-slate-600">Loading…</p>}>
            <RegisterSuccessPageContent />
          </Suspense>
        </div>
      </SiteSection>
    </>
  );
}
