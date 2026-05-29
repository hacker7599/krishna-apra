import type { Metadata } from "next";
import Link from "next/link";
import { SitePublicPage } from "@/components/site/site-public-page";
import { BTN_PRIMARY, EMPTY_STATE } from "@/lib/site-ui";
import { LEAGUE_NAME, REGION } from "@/lib/league";
import { getPublishedTrialZones } from "@/lib/public-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Trial zones · ${LEAGUE_NAME}`,
  description: "Trial locations across Delhi NCR: place, zone, address, directions, and contacts.",
};

export default async function TrialsPage() {
  const zones = await getPublishedTrialZones();

  return (
    <SitePublicPage
      pageClassName="page-trials"
      eyebrow={REGION}
      title="Trial zones"
      lead="Where trials run across the league footprint: venue name, zone, full address, Google Maps, and on-ground contacts."
      breadcrumb={[{ label: "Trial zones" }]}
    >
      <p className="page-trials__hint">
        Looking for dates and times? See the{" "}
        <Link href="/schedule" className="page-trials__hint-link">
          trial schedule
        </Link>
        .
      </p>

      {zones.length === 0 ? (
        <p className={EMPTY_STATE}>
          Trial locations will be listed here soon. You can still{" "}
          <Link href="/register" className="font-bold text-orange-700 underline hover:text-orange-800">
            register for a trial slot
          </Link>
          .
        </p>
      ) : (
        <ul className="trials-grid">
          {zones.map((z) => (
            <li key={z.id} className="trials-grid__card">
              <p className="trials-grid__zone">{z.zone}</p>
              <h2 className="trials-grid__place">{z.trialPlace}</h2>
              <p className="trials-grid__address">{z.address}</p>
              {z.contactDetails ? <p className="trials-grid__contact">{z.contactDetails}</p> : null}
              {z.navigationUrl ? (
                <a href={z.navigationUrl} target="_blank" rel="noopener noreferrer" className={`${BTN_PRIMARY} trials-grid__maps`}>
                  Open in Maps
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SitePublicPage>
  );
}
