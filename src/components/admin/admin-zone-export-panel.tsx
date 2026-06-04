"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { useAdminAlert } from "@/components/admin/ui/admin-alert-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { humanErrorFromResponse } from "@/lib/human-errors";
import type { TrialZoneOption } from "@/lib/trial-zone-options";

type Row = {
  id: string;
  createdAt: string;
  playerName: string;
  academyName: string;
  email: string;
  phone: string;
  paymentStatus: string | null;
  registrationCode: string | null;
  paymentCode: string | null;
  fatherName: string | null;
  dateOfBirth: string;
  trialZone?: { trialPlace: string; zone: string } | null;
};

type ListResponse = {
  items: Row[];
  total: number;
  limit: number;
  offset: number;
};

type PanelProps = {
  trialZones: TrialZoneOption[];
};

const PAGE_SIZE = 50;

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminZoneExportPanel({ trialZones }: PanelProps) {
  const router = useRouter();
  const { showAlert } = useAdminAlert();
  const [trialZoneId, setTrialZoneId] = useState("");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState({ trialZoneId: "", q: "" });
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.trialZoneId) p.set("trialZoneId", applied.trialZoneId);
    if (applied.q) p.set("q", applied.q);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return p.toString();
  }, [applied, offset]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await adminFetch(`/api/admin/zone-registrations?${queryString}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Could not load players for this zone.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as ListResponse;
    setRows(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [queryString, router]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ trialZoneId, q: q.trim() });
    setOffset(0);
  }

  function clearFilters() {
    setTrialZoneId("");
    setQ("");
    setApplied({ trialZoneId: "", q: "" });
    setOffset(0);
  }

  const zoneLabel = useMemo(() => {
    if (!applied.trialZoneId) return "All trial zones";
    const z = trialZones.find((t) => t.id === applied.trialZoneId);
    return z ? `${z.trialPlace} — ${z.zone}` : "Selected zone";
  }, [applied.trialZoneId, trialZones]);

  async function downloadExcel() {
    setExporting(true);
    setError("");
    const p = new URLSearchParams();
    if (applied.trialZoneId) p.set("trialZoneId", applied.trialZoneId);
    if (applied.q) p.set("q", applied.q);
    const res = await adminFetch(`/api/admin/zone-registrations/export?${p.toString()}`);
    setExporting(false);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(humanErrorFromResponse(data, "Could not download the spreadsheet."));
      return;
    }
    const blob = await res.blob();
    const truncated = res.headers.get("X-Export-Truncated") === "true";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `players-${applied.trialZoneId ? "zone" : "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (truncated) {
      await showAlert({
        variant: "info",
        title: "Export capped",
        message: "Only the first 25,000 rows were included. Pick one trial zone or narrow filters.",
      });
    }
  }

  return (
    <div className="admin-panel space-y-6">
      <AdminPageHeader
        title="Export by trial zone"
        description="Paid registrations only — filter by trial zone and download a spreadsheet for Excel (CSV)."
        actions={
          <button
            type="button"
            onClick={() => void downloadExcel()}
            disabled={exporting || total === 0}
            className="admin-btn admin-btn--primary whitespace-nowrap"
          >
            {exporting ? "Preparing…" : `Download Excel (${total})`}
          </button>
        }
      />

      <form
        onSubmit={applyFilters}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="admin-filter-grid admin-filter-grid--2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Trial zone</span>
            <select
              value={trialZoneId}
              onChange={(e) => setTrialZoneId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900"
            >
              <option value="">All zones</option>
              {trialZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.trialPlace} — {z.zone}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, phone, code…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-900"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Apply filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Reset
          </button>
          <span className="ml-auto text-sm font-semibold text-slate-600">
            {zoneLabel} · {total} paid player{total === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      {error ? <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-600">Loading players…</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--stack">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Trial zone</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Paid on</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className="admin-table__empty-row">
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500" data-label="">
                      No paid players match these filters. Try another trial zone.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td data-label="Code" className="px-4 py-3 font-mono text-xs text-slate-700">
                        {row.registrationCode ?? "—"}
                      </td>
                      <td data-label="Player" className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.playerName}</div>
                        <div className="text-xs text-slate-500">{row.academyName}</div>
                      </td>
                      <td data-label="Trial zone" className="px-4 py-3 text-xs text-slate-700">
                        {row.trialZone ? (
                          <>
                            <div className="font-medium">{row.trialZone.trialPlace}</div>
                            <div className="text-slate-500">{row.trialZone.zone}</div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td data-label="Contact" className="px-4 py-3 text-xs text-slate-600">
                        <div>{row.email}</div>
                        <div className="text-slate-500">{row.phone}</div>
                      </td>
                      <td data-label="Paid on" className="px-4 py-3 text-xs text-slate-600">{formatDt(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        </>
      )}
    </div>
  );
}
