import { FORMAT, LEAGUE_NAME, LEAGUE_SUBTITLE, PLAYER_AGE_CUTOFF_DATE, ROLE_OPTIONS, SEASON_START, TAGLINE, TITLE_SPONSOR, TRIAL_FEE_INR, VENUE } from "@/lib/league";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";

function cutoffDisplay() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function FieldLine({ label }: { label: string }) {
  return (
    <div className="border-b-2 border-slate-900 py-1 print:border-black">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-800 print:text-[10px]">{label}</span>
      <div className="mt-5 min-h-[1.1rem] print:mt-4" />
    </div>
  );
}

export function OfflineTrialFormDocument() {
  return (
    <div className="a4-form-sheet box-border w-full max-w-[210mm] border border-slate-300 bg-white p-5 text-slate-900 shadow-sm sm:p-7 print:max-w-none print:border-0 print:p-0 print:shadow-none">
      <header className="border-b-2 border-slate-900 pb-3 print:border-black print:pb-2">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between print:flex-row print:gap-2 print:items-start">
          <div className="flex shrink-0 justify-center sm:justify-start">
            {/* Replace with /branding/outer-delhi-warriors.png when you have the official mark */}
            <img
              src="/branding/outer-delhi-warriors.svg"
              alt="Outer Delhi Warriors"
              width={140}
              height={84}
              className="h-16 w-auto object-contain sm:h-[4.75rem] print:h-[18mm] print:w-auto"
            />
          </div>
          <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600 print:text-[8px]">
              An Outer Delhi Warriors initiative (DPL franchise)
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl uppercase leading-none tracking-wide text-slate-900 sm:text-3xl print:text-[22pt]">
              Future Star U-15 Cricket Tournament
            </h1>
            <p className="mt-1 text-xs font-bold text-orange-700 print:text-[10px]">Title sponsor · {TITLE_SPONSOR}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-700 print:text-[9px]">
              {LEAGUE_NAME} · {LEAGUE_SUBTITLE}
            </p>
            <p className="mt-0.5 text-[10px] font-medium italic text-slate-600 print:text-[8px]">&ldquo;{TAGLINE}&rdquo;</p>
          </div>
          <div className="flex shrink-0 justify-center sm:justify-end">
            <img
              src="/branding/logo.png"
              alt="Future Star U15 league logo"
              width={112}
              height={112}
              className="h-16 w-16 object-contain sm:h-[4.75rem] sm:w-[4.75rem] print:h-[20mm] print:w-[20mm]"
            />
          </div>
        </div>
      </header>

      <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-slate-800 print:mt-3 print:text-[10px]">
        Registration form (offline) · Season 1
      </p>
      <p className="mt-1 text-center text-[10px] font-medium leading-snug text-slate-600 print:text-[9px]">
        Submit completed form and fee at the league / academy desk as directed. Trial fee includes jersey. Formatted for A4 (210 × 297 mm).
      </p>

      <div className="mt-5 space-y-3 print:mt-4 print:space-y-2.5">
        <FieldLine label="Name of the academy / club" />
        <FieldLine label="Name of the player (as on government ID)" />
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          <FieldLine label="Player date of birth (DD/MM/YYYY)" />
          <div className="border-b-2 border-slate-900 py-1 print:border-black">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-800 print:text-[10px]">Receiving registration fee</span>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-600 print:text-[9px]">
              Amount: ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} (incl. t-shirt)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-slate-700 print:mt-2">
              <span>Date received:</span>
              <div className="border-b border-slate-500 print:border-black" />
            </div>
          </div>
        </div>
        <FieldLine label="Full postal address" />
        <FieldLine label="Father / guardian name" />
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          <FieldLine label="Email ID" />
          <FieldLine label="Phone number" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          <div className="border-b-2 border-slate-900 py-1 print:border-black">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-800 print:text-[10px]">Jersey (t-shirt) size</span>
            <p className="mt-0.5 text-[9px] leading-snug text-slate-600 print:text-[8px]">Circle one: {JERSEY_SIZES.join(" · ")}</p>
            <div className="mt-5 min-h-[1.1rem] print:mt-4" />
          </div>
          <FieldLine label="Shoe size (e.g. UK / EU)" />
        </div>
      </div>

      <section className="print-form-section mt-5 border-2 border-slate-900 p-2.5 print:mt-4 print:border-black print:p-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900 print:text-[10px]">Player details (tick all that apply)</p>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm font-semibold sm:grid-cols-3 print:grid-cols-3 print:text-xs">
          {ROLE_OPTIONS.map((r) => (
            <label key={r.id} className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 shrink-0 border-2 border-slate-900 print:border-black" aria-hidden />
              {r.label}
            </label>
          ))}
        </div>
      </section>

      <section className="print-form-section mt-4 border-2 border-slate-900 p-2.5 print:mt-3 print:border-black print:p-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900 print:text-[10px]">Government ID (one compulsory copy attached)</p>
        <p className="mt-1 text-[10px] font-medium leading-snug text-slate-700 print:text-[9px]">
          Age cut-off: players born after <strong>{cutoffDisplay()}</strong> are not eligible. Accepted proof: Aadhaar card, passport (minimum 3-year
          validity), or birth certificate.
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase text-slate-800 print:text-[9px]">Tick document attached</p>
        <div className="mt-1.5 space-y-1 text-sm font-semibold print:text-xs">
          {ID_DOCUMENT_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 shrink-0 border-2 border-slate-900 print:border-black" aria-hidden />
              {ID_DOCUMENT_LABELS[t]}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-medium text-slate-600 print:mt-2 print:text-[9px]">
          Attach clear photocopy / printout of the selected ID to this form.
        </p>
      </section>

      <section className="print-form-section mt-4 space-y-2 border-2 border-dashed border-slate-400 p-2.5 print:mt-3 print:p-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900 print:text-[10px]">Payment (office / coordinator)</p>
        <div className="border-b border-slate-700 py-0.5 text-[10px] font-semibold text-slate-700 print:border-black print:text-[9px]">
          <span>Transaction reference / receipt no. (if paid digitally)</span>
          <div className="mt-4 min-h-[1rem] print:mt-3" />
        </div>
        <p className="text-[10px] text-slate-600 print:text-[9px]">Attach payment slip / screenshot if applicable.</p>
      </section>

      <div className="print-form-section mt-6 grid gap-4 border-t-2 border-slate-900 pt-3 sm:grid-cols-2 print:mt-5 print:grid-cols-2 print:border-black print:pt-2">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-800 print:text-[10px]">Coach sign / stamp</p>
          <div className="mt-8 min-h-[2rem] border-b border-slate-700 print:mt-6 print:border-black" />
          <p className="mt-0.5 text-[9px] text-slate-500 print:text-[8px]">Name & signature</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-800 print:text-[10px]">Parent / guardian sign</p>
          <div className="mt-8 min-h-[2rem] border-b border-slate-700 print:mt-6 print:border-black" />
          <p className="mt-0.5 text-[9px] text-slate-500 print:text-[8px]">Date</p>
        </div>
      </div>

      <footer className="mt-6 border-t border-slate-300 pt-3 text-[10px] font-medium leading-snug text-slate-600 print:mt-5 print:border-black print:pt-2 print:text-[9px]">
        <p>
          <strong className="text-slate-800">Format:</strong> {FORMAT.category} · {FORMAT.overs}-over T20 · {FORMAT.teams} teams · Season window ·{" "}
          {SEASON_START}
        </p>
        <p className="mt-1">
          <strong className="text-slate-800">Primary venue:</strong> {VENUE}
        </p>
        <p className="mt-2 text-center text-[9px] text-slate-500 print:text-[8px]">
          Future Star U-15 · Offline registration · Print or save as PDF (A4 recommended).
        </p>
      </footer>
    </div>
  );
}
