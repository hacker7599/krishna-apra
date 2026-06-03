"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SupportContactLinks } from "@/components/support-contact-links";
import { openRazorpayCheckout } from "@/lib/open-razorpay-checkout";
import { humanErrorFromResponse } from "@/lib/human-errors";
import { TRIAL_FEE_INR } from "@/lib/league";
import type { PublicPaymentConfig } from "@/lib/public-payment-config";
import { CARD } from "@/lib/site-ui";

type RegistrationSummary = {
  id: string;
  playerName: string;
  academyName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  roles: string[];
  trialZone: { trialPlace: string; zone: string } | null;
  registrationCode: string | null;
  jerseySize: string | null;
  fatherName: string | null;
};

type Props = {
  token: string;
  initialPaymentConfig: PublicPaymentConfig;
};

function successPath(emailSent: boolean) {
  return emailSent ? "/register/success" : "/register/success?emailSent=0";
}

export function RegisterPaymentResume({ token, initialPaymentConfig }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState<RegistrationSummary | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "paying" | "loading" | "err">("idle");
  const [message, setMessage] = useState("");
  const [paymentConfig, setPaymentConfig] = useState(initialPaymentConfig);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/register/payment-invite?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "This payment link is invalid.");
      setRegistration(null);
      setLoading(false);
      return;
    }
    setRegistration(data.registration as RegistrationSummary);
    setExpiresAt(typeof data.expiresAt === "string" ? data.expiresAt : null);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PublicPaymentConfig & { enabled?: boolean }) => {
        if (cancelled) return;
        setPaymentConfig({
          paymentMode: data.paymentMode === "qr_upload" ? "qr_upload" : "razorpay",
          razorpayEnabled: data.enabled === true,
          keyId: data.keyId,
          amountPaise: data.amountPaise,
          amountInr: data.amountInr ?? initialPaymentConfig.amountInr,
          currency: data.currency ?? "INR",
          qrImageUrl: data.qrImageUrl ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setPaymentConfig(initialPaymentConfig);
      });
    return () => {
      cancelled = true;
    };
  }, [initialPaymentConfig]);

  async function confirmPayment(registrationId: string, proof: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }) {
    const res = await fetch("/api/register/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        registrationId,
        razorpayOrderId: proof.razorpay_order_id,
        razorpayPaymentId: proof.razorpay_payment_id,
        razorpaySignature: proof.razorpay_signature,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMessage(humanErrorFromResponse(data, "Payment received but confirmation failed. Contact the league desk."));
      return;
    }
    router.push(successPath(data.emailSent !== false));
  }

  async function startPayment() {
    if (!registration) return;
    if (!paymentConfig.razorpayEnabled) {
      setStatus("err");
      setMessage("Online payment is not available right now. Please contact the league desk.");
      return;
    }

    setStatus("loading");
    setMessage("Opening secure checkout…");

    const prepareRes = await fetch("/api/register/payment-invite/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });
    const prepareData = await prepareRes.json().catch(() => ({}));
    if (!prepareRes.ok) {
      setStatus("err");
      setMessage(humanErrorFromResponse(prepareData, "Could not start payment. Please try again."));
      return;
    }

    const registrationId = String(prepareData.registrationId ?? registration.id);
    setStatus("paying");

    try {
      await openRazorpayCheckout({
        keyId: prepareData.keyId as string,
        orderId: prepareData.orderId as string,
        amount: prepareData.amount as number,
        currency: (prepareData.currency as string) || "INR",
        name: (prepareData.name as string) || "Future Star U-15",
        description: `Trial registration fee — ₹${TRIAL_FEE_INR.toLocaleString("en-IN")}`,
        prefill: {
          name: registration.playerName,
          email: registration.email,
          contact: registration.phone,
        },
        onSuccess: async (response) => {
          setStatus("loading");
          setMessage("Payment successful. Confirming…");
          await confirmPayment(registrationId, response);
        },
        onDismiss: () => {
          setStatus("err");
          setMessage("Payment was not completed. Tap Pay again when you're ready.");
        },
      });
    } catch {
      setStatus("err");
      setMessage("Could not open the payment window. Check your connection and try again.");
    }
  }

  if (loading) {
    return <p className="text-sm font-medium text-slate-600">Loading your registration…</p>;
  }

  if (error || !registration) {
    return (
      <div className={`${CARD} space-y-4 p-6`}>
        <p className="text-sm font-semibold text-rose-800">{error || "This link is invalid."}</p>
        <RegisterPaymentPhoneLookup embedded />
      </div>
    );
  }

  const venue = registration.trialZone
    ? `${registration.trialZone.trialPlace} · ${registration.trialZone.zone}`
    : "Trial zone on file";

  return (
    <div className="space-y-6">
      <div className={`${CARD} overflow-hidden border-2 border-[#1B365D]/10`}>
        <div className="bg-gradient-to-br from-[#0c1f3d] via-[#1a3358] to-[#0c1f3d] px-6 py-8 text-center text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Secure payment</p>
          <h2 className="mt-2 font-display text-2xl font-black italic uppercase tracking-tight sm:text-3xl">
            You&apos;re almost in!
          </h2>
          <p className="mt-2 text-sm text-white/80">Complete payment to lock your trial spot</p>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Player</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{registration.playerName}</p>
              <p className="text-sm text-slate-600">{registration.academyName}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trial fee</p>
              <p className="mt-1 text-3xl font-black text-orange-600">
                ₹{TRIAL_FEE_INR.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <dl className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-500">Trial zone</dt>
              <dd className="font-semibold text-slate-900">{venue}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-500">Mobile</dt>
              <dd className="font-semibold text-slate-900">{registration.phone}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-500">Email</dt>
              <dd className="font-semibold text-slate-900">{registration.email}</dd>
            </div>
            {registration.registrationCode ? (
              <div>
                <dt className="text-[10px] font-bold uppercase text-slate-500">Registration code</dt>
                <dd className="font-mono font-bold text-slate-900">{registration.registrationCode}</dd>
              </div>
            ) : null}
          </dl>
          {expiresAt ? (
            <p className="text-center text-xs font-medium text-slate-500">
              This link expires {new Date(expiresAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
            </p>
          ) : null}
          {message ? (
            <p
              className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                status === "err" ? "border border-rose-200 bg-rose-50 text-rose-900" : "border border-sky-200 bg-sky-50 text-sky-950"
              }`}
            >
              {message}
            </p>
          ) : null}
          <button
            type="button"
            disabled={status === "loading" || status === "paying"}
            onClick={() => void startPayment()}
            className="register-form-submit w-full !py-4 text-base"
          >
            {status === "loading" || status === "paying" ? "Please wait…" : `Pay ₹${TRIAL_FEE_INR.toLocaleString("en-IN")} now`}
          </button>
          <p className="text-center text-xs text-slate-500">
            Your saved form details will be used — no need to fill the form again.
          </p>
        </div>
      </div>
      <p className="text-center text-sm text-slate-600">
        Need help? <SupportContactLinks linkClassName="font-bold text-orange-700 underline" />
      </p>
    </div>
  );
}

export function RegisterPaymentPhoneLookup({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const res = await fetch("/api/register/payment-invite/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMessage(humanErrorFromResponse(data, "We could not find a pending registration for this number."));
      return;
    }
    const url = typeof data.paymentUrl === "string" ? data.paymentUrl : "";
    if (url) {
      try {
        const u = new URL(url, window.location.origin);
        router.push(`${u.pathname}${u.search}`);
      } catch {
        setStatus("err");
        setMessage("Could not open your payment page. Please try again.");
      }
    }
  }

  const inner = (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {!embedded ? (
        <>
          <h2 className="font-display text-xl font-bold text-slate-900">Continue with your mobile number</h2>
          <p className="text-sm text-slate-600">
            Enter the same mobile number you used when registering. We&apos;ll open your secure payment page.
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-slate-700">Or enter your registered mobile number:</p>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Mobile number</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-900"
          required
        />
      </label>
      {message ? <p className="text-sm font-semibold text-rose-800">{message}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-[#1B365D] px-4 py-3 text-sm font-bold text-white hover:bg-[#152a4a] disabled:opacity-60"
      >
        {status === "loading" ? "Looking up…" : "Continue to payment"}
      </button>
    </form>
  );

  if (embedded) return inner;
  return <div className={`${CARD} p-6 sm:p-8`}>{inner}</div>;
}
