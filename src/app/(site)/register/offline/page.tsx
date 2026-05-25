import type { Metadata } from "next";
import Link from "next/link";
import { OfflineFormPrintActions } from "@/components/offline-form-print-actions";
import { OfflineTrialFormDocument } from "@/components/offline-trial-form-document";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { LEAGUE_NAME } from "@/lib/league";
import { getPublishedTrialZoneOptions } from "@/lib/public-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Offline trial form (print) · ${LEAGUE_NAME}`,
  description: "Printable Future Star U-15 trial registration form for academy and league desk use — same fields as the official paper form.",
};

export default async function RegisterOfflinePage() {
  const trialZones = await getPublishedTrialZoneOptions();

  return (
    <SiteSection width="content" tone="muted" innerClassName="!py-10 sm:!py-12 print:!py-0 print:!bg-white">
      <div className="no-print">
        <SitePageHero
          title="Offline trial form"
          lead="Print or save as PDF — same layout as the official paper registration. Hand in at your academy or league desk with fee and ID copy."
          breadcrumb={[{ label: "Register", href: "/register" }, { label: "Offline form" }]}
        />
        <OfflineFormPrintActions />
        <p className="mt-4 text-center text-sm font-medium text-slate-600">
          Prefer online?{" "}
          <Link href="/register" className="font-bold text-orange-700 underline underline-offset-2 hover:text-orange-800">
            Complete registration on the website
          </Link>
        </p>
      </div>

      <div className="offline-form-print-root offline-form-preview-wrap print:!p-0 print:!bg-transparent">
        <OfflineTrialFormDocument trialZones={trialZones} />
      </div>
    </SiteSection>
  );
}
