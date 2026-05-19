import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { TERMS_AND_CONDITIONS } from "@/lib/legal-content";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Terms & conditions · ${LEAGUE_NAME}`,
  description:
    "Terms and conditions for Future Star U-15 Championship website use, trial registration, fees, conduct, media rights, and participation.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & conditions"
      lead="Rules for using our website, registering for trials, and participating in Season 1 activities."
    >
      <LegalDocument summary={TERMS_AND_CONDITIONS.summary} sections={TERMS_AND_CONDITIONS.sections} activeDoc="terms" />
    </LegalPageShell>
  );
}
