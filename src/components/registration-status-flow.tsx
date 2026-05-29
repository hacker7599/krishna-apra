"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BTN_PRIMARY, SITE_CONTAINER } from "@/lib/site-ui";

type LookupResult = {
  playerName: string;
  paymentStatus: string | null;
  paid: boolean;
  pending: boolean;
  registrationCode: string | null;
  paymentCode: string | null;
  summary: string;
};

export function RegistrationStatusFlow({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/registration/status/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          registrationCode: registrationCode.trim(),
        }),
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Could not find your registration.");
        return;
      }
      setResult({
        playerName: String(body.playerName ?? ""),
        paymentStatus: typeof body.paymentStatus === "string" ? body.paymentStatus : null,
        paid: body.paid === true,
        pending: body.pending === true,
        registrationCode: typeof body.registrationCode === "string" ? body.registrationCode : null,
        paymentCode: typeof body.paymentCode === "string" ? body.paymentCode : null,
        summary: typeof body.summary === "string" ? body.summary : "",
      });
    } finally {
      setLoading(false);
    }
  }

  const shell = (
    <div className={embedded ? "mx-auto max-w-md" : `${SITE_CONTAINER} mx-auto max-w-md py-14 sm:py-20`}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!embedded ? (
          <>
            <p className="eyebrow text-orange-700">Registration</p>
            <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-slate-900">
              Check registration status
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Use the email and <strong>registration code</strong> from your confirmation email or printable receipt
              (format FSU15-R-XXXXXX).
            </p>
          </>
        ) : null}

        {!result ? (
          <form onSubmit={(e) => void lookup(e)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="status-email" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Email address
              </label>
              <input
                id="status-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="status-code" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Registration code
              </label>
              <input
                id="status-code"
                type="text"
                required
                autoComplete="off"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="FSU15-R-XXXXXX"
              />
            </div>
            {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
            <button type="submit" disabled={loading} className={`${BTN_PRIMARY} w-full disabled:opacity-60`}>
              {loading ? "Looking up…" : "Check status"}
            </button>
            <p className="text-center text-xs text-slate-600">
              Prefer email OTP?{" "}
              <Link href="/register/status/otp" className="font-bold text-orange-700 underline">
                Verify with one-time code
              </Link>
            </p>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Player</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{result.playerName}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Registration code</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-[#1B365D]">{result.registrationCode ?? "—"}</p>
              {result.paymentCode ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Payment code</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-emerald-800">{result.paymentCode}</p>
                </>
              ) : null}
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Payment status</p>
              <p
                className={`mt-1 text-sm font-bold ${result.paid ? "text-emerald-700" : result.pending ? "text-amber-700" : "text-slate-700"}`}
              >
                {result.paid ? "Fee confirmed" : result.pending ? "Pending verification / payment" : result.paymentStatus ?? "—"}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{result.summary}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/register/receipt")}
              className={`${BTN_PRIMARY} w-full`}
            >
              View printable receipt
            </button>
            {result.pending ? (
              <Link href="/register" className="block text-center text-sm font-bold text-orange-700 underline">
                Return to registration to complete payment
              </Link>
            ) : null}
            <button
              type="button"
              className="w-full text-sm font-bold text-slate-600 underline hover:text-orange-700"
              onClick={() => {
                setResult(null);
                setError("");
              }}
            >
              Look up another registration
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return shell;
}
