import Image from "next/image";
import Link from "next/link";
import {
  HOME_BRAND_AMBASSADOR_PORTRAIT_SRC,
  HOME_LEAGUE_COMMISSIONER_PORTRAIT_SRC,
  HOME_STREAMING_HERO_SRC,
} from "@/lib/home-media";
import { STREAMING_YOUTUBE_URL } from "@/lib/league";

const partners = [
  { name: "FanCode", hint: "Live streaming partner" },
  { name: "Waves", hint: "Live streaming partner" },
  { name: "Styx Sports", hint: "Live streaming partner" },
] as const;

function StreamingHeroSlot() {
  if (HOME_STREAMING_HERO_SRC) {
    return (
      <div className="relative mx-auto mt-8 aspect-[2/1] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 shadow-lg sm:aspect-[21/9]">
        <Image
          src={HOME_STREAMING_HERO_SRC}
          alt="Streaming partners — Season 1"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>
    );
  }
  return (
    <div className="mx-auto mt-8 flex aspect-[2/1] w-full max-w-4xl flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-white/30 bg-black/20 px-4 text-center sm:aspect-[21/9]">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Streaming key art</p>
      <p className="text-[11px] font-medium text-white/45">Image slot — artwork to be added.</p>
    </div>
  );
}

function PortraitSlot({ src, alt, label }: { src: string; alt: string; label: string }) {
  if (src) {
    return (
      <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 shadow-xl sm:max-w-md">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300/50 bg-violet-950/30 px-4 text-center sm:max-w-md">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="text-[11px] font-medium text-white/45">Image slot — portrait to be added.</p>
    </div>
  );
}

export function HomeBroadcastLeadership() {
  return (
    <div className="border-b border-slate-200">
      {/* Watch live — streaming */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-violet-900 to-amber-500 px-4 py-14 sm:px-6 sm:py-16"
        aria-labelledby="home-watch-live-heading"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='%23ffffff' d='M30 0L60 30L30 60L0 30z'/%3E%3C/svg%3E")`,
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="rounded-sm bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Season 1</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Outer Delhi Warriors · Future Star U-15</p>
          </div>
          <h2 id="home-watch-live-heading" className="mt-6 text-center sm:mt-8">
            <span className="font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-wide text-white sm:text-5xl md:text-6xl">Watch us</span>
            <span className="ml-2 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-wide text-amber-300 sm:text-5xl md:text-6xl">live on</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-medium text-white/85">
            Season 1 broadcast and digital distribution partners. Schedule and platform links will be confirmed closer to the tournament — marked{" "}
            <strong className="text-amber-200">tentative</strong> until announced.
          </p>

          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {partners.map((p) => (
              <li
                key={p.name}
                className="flex flex-col rounded-2xl border border-white/20 bg-white/[0.07] px-4 py-6 text-center backdrop-blur-sm"
              >
                <span className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-wide text-white sm:text-3xl">{p.name}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">{p.hint}</span>
              </li>
            ))}
          </ul>

          <StreamingHeroSlot />

          <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-white/15 bg-black/20 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-white/90">
              Highlights and clips will also be published on <span className="font-bold text-red-300">YouTube</span> alongside FanCode, Waves, and
              Styx Sports.
            </p>
            {STREAMING_YOUTUBE_URL ? (
              <Link
                href={STREAMING_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 sm:mt-0"
              >
                YouTube channel
              </Link>
            ) : (
              <p className="mt-3 shrink-0 text-xs font-bold uppercase tracking-wide text-white/50 sm:mt-0">YouTube link · coming soon</p>
            )}
          </div>

          <p className="mt-6 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Tentative</p>
        </div>
      </section>

      {/* Brand ambassador */}
      <section className="bg-gradient-to-br from-violet-950 via-violet-900 to-violet-950 px-4 py-14 sm:px-6 sm:py-16" aria-labelledby="home-ambassador-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-center lg:gap-14">
          <div>
            <p className="inline-flex rounded-sm bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Season 1</p>
            <h2 id="home-ambassador-heading" className="mt-4 font-[family-name:var(--font-bebas)] text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl">
              Meet our <span className="text-amber-300">brand</span>
            </h2>
            <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-wide text-orange-400 sm:text-5xl">ambassador</p>
            <p className="mt-6 text-lg font-bold text-white sm:text-xl">Mr. Aakash Chopra</p>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80">
              Former India opener and one of the country&apos;s most trusted cricket voices — backing Future Star U-15 as we bring franchise-style
              storytelling and credibility to junior cricket in Delhi NCR.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PortraitSlot src={HOME_BRAND_AMBASSADOR_PORTRAIT_SRC} alt="Mr. Aakash Chopra, brand ambassador" label="Ambassador portrait" />
          </div>
        </div>
      </section>

      {/* League commissioner */}
      <section className="border-t border-violet-800/40 bg-gradient-to-br from-violet-900 via-violet-950 to-slate-950 px-4 py-14 sm:px-6 sm:py-16" aria-labelledby="home-commissioner-heading">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-center lg:gap-14">
          <div className="lg:order-2">
            <p className="inline-flex rounded-sm bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Season 1</p>
            <h2 id="home-commissioner-heading" className="mt-4 font-[family-name:var(--font-bebas)] text-4xl uppercase leading-none tracking-wide text-white sm:text-5xl">
              Meet our league
            </h2>
            <p className="mt-2 inline-block bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-violet-950 sm:text-4xl">
              commissioner
            </p>
            <p className="mt-6 text-lg font-bold text-white sm:text-xl">Mr. Parthiv Patel</p>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80">
              Former India wicketkeeper-batter and captain — guiding league structure, playing conditions, and the on-field standards for Future
              Star U-15 Season 1.
            </p>
          </div>
          <div className="flex justify-center lg:order-1 lg:justify-start">
            <PortraitSlot src={HOME_LEAGUE_COMMISSIONER_PORTRAIT_SRC} alt="Mr. Parthiv Patel, league commissioner" label="Commissioner portrait" />
          </div>
        </div>
      </section>
    </div>
  );
}
