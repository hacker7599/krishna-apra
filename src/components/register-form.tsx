"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayerRolePicker } from "@/components/player-role-picker";
import { RegisterFormField, RegisterFormSection, registerInputClass } from "@/components/register-form-ui";
import { TrialVenuePicker } from "@/components/trial-venue-picker";
import {
  FORMAT,
  PLAYER_AGE_CUTOFF_DATE,
  PLAYER_AGE_MIN_BIRTH_DATE,
  playerDateOfBirthMaxIso,
  TRIAL_FEE_INR,
} from "@/lib/league";
import type { RoleId } from "@/lib/league";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";
import {
  digitsOnlyPhoneInput,
  firstRegistrationFormError,
  readRegistrationFormValues,
  validateRegistrationForm,
} from "@/lib/registration-form-validation";
import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import { openRazorpayCheckout } from "@/lib/open-razorpay-checkout";
import { humanErrorFromResponse } from "@/lib/human-errors";

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
  const [trialZoneId, setTrialZoneId] = useState("");
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
      return humanErrorFromResponse(
        data,
        "This email or mobile number is already registered. Use a different contact or check your registration status.",
      );
    }
    if (!res.ok) {
      return humanErrorFromResponse(data, "We could not verify your details right now. Please try again in a moment.");
    }
    return null;
  }

  async function confirmPayment(registrationId: string, proof: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
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
      if (res.status === 429 && typeof data.retryAfterSec === "number") {
        setMessage(`Too many attempts. Please wait ${data.retryAfterSec} seconds and try again.`);
      } else {
        setMessage(
          humanErrorFromResponse(
            data,
            "Payment was received but we could not confirm your registration. Your details are saved — try again or contact the league desk.",
          ),
        );
      }
      return false;
    }
    if (data.ok) {
      router.push("/register/success");
      return true;
    }
    setStatus("err");
    setMessage("Registration could not be completed. Please contact the league desk.");
    return false;
  }

  async function submitRegistration(fd: FormData) {
    const res = await fetch("/api/register", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      if (res.status === 429 && typeof data.retryAfterSec === "number") {
        setMessage(`Too many attempts. Please wait ${data.retryAfterSec} seconds and try again.`);
      } else {
        const fallback = razorpayEnabled
          ? "Your payment was received but we could not save your registration. No account was created — please try again or contact the league desk with your payment reference."
          : "We could not save your registration. Please try again or contact the league desk.";
        setMessage(humanErrorFromResponse(data, fallback));
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
    setTrialZoneId("");
    setAcceptedTerms(false);
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (roles.size === 0) {
      setStatus("err");
      setMessage("Please select at least one playing role (batter, bowler, all-rounder, or wicketkeeper).");
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
      setMessage(
        firstRegistrationFormError(errors) ?? "Please check the form — some required fields are missing or incorrect.",
      );
      const firstKey = Object.keys(errors)[0];
      const el =
        firstKey === "roles"
          ? form.querySelector("[role='group']")
          : firstKey === "trialZoneId"
            ? form.querySelector(".trial-venue-picker")
            : form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors({});

    const fd = new FormData(form);
    fd.set("roles", rolesJson);
    fd.set("trialZoneId", trialZoneId);
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
        setMessage("Your internet connection may be down. Check your network and submit again.");
      }
      return;
    }

    setStatus("loading");
    setMessage("Saving your details securely…");

    try {
      const prepareRes = await fetch("/api/register/prepare", { method: "POST", body: fd, credentials: "include" });
      const prepareData = await prepareRes.json().catch(() => ({}));
      if (!prepareRes.ok) {
        setStatus("err");
        setMessage(
          humanErrorFromResponse(prepareData, "We could not save your registration. Check the form and try again."),
        );
        return;
      }

      const registrationId = String(prepareData.registrationId ?? "");
      if (!registrationId) {
        setStatus("err");
        setMessage("We could not save your registration. Please try again.");
        return;
      }

      setStatus("paying");
      setMessage("Details saved. Opening secure payment…");

      await openRazorpayCheckout({
        keyId: prepareData.keyId as string,
        orderId: prepareData.orderId as string,
        amount: prepareData.amount as number,
        currency: (prepareData.currency as string) || "INR",
        name: (prepareData.name as string) || "Future Star U-15",
        description: `Trial registration fee — ₹${TRIAL_FEE_INR.toLocaleString("en-IN")}`,
        prefill: {
          name: String(fd.get("playerName") ?? ""),
          email: String(fd.get("email") ?? ""),
          contact: String(fd.get("phone") ?? ""),
        },
        onSuccess: async (response) => {
          const orderId = response.razorpay_order_id?.trim();
          const paymentId = response.razorpay_payment_id?.trim();
          const signature = response.razorpay_signature?.trim();
          if (!orderId || !paymentId || !signature) {
            setStatus("err");
            setMessage(
              "Payment could not be verified. Your form is saved — try payment again or contact the league desk.",
            );
            return;
          }
          setStatus("loading");
          setMessage("Payment successful. Confirming your registration…");
          await confirmPayment(registrationId, response);
        },
        onDismiss: () => {
          setStatus("err");
          setMessage(
            "Payment was cancelled. Your details are saved on our server — you can submit the form again to retry payment.",
          );
        },
        onPaymentFailed: () => {
          setStatus("err");
          setMessage(
            "Payment failed. Your details are saved — fix your payment method and submit the form again to retry.",
          );
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "PAYMENT_DISMISSED") {
        return;
      }
      if (err instanceof Error && err.message === "PAYMENT_FAILED") {
        return;
      }
      setStatus("err");
      setMessage("Payment could not be completed. Your details may already be saved — try submitting again.");
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

  const fileInputClass = (hasError: boolean) =>
    `register-form-file-input${hasError ? " register-form-file-input--error" : ""}`;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="register-form-shell w-full">
      <div className="register-form-shell__bar">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Official trial registration</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {FORMAT.category} · {FORMAT.overs}-over T20 · {FORMAT.teams} franchises
          </p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-orange-800">Trial fee</p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl leading-none text-slate-900">₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</p>
          <p className="text-[10px] font-semibold text-slate-600">Includes jersey</p>
        </div>
      </div>

      <div className="register-form-shell__body space-y-0">
        <RegisterFormSection number="1" title="Academy & player" description="Details as they appear on your academy records and government ID.">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Academy / club name" error={fieldErrors.academyName} className="register-form-field--wide">
              <input
                name="academyName"
                required
                minLength={2}
                maxLength={200}
                autoComplete="organization"
                className={registerInputClass(!!fieldErrors.academyName)}
                placeholder="e.g. Delhi Cricket Academy"
                onInput={() => clearFieldError("academyName")}
              />
            </RegisterFormField>
            <RegisterFormField label="Player full name" error={fieldErrors.playerName} className="register-form-field--wide">
              <input
                name="playerName"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                className={registerInputClass(!!fieldErrors.playerName)}
                placeholder="As on ID"
                onInput={() => clearFieldError("playerName")}
              />
            </RegisterFormField>
            <RegisterFormField label="Player photo" error={fieldErrors.playerPhoto} className="register-form-field--wide">
              <input
                name="playerPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className={fileInputClass(!!fieldErrors.playerPhoto)}
                onChange={() => clearFieldError("playerPhoto")}
              />
              <ImageUploadSizeHint specKey="registrationPlayerPhoto" className="register-form-field__hint !mt-2" />
            </RegisterFormField>
            <RegisterFormField label="Father / guardian name" error={fieldErrors.fatherName} className="register-form-field--wide">
              <input
                name="fatherName"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                className={registerInputClass(!!fieldErrors.fatherName)}
                onInput={() => clearFieldError("fatherName")}
              />
            </RegisterFormField>
            <RegisterFormField label="Full address" error={fieldErrors.address} className="register-form-field--wide">
              <textarea
                name="address"
                required
                minLength={10}
                maxLength={600}
                rows={3}
                autoComplete="street-address"
                className={registerInputClass(!!fieldErrors.address)}
                placeholder="Postal address for correspondence"
                onInput={() => clearFieldError("address")}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="2" title="Contact & eligibility" description="We use these details for trial confirmation and duplicate checks.">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField
              label="Date of birth"
              error={fieldErrors.dateOfBirth}
              hint={`Must be born after ${cutoffNote()}. Upload age proof in section 6.`}
            >
              <input
                name="dateOfBirth"
                type="date"
                required
                min={PLAYER_AGE_MIN_BIRTH_DATE}
                max={playerDateOfBirthMaxIso()}
                className={registerInputClass(!!fieldErrors.dateOfBirth)}
                onChange={() => clearFieldError("dateOfBirth")}
              />
            </RegisterFormField>
            <RegisterFormField label="Mobile (10 digits)" error={fieldErrors.phone}>
              <input
                name="phone"
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                title="10 digits only"
                className={registerInputClass(!!fieldErrors.phone)}
                placeholder="9876543210"
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
                  e.currentTarget.value = digitsOnlyPhoneInput(e.clipboardData.getData("text"));
                  clearFieldError("phone");
                }}
              />
            </RegisterFormField>
            <RegisterFormField label="Email" error={fieldErrors.email} className="register-form-field--wide">
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                className={registerInputClass(!!fieldErrors.email)}
                placeholder="you@example.com"
                onInput={() => clearFieldError("email")}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="3" title="Kit sizing">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Jersey (t-shirt) size" error={fieldErrors.jerseySize}>
              <select
                name="jerseySize"
                required
                className={registerInputClass(!!fieldErrors.jerseySize)}
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
            </RegisterFormField>
            <RegisterFormField label="Shoe size" error={fieldErrors.shoeSize}>
              <input
                name="shoeSize"
                required
                maxLength={24}
                className={registerInputClass(!!fieldErrors.shoeSize)}
                placeholder="e.g. UK 5 / EU 38"
                onInput={() => clearFieldError("shoeSize")}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="4" title="Player details" description="Match the official paper form — batter, bowler, all-rounder, wicketkeeper.">
          <PlayerRolePicker roles={roles} onChange={setRolesSelection} hasError={!!fieldErrors.roles} />
          {fieldErrors.roles ? (
            <p className="register-form-field__error !mt-0" role="alert">
              {fieldErrors.roles}
            </p>
          ) : roles.size === 0 ? (
            <p className="register-form-field__hint !mt-0">Select at least one role.</p>
          ) : null}
        </RegisterFormSection>

        <RegisterFormSection number="5" title="Trial venue" description="Choose where you plan to attend trials.">
          <TrialVenuePicker
            trialZones={trialZones}
            value={trialZoneId}
            onChange={(id) => {
              setTrialZoneId(id);
              clearFieldError("trialZoneId");
            }}
            hasError={!!fieldErrors.trialZoneId}
          />
          {fieldErrors.trialZoneId ? (
            <p className="register-form-field__error" role="alert">
              {fieldErrors.trialZoneId}
            </p>
          ) : null}
        </RegisterFormSection>

        <RegisterFormSection number="6" title="Achievements" description="Optional — helps scouts review your profile.">
          <RegisterFormField label="Achievements & awards" optional error={fieldErrors.achievementsAndAwards}>
            <textarea
              name="achievementsAndAwards"
              rows={4}
              maxLength={2000}
              className={registerInputClass(!!fieldErrors.achievementsAndAwards)}
              placeholder="District selections, tournament awards, academy honours…"
              onInput={() => clearFieldError("achievementsAndAwards")}
            />
          </RegisterFormField>
        </RegisterFormSection>

        <RegisterFormSection number="7" title="Age proof (required)" description="Upload a clear scan or photo of one government ID.">
          <div className="register-form-callout register-form-callout--amber">
            <p className="register-form-callout__title">Accepted documents</p>
            <p className="register-form-callout__text">Aadhaar card, passport (minimum 3-year validity), or birth certificate.</p>
          </div>
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Document type" error={fieldErrors.idDocumentType}>
              <select
                name="idDocumentType"
                required
                className={registerInputClass(!!fieldErrors.idDocumentType)}
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
            </RegisterFormField>
            <RegisterFormField label="Upload ID proof" error={fieldErrors.idProof}>
              <input
                name="idProof"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className={fileInputClass(!!fieldErrors.idProof)}
                onChange={() => clearFieldError("idProof")}
              />
              <ImageUploadSizeHint specKey="registrationIdScan" className="register-form-field__hint !mt-2" />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="8" title="Payment">
          <div className="register-form-payment-block">
            {razorpayEnabled ? (
              <div className="register-form-callout register-form-callout--emerald">
                <p className="register-form-callout__title">Online payment (Razorpay)</p>
                <p className="register-form-callout__text">
                  Pay ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} securely via UPI, cards, or netbanking. Registration is saved only after successful payment.
                </p>
              </div>
            ) : (
              <div className="register-form-callout register-form-callout--slate">
                <p className="register-form-callout__title">Manual / offline payment</p>
                <p className="register-form-callout__text">
                  Pay via your club coordinator or league desk UPI. Add a transaction reference and upload proof for faster verification.
                </p>
                <div className="mt-4 register-form-grid register-form-grid--2">
                  <RegisterFormField label="Transaction reference" optional error={fieldErrors.transactionRef}>
                    <input
                      name="transactionRef"
                      maxLength={120}
                      className={registerInputClass(!!fieldErrors.transactionRef)}
                      placeholder="UPI / bank reference"
                      onInput={() => clearFieldError("transactionRef")}
                    />
                  </RegisterFormField>
                  <RegisterFormField label="Payment proof" optional error={fieldErrors.paymentProof}>
                    <input
                      name="paymentProof"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={fileInputClass(!!fieldErrors.paymentProof)}
                      onChange={() => clearFieldError("paymentProof")}
                    />
                    <ImageUploadSizeHint specKey="registrationPaymentProof" className="register-form-field__hint !mt-2" />
                  </RegisterFormField>
                </div>
              </div>
            )}

            {razorpayEnabled ? (
              <label className="register-form-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="register-form-terms__input"
                />
                <span className="register-form-terms__text">
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
            ) : null}
          </div>
        </RegisterFormSection>

        <div className="register-form-actions">
          {status !== "idle" ? (
            <div className={`register-form-status ${status === "ok" ? "register-form-status--ok" : "register-form-status--err"}`}>{message}</div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading" || status === "paying" || roles.size === 0 || (razorpayEnabled && !acceptedTerms)}
            className="register-form-submit"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
