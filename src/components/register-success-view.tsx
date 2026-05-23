"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RegistrationSuccessDocument } from "@/components/registration-success-document";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";
import { printRegistrationReceipt } from "@/lib/print-receipt";

type Props = {
  /** Optional: email links still pass ?token=; fresh registrations use HttpOnly cookie instead. */
  token?: string;
  minimal?: boolean;
};

export function RegisterSuccessView({ token, minimal }: Props) {
  const [data, setData] = useState<RegistrationConfirmation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const url = token
      ? `/api/register/confirmation?token=${encodeURIComponent(token)}`
      : "/api/register/confirmation";

    void fetch(url, { credentials: "include" })
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
        <Link href="/register/status" className="mt-3 block text-sm font-bold text-orange-600 underline hover:text-orange-700">
          Check status with email OTP
        </Link>
        <Link href="/register" className="mt-2 block text-sm font-bold text-slate-600 underline hover:text-slate-800">
          Back to registration
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-sm font-semibold text-slate-600">Loading your confirmation…</p>;
  }

  return (
    <div className={minimal ? "" : "space-y-6"}>
      {!minimal ? (
        <div className="print-only-hide flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => printRegistrationReceipt()}
            className="rounded-lg bg-[#1B365D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#152a4a]"
          >
            Print / Save PDF
          </button>
          <Link
            href="/register/status"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Check status later
          </Link>
        </div>
      ) : null}
      <RegistrationSuccessDocument data={data} />
    </div>
  );
}
