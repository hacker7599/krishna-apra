import Image from "next/image";
import Link from "next/link";
import { FORMAT } from "@/lib/league";
import { cricketTeamGame } from "@/lib/remote-images";

function formatStatLines() {
  const t = FORMAT.teams;
  return [
    `${String(t).padStart(2, "0")} TEAMS`,
    `${FORMAT.groups} GROUPS`,
    `${FORMAT.leagueMatches} MATCHES`,
    `${FORMAT.semiFinals} SEMI FINAL`,
    `${FORMAT.final} FINAL`,
    `T${FORMAT.overs} FORMAT`,
    "U15 CATEGORY",
    `${FORMAT.cameraLive} CAMERA LIVE`,
  ];
}

type Props = {
  /** When true, hero image uses `priority` (homepage above the fold). */
  imagePriority?: boolean;
  /** Show a short “Read full story” link to /about (homepage only). */
  showAboutLink?: boolean;
};

export function TournamentFormatSplit({ imagePriority = false, showAboutLink = false }: Props) {
  const lines = formatStatLines();
  const img = cricketTeamGame(1200);

  return (
    <section className="border-b border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 md:grid md:min-h-[320px] md:grid-cols-2">
          <div className="relative flex flex-col justify-between gap-8 bg-gradient-to-br from-violet-800 via-violet-900 to-violet-950 p-8 sm:p-10 lg:p-12">
            <p className="inline-flex w-fit rounded-md bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
              Season 1
            </p>
            <div className="relative z-[1]">
              <h2 className="font-[family-name:var(--font-barlow)] text-4xl font-bold italic leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                Tournament
              </h2>
              <p className="mt-1 font-[family-name:var(--font-bebas)] text-5xl uppercase leading-none tracking-wide text-orange-400 sm:text-6xl lg:text-7xl">
                Format
              </p>
              <span className="mt-3 inline-block h-1.5 w-14 rounded-full bg-orange-500" aria-hidden />
            </div>
            <div className="relative z-[1] mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-xl border border-white/10 shadow-lg md:mx-0 md:max-w-none">
              <Image
                src={img}
                alt="Young cricketer in match action"
                fill
                className="object-cover object-top"
                sizes="(max-width:768px) 100vw, 50vw"
                priority={imagePriority}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <ul className="space-y-2.5 sm:space-y-3" aria-label="Tournament format summary">
              {lines.map((line) => (
                <li
                  key={line}
                  className="font-[family-name:var(--font-bebas)] text-2xl font-bold uppercase tracking-[0.06em] text-slate-950 sm:text-3xl lg:text-[2rem] lg:leading-tight"
                >
                  {line}
                </li>
              ))}
            </ul>
            {showAboutLink && (
              <p className="mt-8">
                <Link
                  href="/about"
                  className="text-sm font-bold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4 transition hover:text-slate-800"
                >
                  About the league
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
