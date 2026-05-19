import type { Metadata } from "next";
import Link from "next/link";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { SponsorshipTiers } from "@/components/sponsorship-tiers";
import { BTN_PRIMARY, BTN_SECONDARY, STICKY_OFFSET } from "@/lib/site-ui";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Partners & sponsorship · ${LEAGUE_NAME}`,
  description:
    "Season 1 title and powered-by packages: in-stadia branding, broadcast visibility, and digital promotion for brands backing Under-15 franchise cricket in Delhi NCR.",
};

export default function SponsorshipPage() {
  return (
    <div>
      <SiteSection width="narrow" tone="white">
        <SitePageHero
          title="Partner with us"
          lead="Season 1 commercial outlines for brands that want stadium presence, broadcast-linked recognition, and digital storytelling alongside the Future Star U-15 Championship."
          breadcrumb={[{ label: "Partners" }]}
        />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="#sponsorship-packages" className={BTN_PRIMARY}>
            View packages
          </Link>
          <Link href="/contact" className={BTN_SECONDARY}>
            Enquire
          </Link>
        </div>
      </SiteSection>

      <SiteSection id="sponsorship-packages" width="wide" tone="muted" className={STICKY_OFFSET}>
        <h2 className="sr-only">Sponsorship packages</h2>
        <SponsorshipTiers />
      </SiteSection>
    </div>
  );
}
