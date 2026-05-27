import { PrintLayoutImage } from "@/components/print-layout-image";
import { KRISHNA_APRA_LOGO_SRC, LEAGUE_LOGO_SRC } from "@/lib/branding";
import { FORMAT, LEAGUE_NAME, LEAGUE_SUBTITLE, TAGLINE } from "@/lib/league";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";

function formatSubmittedAt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatDob(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="receipt-section-title mt-5 flex items-center gap-3 border-b-2 border-[#1B365D] pb-2 print:mt-3 print:pb-1">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#1B365D] text-[11px] font-bold text-white">
        {index}
      </span>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B365D]">{title}</h2>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const isAchievements = label === "Achievements & awards";
  return (
    <div
      className={`receipt-detail-row grid gap-1 border-b border-slate-200 py-2.5 sm:grid-cols-[38%_1fr] print:py-1.5 ${
        highlight ? "bg-orange-50/60" : ""
      }`}
    >
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={`text-[13px] font-semibold leading-snug text-slate-900 ${highlight ? "text-[#1B365D]" : ""} ${
          isAchievements ? "receipt-achievements" : ""
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function PaymentStatusBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className={`inline-block rounded border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
        paid ? "border-emerald-700 bg-emerald-600 text-white" : "border-amber-600 bg-amber-500 text-white"
      }`}
    >
      {paid ? "Fee paid" : "Pending verification"}
    </span>
  );
}

export function RegistrationSuccessDocument({ data }: { data: RegistrationConfirmation }) {
  const paidOnline = data.payment.status === "paid";
  const amountDisplay = `₹${data.payment.amountInr.toLocaleString("en-IN")}`;

  return (
    <article
      id="registration-receipt"
      className="receipt-a4-sheet receipt-single-page mx-auto box-border w-full max-w-[210mm] bg-white text-slate-900 shadow-lg ring-1 ring-slate-200 print:mx-0 print:max-w-none print:shadow-none print:ring-0"
    >
      <div className="receipt-tricolor flex h-1.5 w-full" aria-hidden>
        <span className="flex-1 bg-[#FF9933]" />
        <span className="flex-[0.35] bg-white" />
        <span className="flex-1 bg-[#138808]" />
      </div>

      <div className="receipt-body px-6 py-6 sm:px-8 sm:py-7 print:px-0 print:py-0">
        <header className="receipt-header border-b border-slate-300 pb-5 print:pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:gap-2">
            <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Official acknowledgement · Season 1
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-bebas)] text-[26px] uppercase leading-none tracking-wide text-[#1B365D] sm:text-[28px]">
                Trial registration confirmation
              </h1>
              <p className="mt-1 text-[11px] font-semibold text-slate-700">
                {LEAGUE_NAME} · {LEAGUE_SUBTITLE} · Delhi NCR
              </p>
              <PrintLayoutImage
                src={KRISHNA_APRA_LOGO_SRC}
                alt="Krishna Apra — title sponsor"
                width={180}
                height={72}
                className="mx-auto mt-2 h-10 w-auto object-contain"
              />
            </div>
            <div className="flex shrink-0 justify-center sm:justify-end">
              <PrintLayoutImage
                src={LEAGUE_LOGO_SRC}
                alt="Future Star U15"
                width={80}
                height={80}
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] italic text-slate-600">&ldquo;{TAGLINE}&rdquo;</p>

          <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border-2 border-[#1B365D]/20 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-between print:mt-2 print:py-2">
            <div className="text-center sm:text-left">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Registration reference no.</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-[#1B365D]">{data.registrationId}</p>
            </div>
            <PaymentStatusBadge paid={paidOnline} />
          </div>
        </header>

        <section className="receipt-payment-card mt-5 overflow-hidden rounded-lg border-2 border-[#1B365D] print:mt-3">
          <div className="bg-[#1B365D] px-4 py-2">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Trial registration fee · Payment summary
            </p>
          </div>
          <div className="grid gap-4 bg-gradient-to-br from-slate-50 to-orange-50/40 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center print:py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Amount received / due</p>
              <p className="receipt-amount mt-1 font-[family-name:var(--font-bebas)] text-4xl leading-none text-orange-600">
                {amountDisplay}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">{data.payment.currency} · inclusive of jersey (per league form)</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
              <p className="text-[10px] font-bold uppercase text-slate-500">Settlement</p>
              <p className="mt-1 font-semibold text-slate-900">{data.payment.method}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-slate-500">Status</p>
              <p className={`mt-0.5 font-bold ${paidOnline ? "text-emerald-700" : "text-amber-700"}`}>
                {paidOnline ? "Confirmed paid" : "Awaiting verification"}
              </p>
            </div>
          </div>
          {data.payment.transactionRef && (
            <div className="border-t border-slate-200 bg-white px-4 py-2.5 text-[11px]">
              <p>
                <span className="font-bold text-slate-600">Transaction reference: </span>
                <span className="font-mono text-slate-900">{data.payment.transactionRef}</span>
              </p>
            </div>
          )}
        </section>

        <div className="receipt-details-block">
          <SectionTitle index="01" title="Registration particulars" />
          <dl className="receipt-details mt-2">
            <DetailRow label="Date & time of submission" value={formatSubmittedAt(data.submittedAt)} />
            <DetailRow
              label="Tournament category"
              value={`${FORMAT.category} · ${FORMAT.overs}-over T20 · ${FORMAT.teams} franchises`}
              highlight
            />
          </dl>

          <SectionTitle index="02" title="Player & academy details" />
          <dl className="receipt-details mt-2">
            <DetailRow label="Academy / club name" value={data.academyName} />
            <DetailRow label="Player name (as on ID)" value={data.playerName} highlight />
            <DetailRow label="Date of birth" value={formatDob(data.dateOfBirth)} />
            <DetailRow label="Father / guardian name" value={data.fatherName ?? "—"} />
            <DetailRow label="Playing role(s)" value={data.roles.join(" · ")} />
            {data.trialZone ? <DetailRow label="Preferred trial zone" value={data.trialZone} highlight /> : null}
            <DetailRow label="Jersey (t-shirt) size" value={data.jerseySize ?? "—"} />
            <DetailRow label="Shoe size" value={data.shoeSize ?? "—"} />
            <DetailRow label="Correspondence address" value={data.address ?? "—"} />
            <DetailRow label="Email address" value={data.email} />
            <DetailRow label="Mobile number" value={data.phone} />
            <DetailRow label="Government ID submitted" value={data.idDocumentType ?? "—"} />
            {data.achievementsAndAwards?.trim() ? (
              <DetailRow label="Achievements & awards" value={data.achievementsAndAwards} />
            ) : null}
          </dl>
        </div>

        <footer className="receipt-footer mt-6 border-t-2 border-slate-300 pt-4 print:mt-3 print:pt-2">
          <p className="text-center text-[10px] font-semibold leading-relaxed text-slate-700">
            This document is system-generated upon successful submission of the official online registration form. Please retain a
            printed or PDF copy for academy records and trial-day verification.
          </p>
          <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-600">
            {paidOnline
              ? `Trial fee of ${amountDisplay} has been received electronically.`
              : `Trial fee of ${amountDisplay} is recorded as ${data.payment.status}; final confirmation is subject to league desk verification.`}
          </p>
          <p className="mt-3 text-center text-[10px] font-bold text-[#1B365D]">
            Enquiries: info@futurestarchampion.com · Future Star U-15 Championship
          </p>
          <p className="mt-4 text-center text-[9px] text-slate-400">
            Document generated {formatSubmittedAt(data.submittedAt)} (IST) · Ref {data.registrationId.slice(0, 8).toUpperCase()}
          </p>
        </footer>
      </div>
    </article>
  );
}
