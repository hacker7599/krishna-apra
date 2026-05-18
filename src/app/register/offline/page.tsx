import type { Metadata } from "next";
import { OfflineFormPrintActions } from "@/components/offline-form-print-actions";
import { OfflineTrialFormDocument } from "@/components/offline-trial-form-document";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Offline trial form (print) · ${LEAGUE_NAME}`,
  description: "Printable Future Star U-15 trial registration form for academy and league desk use — same fields as the official paper form.",
};

export default function RegisterOfflinePage() {
  return (
    <div className="mx-auto w-full max-w-[210mm] px-4 py-10 sm:px-6 sm:py-12 print:max-w-none print:px-0 print:py-2">
      <OfflineFormPrintActions />
      <OfflineTrialFormDocument />
    </div>
  );
}
