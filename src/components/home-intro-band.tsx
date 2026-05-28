import Image from "next/image";
import Link from "next/link";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { TitleSponsorMark } from "@/components/title-sponsor-mark";
import { BTN_PRIMARY, BTN_SECONDARY, SITE_CONTAINER, SECTION_WHITE } from "@/lib/site-ui";
import { LEAGUE_LOGO_SRC } from "@/lib/branding";
import { LEAGUE_INITIATIVE_BY, LEAGUE_NAME, TAGLINE } from "@/lib/league";
import { cricketMatchWide, cricketTeamGame } from "@/lib/remote-images";

type Props = {
  teamsStat: number;
};

export function HomeIntroBand({ teamsStat }: Props) {
  const imgA = cricketMatchWide(880);
  const imgB = cricketTeamGame(880);

  return (
    <section className={SECTION_WHITE}>
      <div className={`${SITE_CONTAINER} grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center lg:gap-14`}>
        <div className="min-w-0 space-y-5">
          <TricolorBar className="max-w-32 rounded-sm" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            An initiative by{" "}
            <span className="text-slate-800">{LEAGUE_INITIATIVE_BY}</span>
          </p>
          <TitleSponsorMark size="xl" align="start" priority />
          <div>
            <p className="eyebrow">Delhi NCR · Season 1</p>
            <h1 className="mt-2 font-[family-name:var(--font-barlow)] text-3xl font-bold italic leading-[1.05] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              {LEAGUE_NAME}
              <span className="mt-1 block font-[family-name:var(--font-bebas)] text-3xl not-italic uppercase tracking-wide text-orange-600 sm:text-4xl lg:text-5xl">
                Under-15 Championship
              </span>
            </h1>
          </div>
          <p className="max-w-xl text-lg font-semibold leading-snug text-slate-900">{TAGLINE}</p>
          <p className="max-w-xl text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base">
            A Delhi NCR junior league blending grassroots discovery with franchise spectacle—trials, team builds, and match days designed for
            school-age cricketers to shine on camera and on the scoreboard.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Link href="/register" className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              Book trial slot
            </Link>
            <Link href="/teams" className={`${BTN_SECONDARY} w-full sm:w-auto`}>
              Meet the {teamsStat} teams
            </Link>
          </div>
        </div>

        <aside className="card-pad overflow-hidden">
          <div className="relative mx-auto aspect-square max-w-[240px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image src={LEAGUE_LOGO_SRC} alt="Future Star U15 league logo" fill className="object-cover" sizes="240px" priority />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <figure className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image src={imgA} alt="Cricket match in a stadium" fill className="object-cover" sizes="180px" />
            </figure>
            <figure className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <Image src={imgB} alt="Cricket on a green field" fill className="object-cover" sizes="180px" />
            </figure>
          </div>
        </aside>
      </div>
    </section>
  );
}
