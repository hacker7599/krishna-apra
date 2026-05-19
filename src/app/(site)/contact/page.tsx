import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal-page-shell";
import { LEGAL_ENTITY } from "@/lib/site-legal";
import { LEAGUE_NAME, VENUE } from "@/lib/league";

export const metadata: Metadata = {
  title: `Contact us · ${LEAGUE_NAME}`,
  description: "Contact Future Star U-15 Championship — registrations, partnerships, and grievances.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact us">
      <p>For trial registrations, partnerships, media, and general enquiries about {LEGAL_ENTITY.tradeName}, reach us by email.</p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">General enquiries</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="text-orange-700 hover:underline">
                {LEGAL_ENTITY.contactEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Grievance officer</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="text-orange-700 hover:underline">
                {LEGAL_ENTITY.grievanceEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Registered entity</dt>
            <dd className="mt-1 font-semibold text-slate-900">{LEGAL_ENTITY.legalName}</dd>
            <dd className="mt-1 text-slate-700">{LEGAL_ENTITY.registeredAddress}</dd>
          </div>
        </dl>
      </div>

      <h2 className="text-lg font-bold text-slate-900">Primary venue</h2>
      <p>{VENUE}</p>

      <p>
        <Link href="/register" className="font-bold text-orange-700 underline hover:text-orange-800">
          Online trial registration →
        </Link>
      </p>
    </LegalPageShell>
  );
}
