"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerRolePicker } from "@/components/player-role-picker";
import { RegisterFormField, RegisterFormSection, registerInputClass } from "@/components/register-form-ui";
import { TrialVenuePicker } from "@/components/trial-venue-picker";
import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import {
  PLAYER_AGE_MIN_BIRTH_DATE,
  playerDateOfBirthMaxIso,
  PLAYER_AGE_CUTOFF_DATE,
} from "@/lib/league";
import type { RoleId } from "@/lib/league";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";
import { isRoleId } from "@/lib/registration-roles";
import {
  firstRegistrationFormError,
  readRegistrationFormValues,
  validateRegistrationForm,
} from "@/lib/registration-form-validation";
import { humanErrorFromResponse } from "@/lib/human-errors";

function cutoffNote() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

type Prefill = {
  academyName: string;
  playerName: string;
  dateOfBirth: string;
  roles: string[];
  trialZoneId: string;
  email: string;
  phone: string;
  fatherName: string;
  address: string;
  jerseySize: string;
  shoeSize: string;
  idDocumentType: string;
  achievementsAndAwards: string;
  hasPlayerPhoto: boolean;
  hasIdProof: boolean;
};

type LoadPayload = {
  playerName: string;
  email: string | null;
  phone: string | null;
  amountInr: number;
  paidAt: string | null;
  prefill: Prefill;
};

type Props = {
  token: string;
  trialZones: TrialZoneOption[];
};

export function RegistrationCompletionForm({ token, trialZones }: Props) {
  const router = useRouter();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [meta, setMeta] = useState<LoadPayload | null>(null);
  const [roles, setRoles] = useState<Set<RoleId>>(() => new Set());
  const [trialZoneId, setTrialZoneId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const rolesJson = useMemo(() => JSON.stringify([...roles]), [roles]);
  const requirePhoto = meta ? !meta.prefill.hasPlayerPhoto : true;
  const requireIdProof = meta ? !meta.prefill.hasIdProof : true;

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/register/complete?token=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setLoadState("error");
          setLoadError(
            humanErrorFromResponse(data, "This link is invalid, expired, or already used."),
          );
          return;
        }
        const payload = data as LoadPayload;
        setMeta(payload);
        setTrialZoneId(payload.prefill.trialZoneId);
        setRoles(new Set(payload.prefill.roles.filter((r): r is RoleId => isRoleId(r))));
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState("error");
          setLoadError("Could not load your form. Check your connection and try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function clearFieldError(name: string) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!meta) return;

    const form = e.currentTarget;
    const values = readRegistrationFormValues(form, roles);
    const errors = validateRegistrationForm(values, {
      requirePlayerPhoto: requirePhoto,
      requireIdProof,
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("err");
      setMessage(firstRegistrationFormError(errors) ?? "Please check the form.");
      return;
    }

    setFieldErrors({});
    setStatus("loading");
    setMessage("");

    const fd = new FormData(form);
    fd.set("roles", rolesJson);
    fd.set("trialZoneId", trialZoneId);
    fd.set("email", meta.prefill.email);
    fd.set("phone", meta.prefill.phone);

    const res = await fetch(`/api/register/complete?token=${encodeURIComponent(token)}`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMessage(humanErrorFromResponse(data, "We could not save your registration. Check the form and try again."));
      return;
    }

    setStatus("ok");
    setMessage("Registration complete. Redirecting…");
    router.push("/register/success");
  }

  const fileInputClass = (hasError: boolean) =>
    `register-form-file-input${hasError ? " register-form-file-input--error" : ""}`;

  if (loadState === "loading") {
    return <p className="text-sm font-semibold text-slate-600">Loading your registration form…</p>;
  }

  if (loadState === "error") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm font-semibold text-rose-900" role="alert">
        {loadError}
      </div>
    );
  }

  if (!meta) return null;

  const p = meta.prefill;

  return (
    <form onSubmit={onSubmit} className="register-form-shell w-full">
      <div className="register-form-shell__bar">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Payment received</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            Complete your trial registration for {meta.playerName}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Paid</p>
          <p className="font-[family-name:var(--font-bebas)] text-3xl leading-none text-slate-900">
            ₹{meta.amountInr.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {status === "err" && message ? (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900" role="alert">
          {message}
        </p>
      ) : null}

      <input type="hidden" name="roles" value={rolesJson} />
      <input type="hidden" name="trialZoneId" value={trialZoneId} />

      <div className="register-form-shell__body space-y-0">
        <RegisterFormSection number="1" title="Academy & player">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Academy / club name" error={fieldErrors.academyName} className="register-form-field--wide">
              <input
                name="academyName"
                required
                defaultValue={p.academyName}
                className={registerInputClass(!!fieldErrors.academyName)}
                onInput={() => clearFieldError("academyName")}
              />
            </RegisterFormField>
            <RegisterFormField label="Player full name" error={fieldErrors.playerName} className="register-form-field--wide">
              <input
                name="playerName"
                required
                defaultValue={p.playerName}
                className={registerInputClass(!!fieldErrors.playerName)}
                onInput={() => clearFieldError("playerName")}
              />
            </RegisterFormField>
            <RegisterFormField
              label={requirePhoto ? "Player photo" : "Player photo (on file — upload to replace)"}
              error={fieldErrors.playerPhoto}
              className="register-form-field--wide"
            >
              <input
                name="playerPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required={requirePhoto}
                className={fileInputClass(!!fieldErrors.playerPhoto)}
                onChange={() => clearFieldError("playerPhoto")}
              />
              <ImageUploadSizeHint specKey="registrationPlayerPhoto" className="register-form-field__hint !mt-2" />
            </RegisterFormField>
            <RegisterFormField label="Father / guardian name" error={fieldErrors.fatherName} className="register-form-field--wide">
              <input
                name="fatherName"
                required
                defaultValue={p.fatherName}
                className={registerInputClass(!!fieldErrors.fatherName)}
                onInput={() => clearFieldError("fatherName")}
              />
            </RegisterFormField>
            <RegisterFormField label="Full address" error={fieldErrors.address} className="register-form-field--wide">
              <textarea
                name="address"
                required
                rows={3}
                defaultValue={p.address}
                className={registerInputClass(!!fieldErrors.address)}
                onInput={() => clearFieldError("address")}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="2" title="Contact (from payment)">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Date of birth" error={fieldErrors.dateOfBirth} hint={`Born after ${cutoffNote()}.`}>
              <input
                name="dateOfBirth"
                type="date"
                required
                min={PLAYER_AGE_MIN_BIRTH_DATE}
                max={playerDateOfBirthMaxIso()}
                defaultValue={p.dateOfBirth}
                className={registerInputClass(!!fieldErrors.dateOfBirth)}
                onChange={() => clearFieldError("dateOfBirth")}
              />
            </RegisterFormField>
            <RegisterFormField label="Mobile" error={fieldErrors.phone}>
              <input
                name="phone"
                readOnly
                required
                defaultValue={p.phone}
                className={`${registerInputClass(!!fieldErrors.phone)} bg-slate-100`}
              />
            </RegisterFormField>
            <RegisterFormField label="Email" error={fieldErrors.email} className="register-form-field--wide">
              <input
                name="email"
                type="email"
                readOnly
                required
                defaultValue={p.email}
                className={`${registerInputClass(!!fieldErrors.email)} bg-slate-100`}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="3" title="Kit sizing">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Jersey size" error={fieldErrors.jerseySize}>
              <select
                name="jerseySize"
                required
                defaultValue={p.jerseySize || ""}
                className={registerInputClass(!!fieldErrors.jerseySize)}
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
                defaultValue={p.shoeSize}
                className={registerInputClass(!!fieldErrors.shoeSize)}
                onInput={() => clearFieldError("shoeSize")}
              />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <RegisterFormSection number="4" title="Player roles">
          <PlayerRolePicker
            roles={roles}
            onChange={(next) => {
              setRoles(next);
              clearFieldError("roles");
            }}
            hasError={!!fieldErrors.roles}
          />
        </RegisterFormSection>

        <RegisterFormSection number="5" title="Trial venue">
          <TrialVenuePicker
            trialZones={trialZones}
            value={trialZoneId}
            onChange={(id) => {
              setTrialZoneId(id);
              clearFieldError("trialZoneId");
            }}
            hasError={!!fieldErrors.trialZoneId}
          />
        </RegisterFormSection>

        <RegisterFormSection number="6" title="Achievements" description="Optional">
          <RegisterFormField label="Achievements & awards" optional>
            <textarea name="achievementsAndAwards" rows={3} defaultValue={p.achievementsAndAwards} className={registerInputClass(false)} />
          </RegisterFormField>
        </RegisterFormSection>

        <RegisterFormSection number="7" title="Age proof">
          <div className="register-form-grid register-form-grid--2">
            <RegisterFormField label="Document type" error={fieldErrors.idDocumentType}>
              <select
                name="idDocumentType"
                required
                defaultValue={p.idDocumentType || ""}
                className={registerInputClass(!!fieldErrors.idDocumentType)}
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
            <RegisterFormField
              label={requireIdProof ? "Upload ID proof" : "ID proof (on file — upload to replace)"}
              error={fieldErrors.idProof}
            >
              <input
                name="idProof"
                type="file"
                required={requireIdProof}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className={fileInputClass(!!fieldErrors.idProof)}
                onChange={() => clearFieldError("idProof")}
              />
              <ImageUploadSizeHint specKey="registrationIdScan" className="register-form-field__hint !mt-2" />
            </RegisterFormField>
          </div>
        </RegisterFormSection>

        <div className="register-form-shell__footer">
          <button
            type="submit"
            disabled={status === "loading" || status === "ok"}
            className="register-form-submit w-full sm:w-auto"
          >
            {status === "loading" ? "Saving…" : "Submit & complete registration"}
          </button>
          <p className="mt-3 text-xs font-medium text-slate-500">
            This link works once. After you submit, it cannot be used again.
          </p>
        </div>
      </div>
    </form>
  );
}
