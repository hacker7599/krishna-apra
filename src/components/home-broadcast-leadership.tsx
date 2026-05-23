import Link from "next/link";
import { MediaSlot } from "@/components/media-slot";
import { SectionHeader } from "@/components/section-header";
import {
  HOME_AAKASH_CHOPRA_PORTRAIT_PATH,
  HOME_AAKASH_CHOPRA_PORTRAIT_SRC,
  HOME_DINESH_NANAVATI_PORTRAIT_PATH,
  HOME_DINESH_NANAVATI_PORTRAIT_SRC,
  HOME_PARTHIV_PATEL_PORTRAIT_PATH,
  HOME_PARTHIV_PATEL_PORTRAIT_SRC,
} from "@/lib/home-media";
import { formatImageUploadSpecShort } from "@/lib/image-upload-specs";
import { STREAMING_YOUTUBE_URL } from "@/lib/league";
import { cn } from "@/lib/cn";
import { CARD_PAD, SECTION_WHITE, SECTION_MUTED, SITE_CONTAINER } from "@/lib/site-ui";

const partners = [{ name: "FanCode", hint: "Live streaming partner" }] as const;

function EventSupporterBlock({
  id,
  name,
  bio,
  portraitSrc,
  portraitAlt,
  suggestedPath,
  reverse,
  tone,
  roleLine,
}: {
  id: string;
  name: string;
  bio: string;
  portraitSrc: string;
  portraitAlt: string;
  suggestedPath: string;
  reverse?: boolean;
  tone: typeof SECTION_WHITE | typeof SECTION_MUTED;
  /** e.g. Former Director, National Cricket Academy */
  roleLine?: string;
}) {
  return (
    <section className={tone} aria-labelledby={id}>
      <div className={`${SITE_CONTAINER} grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14`}>
        <div className={reverse ? "lg:order-2" : undefined}>
          <SectionHeader eyebrow="Season 1" title="Event supporter" />
          <p className="mt-4 text-xl font-bold text-slate-900">{name}</p>
          {roleLine ? (
            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-orange-700">{roleLine}</p>
          ) : null}
          <p className="prose-league mt-3 max-w-xl text-sm font-medium">{bio}</p>
        </div>
        <div className={`flex justify-center ${reverse ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}>
          <MediaSlot
            src={portraitSrc}
            alt={portraitAlt}
            label="Event supporter portrait"
            suggestedPath={suggestedPath}
            className="w-full max-w-sm sm:max-w-md"
            sizes="(max-width: 768px) 100vw, 400px"
            sizeHint={`Exact size: ${formatImageUploadSpecShort("homeSupporterPortrait")}`}
          />
        </div>
      </div>
    </section>
  );
}

export function HomeBroadcastLeadership() {
  return (
    <>
      <section className={SECTION_WHITE} aria-labelledby="home-watch-live-heading">
        <div className={SITE_CONTAINER}>
          <SectionHeader
            eyebrow="Broadcast · tentative"
            title="Watch us live"
            lead="Season 1 distribution partners. Schedule and platform links will be confirmed closer to the tournament."
            align="center"
          />

          <ul className="mx-auto mt-10 grid max-w-sm gap-4 sm:max-w-md">
            {partners.map((p) => (
              <li key={p.name} className={cn(CARD_PAD, "text-center !py-6")}>
                <span className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-wide text-slate-900 sm:text-3xl">{p.name}</span>
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-orange-700">{p.hint}</span>
              </li>
            ))}
          </ul>

          <div className={`${CARD_PAD} mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
            <p className="text-sm font-medium text-slate-700">
              Highlights and clips will also be published on <span className="font-bold text-red-600">YouTube</span> alongside partner platforms.
            </p>
            {STREAMING_YOUTUBE_URL ? (
              <Link
                href={STREAMING_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
              >
                YouTube channel
              </Link>
            ) : (
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">YouTube link · add in league config</p>
            )}
          </div>
        </div>
      </section>

      <EventSupporterBlock
        id="home-aakash-supporter-heading"
        name="Mr. Aakash Chopra"
        bio="Former India opener and one of the country&apos;s most trusted cricket voices — supporting Future Star U-15 as we bring franchise-style storytelling and credibility to junior cricket in Delhi NCR."
        portraitSrc={HOME_AAKASH_CHOPRA_PORTRAIT_SRC}
        portraitAlt="Mr. Aakash Chopra"
        suggestedPath={HOME_AAKASH_CHOPRA_PORTRAIT_PATH}
        tone={SECTION_MUTED}
      />

      <EventSupporterBlock
        id="home-parthiv-supporter-heading"
        name="Mr. Parthiv Patel"
        bio="Former India wicketkeeper-batter and captain — supporting youth cricket, franchise standards, and the pathway from trials to the big stage in Delhi NCR."
        portraitSrc={HOME_PARTHIV_PATEL_PORTRAIT_SRC}
        portraitAlt="Mr. Parthiv Patel"
        suggestedPath={HOME_PARTHIV_PATEL_PORTRAIT_PATH}
        reverse
        tone={SECTION_WHITE}
      />

      <EventSupporterBlock
        id="home-dinesh-nanavati-heading"
        name="Mr. Dinesh Nanavati"
        roleLine="Former Director, National Cricket Academy (NCA)"
        bio="With decades of experience in Indian cricket&apos;s high-performance pathway, Mr. Nanavati lends his guidance to Future Star U-15 — helping align trials, coaching standards, and player development with the professionalism of the national academy system."
        portraitSrc={HOME_DINESH_NANAVATI_PORTRAIT_SRC}
        portraitAlt="Mr. Dinesh Nanavati"
        suggestedPath={HOME_DINESH_NANAVATI_PORTRAIT_PATH}
        tone={SECTION_MUTED}
      />
    </>
  );
}
