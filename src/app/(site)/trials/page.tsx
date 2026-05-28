import type { Metadata } from "next";
import Link from "next/link";
import { SitePageHero } from "@/components/site-page-hero";
import { SiteSection } from "@/components/site-section";
import { BTN_PRIMARY, CARD_PAD, EMPTY_STATE } from "@/lib/site-ui";
import { LEAGUE_NAME } from "@/lib/league";
import { getPublishedTrialZones } from "@/lib/public-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial zones · ${LEAGUE_NAME}`,
  description: "Trial locations across Delhi NCR: place, zone, address, directions, and contacts.",
};

export default async function TrialsPage() {
  const zones = await getPublishedTrialZones();

  return (
    <SiteSection width="content" tone="white">
      <SitePageHero
        title="Trial zones"
        lead="Where trials run across the league footprint: venue name, zone, full address, open in Google Maps, and who to contact on the ground."
        breadcrumb={[{ label: "Trial zones" }]}
      />

      <p className="mt-6 text-sm font-medium text-slate-600">
        Looking for dates and times? See the{" "}
        <Link href="/schedule" className="font-bold text-orange-700 underline hover:text-orange-800">
          trial schedule
        </Link>
        .
      </p>

      {zones.length === 0 ? (
        <p className={`mt-10 ${EMPTY_STATE}`}>
          Trial locations will be listed here soon. You can still{" "}
          <Link href="/register" className="font-bold text-orange-700 underline hover:text-orange-800">
            register for a trial slot
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {zones.map((z) => (
            <li key={z.id} className={`flex flex-col ${CARD_PAD}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{z.zone}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{z.trialPlace}</h2>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-700">{z.address}</p>
              {z.contactDetails ? (
                <p className="mt-3 text-sm font-semibold text-slate-800">{z.contactDetails}</p>
              ) : null}
              {z.navigationUrl ? (
                <a
                  href={z.navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN_PRIMARY} mt-5 w-full sm:w-auto`}
                >
                  Open in Maps
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SiteSection>
  );
}
