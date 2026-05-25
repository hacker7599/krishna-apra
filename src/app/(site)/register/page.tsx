import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";
import { RegisterForm } from "@/components/register-form";
import { SectionHeader } from "@/components/section-header";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { REGISTRATION_FAQ } from "@/lib/faq";
import { getPublishedTrialZoneOptions } from "@/lib/public-queries";
import { cricketTeamGame } from "@/lib/remote-images";
import { CARD } from "@/lib/site-ui";
import { LEAGUE_NAME, TITLE_SPONSOR } from "@/lib/league";

const sideImg = cricketTeamGame(900);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial Registration · ${LEAGUE_NAME}`,
  description: `Official trial registration for the ${TITLE_SPONSOR} Future Star Under-15 Cricket League (Delhi NCR).`,
};

export default async function RegisterPage() {
  const trialZones = await getPublishedTrialZoneOptions();

  return (
    <>
      <SiteSection width="content" tone="white" innerClassName="!py-10 sm:!py-14">
        <SitePageHero
          title="Trial registration"
          lead={`Official sign-up for the ${TITLE_SPONSOR} Future Star Under-15 Cricket League (Delhi NCR).`}
          breadcrumb={[{ label: "Register" }]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className={`${CARD} flex flex-col overflow-hidden lg:col-span-4 lg:sticky lg:top-24 lg:self-start`}>
            <div className="relative aspect-[16/10] w-full shrink-0 border-b border-slate-200 bg-slate-100">
              <Image src={sideImg} alt="Cricket on a green field" fill className="object-cover" sizes="(max-width:1280px) 100vw, 320px" priority />
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              <p className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-slate-900">Before you submit</p>
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-slate-600">
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">1.</span>
                  Have age proof ready (Aadhaar, passport, or birth certificate).
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">2.</span>
                  Select player roles and your preferred trial venue.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-orange-600">3.</span>
                  {TITLE_SPONSOR} — official league registration only on this site.
                </li>
              </ul>
              <p className="border-t border-slate-200 pt-3 text-sm font-medium text-slate-600">
                Prefer paper?{" "}
                <Link href="/register/offline" className="font-bold text-orange-700 underline underline-offset-2 hover:text-orange-800">
                  Printable offline form
                </Link>
              </p>
            </div>
          </aside>
          <div className="min-w-0 lg:col-span-8">
            <RegisterForm trialZones={trialZones} />
          </div>
        </div>
      </SiteSection>

      <SiteSection width="content" tone="muted">
        <SectionHeader title="Common questions" lead="Quick answers before you submit the form." />
        <FaqAccordion items={REGISTRATION_FAQ} className="mt-8" />
      </SiteSection>
    </>
  );
}
