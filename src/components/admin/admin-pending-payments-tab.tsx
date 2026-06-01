"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { useAdminAlert } from "@/components/admin/ui/admin-alert-provider";
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
  razorpayOrderId: string | null;
  trialZone?: { trialPlace: string; zone: string } | null;
  paymentOrderStatus?: string | null;
};

type ListResponse = {
  items: Row[];
  total: number;
  limit: number;
  offset: number;
};

type Props = {
  trialZones: TrialZoneOption[];
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text).catch(() => undefined);
}

export function AdminPendingPaymentsTab({ trialZones }: Props) {
  const router = useRouter();
  const { showAlert } = useAdminAlert();
  const [q, setQ] = useState("");
  const [trialZoneId, setTrialZoneId] = useState("");
  const [applied, setApplied] = useState({ q: "", trialZoneId: "" });
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const PAGE_SIZE = 25;

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (applied.q) p.set("q", applied.q);
    if (applied.trialZoneId) p.set("trialZoneId", applied.trialZoneId);
    p.set("paymentStatus", "pending_payment");
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return p.toString();
  }, [applied, offset]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const res = await adminFetch(`/api/admin/registrations?${queryString}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load pending registrations.");
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
    setApplied({ q: q.trim(), trialZoneId });
    setOffset(0);
  }

  function clearFilters() {
    setQ("");
    setTrialZoneId("");
    setApplied({ q: "", trialZoneId: "" });
    setOffset(0);
  }

  async function sendPaymentLink(row: Row) {
    if (!row.email?.trim()) {
      await showAlert({
        variant: "error",
        title: "No email",
        message: "This registration has no email — cannot send a payment link.",
      });
      return;
    }
    setSendingId(row.id);
    const res = await adminFetch(`/api/admin/registrations/${encodeURIComponent(row.id)}/send-payment-link`, {
      method: "POST",
    });
    setSendingId(null);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      await showAlert({
        variant: "error",
        title: "Could not send",
        message: humanErrorFromResponse(data, "Could not send the payment link."),
      });
      return;
    }
    const url = typeof data.paymentUrl === "string" ? data.paymentUrl : "";
    if (url) copyToClipboard(url);
    const emailPart = data.emailSent
      ? `Payment reminder sent to ${data.email}.`
      : `Email was not sent${data.emailError ? `: ${data.emailError}` : ""}.`;
    const copyPart = url ? " Register link copied to clipboard." : "";
    await showAlert({
      variant: data.emailSent ? "success" : "info",
      title: data.emailSent ? "Payment link sent" : "Link ready",
      message: `${emailPart}${copyPart}`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold text-amber-900">Pending trial payment</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
          These players submitted registration details but have not completed Razorpay payment (or QR proof is not
          approved). Send them a reminder to open{" "}
          <Link href="/register" target="_blank" className="font-bold underline">
            /register
          </Link>{" "}
          with the same email and phone to pay. Manage QR approvals under{" "}
          <Link href="/admin/registrations" className="font-bold underline">
            Registrations
          </Link>
          .
        </p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[180px] flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Player, email, phone…"
          />
        </label>
        <label className="block min-w-[200px] sm:w-56">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Trial zone</span>
          <select
            value={trialZoneId}
            onChange={(e) => setTrialZoneId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All zones</option>
            {trialZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.trialPlace} — {z.zone}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Apply
          </button>
          <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Clear
          </button>
        </div>
        <p className="w-full text-xs font-semibold text-slate-600 sm:ml-auto sm:w-auto">
          {total} pending registration{total === 1 ? "" : "s"}
        </p>
      </form>

      {err ? <p className="text-sm font-semibold text-rose-700">{err}</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading…</p> : null}

      {!loading ? (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table min-w-[880px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Trial zone</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Checkout</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No pending payment registrations match your filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDt(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.playerName}</div>
                        <div className="text-xs text-slate-500">{row.academyName}</div>
                        {row.registrationCode ? (
                          <div className="mt-0.5 font-mono text-[10px] text-slate-500">{row.registrationCode}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {row.trialZone ? (
                          <>
                            <div className="font-medium">{row.trialZone.trialPlace}</div>
                            <div className="text-slate-500">{row.trialZone.zone}</div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{row.email}</div>
                        <div className="text-slate-500">{row.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {row.paymentOrderStatus === "failed" ? (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 font-bold text-rose-800">
                            Razorpay cancelled
                          </span>
                        ) : row.razorpayOrderId ? (
                          <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-bold text-orange-800">
                            Checkout started
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-800">
                            Not started
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            disabled={sendingId === row.id}
                            onClick={() => void sendPaymentLink(row)}
                            className="whitespace-nowrap rounded-lg bg-[#1B365D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#152a4a] disabled:opacity-50"
                          >
                            {sendingId === row.id ? "Sending…" : "Send payment link"}
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/admin/registrations")}
                            className="text-left text-xs font-semibold text-[#1B365D] underline hover:text-orange-700"
                          >
                            Open in registrations
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        </>
      ) : null}
    </div>
  );
}
