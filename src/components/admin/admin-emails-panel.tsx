"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";

type EmailLog = {
  id: string;
  createdAt: string;
  templateKey: string;
  toEmail: string;
  registrationId: string | null;
  success: boolean;
  providerMsgId: string | null;
  error: string | null;
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminEmailsPanel() {
  const [items, setItems] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [email, setEmail] = useState("");
  const [template, setTemplate] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const PAGE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const params = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
    if (email.trim()) params.set("email", email.trim());
    if (template) params.set("template", template);
    const res = await adminFetch(`/api/admin/email-logs?${params}`);
    if (!res.ok) {
      setErr("Could not load email logs.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: EmailLog[]; total: number };
    setItems(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [offset, email, template]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email log"
        description="SMTP transactional emails — registration confirmation, OTP verification, and completion invites."
      />

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
          void load();
        }}
      >
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Filter by recipient"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="registration_confirmation">Registration confirmation</option>
            <option value="registration_otp">Registration OTP</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0c1f3d]">
          Filter
        </button>
      </form>

      {err ? <p className="text-sm font-semibold text-rose-700">{err}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 w-[11rem]">Time</th>
              <th className="px-3 py-2 w-[10rem]">Template</th>
              <th className="px-3 py-2">To</th>
              <th className="px-3 py-2 w-[5rem]">Status</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No emails logged yet.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-2 text-xs text-slate-600">{formatDt(row.createdAt)}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-slate-700">{row.templateKey}</td>
                  <td className="px-3 py-2 truncate text-slate-900">{row.toEmail}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                        row.success
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                          : "bg-rose-50 text-rose-800 ring-rose-600/20"
                      }`}
                    >
                      {row.success ? "Sent" : "Failed"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500 break-all">
                    {row.error || row.providerMsgId || row.registrationId || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination total={total} limit={PAGE} offset={offset} onChange={setOffset} />
    </div>
  );
}
