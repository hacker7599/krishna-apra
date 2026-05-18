import type { Metadata } from "next";
import Link from "next/link";
import { TricolorBar } from "@/components/graphics/tricolor-bar";
import { LEAGUE_NAME } from "@/lib/league";
import { getPublishedTrialZones } from "@/lib/public-queries";

/** Avoid build-time static prerender before `TrialZone` exists in the DB (`prisma db push`). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial zones · ${LEAGUE_NAME}`,
  description: "Trial locations across Delhi NCR: place, zone, address, directions, and contacts.",
};

export default async function TrialsPage() {
  const zones = await getPublishedTrialZones();

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <TricolorBar className="max-w-36 rounded-sm" />
        <h1 className="mt-6 font-[family-name:var(--font-barlow)] text-4xl font-bold italic tracking-tight text-slate-900 sm:text-5xl">
          Trial zones
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-700">
          Where trials run across the league footprint: venue name, zone, full address, open in Google Maps, and who to contact on the ground.
        </p>

        {zones.length === 0 ? (
          <p className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600 shadow-sm">
            Trial locations will be listed here soon. You can still{" "}
            <Link href="/register" className="font-bold text-orange-700 underline hover:text-orange-800">
              register for a trial slot
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {zones.map((z) => (
              <li key={z.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{z.zone}</p>
                <h2 className="mt-2 font-[family-name:var(--font-barlow)] text-2xl font-bold italic text-slate-900">{z.trialPlace}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">{z.address}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm font-semibold text-slate-900">{z.contactDetails}</p>
                <div className="mt-auto pt-6">
                  {z.navigationUrl ? (
                    <a
                      href={z.navigationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-orange-700"
                    >
                      Open in Google Maps
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">Map link unavailable</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
