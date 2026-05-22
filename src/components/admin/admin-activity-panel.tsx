"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  clientIp: string | null;
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminActivityPanel() {
  const PAGE_SIZE = 30;
  const [items, setItems] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/activity?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) {
      setErr("Could not load activity log.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: AuditRow[]; total: number };
    setItems(data.items);
    setTotal(data.total);
    setErr("");
    setLoading(false);
  }, [offset]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <div className="admin-panel mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="Activity log"
        description="Record of create, update, and delete actions performed in the league desk."
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
      {err ? <p className="text-sm font-semibold text-rose-700">{err}</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading…</p> : null}
      {!loading ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-slate-500">No admin activity recorded yet.</li>
            ) : (
              items.map((row) => (
                <li key={row.id} className="px-4 py-4 hover:bg-slate-50/60">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <time>{formatDt(row.createdAt)}</time>
                    <span className="rounded bg-[#1B365D]/10 px-2 py-0.5 font-bold uppercase tracking-wide text-[#1B365D]">
                      {row.action}
                    </span>
                    <span className="text-slate-400">{row.entityType}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">{row.summary}</p>
                  {row.clientIp ? <p className="mt-0.5 font-mono text-[10px] text-slate-400">{row.clientIp}</p> : null}
                </li>
              ))
            )}
          </ul>
          {items.length > 0 ? (
            <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
