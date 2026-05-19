import Image from "next/image";
import Link from "next/link";
import { FORMAT } from "@/lib/league";
import { cricketTeamGame } from "@/lib/remote-images";
import { CARD_PAD, SECTION_WHITE, SITE_CONTAINER } from "@/lib/site-ui";

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
  imagePriority?: boolean;
  showAboutLink?: boolean;
};

export function TournamentFormatSplit({ imagePriority = false, showAboutLink = false }: Props) {
  const lines = formatStatLines();
  const img = cricketTeamGame(1200);

  return (
    <section className={SECTION_WHITE}>
      <div className={SITE_CONTAINER}>
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg md:grid md:min-h-[340px] md:grid-cols-2">
          <div className={`${CARD_PAD} relative flex flex-col justify-between gap-8 !shadow-none md:border-r-0 md:rounded-r-none`}>
            <p className="eyebrow text-orange-700">Season 1</p>
            <div>
              <h2 className="heading-section">Tournament</h2>
              <p className="heading-display mt-1 text-orange-600">Format</p>
            </div>
            <div className="relative aspect-[5/4] w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
          <div className="flex flex-col justify-center bg-orange-600 px-8 py-10 sm:px-10 sm:py-12 lg:px-14">
            <ul className="space-y-2.5 sm:space-y-3" aria-label="Tournament format summary">
              {lines.map((line) => (
                <li key={line} className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-wide text-white sm:text-3xl">
                  {line}
                </li>
              ))}
            </ul>
            {showAboutLink && (
              <p className="mt-8">
                <Link
                  href="/about"
                  className="text-sm font-bold uppercase tracking-wide text-white underline decoration-2 underline-offset-4 hover:text-orange-100"
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
