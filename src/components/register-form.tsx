"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SupportContactLinks } from "@/components/support-contact-links";
import { PlayerRolePicker } from "@/components/player-role-picker";
import { RegisterFormOutline } from "@/components/register-form-outline";
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
import type { PublicPaymentConfig } from "@/lib/public-payment-config";

function cutoffNote() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function successPath(emailSent: boolean) {
  return emailSent ? "/register/success" : "/register/success?emailSent=0";
}

type Props = {
  trialZones: TrialZoneOption[];
  initialPaymentConfig: PublicPaymentConfig;
};

export function RegisterForm({ trialZones, initialPaymentConfig }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [roles, setRoles] = useState<Set<RoleId>>(() => new Set());
  const [trialZoneId, setTrialZoneId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "paying" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PublicPaymentConfig>(initialPaymentConfig);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  const rolesJson = useMemo(() => JSON.stringify([...roles]), [roles]);
  const razorpayEnabled = paymentConfig.razorpayEnabled;
  const qrUploadMode = paymentConfig.paymentMode === "qr_upload";
  const qrImageUrl = paymentConfig.qrImageUrl ?? null;

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PublicPaymentConfig & { enabled?: boolean; paymentMode?: string }) => {
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

  useEffect(() => {
    if (!isQrPreviewOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsQrPreviewOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isQrPreviewOpen]);

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

  async function checkDuplicateRegistration(
    email: string,
    phone: string,
  ): Promise<{ error: string | null; resumeNotice: string | null }> {
    const res = await fetch("/api/register/check-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      return {
        error: humanErrorFromResponse(
          data,
          "This email or mobile number is already registered. Use a different contact or check your registration status.",
        ),
        resumeNotice: null,
      };
    }
    if (!res.ok) {
      return {
        error: humanErrorFromResponse(data, "We could not verify your details right now. Please try again in a moment."),
        resumeNotice: null,
      };
    }
    if (data.resume === true) {
      return {
        error: null,
        resumeNotice:
          typeof data.message === "string"
            ? data.message
            : "We found your previous application. Submitting will update your details and continue payment.",
      };
    }
    return { error: null, resumeNotice: null };
  }

  async function reportCheckoutEvent(
    registrationId: string,
    razorpayOrderId: string,
    event: "dismissed" | "payment_failed",
    message?: string,
  ) {
    try {
      await fetch("/api/register/checkout-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ registrationId, razorpayOrderId, event, message }),
      });
    } catch {
      /* non-blocking — user can retry payment */
    }
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
      router.push(successPath(data.emailSent !== false));
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
      router.push(successPath(data.emailSent !== false));
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
    if (!acceptedTerms) {
      setStatus("err");
      setMessage("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    const form = e.currentTarget;
    const values = readRegistrationFormValues(form, roles);
    if (!values.trialZoneId.trim() && trialZoneId) {
      values.trialZoneId = trialZoneId;
    }
    const errors = validateRegistrationForm(values, {
      requirePaymentProof: qrUploadMode,
    });

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

    const dup = await checkDuplicateRegistration(
      values.email.trim().toLowerCase(),
      digitsOnlyPhoneInput(values.phone),
    );
    if (dup.error) {
      setStatus("err");
      setMessage(dup.error);
      return;
    }
    setResumeNotice(dup.resumeNotice);

    if (!razorpayEnabled) {
      if (qrUploadMode && !qrImageUrl) {
        setStatus("err");
        setMessage("Payment QR is not configured yet. Please contact the league desk before submitting.");
        return;
      }
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
      const razorpayOrderId = String(prepareData.orderId ?? "");
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
          if (razorpayOrderId) {
            void reportCheckoutEvent(registrationId, razorpayOrderId, "dismissed");
          }
          setStatus("err");
          setMessage(
            "Payment was cancelled. Your details are saved on our server — you can submit the form again to retry payment.",
          );
        },
        onPaymentFailed: (failureMessage) => {
          if (razorpayOrderId) {
            void reportCheckoutEvent(registrationId, razorpayOrderId, "payment_failed", failureMessage);
          }
          setStatus("err");
          setMessage(
            failureMessage ||
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
          : qrUploadMode
            ? "Submit registration & payment proof"
            : "Submit registration";

  const fileInputClass = (hasError: boolean) =>
    `register-form-file-input${hasError ? " register-form-file-input--error" : ""}`;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="register-form-shell w-full">
      <header className="register-form-shell__header">
        <div className="register-form-shell__header-main">
          <p className="register-form-shell__eyebrow">Application form</p>
          <h2 className="register-form-shell__title">Player registration</h2>
          <p className="register-form-shell__lead">
            {FORMAT.category} · {FORMAT.overs}-over T20 · {FORMAT.teams} franchises · All fields required unless marked
            optional
          </p>
          <p className="register-form-shell__support">
            Need help? <SupportContactLinks linkClassName="font-bold text-orange-300 underline underline-offset-2 hover:text-white" />
          </p>
        </div>
        <div className="register-form-shell__header-fee" aria-label={`Trial fee ₹${TRIAL_FEE_INR.toLocaleString("en-IN")}`}>
          <p className="register-form-shell__header-fee-label">Trial fee</p>
          <p className="register-form-shell__header-fee-amount">₹{TRIAL_FEE_INR.toLocaleString("en-IN")}</p>
          <p className="register-form-shell__header-fee-note">Jersey included</p>
        </div>
      </header>

      <RegisterFormOutline variant="bar" className="register-form-shell__progress lg:hidden" />

      <div className="register-form-shell__body">
        {resumeNotice ? (
          <div className="register-form-notice register-form-notice--amber" role="status">
            {resumeNotice}
          </div>
        ) : null}
        <RegisterFormSection
          sectionId="register-section-academy"
          number="1"
          title="Academy & player"
          description="Details as they appear on your academy records and government ID."
        >
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

        <RegisterFormSection
          sectionId="register-section-contact"
          number="2"
          title="Contact & eligibility"
          description="We use these details for trial confirmation and duplicate checks."
        >
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

        <RegisterFormSection sectionId="register-section-kit" number="3" title="Kit sizing">
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

        <RegisterFormSection
          sectionId="register-section-roles"
          number="4"
          title="Player details"
          description="Match the official paper form — batter, bowler, all-rounder, wicketkeeper."
        >
          <PlayerRolePicker roles={roles} onChange={setRolesSelection} hasError={!!fieldErrors.roles} />
          {fieldErrors.roles ? (
            <p className="register-form-field__error !mt-0" role="alert">
              {fieldErrors.roles}
            </p>
          ) : roles.size === 0 ? (
            <p className="register-form-field__hint !mt-0">Select at least one role.</p>
          ) : null}
        </RegisterFormSection>

        <RegisterFormSection
          sectionId="register-section-venue"
          number="5"
          title="Trial venue"
          description="Choose where you plan to attend trials."
        >
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

        <RegisterFormSection
          sectionId="register-section-achievements"
          number="6"
          title="Achievements"
          description="Optional — helps scouts review your profile."
        >
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

        <RegisterFormSection
          sectionId="register-section-id"
          number="7"
          title="Age proof (required)"
          description="Upload a clear scan or photo of one government ID."
        >
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

        <RegisterFormSection sectionId="register-section-payment" number="8" title="Payment">
          <div className="register-form-payment-block">
            {razorpayEnabled ? (
              <div className="register-form-callout register-form-callout--emerald">
                <p className="register-form-callout__title">Online payment (Razorpay)</p>
                <p className="register-form-callout__text">
                  Pay ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} securely via UPI, cards, or netbanking. Your registration is confirmed only after successful payment.
                </p>
                <p className="register-form-callout__text mt-2">
                  Need help? Contact <SupportContactLinks />.
                </p>
              </div>
            ) : qrUploadMode ? (
              <div className="register-form-callout register-form-callout--slate">
                <p className="register-form-callout__title">Scan QR and upload payment screenshot</p>
                <p className="register-form-callout__text">
                  Pay ₹{TRIAL_FEE_INR.toLocaleString("en-IN")} to the league QR, then upload the screenshot below. Admin will verify your payment.
                </p>
                {qrImageUrl ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                    <button
                      type="button"
                      onClick={() => setIsQrPreviewOpen(true)}
                      className="mx-auto block w-full max-w-[220px] cursor-zoom-in"
                      aria-label="Click to enlarge QR code"
                    >
                      <Image
                        src={qrImageUrl}
                        alt="League payment QR code"
                        width={220}
                        height={220}
                        className="mx-auto h-auto w-full max-w-[220px] object-contain"
                      />
                    </button>
                    <p className="mt-2 text-center text-xs font-semibold text-slate-600">Click QR code to enlarge</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-semibold text-rose-700">
                    Payment QR is not configured. Contact <SupportContactLinks linkClassName="underline" /> before paying.
                  </p>
                )}
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
                  <RegisterFormField label="Payment screenshot" error={fieldErrors.paymentProof}>
                    <input
                      name="paymentProof"
                      type="file"
                      required
                      accept="image/jpeg,image/png,image/webp"
                      className={fileInputClass(!!fieldErrors.paymentProof)}
                      onChange={() => clearFieldError("paymentProof")}
                    />
                    <ImageUploadSizeHint specKey="registrationPaymentProof" className="register-form-field__hint !mt-2" />
                  </RegisterFormField>
                </div>
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
                {razorpayEnabled ? ", and authorise payment of the trial registration fee." : "."}
              </span>
            </label>
          </div>
        </RegisterFormSection>

        <div className="register-form-actions">
          {status !== "idle" ? (
            <div className={`register-form-status ${status === "ok" ? "register-form-status--ok" : "register-form-status--err"}`} role="alert">
              {message}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading" || status === "paying" || roles.size === 0 || !acceptedTerms}
            className="register-form-submit"
          >
            {submitLabel}
          </button>
          <p className="register-form-actions__hint">
            By submitting you confirm details are accurate. Confirmation email sent after successful payment or admin
            verification.
          </p>
        </div>
      </div>
      {isQrPreviewOpen && qrImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged payment QR code"
          onClick={() => setIsQrPreviewOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow"
            onClick={() => setIsQrPreviewOpen(false)}
            aria-label="Close enlarged QR code"
          >
            Close
          </button>
          <div
            className="w-full max-w-[420px] rounded-xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={qrImageUrl}
              alt="League payment QR code enlarged"
              width={420}
              height={420}
              className="mx-auto h-auto w-full max-w-[420px] object-contain"
            />
          </div>
        </div>
      ) : null}
    </form>
  );
}
