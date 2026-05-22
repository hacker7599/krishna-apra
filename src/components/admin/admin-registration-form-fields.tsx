"use client";

import { PLAYER_AGE_CUTOFF_DATE, ROLE_OPTIONS } from "@/lib/league";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";

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
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

type Props = {
  form: AdminRegistrationFormState;
  setForm: React.Dispatch<React.SetStateAction<AdminRegistrationFormState>>;
  disabled?: boolean;
};

export function AdminRegistrationFormFields({ form, setForm, disabled }: Props) {
  function toggleRole(id: string) {
    setForm((prev) => {
      const has = prev.roles.includes(id);
      return {
        ...prev,
        roles: has ? prev.roles.filter((r) => r !== id) : [...prev.roles, id],
      };
    });
  }

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
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Date of birth</span>
        <input
          type="date"
          required
          max={PLAYER_AGE_CUTOFF_DATE}
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
          disabled={disabled}
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
          disabled={disabled}
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
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-xs font-bold uppercase text-slate-700">Roles</legend>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((r) => {
            const on = form.roles.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleRole(r.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase ${
                  on ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300 bg-white text-slate-800"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </fieldset>
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
  };
}
