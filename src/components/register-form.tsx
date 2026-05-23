"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayerRolePicker } from "@/components/player-role-picker";
import {
  FORMAT,
  PLAYER_AGE_CUTOFF_DATE,
  PLAYER_AGE_MIN_BIRTH_DATE,
  playerDateOfBirthMaxIso,
  TRIAL_FEE_INR,
} from "@/lib/league";
import type { RoleId } from "@/lib/league";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { trialZoneSelectLabel } from "@/lib/trial-zone-options";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";
import {
  digitsOnlyPhoneInput,
  firstRegistrationFormError,
  readRegistrationFormValues,
  validateRegistrationForm,
} from "@/lib/registration-form-validation";
import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import { openRazorpayCheckout } from "@/lib/open-razorpay-checkout";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-semibold text-rose-700" role="alert">
      {message}
    </p>
  );
}

function fieldInputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/25"
      : "border-slate-300 focus:border-orange-500 focus:ring-orange-500/20"
  }`;
}

function cutoffNote() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

type PaymentConfig = {
  enabled: boolean;
  keyId?: string;
  amountPaise?: number;
  amountInr?: number;
  currency?: string;
};

type Props = {
  trialZones: TrialZoneOption[];
};

export function RegisterForm({ trialZones }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [roles, setRoles] = useState<Set<RoleId>>(() => new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "paying" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const rolesJson = useMemo(() => JSON.stringify([...roles]), [roles]);
  const razorpayEnabled = paymentConfig?.enabled === true;

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PaymentConfig) => {
        if (!cancelled) setPaymentConfig(data);
      })
      .catch(() => {
        if (!cancelled) setPaymentConfig({ enabled: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function clearFieldError(name: string) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function setRolesSelection(next: Set<RoleId>) {
    setRoles(next);
    clearFieldError("roles");
  }

  async function checkDuplicateRegistration(email: string, phone: string): Promise<string | null> {
    const res = await fetch("/api/register/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      return typeof data.error === "string" ? data.error : "This email or mobile is already registered.";
    }
    if (!res.ok) {
      return typeof data.error === "string" ? data.error : "Could not verify your details. Please try again.";
    }
    return null;
  }

  async function submitRegistration(fd: FormData) {
    const res = await fetch("/api/register", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      if (res.status === 429 && typeof data.retryAfterSec === "number") {
        setMessage(`Too many attempts. Please try again in ${data.retryAfterSec}s.`);
      } else {
        setMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
      }
      return false;
    }
    if (data.ok) {
      router.push("/register/success");
      return true;
    }
    setStatus("ok");
    setMessage("Registration received. Our team will contact you with trial details.");
    formRef.current?.reset();
    setRoles(new Set());
    setAcceptedTerms(false);
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (roles.size === 0) {
      setStatus("err");
      setMessage("Select at least one player role.");
      return;
    }
    if (razorpayEnabled && !acceptedTerms) {
      setStatus("err");
      setMessage("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    const form = e.currentTarget;
    const values = readRegistrationFormValues(form, roles);
    const errors = validateRegistrationForm(values);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("err");
      setMessage(firstRegistrationFormError(errors) ?? "Please fix the highlighted fields.");
      const firstKey = Object.keys(errors)[0];
      const el =
        firstKey === "roles"
          ? form.querySelector("fieldset")
          : form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors({});

    const fd = new FormData(form);
    fd.set("roles", rolesJson);
    fd.set("phone", digitsOnlyPhoneInput(values.phone));
    fd.set("email", values.email.trim().toLowerCase());

    setStatus("loading");
    setMessage("");

    const dupError = await checkDuplicateRegistration(values.email.trim().toLowerCase(), digitsOnlyPhoneInput(values.phone));
    if (dupError) {
      setStatus("err");
      setMessage(dupError);
      return;
    }

    if (!razorpayEnabled) {
      try {
        await submitRegistration(fd);
      } catch {
        setStatus("err");
        setMessage("Network error. Please try again.");
      }
      return;
    }

    setStatus("paying");
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: String(fd.get("playerName") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
        }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        setStatus("err");
        setMessage(typeof orderData.error === "string" ? orderData.error : "Could not start payment.");
        return;
      }

      await openRazorpayCheckout({
        keyId: orderData.keyId as string,
        orderId: orderData.orderId as string,
        amount: orderData.amount as number,
        currency: (orderData.currency as string) || "INR",
        name: (orderData.name as string) || "Future Star U-15",
        description: `Trial registration fee — ₹${TRIAL_FEE_INR.toLocaleString("en-IN")}`,
        prefill: {
          name: String(fd.get("playerName") ?? ""),
          email: String(fd.get("email") ?? ""),
          contact: String(fd.get("phone") ?? ""),
        },
        onSuccess: async (response) => {
          fd.set("razorpayOrderId", response.razorpay_order_id);
          fd.set("razorpayPaymentId", response.razorpay_payment_id);
          fd.set("razorpaySignature", response.razorpay_signature);
          setStatus("loading");
          setMessage("Payment received. Saving registration…");
          await submitRegistration(fd);
        },
        onDismiss: () => {
          setStatus("err");
          setMessage("Payment was not completed. Your registration was not submitted.");
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "PAYMENT_DISMISSED") {
        return;
      }
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Payment could not be completed. Please try again.");
    }
  }

  const submitLabel =
    status === "loading"
      ? "Submitting…"
      : status === "paying"
        ? "Opening payment…"
        : razorpayEnabled
          ? `Pay ₹${TRIAL_FEE_INR.toLocaleString("en-IN")} & submit`
          : "Submit registration";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card-elevated w-full space-y-8 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900 sm:text-4xl">
            Trial registration
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {FORMAT.category} · {FORMAT.overs}-over T20 · {FORMAT.teams} teams · Outer Delhi Warriors initiative
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Trial fee</p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-slate-900">₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-600">Includes jersey (per printed form)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Name of the academy / club</span>
          <input
            name="academyName"
            required
            minLength={2}
            maxLength={200}
            autoComplete="organization"
            className={fieldInputClass(!!fieldErrors.academyName)}
            placeholder="e.g. Delhi Cricket Academy"
            onInput={() => clearFieldError("academyName")}
          />
          <FieldError message={fieldErrors.academyName} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Name of the player</span>
          <input
            name="playerName"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={fieldInputClass(!!fieldErrors.playerName)}
            placeholder="Full name as on ID"
            onInput={() => clearFieldError("playerName")}
          />
          <FieldError message={fieldErrors.playerName} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Father / guardian name</span>
          <input
            name="fatherName"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={fieldInputClass(!!fieldErrors.fatherName)}
            placeholder="As on government ID where applicable"
            onInput={() => clearFieldError("fatherName")}
          />
          <FieldError message={fieldErrors.fatherName} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Address</span>
          <textarea
            name="address"
            required
            minLength={10}
            maxLength={600}
            rows={3}
            autoComplete="street-address"
            className={fieldInputClass(!!fieldErrors.address)}
            placeholder="Full postal address for correspondence"
            onInput={() => clearFieldError("address")}
          />
          <FieldError message={fieldErrors.address} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Player date of birth</span>
          <input
            name="dateOfBirth"
            type="date"
            required
            min={PLAYER_AGE_MIN_BIRTH_DATE}
            max={playerDateOfBirthMaxIso()}
            className={fieldInputClass(!!fieldErrors.dateOfBirth)}
            onChange={() => clearFieldError("dateOfBirth")}
          />
          <FieldError message={fieldErrors.dateOfBirth} />
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
            Age cut-off per trial form: players must be born <span className="font-bold text-slate-900">after {cutoffNote()}</span> (any later year is
            allowed). Dates on or before that day are not accepted.
            Accepted age proof: Aadhaar, passport (3-year validity), or birth certificate — upload one below.
          </p>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Contact number</span>
          <input
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            title="Enter 10 digits only (no letters or spaces)"
            className={fieldInputClass(!!fieldErrors.phone)}
            placeholder="10-digit mobile"
            onInput={(e) => {
              e.currentTarget.value = digitsOnlyPhoneInput(e.currentTarget.value);
              clearFieldError("phone");
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey) return;
              const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
              if (allowed.includes(e.key)) return;
              if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              e.currentTarget.value = digitsOnlyPhoneInput(pasted);
              clearFieldError("phone");
            }}
          />
          <FieldError message={fieldErrors.phone} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={fieldInputClass(!!fieldErrors.email)}
            placeholder="you@example.com"
            onInput={() => clearFieldError("email")}
          />
          <FieldError message={fieldErrors.email} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Jersey (t-shirt) size</span>
          <select
            name="jerseySize"
            required
            className={fieldInputClass(!!fieldErrors.jerseySize)}
            defaultValue=""
            onChange={() => clearFieldError("jerseySize")}
          >
            <option value="" disabled>
              Select size
            </option>
            {JERSEY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.jerseySize} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Shoe size</span>
          <input
            name="shoeSize"
            required
            maxLength={24}
            className={fieldInputClass(!!fieldErrors.shoeSize)}
            placeholder="e.g. UK 5 / EU 38"
            onInput={() => clearFieldError("shoeSize")}
          />
          <FieldError message={fieldErrors.shoeSize} />
        </label>
      </div>

      <PlayerRolePicker roles={roles} onChange={setRolesSelection} hasError={!!fieldErrors.roles} />
      <FieldError message={fieldErrors.roles} />
      {roles.size === 0 && !fieldErrors.roles ? (
        <p className="-mt-2 text-sm font-semibold text-slate-700">Select at least one role.</p>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Preferred trial zone</span>
        <select
          name="trialZoneId"
          required
          defaultValue=""
          disabled={trialZones.length === 0}
          className={fieldInputClass(!!fieldErrors.trialZoneId)}
          onChange={() => clearFieldError("trialZoneId")}
        >
          <option value="" disabled>
            {trialZones.length === 0 ? "No trial zones available — contact the league desk" : "Select trial zone"}
          </option>
          {trialZones.map((z) => (
            <option key={z.id} value={z.id}>
              {trialZoneSelectLabel(z)}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors.trialZoneId} />
        <p className="mt-1.5 text-xs font-medium text-slate-600">Choose where you plan to attend trials. Venues are managed by the league and shown on the Trials page.</p>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">
          Achievements &amp; awards <span className="font-semibold normal-case text-slate-500">(optional)</span>
        </span>
        <textarea
          name="achievementsAndAwards"
          rows={4}
          maxLength={2000}
          className={fieldInputClass(!!fieldErrors.achievementsAndAwards)}
          placeholder="e.g. District U-14 best batter 2024, school tournament MVP, academy player of the year…"
          onInput={() => clearFieldError("achievementsAndAwards")}
        />
        <FieldError message={fieldErrors.achievementsAndAwards} />
        <p className="mt-1.5 text-xs font-medium text-slate-600">List cricket honours, selections, and awards — helps scouts review your profile.</p>
      </label>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-sm font-bold text-slate-900">Government ID proof (required)</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
          Upload a clear scan or photo of one document: Aadhaar card, passport (minimum 3-year validity), or birth certificate.
        </p>
        <label className="mt-4 block max-w-md">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Document type</span>
          <select
            name="idDocumentType"
            required
            className={fieldInputClass(!!fieldErrors.idDocumentType)}
            defaultValue=""
            onChange={() => clearFieldError("idDocumentType")}
          >
            <option value="" disabled>
              Select document
            </option>
            {ID_DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ID_DOCUMENT_LABELS[t]}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.idDocumentType} />
        </label>
        <label className="mt-3 block max-w-md">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Upload ID proof</span>
          <input
            name="idProof"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className={`w-full text-sm font-medium text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white ${
              fieldErrors.idProof ? "rounded-lg ring-2 ring-rose-500/40" : ""
            }`}
            onChange={() => clearFieldError("idProof")}
          />
          <ImageUploadSizeHint specKey="registrationIdScan" />
          <FieldError message={fieldErrors.idProof} />
        </label>
      </div>

      {razorpayEnabled ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm font-bold text-slate-900">Online payment (Razorpay)</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
            When you submit, you will pay the trial fee of ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} securely via Razorpay (UPI, cards, netbanking).
            Registration is saved only after successful payment.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">Payment</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
            Pay the trial fee via your club coordinator or the official UPI / QR from the league desk. You may add a transaction reference and upload
            proof (screenshot) for faster verification.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Transaction reference (optional)</span>
            <input
              name="transactionRef"
              maxLength={120}
              className={fieldInputClass(!!fieldErrors.transactionRef)}
              placeholder="UPI ref / bank ref"
              onInput={() => clearFieldError("transactionRef")}
            />
            <FieldError message={fieldErrors.transactionRef} />
          </label>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Payment proof (optional)</span>
            <input
              name="paymentProof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={`w-full text-sm font-medium text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white ${
                fieldErrors.paymentProof ? "rounded-lg ring-2 ring-rose-500/40" : ""
              }`}
              onChange={() => clearFieldError("paymentProof")}
            />
            <ImageUploadSizeHint specKey="registrationPaymentProof" />
            <FieldError message={fieldErrors.paymentProof} />
          </label>
        </div>
      )}

      {razorpayEnabled && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm font-medium leading-relaxed text-slate-700">
            I agree to the{" "}
            <Link href="/terms" className="font-bold text-orange-600 underline hover:text-orange-700" target="_blank">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-orange-600 underline hover:text-orange-700" target="_blank">
              Privacy Policy
            </Link>
            , and authorise payment of the trial registration fee.
          </span>
        </label>
      )}

      {status !== "idle" && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
            status === "ok" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading" || status === "paying" || roles.size === 0 || (razorpayEnabled && !acceptedTerms)}
        className="w-full rounded-lg bg-orange-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}