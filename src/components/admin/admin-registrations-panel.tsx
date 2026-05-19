"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_OPTIONS } from "@/lib/league";
import type { IdDocumentType } from "@/lib/registration-schema";
import { ID_DOCUMENT_LABELS } from "@/lib/registration-schema";

type Row = {
  id: string;
  createdAt: string;
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
  idProofPath: string | null;
  paymentProofPath: string | null;
  transactionRef: string | null;
  feeReceivedDate: string | null;
  coachName: string | null;
  achievementsAndAwards: string | null;
};

function formatRoles(json: string) {
  try {
    const arr = JSON.parse(json) as string[];
    const map = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.id, r.label]));
    return arr.map((id) => map[id] ?? id).join(", ");
  } catch {
    return json;
  }
}

function idLabel(t: string | null) {
  if (!t) return "—";
  return ID_DOCUMENT_LABELS[t as IdDocumentType] ?? t;
}

export function AdminRegistrationsPanel() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({ q: "", from: "", to: "" });
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.q) p.set("q", applied.q);
    if (applied.from) p.set("from", applied.from);
    if (applied.to) p.set("to", applied.to);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [applied]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/registrations${queryString}`, { credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Could not load registrations.");
      return;
    }
    setError("");
    setRows((await res.json()) as Row[]);
  }, [queryString]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ q: q.trim(), from, to });
  }

  function clearFilters() {
    setQ("");
    setFrom("");
    setTo("");
    setApplied({ q: "", from: "", to: "" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Registrations</h1>
        <p className="mt-1 text-sm font-medium text-slate-600">Filter by text or submitted date range.</p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[200px] flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
            placeholder="Player, academy, parent, address, achievements, email, phone…"
          />
        </label>
        <label className="block w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          />
        </label>
        <label className="block w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900" />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Apply
          </button>
          <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Clear
          </button>
        </div>
      </form>

      {error && <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900">{error}</p>}

      {rows === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1600px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-700">
                <th className="px-3 py-3">When</th>
                <th className="px-3 py-3">Player</th>
                <th className="px-3 py-3">DOB</th>
                <th className="px-3 py-3">Father</th>
                <th className="px-3 py-3">Jersey</th>
                <th className="px-3 py-3">Shoe</th>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Academy</th>
                <th className="px-3 py-3">Address</th>
                <th className="px-3 py-3">Roles</th>
                <th className="px-3 py-3">Achievements</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Pay</th>
                <th className="px-3 py-3">ID file</th>
                <th className="px-3 py-3">Fee date</th>
                <th className="px-3 py-3">Coach</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-800">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="max-w-[100px] truncate px-3 py-3 font-bold text-slate-900">{r.playerName}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs">{new Date(r.dateOfBirth).toLocaleDateString()}</td>
                  <td className="max-w-[100px] truncate px-3 py-3 text-xs">{r.fatherName ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs">{r.jerseySize ?? "—"}</td>
                  <td className="max-w-[72px] truncate px-3 py-3 text-xs">{r.shoeSize ?? "—"}</td>
                  <td className="max-w-[120px] truncate px-3 py-3 text-xs">{idLabel(r.idDocumentType)}</td>
                  <td className="max-w-[120px] truncate px-3 py-3 text-xs">{r.academyName}</td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-xs" title={r.address ?? undefined}>
                    {r.address ?? "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-3 text-xs">{formatRoles(r.roles)}</td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-xs" title={r.achievementsAndAwards ?? undefined}>
                    {r.achievementsAndAwards?.trim() ? r.achievementsAndAwards : "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-3 text-xs">{r.email}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs">{r.phone}</td>
                  <td className="px-3 py-3 text-xs">
                    {r.paymentProofPath ? (
                      <a
                        className="font-bold text-orange-600 underline hover:text-orange-700"
                        href={`/api/admin/proof?id=${encodeURIComponent(r.id)}&kind=payment`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Pay
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                    {r.transactionRef && <div className="mt-1 text-[10px] text-slate-600">Ref: {r.transactionRef}</div>}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {r.idProofPath ? (
                      <a
                        className="font-bold text-orange-600 underline hover:text-orange-700"
                        href={`/api/admin/proof?id=${encodeURIComponent(r.id)}&kind=id`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs">{r.feeReceivedDate ? r.feeReceivedDate : "—"}</td>
                  <td className="max-w-[100px] truncate px-3 py-3 text-xs">{r.coachName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600">No rows match these filters.</p>}
        </div>
      )}
    </div>
  );
}
