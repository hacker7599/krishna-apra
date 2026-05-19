import type { Metadata } from "next";
import { OfflineFormPrintActions } from "@/components/offline-form-print-actions";
import { OfflineTrialFormDocument } from "@/components/offline-trial-form-document";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Offline trial form (print) · ${LEAGUE_NAME}`,
  description: "Printable Future Star U-15 trial registration form for academy and league desk use — same fields as the official paper form.",
};

export default function RegisterOfflinePage() {
  return (
    <SiteSection width="narrow" tone="white" innerClassName="!py-10 sm:!py-12">
      <SitePageHero
        title="Offline trial form"
        lead="Print or save as PDF — same fields as the official paper registration. Submit at your academy or league desk."
        className="no-print"
      />
      <div className="no-print">
        <OfflineFormPrintActions />
      </div>
      <div className="mx-auto mt-8 w-full max-w-[210mm] print:mt-0 print:max-w-none">
        <OfflineTrialFormDocument />
      </div>
    </SiteSection>
  );
}
