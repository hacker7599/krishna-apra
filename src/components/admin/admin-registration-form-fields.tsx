"use client";

import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import { PlayerRolePicker } from "@/components/player-role-picker";
import { PLAYER_AGE_MIN_BIRTH_DATE, playerDateOfBirthMaxIso } from "@/lib/league";
import type { RoleId } from "@/lib/league";
import { isRoleId } from "@/lib/registration-roles";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { trialZoneSelectLabel } from "@/lib/trial-zone-options";

export type AdminRegistrationFormState = {
  academyName: string;
  playerName: string;
  dateOfBirth: string;
  roles: string[];
  email: string;
  phone: string;
  fatherName: string;
  address: string;
  jerseySize: string;
  shoeSize: string;
  idDocumentType: string;
  achievementsAndAwards: string;
  transactionRef: string;
  feeReceivedDate: string;
  coachName: string;
  paymentStatus: string;
  trialZoneId: string;
};

export const emptyAdminRegistrationForm: AdminRegistrationFormState = {
  academyName: "",
  playerName: "",
  dateOfBirth: "",
  roles: [],
  email: "",
  phone: "",
  fatherName: "",
  address: "",
  jerseySize: "",
  shoeSize: "",
  idDocumentType: "",
  achievementsAndAwards: "",
  transactionRef: "",
  feeReceivedDate: "",
  coachName: "",
  paymentStatus: "manual",
  trialZoneId: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

type Props = {
  form: AdminRegistrationFormState;
  setForm: React.Dispatch<React.SetStateAction<AdminRegistrationFormState>>;
  trialZones: TrialZoneOption[];
  disabled?: boolean;
  /** Lock fields that must match an existing payment order */
  readOnlyFields?: ("email" | "phone")[];
  /** Desk create / orphan complete — photo required unless editing with existing file */
  requirePlayerPhoto?: boolean;
  hasExistingPlayerPhoto?: boolean;
  onPlayerPhotoChange?: (file: File | null) => void;
  playerPhotoError?: string;
};

export function AdminRegistrationFormFields({
  form,
  setForm,
  trialZones,
  disabled,
  readOnlyFields = [],
  requirePlayerPhoto = false,
  hasExistingPlayerPhoto = false,
  onPlayerPhotoChange,
  playerPhotoError,
}: Props) {
  const lockEmail = readOnlyFields.includes("email");
  const lockPhone = readOnlyFields.includes("phone");
  const roleSet = new Set(form.roles.filter((r): r is RoleId => isRoleId(r)));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Academy / club</span>
        <input
          required
          disabled={disabled}
          value={form.academyName}
          onChange={(e) => setForm((p) => ({ ...p, academyName: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Player name</span>
        <input
          required
          disabled={disabled}
          value={form.playerName}
          onChange={(e) => setForm((p) => ({ ...p, playerName: e.target.value }))}
          className={inputClass}
        />
      </label>
      {(requirePlayerPhoto || hasExistingPlayerPhoto || onPlayerPhotoChange) && (
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">
            Player photo
            {requirePlayerPhoto && !hasExistingPlayerPhoto ? "" : hasExistingPlayerPhoto ? " (replace)" : ""}
          </span>
          <input
            type="file"
            name="playerPhoto"
            accept="image/jpeg,image/png,image/webp"
            required={requirePlayerPhoto && !hasExistingPlayerPhoto}
            disabled={disabled}
            onChange={(e) => onPlayerPhotoChange?.(e.target.files?.[0] ?? null)}
            className={`w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 ${
              playerPhotoError ? "rounded-lg border border-rose-400" : ""
            }`}
          />
          <ImageUploadSizeHint specKey="registrationPlayerPhoto" className="mt-2 text-xs font-medium text-slate-500" />
          {hasExistingPlayerPhoto && !requirePlayerPhoto ? (
            <p className="mt-1 text-xs text-slate-500">A photo is already on file. Upload only to replace it.</p>
          ) : null}
          {playerPhotoError ? (
            <p className="mt-1 text-xs font-semibold text-rose-700" role="alert">
              {playerPhotoError}
            </p>
          ) : null}
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Date of birth</span>
        <input
          type="date"
          required
          min={PLAYER_AGE_MIN_BIRTH_DATE}
          max={playerDateOfBirthMaxIso()}
          disabled={disabled}
          value={form.dateOfBirth}
          onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Mobile</span>
        <input
          required
          disabled={disabled || lockPhone}
          readOnly={lockPhone}
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Email</span>
        <input
          type="email"
          required
          disabled={disabled || lockEmail}
          readOnly={lockEmail}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Father / guardian</span>
        <input
          required
          disabled={disabled}
          value={form.fatherName}
          onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Address</span>
        <textarea
          required
          rows={2}
          disabled={disabled}
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          className={inputClass}
        />
      </label>
      <div className="sm:col-span-2">
        <PlayerRolePicker
          roles={roleSet}
          disabled={disabled}
          onChange={(next) => setForm((p) => ({ ...p, roles: [...next] }))}
        />
      </div>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Trial zone (optional)</span>
        <select
          disabled={disabled}
          value={form.trialZoneId}
          onChange={(e) => setForm((p) => ({ ...p, trialZoneId: e.target.value }))}
          className={inputClass}
        >
          <option value="">Not set</option>
          {trialZones.map((z) => (
            <option key={z.id} value={z.id}>
              {trialZoneSelectLabel(z)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Jersey size</span>
        <select
          required
          disabled={disabled}
          value={form.jerseySize}
          onChange={(e) => setForm((p) => ({ ...p, jerseySize: e.target.value }))}
          className={inputClass}
        >
          <option value="" disabled>
            Select
          </option>
          {JERSEY_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Shoe size</span>
        <input
          required
          disabled={disabled}
          value={form.shoeSize}
          onChange={(e) => setForm((p) => ({ ...p, shoeSize: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">ID document type</span>
        <select
          required
          disabled={disabled}
          value={form.idDocumentType}
          onChange={(e) => setForm((p) => ({ ...p, idDocumentType: e.target.value }))}
          className={inputClass}
        >
          <option value="" disabled>
            Select
          </option>
          {ID_DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {ID_DOCUMENT_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Achievements (optional)</span>
        <textarea
          rows={2}
          disabled={disabled}
          value={form.achievementsAndAwards}
          onChange={(e) => setForm((p) => ({ ...p, achievementsAndAwards: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Payment status</span>
        <select
          disabled={disabled}
          value={form.paymentStatus}
          onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value }))}
          className={inputClass}
        >
          <option value="manual">Manual / pending verification</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Fee received date</span>
        <input
          disabled={disabled}
          value={form.feeReceivedDate}
          onChange={(e) => setForm((p) => ({ ...p, feeReceivedDate: e.target.value }))}
          className={inputClass}
          placeholder="e.g. 19 May 2026"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Transaction ref (optional)</span>
        <input
          disabled={disabled}
          value={form.transactionRef}
          onChange={(e) => setForm((p) => ({ ...p, transactionRef: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Coach name (optional)</span>
        <input
          disabled={disabled}
          value={form.coachName}
          onChange={(e) => setForm((p) => ({ ...p, coachName: e.target.value }))}
          className={inputClass}
        />
      </label>
    </div>
  );
}

export function rowToAdminForm(row: {
  academyName: string;
  playerName: string;
  dateOfBirth: string;
  roles: string;
  email: string;
  phone: string;
  fatherName: string | null;
  address: string | null;
  jerseySize: string | null;
  shoeSize: string | null;
  idDocumentType: string | null;
  achievementsAndAwards: string | null;
  transactionRef: string | null;
  feeReceivedDate: string | null;
  coachName: string | null;
  paymentStatus: string | null;
  trialZoneId?: string | null;
}): AdminRegistrationFormState {
  let roles: string[] = [];
  try {
    roles = JSON.parse(row.roles) as string[];
  } catch {
    roles = [];
  }
  return {
    academyName: row.academyName,
    playerName: row.playerName,
    dateOfBirth: row.dateOfBirth.slice(0, 10),
    roles,
    email: row.email,
    phone: row.phone,
    fatherName: row.fatherName ?? "",
    address: row.address ?? "",
    jerseySize: row.jerseySize ?? "",
    shoeSize: row.shoeSize ?? "",
    idDocumentType: row.idDocumentType ?? "",
    achievementsAndAwards: row.achievementsAndAwards ?? "",
    transactionRef: row.transactionRef ?? "",
    feeReceivedDate: row.feeReceivedDate ?? "",
    coachName: row.coachName ?? "",
    paymentStatus: row.paymentStatus ?? "manual",
    trialZoneId: row.trialZoneId ?? "",
  };
}
