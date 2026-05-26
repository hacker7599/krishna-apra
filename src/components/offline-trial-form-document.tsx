import { OfflinePlayerRoleFields } from "@/components/offline-player-role-fields";
import { PrintLayoutImage } from "@/components/print-layout-image";
import { OfflineFieldLine, OfflineFormSection, OfflinePrintCheckbox } from "@/components/offline-form-primitives";
import { OfflineTrialVenueFields } from "@/components/offline-trial-venue-fields";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";
import { FORMAT, LEAGUE_NAME, LEAGUE_SUBTITLE, PLAYER_AGE_CUTOFF_DATE, SEASON_START, TAGLINE, TRIAL_FEE_INR, VENUE } from "@/lib/league";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";
import type { TrialZoneOption } from "@/lib/trial-zone-options";

function cutoffDisplay() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function FormHeader() {
  return (
    <header className="offline-form-header">
      <div className="offline-form-header__logos">
        <div className="offline-form-header__brand">
          <p className="offline-form-header__eyebrow">Official trial registration · Season 1</p>
          <h1 className="offline-form-header__title">Future Star U-15 Cricket Tournament</h1>
          <PrintLayoutImage
            src={KRISHNA_APRA_LOGO_SRC}
            alt="Krishna Apra — title sponsor"
            width={220}
            height={88}
            className="offline-form-header__sponsor"
          />
          <p className="offline-form-header__subtitle">
            {LEAGUE_NAME} · {LEAGUE_SUBTITLE}
          </p>
          <p className="offline-form-header__tagline">&ldquo;{TAGLINE}&rdquo;</p>
        </div>
        <PrintLayoutImage
          src={LEAGUE_LOGO_SRC}
          alt="Future Star U15 league logo"
          width={112}
          height={112}
          className="offline-form-header__logo offline-form-header__logo--league"
        />
      </div>
    </header>
  );
}

export function OfflineTrialFormDocument({ trialZones }: { trialZones: TrialZoneOption[] }) {
  return (
    <div className="offline-form-sheet a4-form-sheet offline-form-two-pages p-6 sm:p-8 print:p-0">
      {/* —— Page 1: player & trial details —— */}
      <div className="offline-form-page offline-form-page--1">
        <FormHeader />

        <p className="offline-form-doc-title">Registration form (offline) · Season 1</p>
        <p className="offline-form-doc-lead">
          Submit completed form and fee at the league / academy desk. Trial fee includes jersey. A4 · 2 pages.
        </p>

        <div className="offline-form-fields">
          <OfflineFieldLine label="Name of the academy / club" span={2} />
          <OfflineFieldLine label="Name of the player (as on government ID)" span={2} />
          <div className="offline-form-grid-2">
            <OfflineFieldLine label="Player date of birth (DD/MM/YYYY)" />
            <div className="offline-field-line">
              <span className="offline-field-line__label">Receiving registration fee</span>
              <span className="offline-field-line__sublabel">
                Amount: ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} (incl. t-shirt)
              </span>
              <div className="offline-form-grid-2 mt-2">
                <span className="offline-field-line__label text-[0.5625rem]">Date received</span>
                <div className="min-h-3 border-b border-slate-500 print:border-black" />
              </div>
            </div>
          </div>
          <OfflineFieldLine label="Full postal address" span={2} />
          <OfflineFieldLine label="Father / guardian name" span={2} />
          <div className="offline-form-grid-2">
            <OfflineFieldLine label="Email ID" />
            <OfflineFieldLine label="Phone number" />
          </div>
          <div className="offline-form-grid-2">
            <div className="offline-field-line">
              <span className="offline-field-line__label">Jersey (t-shirt) size</span>
              <span className="offline-field-line__sublabel">Circle one: {JERSEY_SIZES.join(" · ")}</span>
              <div className="offline-field-line__write" />
            </div>
            <OfflineFieldLine label="Shoe size (e.g. UK / EU)" />
          </div>
        </div>

        <OfflinePlayerRoleFields />
        <OfflineTrialVenueFields trialZones={trialZones} />

        <p className="offline-form-page-marker" aria-hidden>
          Page 1 of 2
        </p>
      </div>

      {/* —— Page 2: ID, payment, signatures —— */}
      <div className="offline-form-page offline-form-page--2">
        <p className="offline-form-continued">Future Star U-15 · Registration (continued)</p>

        <OfflineFormSection number="13" title="Achievements & awards" hint="Optional — district / state selections, tournament awards, academy honours.">
          <div className="offline-field-line">
            <div className="offline-field-line__write offline-field-line__write--short" />
          </div>
        </OfflineFormSection>

        <OfflineFormSection
          number="14"
          title="Government ID (one compulsory copy attached)"
          hint={`Age cut-off: born after ${cutoffDisplay()}. Aadhaar, passport (3-year validity), or birth certificate.`}
          boxed
        >
          <p className="offline-form-section__title mt-1 text-[0.5625rem]">Tick document attached</p>
          <div className="offline-form-id-options">
            {ID_DOCUMENT_TYPES.map((t) => (
              <OfflinePrintCheckbox key={t} label={ID_DOCUMENT_LABELS[t]} />
            ))}
          </div>
        </OfflineFormSection>

        <section className="offline-form-payment">
          <p className="offline-form-section__title">Payment (office / coordinator)</p>
          <p className="offline-form-section__hint">
            Trial fee: <strong>₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</strong> (incl. t-shirt). Pay via UPI / cards or at the league desk.
          </p>
          <div className="offline-form-payment__layout">
            <div className="offline-form-payment__qr-wrap">
              <p className="offline-form-section__title text-center">Scan to pay</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/trial-fee-payment-qr.png"
                alt="UPI payment QR code for TBCL Sports Pvt Ltd"
                width={160}
                height={160}
                className="offline-form-payment__qr"
              />
              <p className="offline-form-section__hint text-center">
                TBCL Sports Pvt Ltd
                <br />
                <span className="font-mono text-[0.5rem]">Vyapar.173394572826@hdfcbank</span>
              </p>
            </div>
            <div className="offline-form-payment__fields">
              <div className="offline-field-line">
                <span className="offline-field-line__label">Transaction reference / receipt no.</span>
                <div className="offline-field-line__write min-h-3.5" />
              </div>
              <p className="offline-form-section__hint">Attach payment slip / screenshot if applicable.</p>
            </div>
          </div>
        </section>

        <div className="offline-form-signatures">
          <div>
            <p className="offline-field-line__label">Coach sign / stamp</p>
            <div className="offline-form-sign-line" />
            <p className="offline-form-section__hint">Name & signature</p>
          </div>
          <div>
            <p className="offline-field-line__label">Parent / guardian sign</p>
            <div className="offline-form-sign-line" />
            <p className="offline-form-section__hint">Date</p>
          </div>
        </div>

        <footer className="offline-form-footer">
          <p>
            <strong>Format:</strong> {FORMAT.category} · {FORMAT.overs}-over T20 · {FORMAT.teams} teams · {SEASON_START}
          </p>
          <p className="mt-1">
            <strong>Primary venue:</strong> {VENUE}
          </p>
          <p className="mt-1 text-center">Future Star U-15 · Offline registration · Page 2 of 2</p>
        </footer>
      </div>
    </div>
  );
}
