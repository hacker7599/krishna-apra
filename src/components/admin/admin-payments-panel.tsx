"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminOrphanPaymentCompleteModal, type OrphanPaymentRow } from "@/components/admin/admin-orphan-payment-complete-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { TRIAL_FEE_INR } from "@/lib/league";
import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import type { TrialZoneOption } from "@/lib/trial-zone-options";

type PaymentOrder = OrphanPaymentRow & {
  createdAt: string;
  status: string;
  registrationId: string | null;
  registrationPaymentStatus?: string | null;
  paymentMethod: string | null;
};

type PaymentLog = {
  id: string;
  createdAt: string;
  source: string;
  eventType: string;
  razorpayOrderId: string | null;
  success: boolean;
  message: string | null;
};

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    paise / 100,
  );
}

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

type PanelProps = {
  trialZones: TrialZoneOption[];
};

export function AdminPaymentsPanel({ trialZones }: PanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orphanFromUrl = searchParams.get("orphan") === "true" || searchParams.get("orphan") === "1";

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [summary, setSummary] = useState({ paidCount: 0, orphanPaid: 0, totalRevenuePaise: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(orphanFromUrl ? "paid" : "");
  const [orphanOnly, setOrphanOnly] = useState(orphanFromUrl);
  const [tab, setTab] = useState<"orders" | "logs">("orders");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [completeOrder, setCompleteOrder] = useState<OrphanPaymentRow | null>(null);
  const ORDERS_PAGE = 25;
  const LOGS_PAGE = 50;
  const [ordersOffset, setOrdersOffset] = useState(0);
  const [logsOffset, setLogsOffset] = useState(0);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [logsTotal, setLogsTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (orphanOnly) params.set("orphan", "true");
    params.set("limit", String(ORDERS_PAGE));
    params.set("offset", String(ordersOffset));
    const logsParams = new URLSearchParams({ limit: String(LOGS_PAGE), offset: String(logsOffset) });
    const [ordersRes, logsRes] = await Promise.all([
      adminFetch(`/api/admin/payments?${params}`),
      adminFetch(`/api/admin/payment-logs?${logsParams}`),
    ]);
    if (!ordersRes.ok) {
      setErr("Could not load payments.");
      setLoading(false);
      return;
    }
    const ordersData = (await ordersRes.json()) as {
      items: PaymentOrder[];
      total: number;
      summary: typeof summary;
    };
    setOrders(ordersData.items);
    setOrdersTotal(ordersData.total);
    setSummary(ordersData.summary);
    if (logsRes.ok) {
      const logsData = (await logsRes.json()) as { items: PaymentLog[]; total: number };
      setLogs(logsData.items);
      setLogsTotal(logsData.total);
    }
    setLoading(false);
  }, [q, status, orphanOnly, ordersOffset, logsOffset]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  function isOrphanRow(o: PaymentOrder) {
    if (o.status !== "paid" || !o.razorpayPaymentId) return false;
    if (!o.registrationId) return true;
    return o.registrationPaymentStatus === REGISTRATION_PAYMENT_PENDING;
  }

  return (
    <div className="admin-panel mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Payments & revenue"
        description="Razorpay orders and event log. Complete orphan payments to add players to Registrations."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#1B365D] shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      />

      {summary.orphanPaid > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-bold">
            {summary.orphanPaid} paid order{summary.orphanPaid === 1 ? "" : "s"} not yet fully enrolled
          </p>
          <p className="mt-1 leading-relaxed text-amber-900/90">
            These players paid online but did not finish the form (or the save failed). Use{" "}
            <strong>Complete registration</strong> on each row to add them to{" "}
            <Link href="/admin/registrations" className="font-semibold underline hover:text-orange-800">
              Registrations
            </Link>
            .
          </p>
          {!orphanOnly ? (
            <button
              type="button"
              onClick={() => {
                setOrphanOnly(true);
                setStatus("paid");
                setOrdersOffset(0);
              }}
              className="mt-3 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-900"
            >
              Show orphan payments only
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Paid orders" value={summary.paidCount} accent="green" />
        <AdminStatCard
          label="Revenue (paid)"
          value={formatInr(summary.totalRevenuePaise)}
          hint={`${TRIAL_FEE_INR} per trial slot`}
          accent="navy"
        />
        <AdminStatCard
          label="Orphan payments"
          value={summary.orphanPaid}
          hint="Paid — not enrolled yet"
          accent="amber"
        />
        <AdminStatCard label="Fee per registration" value={TRIAL_FEE_INR} accent="orange" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search order id, email, phone, player…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOrdersOffset(0);
          }}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setOrdersOffset(0);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          <option value="">All statuses</option>
          <option value="created">Created</option>
          <option value="paid">Paid</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <input
            type="checkbox"
            checked={orphanOnly}
            onChange={(e) => {
              setOrphanOnly(e.target.checked);
              if (e.target.checked) setStatus("paid");
              setOrdersOffset(0);
            }}
            className="h-4 w-4 rounded border-slate-300 text-[#1B365D]"
          />
          Orphans only
        </label>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "orders" ? "bg-[#1B365D] text-white" : "text-slate-600"}`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setTab("logs")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "logs" ? "bg-[#1B365D] text-white" : "text-slate-600"}`}
          >
            Event log
          </button>
        </div>
      </div>

      {err ? <p className="text-sm font-semibold text-rose-700">{err}</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading…</p> : null}

      {!loading && tab === "orders" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3">Razorpay IDs</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      {orphanOnly ? "No orphan payments — all paid orders are linked." : "No payment orders match your filters."}
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className={`border-b border-slate-100 hover:bg-slate-50/50 ${isOrphanRow(o) ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDt(o.paidAt ?? o.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{o.playerName ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{o.email ?? "—"}</div>
                        <div className="text-slate-500">{o.phone ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatInr(o.amountPaise)}</td>
                      <td className="px-4 py-3">
                        <AdminBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {o.registrationId ? (
                          <Link
                            href="/admin/registrations"
                            className="font-medium text-emerald-700 underline hover:text-emerald-900"
                          >
                            Registered
                          </Link>
                        ) : isOrphanRow(o) ? (
                          <span className="font-medium text-amber-800">Orphan — needs form</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isOrphanRow(o) ? (
                          <button
                            type="button"
                            onClick={() => setCompleteOrder(o)}
                            className="whitespace-nowrap rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700"
                          >
                            Complete registration
                          </button>
                        ) : o.registrationId ? (
                          <button
                            type="button"
                            onClick={() => router.push("/admin/registrations")}
                            className="text-xs font-semibold text-[#1B365D] underline hover:text-orange-700"
                          >
                            View registrations
                          </button>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                        <div className="max-w-[160px] truncate" title={o.razorpayOrderId}>
                          {o.razorpayOrderId}
                        </div>
                        {o.razorpayPaymentId ? (
                          <div className="max-w-[160px] truncate" title={o.razorpayPaymentId}>
                            {o.razorpayPaymentId}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination total={ordersTotal} limit={ORDERS_PAGE} offset={ordersOffset} onChange={setOrdersOffset} />
        </div>
      ) : null}

      {!loading && tab === "logs" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">No payment events logged yet.</li>
            ) : (
              logs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-start gap-3 px-4 py-3 text-sm hover:bg-slate-50/50">
                  <span className="text-xs text-slate-500">{formatDt(log.createdAt)}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{log.source}</span>
                  <span className="font-medium text-slate-800">{log.eventType}</span>
                  {log.razorpayOrderId ? (
                    <span className="font-mono text-[10px] text-slate-500">{log.razorpayOrderId}</span>
                  ) : null}
                  {!log.success ? <span className="text-xs font-semibold text-rose-600">{log.message ?? "Failed"}</span> : null}
                </li>
              ))
            )}
          </ul>
          <AdminPagination total={logsTotal} limit={LOGS_PAGE} offset={logsOffset} onChange={setLogsOffset} />
        </div>
      ) : null}

      <AdminOrphanPaymentCompleteModal
        order={completeOrder}
        trialZones={trialZones}
        onClose={() => setCompleteOrder(null)}
        onCompleted={() => void load()}
      />
    </div>
  );
}
