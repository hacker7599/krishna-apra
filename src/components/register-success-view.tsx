"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RegistrationSuccessDocument } from "@/components/registration-success-document";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";
import { printRegistrationReceipt } from "@/lib/print-receipt";

export function RegisterSuccessView({ token, minimal }: { token: string; minimal?: boolean }) {
  const [data, setData] = useState<RegistrationConfirmation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/register/confirmation?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof body.error === "string" ? body.error : "Could not load confirmation.");
        }
        return body as RegistrationConfirmation;
      })
      .then((row) => {
        if (!cancelled) setData(row);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load confirmation.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);


  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-rose-900">{error}</p>
        <Link href="/register" className="mt-4 inline-block text-sm font-bold text-orange-600 underline hover:text-orange-700">
          Back to registration
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-sm font-semibold text-slate-600">Loading your confirmation…</p>;
  }

  return (
    <div className="print-document-scope space-y-6">
      {!minimal ? (
        <p className="no-print text-center text-sm font-medium text-slate-600">
          A confirmation email with your print link was sent if MSG91 is configured. Lost the email?{" "}
          <a href="/register/status" className="font-bold text-orange-700 underline hover:text-orange-800">
            Verify with email &amp; OTP
          </a>
        </p>
      ) : null}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={printRegistrationReceipt}
          className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-700"
        >
          Print / save as PDF (A4)
        </button>
        {!minimal ? (
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-slate-800 hover:bg-slate-50"
          >
            Back to home
          </Link>
        ) : null}
      </div>
      <RegistrationSuccessDocument data={data} />
    </div>
  );
}
