"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminStatCard } from "@/components/admin/ui/admin-stat-card";

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

type Summary = {
  total: number;
  sentCount: number;
  failedCount: number;
};

const PAGE_SIZE = 25;

const TEMPLATE_OPTIONS = [
  { value: "", label: "All templates" },
  { value: "registration_confirmation", label: "Registration confirmation" },
  { value: "registration_otp", label: "OTP verification" },
  { value: "registration_completion_invite", label: "Completion invite" },
] as const;

const TEMPLATE_LABELS: Record<string, string> = {
  registration_confirmation: "Registration confirmation",
  registration_otp: "OTP verification",
  registration_completion_invite: "Completion invite",
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function templateLabel(key: string) {
  return TEMPLATE_LABELS[key] ?? key.replace(/_/g, " ");
}

function detailText(row: EmailLog): { primary: string; secondary?: string } {
  if (!row.success && row.error) {
    return { primary: row.error, secondary: row.providerMsgId ?? undefined };
  }
  if (row.providerMsgId) {
    return { primary: row.providerMsgId };
  }
  if (row.registrationId) {
    return { primary: "Linked registration", secondary: row.registrationId };
  }
  return { primary: "—" };
}

export function AdminEmailsPanel() {
  const [items, setItems] = useState<EmailLog[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, sentCount: 0, failedCount: 0 });
  const [offset, setOffset] = useState(0);

  const [draftEmail, setDraftEmail] = useState("");
  const [draftTemplate, setDraftTemplate] = useState("");
  const [applied, setApplied] = useState({ email: "", template: "" });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (applied.email) p.set("email", applied.email);
    if (applied.template) p.set("template", applied.template);
    return p.toString();
  }, [offset, applied]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const res = await adminFetch(`/api/admin/email-logs?${queryString}`);
    if (!res.ok) {
      setErr("Could not load email logs.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      items: EmailLog[];
      summary?: Summary;
      total: number;
    };
    setItems(data.items);
    setSummary(
      data.summary ?? {
        total: data.total,
        sentCount: data.items.filter((i) => i.success).length,
        failedCount: data.items.filter((i) => !i.success).length,
      },
    );
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ email: draftEmail.trim().toLowerCase(), template: draftTemplate });
    setOffset(0);
  }

  function clearFilters() {
    setDraftEmail("");
    setDraftTemplate("");
    setApplied({ email: "", template: "" });
    setOffset(0);
  }

  const hasFilters = Boolean(applied.email || applied.template);

  return (
    <div className="admin-email-log space-y-6">
      <AdminPageHeader
        title="Email log"
        description="Confirmation and notification delivery history."
      />

      <div className="admin-email-log__stats">
        <AdminStatCard label="Total (filtered)" value={summary.total} accent="navy" />
        <AdminStatCard label="Sent" value={summary.sentCount} accent="green" />
        <AdminStatCard label="Failed / throttled" value={summary.failedCount} accent="amber" />
      </div>

      <form className="admin-filters" onSubmit={applyFilters}>
        <div className="admin-filters__field admin-filters__field--grow">
          <label className="admin-label" htmlFor="email-log-filter-email">
            Recipient email
          </label>
          <input
            id="email-log-filter-email"
            type="search"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            className="admin-input w-full min-w-[12rem]"
            placeholder="e.g. player@example.com"
            autoComplete="off"
          />
        </div>
        <div className="admin-filters__field">
          <label className="admin-label" htmlFor="email-log-filter-template">
            Template
          </label>
          <select
            id="email-log-filter-template"
            value={draftTemplate}
            onChange={(e) => setDraftTemplate(e.target.value)}
            className="admin-select min-w-[11rem]"
          >
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-filters__actions">
          <button type="submit" className="admin-btn admin-btn--primary">
            Apply filters
          </button>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="admin-btn admin-btn--secondary">
              Clear
            </button>
          ) : null}
        </div>
      </form>

      {hasFilters ? (
        <p className="admin-email-log__active-filters text-xs font-medium text-slate-600">
          Showing results for
          {applied.email ? (
            <>
              {" "}
              email <span className="font-semibold text-slate-900">{applied.email}</span>
            </>
          ) : null}
          {applied.template ? (
            <>
              {applied.email ? " ·" : ""} template{" "}
              <span className="font-semibold text-slate-900">{templateLabel(applied.template)}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {err ? <p className="admin-alert admin-alert--error">{err}</p> : null}

      <div className="admin-email-log__card">
        <div className="admin-email-log__card-head">
          <h2 className="admin-email-log__card-title">Delivery history</h2>
          <p className="admin-email-log__card-hint">SMTP · registration confirmation, OTP, completion invites</p>
        </div>

        <div className="admin-table-wrap admin-email-log__table-wrap">
          <table className="admin-table admin-email-log__table min-w-[52rem]">
            <thead>
              <tr>
                <th className="admin-email-log__col-time">Time</th>
                <th className="admin-email-log__col-template">Template</th>
                <th className="admin-email-log__col-to">Recipient</th>
                <th className="admin-email-log__col-status">Status</th>
                <th className="admin-email-log__col-detail">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-email-log__empty">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-email-log__empty">
                    {hasFilters ? "No emails match these filters." : "No emails logged yet."}
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const detail = detailText(row);
                  return (
                    <tr key={row.id}>
                      <td className="admin-email-log__cell-time whitespace-nowrap">{formatDt(row.createdAt)}</td>
                      <td className="admin-email-log__cell-template">
                        <span className="admin-email-log__template-pill" title={row.templateKey}>
                          {templateLabel(row.templateKey)}
                        </span>
                      </td>
                      <td className="admin-email-log__cell-to">
                        <span className="block max-w-[14rem] truncate font-medium" title={row.toEmail}>
                          {row.toEmail}
                        </span>
                      </td>
                      <td className="admin-email-log__cell-status">
                        <span
                          className={`admin-email-log__status ${
                            row.success ? "admin-email-log__status--sent" : "admin-email-log__status--failed"
                          }`}
                        >
                          {row.success ? "Sent" : "Failed"}
                        </span>
                      </td>
                      <td className="admin-email-log__cell-detail">
                        <p
                          className={`admin-email-log__detail-primary ${!row.success ? "admin-email-log__detail-primary--error" : ""}`}
                          title={detail.primary}
                        >
                          {detail.primary}
                        </p>
                        {detail.secondary ? (
                          <p className="admin-email-log__detail-secondary" title={detail.secondary}>
                            {row.registrationId && detail.secondary === row.registrationId ? (
                              <Link href="/admin/registrations" className="text-[#1B365D] underline hover:text-orange-700">
                                View registration
                              </Link>
                            ) : (
                              detail.secondary
                            )}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          total={summary.total}
          limit={PAGE_SIZE}
          offset={offset}
          onChange={setOffset}
          className="admin-email-log__pagination"
        />
      </div>
    </div>
  );
}
