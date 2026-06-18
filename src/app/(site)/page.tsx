import { HeroBannersCarousel, type HeroBannerDTO } from "@/components/hero-banners-carousel";
import { HomeIntroBand } from "@/components/home-intro-band";
import { RegisterCtaLink } from "@/components/register-cta-link";
import { HomeStatsStrip } from "@/components/home-stats-strip";
import { HomeEstimatedReach } from "@/components/home-estimated-reach";
import { CelebritySupportSection } from "@/components/celebrity-support-section";
import { HomeBroadcastLeadership } from "@/components/home-broadcast-leadership";
import { LeagueProtectionSection } from "@/components/league-protection-section";
import { TournamentFormatSplit } from "@/components/tournament-format-split";
import { SectionHeader } from "@/components/section-header";
import { SiteSection } from "@/components/site-section";
import { BTN_SECONDARY } from "@/lib/site-ui";
import { SupportContactLinks } from "@/components/support-contact-links";
import { FORMAT, SEASON_START, VENUE } from "@/lib/league";
import { isRegistrationOpen, mapBannersForRegistrationStatus } from "@/lib/registration-gate";
import { getPublishedBanners, getPublishedTeamCount } from "@/lib/public-queries";

const highlights = [
  {
    title: "Franchise energy",
    body: "Eight Delhi NCR franchises, group stages, knockouts, and broadcast-style match days built for young athletes.",
  },
  {
    title: "Talent pathway",
    body: "Structured trials and scouting so standout performers can progress into elite training and mentorship.",
  },
  {
    title: "Big-stage feel",
    body: "Multi-camera coverage, giant-screen moments, and digital storytelling inspired by pro T20 leagues.",
  },
];

export default async function Home() {
  const [bannerRows, teamCount] = await Promise.all([getPublishedBanners(), getPublishedTeamCount()]);
  const banners: HeroBannerDTO[] = mapBannersForRegistrationStatus(
    bannerRows.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      ctaLabel: b.ctaLabel,
      ctaHref: b.ctaHref,
    })),
  );
  const teamsStat = teamCount > 0 ? teamCount : FORMAT.teams;

  return (
    <div>
      <HeroBannersCarousel key={banners.map((b) => b.id).join("|")} banners={banners} />
      <HomeIntroBand teamsStat={teamsStat} />
      <HomeStatsStrip teamsStat={teamsStat} />
      <CelebritySupportSection />

      <TournamentFormatSplit showAboutLink imagePriority />
      <HomeEstimatedReach />

      <SiteSection tone="muted" width="content">
        <SectionHeader
          eyebrow="Our mission"
          title="Why this league exists"
          lead="Future Star is built as a complete junior ecosystem: competitive cricket first, layered with the storytelling, branding, and match-day energy you expect from modern T20—anchored in Delhi&apos;s cricket culture."
        />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {highlights.map((h) => (
            <li key={h.title} className="site-card site-card--pad site-card--hover">
              <div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
              <h3 className="text-lg font-bold text-slate-900">{h.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{h.body}</p>
            </li>
          ))}
        </ul>
      </SiteSection>

      <LeagueProtectionSection compact />
      <HomeBroadcastLeadership />

      <SiteSection tone="white" width="content" className="!border-b-0">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-3">
            <SectionHeader
              eyebrow="Registration"
              title={isRegistrationOpen() ? "Trials are open" : "Registration closed"}
            />
            <p className="text-base font-medium leading-relaxed text-slate-600">
              {isRegistrationOpen()
                ? "Submit the digital registration form with academy details, player profile, and optional payment proof—the same structure as the official paper trial form, upgraded for speed and clarity."
                : "Trial registration for Season 1 has closed. You can still check an existing application or follow the schedule and trial zones for league updates."}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Season window · <span className="text-orange-700">{SEASON_START}</span>
            </p>
            <p className="text-sm font-medium text-slate-600">{VENUE}</p>
            <p className="text-sm font-medium text-slate-600">
              Support: <SupportContactLinks linkClassName="font-semibold text-orange-700 hover:text-orange-800" />
            </p>
          </div>
          {isRegistrationOpen() ? (
            <RegisterCtaLink className="shrink-0 px-8" openLabel="Start registration" />
          ) : (
            <div className="flex shrink-0 flex-col gap-3 sm:items-stretch">
              <RegisterCtaLink className="px-8" />
              <a href="/register/status" className={`${BTN_SECONDARY} px-8 text-center`}>
                Check status
              </a>
            </div>
          )}
        </div>
      </SiteSection>
    </div>
  );
}
