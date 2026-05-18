import type { Metadata } from "next";
import Link from "next/link";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { SponsorshipTiers } from "@/components/sponsorship-tiers";
import { LEAGUE_NAME } from "@/lib/league";

export const metadata: Metadata = {
  title: `Partners & sponsorship · ${LEAGUE_NAME}`,
  description:
    "Season 1 title and powered-by packages: in-stadia branding, broadcast visibility, and digital promotion for brands backing Under-15 franchise cricket in Delhi NCR.",
};

export default function SponsorshipPage() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <TricolorBar className="max-w-36 rounded-sm" />
          <h1 className="mt-6 font-[family-name:var(--font-barlow)] text-4xl font-bold italic tracking-tight text-slate-900 sm:text-5xl">
            Partner with us
          </h1>
          <p className="mt-5 text-base font-medium leading-relaxed text-slate-700">
            Season 1 commercial outlines for brands that want stadium presence, broadcast-linked recognition, and digital storytelling alongside the
            Future Star U-15 Championship. Packages below reflect the league’s published rate card; final agreements are subject to contract and
            inventory confirmation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#sponsorship-packages"
              className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-700"
            >
              View packages
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50"
            >
              About the league
            </Link>
            <Link href="/" className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-orange-700 underline hover:text-orange-800">
              Home
            </Link>
          </div>
        </div>
      </section>

      <section
        id="sponsorship-packages"
        className="relative overflow-hidden border-b border-violet-950/30 bg-gradient-to-br from-violet-950 via-violet-900 to-violet-950 py-14 sm:py-20 scroll-mt-24"
        aria-labelledby="sponsorship-packages-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='%23ffffff' d='M40 0L80 40L40 80L0 40z'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="sponsorship-packages-heading" className="sr-only">
            Sponsorship packages
          </h2>
          <SponsorshipTiers />
        </div>
      </section>
    </div>
  );
}
