"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import {
  AdminRegistrationFormFields,
  emptyAdminRegistrationForm,
  rowToAdminForm,
  type AdminRegistrationFormState,
} from "@/components/admin/admin-registration-form-fields";
import { AdminRegistrationPrintModal } from "@/components/admin/admin-registration-print-modal";
import { formatRoleLabels } from "@/lib/registration-roles";
import type { IdDocumentType } from "@/lib/registration-schema";
import { ID_DOCUMENT_LABELS } from "@/lib/registration-schema";
import type { TrialZoneOption } from "@/lib/trial-zone-options";

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
  paymentStatus: string | null;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  feeReceivedDate: string | null;
  coachName: string | null;
  achievementsAndAwards: string | null;
  trialZoneId: string | null;
  trialZone?: { trialPlace: string; zone: string } | null;
};

type ListResponse = {
  items: Row[];
  total: number;
  limit: number;
  offset: number;
};

function formatRoles(json: string) {
  try {
    return formatRoleLabels(JSON.parse(json) as string[]).join(", ");
  } catch {
    return json;
  }
}

function idLabel(t: string | null) {
  if (!t) return "—";
  return ID_DOCUMENT_LABELS[t as IdDocumentType] ?? t;
}

function formToPayload(form: AdminRegistrationFormState) {
  return {
    academyName: form.academyName,
    playerName: form.playerName,
    dateOfBirth: form.dateOfBirth,
    roles: form.roles,
    email: form.email,
    phone: form.phone,
    fatherName: form.fatherName,
    address: form.address,
    jerseySize: form.jerseySize,
    shoeSize: form.shoeSize,
    idDocumentType: form.idDocumentType,
    achievementsAndAwards: form.achievementsAndAwards || null,
    trialZoneId: form.trialZoneId || null,
    transactionRef: form.transactionRef || null,
    feeReceivedDate: form.feeReceivedDate || null,
    coachName: form.coachName || null,
    paymentStatus: form.paymentStatus,
  };
}

type PanelProps = {
  trialZones: TrialZoneOption[];
};

export function AdminRegistrationsPanel({ trialZones }: PanelProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [applied, setApplied] = useState({ q: "", from: "", to: "", paymentStatus: "" });
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 25;
  const [error, setError] = useState("");

  const [viewRow, setViewRow] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [printId, setPrintId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminRegistrationFormState>(emptyAdminRegistrationForm);
  const [saving, setSaving] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.q) p.set("q", applied.q);
    if (applied.from) p.set("from", applied.from);
    if (applied.to) p.set("to", applied.to);
    if (applied.paymentStatus) p.set("paymentStatus", applied.paymentStatus);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return `?${p.toString()}`;
  }, [applied, offset]);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/admin/registrations${queryString}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Could not load registrations.");
      return;
    }
    setError("");
    const data = (await res.json()) as ListResponse;
    setRows(data.items);
    setTotal(data.total);
  }, [queryString]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    setApplied({ q: q.trim(), from, to, paymentStatus });
  }

  function clearFilters() {
    setQ("");
    setFrom("");
    setTo("");
    setPaymentStatus("");
    setOffset(0);
    setApplied({ q: "", from: "", to: "", paymentStatus: "" });
  }

  async function saveCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.roles.length === 0) {
      setError("Select at least one role.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await adminFetch("/api/admin/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Create failed.");
      return;
    }
    setCreateOpen(false);
    setForm(emptyAdminRegistrationForm);
    void load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (form.roles.length === 0) {
      setError("Select at least one role.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await adminFetch(`/api/admin/registrations/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Save failed.");
      return;
    }
    setEditing(null);
    setForm(emptyAdminRegistrationForm);
    void load();
  }

  async function removeRow(r: Row) {
    if (!window.confirm(`Delete registration for “${r.playerName}”? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/registrations/${r.id}`, { method: "DELETE" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
    else setError("Delete failed.");
  }

  function exportCsv() {
    if (!rows?.length) return;
    const headers = [
      "id",
      "createdAt",
      "playerName",
      "academyName",
      "email",
      "phone",
      "paymentStatus",
      "razorpayPaymentId",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.createdAt,
          r.playerName,
          r.academyName,
          r.email,
          r.phone,
          r.paymentStatus ?? "",
          r.razorpayPaymentId ?? "",
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startEdit(r: Row) {
    setEditing(r);
    setForm(rowToAdminForm({ ...r, dateOfBirth: r.dateOfBirth }));
    setCreateOpen(false);
    setViewRow(null);
  }

  return (
    <div className="admin-panel mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Registrations"
        description={`Search, filter, export, and manage trial sign-ups (${total} total).`}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setEditing(null);
                setForm(emptyAdminRegistrationForm);
              }}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
            >
              Add registration
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!rows?.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Export CSV
            </button>
          </>
        }
      />

      <form onSubmit={applyFilters} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[200px] flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
            placeholder="Player, academy, email, phone, payment ID…"
          />
        </label>
        <label className="block w-full sm:w-36">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Payment</span>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          >
            <option value="">All</option>
            <option value="paid">Paid (Razorpay)</option>
            <option value="manual">Manual</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <label className="block w-full sm:w-40">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900" />
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-700">
                <th className="w-[12%] px-2 py-3">When</th>
                <th className="w-[14%] px-2 py-3">Player</th>
                <th className="w-[14%] px-2 py-3">Academy</th>
                <th className="w-[18%] px-2 py-3">Email</th>
                <th className="w-[11%] px-2 py-3">Phone</th>
                <th className="w-[11%] px-2 py-3">Payment</th>
                <th className="w-[20%] px-2 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-800">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="truncate px-3 py-3 font-bold text-slate-900">{r.playerName}</td>
                  <td className="truncate px-3 py-3 text-xs">{r.academyName}</td>
                  <td className="truncate px-3 py-3 text-xs">{r.email}</td>
                  <td className="truncate px-3 py-3 text-xs">{r.phone}</td>
                  <td className="px-3 py-3 text-xs">
                    <span
                      className={
                        r.paymentStatus === "paid"
                          ? "font-bold text-emerald-700"
                          : r.paymentStatus === "refunded"
                            ? "font-bold text-slate-500"
                            : "font-bold text-amber-700"
                      }
                    >
                      {r.paymentStatus ?? "manual"}
                    </span>
                    {r.razorpayPaymentId && (
                      <div className="mt-0.5 font-mono text-[10px] text-slate-500">{r.razorpayPaymentId.slice(0, 14)}…</div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button type="button" onClick={() => setViewRow(r)} className="rounded border border-slate-300 px-2 py-1 text-[10px] font-bold uppercase hover:bg-slate-50">
                        View
                      </button>
                      <button type="button" onClick={() => startEdit(r)} className="rounded border border-slate-300 px-2 py-1 text-[10px] font-bold uppercase hover:bg-slate-50">
                        Edit
                      </button>
                      <button type="button" onClick={() => setPrintId(r.id)} className="rounded border border-orange-300 px-2 py-1 text-[10px] font-bold uppercase text-orange-700 hover:bg-orange-50">
                        Print
                      </button>
                      <button type="button" onClick={() => void removeRow(r)} className="rounded border border-rose-300 px-2 py-1 text-[10px] font-bold uppercase text-rose-700 hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600">No rows match these filters.</p>}
          <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        </div>
      )}

      <AdminModal
        open={Boolean(viewRow)}
        title="Registration details"
        onClose={() => setViewRow(null)}
        size="wide"
      >
        {viewRow && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Reference</dt>
              <dd className="font-mono text-xs">{viewRow.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Submitted</dt>
              <dd>{new Date(viewRow.createdAt).toLocaleString()}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-slate-500">Player</dt>
              <dd className="font-bold">{viewRow.playerName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-slate-500">Academy</dt>
              <dd>{viewRow.academyName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">DOB</dt>
              <dd>{new Date(viewRow.dateOfBirth).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Roles</dt>
              <dd>{formatRoles(viewRow.roles)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Trial zone</dt>
              <dd>
                {viewRow.trialZone ? `${viewRow.trialZone.trialPlace} — ${viewRow.trialZone.zone}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Email</dt>
              <dd>{viewRow.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Phone</dt>
              <dd>{viewRow.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase text-slate-500">Address</dt>
              <dd>{viewRow.address ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Payment</dt>
              <dd>{viewRow.paymentStatus ?? "manual"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Razorpay payment ID</dt>
              <dd className="font-mono text-xs">{viewRow.razorpayPaymentId ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              {viewRow.idProofPath && (
                <a className="font-bold text-orange-600 underline" href={`/api/admin/proof?id=${viewRow.id}&kind=id`} target="_blank" rel="noreferrer">
                  ID proof
                </a>
              )}
              {viewRow.paymentProofPath && (
                <a className="font-bold text-orange-600 underline" href={`/api/admin/proof?id=${viewRow.id}&kind=payment`} target="_blank" rel="noreferrer">
                  Payment proof
                </a>
              )}
            </div>
          </dl>
        )}
      </AdminModal>

      <AdminModal
        open={createOpen}
        title="Add registration (desk / walk-in)"
        onClose={() => setCreateOpen(false)}
        size="wide"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
              Cancel
            </button>
            <button type="submit" form="admin-reg-create" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {saving ? "Saving…" : "Create"}
            </button>
          </>
        }
      >
        <form id="admin-reg-create" onSubmit={saveCreate}>
          <AdminRegistrationFormFields form={form} setForm={setForm} trialZones={trialZones} disabled={saving} />
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(editing)}
        title={`Edit · ${editing?.playerName ?? ""}`}
        onClose={() => setEditing(null)}
        size="wide"
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
              Cancel
            </button>
            <button type="submit" form="admin-reg-edit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        <form id="admin-reg-edit" onSubmit={saveEdit}>
          <AdminRegistrationFormFields form={form} setForm={setForm} trialZones={trialZones} disabled={saving} />
          {editing?.razorpayPaymentId && (
            <p className="mt-4 text-xs font-medium text-slate-600">
              Razorpay payment ID (read-only): <span className="font-mono">{editing.razorpayPaymentId}</span>
            </p>
          )}
        </form>
      </AdminModal>

      <AdminRegistrationPrintModal registrationId={printId} onClose={() => setPrintId(null)} />
    </div>
  );
}
