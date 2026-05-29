import type { Metadata } from "next";
import Link from "next/link";
import { AboutStakeholders } from "@/components/about-stakeholders";
import { LeagueProtectionSection } from "@/components/league-protection-section";
import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { SiteSection } from "@/components/site-section";
import { TournamentFormatSplit } from "@/components/tournament-format-split";
import { ABOUT_US_PARAGRAPHS } from "@/lib/about-copy";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/site-ui";
import { LEAGUE_NAME, REGION, TAGLINE } from "@/lib/league";

export const metadata: Metadata = {
  title: `About us · ${LEAGUE_NAME}`,
  description:
    "Future Star U-15 Championship — Krishna Apra and league leadership building grassroots franchise cricket in Delhi NCR.",
};

export default function AboutPage() {
  return (
    <div className="page-about">
      <SiteInnerHero
        eyebrow={`${REGION} · Franchise cricket`}
        title="About us"
        lead="Grassroots discovery meets franchise spectacle — built for Delhi NCR's next generation of cricketers."
        breadcrumb={[{ label: "About" }]}
      >
        <div className="site-page-actions">
          <Link href="/register" className="site-hero__btn site-hero__btn--primary">
            Join trial
          </Link>
          <Link href="/teams" className="site-hero__btn site-hero__btn--ghost">
            View teams
          </Link>
        </div>
      </SiteInnerHero>

      <SiteSection width="narrow" tone="white" innerClassName="page-about__prose-wrap">
        <div className="page-about__prose">
          {ABOUT_US_PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <blockquote className="page-about__quote">&ldquo;{TAGLINE}&rdquo;</blockquote>
        </div>
        <div className="page-about__cta-row">
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
