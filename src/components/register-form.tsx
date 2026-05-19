"use client";

import { useMemo, useState } from "react";
import { FORMAT, PLAYER_AGE_CUTOFF_DATE, ROLE_OPTIONS, TRIAL_FEE_INR } from "@/lib/league";
import type { RoleId } from "@/lib/league";
import { ID_DOCUMENT_LABELS, ID_DOCUMENT_TYPES, JERSEY_SIZES } from "@/lib/registration-schema";

function cutoffNote() {
  const [y, m, d] = PLAYER_AGE_CUTOFF_DATE.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function RegisterForm() {
  const [roles, setRoles] = useState<Set<RoleId>>(() => new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  const rolesJson = useMemo(() => JSON.stringify([...roles]), [roles]);

  function toggleRole(id: RoleId) {
    setRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const fd = new FormData(e.currentTarget);
    fd.set("roles", rolesJson);
    try {
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("err");
        if (res.status === 429 && typeof data.retryAfterSec === "number") {
          setMessage(`Too many attempts. Please try again in ${data.retryAfterSec}s.`);
        } else {
          setMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
        }
        return;
      }
      setStatus("ok");
      setMessage("Registration received. Our team will contact you with trial details.");
      e.currentTarget.reset();
      setRoles(new Set());
    } catch {
      setStatus("err");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-elevated w-full space-y-8 rounded-2xl p-6 sm:p-8">
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="e.g. Delhi Cricket Academy"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Name of the player</span>
          <input
            name="playerName"
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Full name as on ID"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Father / guardian name</span>
          <input
            name="fatherName"
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="As on government ID where applicable"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Address</span>
          <textarea
            name="address"
            required
            minLength={10}
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="Full postal address for correspondence"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Player date of birth</span>
          <input
            name="dateOfBirth"
            type="date"
            required
            max={PLAYER_AGE_CUTOFF_DATE}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600">
            Age cut-off per trial form: players born after <span className="font-bold text-slate-900">{cutoffNote()}</span> are not eligible.
            Accepted age proof: Aadhaar, passport (3-year validity), or birth certificate — upload one below.
          </p>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Contact number</span>
          <input
            name="phone"
            required
            inputMode="tel"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="10-digit mobile"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Jersey (t-shirt) size</span>
          <select
            name="jerseySize"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            defaultValue=""
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
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Shoe size</span>
          <input
            name="shoeSize"
            required
            maxLength={24}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="e.g. UK 5 / EU 38"
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-900">Player details (position / role)</legend>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((r) => {
            const on = roles.has(r.id);
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => toggleRole(r.id)}
                className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  on
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        {roles.size === 0 && <p className="mt-2 text-sm font-semibold text-slate-700">Select at least one role.</p>}
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">
          Achievements &amp; awards <span className="font-semibold normal-case text-slate-500">(optional)</span>
        </span>
        <textarea
          name="achievementsAndAwards"
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          placeholder="e.g. District U-14 best batter 2024, school tournament MVP, academy player of the year…"
        />
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            defaultValue=""
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
        </label>
        <label className="mt-3 block max-w-md">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Upload ID proof (max 4 MB)</span>
          <input
            name="idProof"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full text-sm font-medium text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>
      </div>

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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder="UPI ref / bank ref"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">Payment proof (optional, max 4 MB)</span>
          <input
            name="paymentProof"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm font-medium text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </label>
      </div>

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
        disabled={status === "loading" || roles.size === 0}
        className="w-full rounded-lg bg-orange-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
