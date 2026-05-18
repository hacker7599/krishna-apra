import type { Metadata } from "next";
import Link from "next/link";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { LeagueProtectionSection } from "@/components/league-protection-section";
import { TournamentFormatSplit } from "@/components/tournament-format-split";
import { ABOUT_US_PARAGRAPHS } from "@/lib/about-copy";
import { LEAGUE_NAME, TAGLINE } from "@/lib/league";

export const metadata: Metadata = {
  title: `About us · ${LEAGUE_NAME}`,
  description:
    "Future Star U-15 Championship — grassroots discovery, franchise structure, live broadcast, and a pathway to high-performance cricket.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <TricolorBar className="max-w-36 rounded-sm" />
          <h1 className="mt-6 font-[family-name:var(--font-barlow)] text-4xl font-bold italic tracking-tight text-slate-900 sm:text-5xl">About us</h1>
          <div className="mt-8 space-y-5 text-base font-medium leading-relaxed text-slate-800">
            {ABOUT_US_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="border-l-4 border-orange-500 pl-4 text-lg font-semibold italic text-slate-900">&ldquo;{TAGLINE}&rdquo;</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-700"
            >
              Join trial
            </Link>
            <Link
              href="/teams"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50"
            >
              Teams
            </Link>
            <Link
              href="/sponsorship"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50"
            >
              Partner with us
            </Link>
            <Link href="/" className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-orange-700 underline hover:text-orange-800">
              Home
            </Link>
          </div>
        </div>
      </section>

      <LeagueProtectionSection />

      <TournamentFormatSplit />
    </div>
  );
}
