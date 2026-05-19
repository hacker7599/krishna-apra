import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PRIVACY_POLICY } from "@/lib/legal-content";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Privacy policy · ${LEAGUE_NAME}`,
  description:
    "How Future Star U-15 Championship collects, uses, stores, and protects personal information for trial registrations and website use.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      lead="How we collect, use, and protect your information when you use our website and register for trials."
    >
      <LegalDocument summary={PRIVACY_POLICY.summary} sections={PRIVACY_POLICY.sections} activeDoc="privacy" />
    </LegalPageShell>
  );
}
