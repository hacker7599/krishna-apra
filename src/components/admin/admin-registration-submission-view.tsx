"use client";

import type { AdminRegistrationDetail } from "@/lib/admin-registration-detail";
import { TRIAL_FEE_INR } from "@/lib/league";

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

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  const text = value?.trim() ? value : "—";
  return (
    <div className="border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold leading-snug text-slate-900 whitespace-pre-wrap">{text}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1B365D]">
        {title}
      </h3>
      <dl className="px-4">{children}</dl>
    </section>
  );
}

function ProofThumb({
  href,
  label,
  isPdf,
}: {
  href: string;
  label: string;
  isPdf?: boolean;
}) {
  if (isPdf) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[5rem] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs font-bold text-[#1B365D] hover:bg-slate-100"
      >
        {label}
        <span className="mt-1 font-medium text-slate-500">PDF — open in new tab</span>
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">{label}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={href}
        alt={label}
        className="max-h-40 w-full rounded-lg border border-slate-200 object-contain bg-slate-50 transition group-hover:border-orange-300"
      />
      <span className="mt-1 inline-block text-[10px] font-semibold text-orange-700 underline">Open full size</span>
    </a>
  );
}

export function AdminRegistrationSubmissionView({ detail }: { detail: AdminRegistrationDetail }) {
  const paid = detail.paymentStatus === "paid";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Registration reference</p>
          <p className="font-mono text-sm font-bold text-slate-900">{detail.id}</p>
          <p className="mt-1 text-xs font-medium text-slate-600">Submitted {formatSubmittedAt(detail.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
            paid ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" : "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
          }`}
        >
          {detail.paymentStatus ?? "manual"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(200px,240px)_1fr]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Player photo</p>
            {detail.proofs.photo ? (
              <a href={detail.proofs.photo} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detail.proofs.photo}
                  alt={`Photo of ${detail.playerName}`}
                  className="aspect-[4/5] w-full rounded-lg border border-slate-200 object-cover bg-slate-100"
                />
                <span className="mt-2 block text-center text-[10px] font-bold text-orange-700 underline">View full size</span>
              </a>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
                No photo uploaded
              </div>
            )}
          </div>

          {(detail.proofMeta.hasId || detail.proofMeta.hasPayment) && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Uploaded documents</p>
              {detail.proofs.id ? (
                <ProofThumb href={detail.proofs.id} label="Government ID" isPdf={detail.proofMeta.idIsPdf} />
              ) : null}
              {detail.proofs.payment ? <ProofThumb href={detail.proofs.payment} label="Payment proof" /> : null}
            </div>
          )}
        </aside>

        <div className="space-y-4">
          <Section title="1. Academy & player">
            <Field label="Academy / club name" value={detail.academyName} />
            <Field label="Player full name" value={detail.playerName} />
            <Field label="Father / guardian name" value={detail.fatherName} />
            <Field label="Full address" value={detail.address} />
          </Section>

          <Section title="2. Contact & eligibility">
            <Field label="Date of birth" value={formatDob(detail.dateOfBirth)} />
            <Field label="Email" value={detail.email} />
            <Field label="Mobile (10 digits)" value={detail.phone} />
          </Section>

          <Section title="3. Kit sizing">
            <Field label="Jersey (t-shirt) size" value={detail.jerseySize} />
            <Field label="Shoe size" value={detail.shoeSize} />
          </Section>

          <Section title="4. Player details (roles)">
            <Field label="Playing role(s)" value={detail.rolesDisplay} />
          </Section>

          <Section title="5. Trial venue">
            <Field label="Selected trial venue" value={detail.trialZone} />
          </Section>

          {detail.achievementsAndAwards?.trim() ? (
            <Section title="6. Achievements & awards">
              <Field label="Honours & selections" value={detail.achievementsAndAwards} />
            </Section>
          ) : null}

          <Section title="7. Age proof & payment">
            <Field label="Government ID type" value={detail.idDocumentLabel} />
            <Field label="Trial fee (₹)" value={`₹${TRIAL_FEE_INR.toLocaleString("en-IN")}`} />
            <Field label="Payment status" value={detail.paymentStatus} />
            <Field
              label="Payment method"
              value={
                paid
                  ? detail.razorpayPaymentId
                    ? "Razorpay (online)"
                    : detail.proofMeta.hasPayment
                      ? "QR / UPI"
                      : "League desk"
                  : detail.proofMeta.hasPayment
                    ? "QR / UPI — pending"
                    : "Pending"
              }
            />
            {detail.transactionRef ? <Field label="Transaction reference" value={detail.transactionRef} /> : null}
            {detail.feeReceivedDate ? <Field label="Fee received date (desk)" value={detail.feeReceivedDate} /> : null}
            {detail.coachName ? <Field label="Coach name (desk)" value={detail.coachName} /> : null}
          </Section>
        </div>
      </div>
    </div>
  );
}
