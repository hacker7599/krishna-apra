"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { TRIAL_FEE_INR } from "@/lib/league";

type PaymentOrder = {
  id: string;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  status: string;
  email: string | null;
  phone: string | null;
  playerName: string | null;
  registrationId: string | null;
  paidAt: string | null;
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

export function AdminPaymentsPanel() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [summary, setSummary] = useState({ paidCount: 0, orphanPaid: 0, totalRevenuePaise: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState<"orders" | "logs">("orders");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
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
  }, [q, status, ordersOffset, logsOffset]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <div className="admin-panel mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Payments & revenue"
        description="Every Razorpay order and webhook event is stored for audit. Orphan payments are paid but not linked to a registration."
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
          hint="Paid but no registration yet"
          accent="amber"
          href="/admin/registrations"
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
            <table className="admin-table w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Razorpay IDs</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No payment orders match your filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
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
                          <span className="font-medium text-emerald-700">Linked</span>
                        ) : o.status === "paid" ? (
                          <span className="font-medium text-amber-700">Orphan</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                        <div className="max-w-[180px] truncate" title={o.razorpayOrderId}>
                          {o.razorpayOrderId}
                        </div>
                        {o.razorpayPaymentId ? (
                          <div className="max-w-[180px] truncate" title={o.razorpayPaymentId}>
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
    </div>
  );
}
