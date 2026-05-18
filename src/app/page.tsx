import Image from "next/image";
import Link from "next/link";
import { HeroBannersCarousel, type HeroBannerDTO } from "@/components/hero-banners-carousel";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { cricketMatchWide, cricketTeamGame } from "@/lib/remote-images";
import { HomeBroadcastLeadership } from "@/components/home-broadcast-leadership";
import { LeagueProtectionSection } from "@/components/league-protection-section";
import { TournamentFormatSplit } from "@/components/tournament-format-split";
import { FORMAT, LEAGUE_NAME, SEASON_START, TAGLINE, TITLE_SPONSOR, VENUE } from "@/lib/league";
import { getPublishedBanners, getPublishedTeamCount } from "@/lib/public-queries";

const highlights = [
  { title: "Franchise energy", body: "Eight Delhi NCR franchises, group stages, knockouts, and broadcast-style match days built for young athletes." },
  { title: "Talent pathway", body: "Structured trials and scouting so standout performers can progress into elite training and mentorship." },
  { title: "Big-stage feel", body: "Multi-camera coverage, giant-screen moments, and digital storytelling inspired by pro T20 leagues." },
];

const imgA = cricketMatchWide(880);
const imgB = cricketTeamGame(880);

export default async function Home() {
  const [bannerRows, teamCount] = await Promise.all([getPublishedBanners(), getPublishedTeamCount()]);
  const banners: HeroBannerDTO[] = bannerRows.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
  }));
  const teamsStat = teamCount > 0 ? teamCount : FORMAT.teams;

  return (
    <div>
      <HeroBannersCarousel key={banners.map((b) => b.id).join("|")} banners={banners} />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/40 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start lg:gap-12 xl:gap-16">
            <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
              <TricolorBar className="max-w-36 rounded-sm" />
              <p className="inline-flex w-fit rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-950 shadow-sm">
                Title sponsor · {TITLE_SPONSOR}
              </p>
              <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-bold italic leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {LEAGUE_NAME}
                <span className="mt-1 block font-[family-name:var(--font-bebas)] text-4xl not-italic uppercase tracking-wide text-orange-600 sm:text-5xl lg:text-6xl">
                  Under-15 Championship
                </span>
              </h1>
              <blockquote className="max-w-xl border-l-4 border-orange-500 pl-4 sm:pl-5">
                <p className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{TAGLINE}</p>
              </blockquote>
              <p className="max-w-xl text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base">
                A Delhi NCR–centric junior league blending grassroots discovery with franchise spectacle: trials, team builds, and match days
                designed to feel like the real deal—so the region&apos;s best school-age cricketers can shine on camera and on the scoreboard.
              </p>
              <div className="flex max-w-xl flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex h-12 min-w-[200px] flex-1 items-center justify-center rounded-xl bg-orange-600 px-6 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-orange-600/25 transition hover:bg-orange-700 sm:flex-none"
                >
                  Book trial slot
                </Link>
                <Link
                  href="/teams"
                  className="inline-flex h-12 min-w-[200px] flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
                >
                  Meet the {teamsStat} teams
                </Link>
              </div>
            </div>

            <div className="card-elevated overflow-hidden rounded-2xl p-5 sm:p-6">
              <div className="relative mx-auto aspect-[4/3] max-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:max-w-[300px]">
                <Image src="/branding/logo.png" alt="Future Star U15 league logo" fill className="object-cover" sizes="300px" priority />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image src={imgA} alt="Cricket match in a stadium" fill className="object-cover" sizes="(max-width:1024px) 45vw, 360px" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-slate-900/80 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                    Match day
                  </figcaption>
                </figure>
                <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image src={imgB} alt="Cricket on a green field" fill className="object-cover" sizes="(max-width:1024px) 45vw, 360px" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-slate-900/80 px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
                    Delhi NCR
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-14">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Season 1 · at a glance</p>
              <Link href="/about" className="text-xs font-bold text-orange-700 underline-offset-2 hover:underline">
                Full story →
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
              <dl className="grid grid-cols-2 divide-x divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-y-0 lg:grid-cols-8 lg:divide-y-0">
                {[
                  { k: "Teams", v: teamsStat },
                  { k: "Overs", v: FORMAT.overs },
                  { k: "Groups", v: FORMAT.groups },
                  { k: "League games", v: FORMAT.leagueMatches },
                  { k: "Semi-finals", v: FORMAT.semiFinals },
                  { k: "Final", v: FORMAT.final },
                  { k: "Live cameras", v: FORMAT.cameraLive },
                  { k: "Category", v: "U15" },
                ].map((s) => (
                  <div key={s.k} className="group px-3 py-6 text-center sm:px-4 sm:py-8">
                    <dt className="text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-orange-200/90">{s.k}</dt>
                    <dd className="mt-2 font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-white sm:text-4xl lg:text-[2.35rem]">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <TournamentFormatSplit showAboutLink />

      <HomeBroadcastLeadership />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900 sm:text-4xl">
            Why this league exists
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-700">
            Future Star is built as a complete junior ecosystem: competitive cricket first, layered with the storytelling, branding, and match-day
            energy you expect from modern T20—anchored in Delhi&apos;s cricket culture.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map((h) => (
              <li key={h.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 h-1 w-10 rounded-full bg-orange-600" />
                <h3 className="text-lg font-bold text-slate-900">{h.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{h.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LeagueProtectionSection compact />

      <section className="bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-6 sm:py-16">
          <div className="max-w-xl space-y-3">
            <h2 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900 sm:text-4xl">
              Trials are open
            </h2>
            <p className="text-base font-medium leading-relaxed text-slate-700">
              Submit the digital registration form with academy details, player profile, and optional payment proof—same structure as the official
              paper trial form, upgraded for speed and clarity.
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Season window · <span className="text-orange-700">{SEASON_START}</span>
            </p>
            <p className="text-sm font-medium leading-relaxed text-slate-700">{VENUE}</p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-orange-600 bg-orange-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-700"
          >
            Start registration
          </Link>
        </div>
      </section>
    </div>
  );
}
