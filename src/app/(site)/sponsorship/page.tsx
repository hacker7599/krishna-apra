import type { Metadata } from "next";
import Link from "next/link";
import { SiteInnerHero } from "@/components/site/site-inner-hero";
import { SiteSection } from "@/components/site-section";
import { SponsorshipSeasonPartners } from "@/components/sponsorship-season-partners";
import { SponsorshipTiers } from "@/components/sponsorship-tiers";
import { STICKY_OFFSET } from "@/lib/site-ui";
import { LEAGUE_NAME, REGION } from "@/lib/league";

export const metadata: Metadata = {
  title: `Partners & sponsorship · ${LEAGUE_NAME}`,
  description:
    "Season 1 title, powered-by, and co-powered-by packages: in-stadia branding, broadcast visibility, and digital promotion for brands backing Under-15 franchise cricket in Delhi NCR.",
};

export default function SponsorshipPage() {
  return (
    <div className="page-sponsorship">
      <SiteInnerHero
        eyebrow={`${REGION} · Commercial`}
        title="Partner with us"
        lead="Season 1 commercial outlines for brands that want stadium presence, broadcast-linked recognition, and digital storytelling alongside the Future Star U-15 Championship."
        breadcrumb={[{ label: "Partners" }]}
      >
        <div className="site-page-actions">
          <Link href="#sponsorship-packages" className="site-hero__btn site-hero__btn--primary">
            View packages
          </Link>
          <Link href="/contact" className="site-hero__btn site-hero__btn--ghost">
            Enquire
          </Link>
        </div>
      </SiteInnerHero>

      <SiteSection width="wide" tone="white" innerClassName="page-sponsorship__partners-wrap">
        <SponsorshipSeasonPartners />
      </SiteSection>

      <SiteSection id="sponsorship-packages" width="wide" tone="muted" className={STICKY_OFFSET} innerClassName="page-sponsorship__tiers">
        <h2 className="sr-only">Sponsorship packages</h2>
        <SponsorshipTiers />
      </SiteSection>
    </div>
  );
}
