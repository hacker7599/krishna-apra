"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BTN_PRIMARY, SITE_CONTAINER } from "@/lib/site-ui";

type Step = "email" | "otp";

export function RegistrationStatusOtpFlow({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/registration/status/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Could not send code.");
        return;
      }
      setMaskedEmail(typeof body.maskedEmail === "string" ? body.maskedEmail : email);
      setStep("otp");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/registration/status/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Verification failed.");
        return;
      }
      router.push("/register/receipt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={embedded ? "mx-auto max-w-md" : `${SITE_CONTAINER} mx-auto max-w-md py-14 sm:py-20`}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!embedded ? (
          <>
            <p className="eyebrow text-orange-700">Registration</p>
            <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-slate-900">
              Verify by email code
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              We will send a one-time code to the email used at registration.
            </p>
          </>
        ) : null}

        {step === "email" ? (
          <form onSubmit={(e) => void requestOtp(e)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="otp-status-email" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Email address
              </label>
              <input
                id="otp-status-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
            <button type="submit" disabled={loading} className={`${BTN_PRIMARY} w-full disabled:opacity-60`}>
              {loading ? "Sending…" : "Send verification code"}
            </button>
            <p className="text-center text-xs text-slate-600">
              Have your registration code?{" "}
              <Link href="/register/status" className="font-bold text-orange-700 underline">
                Check with email + code
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={(e) => void verifyOtp(e)} className="mt-6 space-y-4">
            <p className="text-sm font-medium text-slate-600">
              Code sent to <span className="font-bold text-slate-900">{maskedEmail}</span>
            </p>
            <div>
              <label htmlFor="status-otp" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                6-digit code
              </label>
              <input
                id="status-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
            <button type="submit" disabled={loading || otp.length !== 6} className={`${BTN_PRIMARY} w-full disabled:opacity-60`}>
              {loading ? "Verifying…" : "View my registration receipt"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
