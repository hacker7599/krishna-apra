import type { Metadata } from "next";
import Link from "next/link";
import { AboutStakeholders } from "@/components/about-stakeholders";
import { LeagueProtectionSection } from "@/components/league-protection-section";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { TournamentFormatSplit } from "@/components/tournament-format-split";
import { ABOUT_US_PARAGRAPHS } from "@/lib/about-copy";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/site-ui";
import { LEAGUE_NAME, TAGLINE } from "@/lib/league";

export const metadata: Metadata = {
  title: `About us · ${LEAGUE_NAME}`,
  description:
    "Future Star U-15 Championship — Krishna Apra, Outer Delhi Warriors, and league leadership building grassroots franchise cricket in Delhi NCR.",
};

export default function AboutPage() {
  return (
    <div>
      <SiteSection width="narrow" tone="white">
        <SitePageHero title="About us" breadcrumb={[{ label: "About" }]} />
        <div className="mt-8 space-y-5 text-base font-medium leading-relaxed text-slate-800">
          {ABOUT_US_PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="border-l-4 border-orange-500 pl-4 text-lg font-semibold italic text-slate-900">&ldquo;{TAGLINE}&rdquo;</p>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/register" className={BTN_PRIMARY}>
            Join trial
          </Link>
          <Link href="/teams" className={BTN_SECONDARY}>
            Teams
          </Link>
          <Link href="/sponsorship" className={BTN_SECONDARY}>
            Partner with us
          </Link>
        </div>
      </SiteSection>

      <AboutStakeholders />

      <LeagueProtectionSection />

      <TournamentFormatSplit />
    </div>
  );
}
