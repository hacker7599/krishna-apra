"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import {
  AdminRegistrationFormFields,
  emptyAdminRegistrationForm,
  rowToAdminForm,
  type AdminRegistrationFormState,
} from "@/components/admin/admin-registration-form-fields";
import { AdminRegistrationPrintModal } from "@/components/admin/admin-registration-print-modal";
import { AdminRegistrationSubmissionModal } from "@/components/admin/admin-registration-submission-modal";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { adminRegistrationFormToFormData, adminRegistrationFormToPayload } from "@/lib/admin-registration-payload";
import { adminRegistrationProofUrl } from "@/lib/admin-registration-detail";
import { humanErrorFromResponse } from "@/lib/human-errors";

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
  playerPhotoPath: string | null;
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

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);
  const [printAutoStart, setPrintAutoStart] = useState(false);
  const [paymentProofPreview, setPaymentProofPreview] = useState<{ registrationId: string; playerName: string } | null>(
    null,
  );
  const [editing, setEditing] = useState<Row | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<AdminRegistrationFormState>(emptyAdminRegistrationForm);
  const [playerPhotoFile, setPlayerPhotoFile] = useState<File | null>(null);
  const [playerPhotoError, setPlayerPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "qr_upload">("razorpay");
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [modeSaving, setModeSaving] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);

  function resetFormState() {
    setForm(emptyAdminRegistrationForm);
    setPlayerPhotoFile(null);
    setPlayerPhotoError("");
  }

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
      setError("We could not load the registration list. Refresh the page or sign in again.");
      return;
    }
    setError("");
    const data = (await res.json()) as ListResponse;
    setRows(data.items);
    setTotal(data.total);
  }, [queryString]);

  const loadPaymentSettings = useCallback(async () => {
    const res = await adminFetch("/api/admin/payment-settings");
    if (!res.ok) return;
    const data = (await res.json()) as {
      paymentMode?: "razorpay" | "qr_upload";
      qrImageUrl?: string | null;
      razorpayConfigured?: boolean;
    };
    setPaymentMode(data.paymentMode === "qr_upload" ? "qr_upload" : "razorpay");
    setQrImageUrl(data.qrImageUrl ?? null);
    setRazorpayConfigured(data.razorpayConfigured === true);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
      void loadPaymentSettings();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load, loadPaymentSettings]);

  async function switchPaymentMode(mode: "razorpay" | "qr_upload") {
    setModeSaving(true);
    setError("");
    const res = await adminFetch("/api/admin/payment-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMode: mode }),
    });
    setModeSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(humanErrorFromResponse(data, "Could not change payment mode."));
      return;
    }
    const data = (await res.json()) as { paymentMode?: "razorpay" | "qr_upload"; qrImageUrl?: string | null };
    setPaymentMode(data.paymentMode === "qr_upload" ? "qr_upload" : "razorpay");
    setQrImageUrl(data.qrImageUrl ?? null);
  }

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
      setError("Please select at least one playing role for this player.");
      return;
    }
    if (!playerPhotoFile || playerPhotoFile.size === 0) {
      setPlayerPhotoError("Player photo is required.");
      return;
    }
    setPlayerPhotoError("");
    setSaving(true);
    setError("");
    const fd = adminRegistrationFormToFormData(adminRegistrationFormToPayload(form), {
      playerPhoto: playerPhotoFile,
    });
    const res = await adminFetch("/api/admin/registrations", {
      method: "POST",
      body: fd,
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        humanErrorFromResponse(data, "We could not save the new registration. Check all required fields and try again."),
      );
      return;
    }
    setCreateOpen(false);
    resetFormState();
    void load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (form.roles.length === 0) {
      setError("Please select at least one playing role for this player.");
      return;
    }
    const needsPhoto = !editing.playerPhotoPath?.trim();
    if (needsPhoto && (!playerPhotoFile || playerPhotoFile.size === 0)) {
      setPlayerPhotoError("Player photo is required.");
      return;
    }
    setPlayerPhotoError("");
    setSaving(true);
    setError("");
    const fd = adminRegistrationFormToFormData(adminRegistrationFormToPayload(form), {
      playerPhoto: playerPhotoFile,
    });
    const res = await adminFetch(`/api/admin/registrations/${editing.id}`, {
      method: "PATCH",
      body: fd,
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(humanErrorFromResponse(data, "Your changes were not saved. Check the form and try again."));
      return;
    }
    setEditing(null);
    resetFormState();
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
    else setError("We could not delete this registration. Try again in a moment.");
  }

  async function uploadPaymentQr(file: File | null) {
    if (!file) return;
    setQrUploading(true);
    const fd = new FormData();
    fd.set("qrImage", file);
    const res = await adminFetch("/api/admin/payment-qr", { method: "POST", body: fd });
    setQrUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(humanErrorFromResponse(data, "Could not upload payment QR."));
      return;
    }
    await loadPaymentSettings();
    if (qrFileRef.current) qrFileRef.current.value = "";
  }

  async function clearPaymentQr() {
    const res = await adminFetch("/api/admin/payment-qr", { method: "DELETE" });
    if (!res.ok) {
      setError("Could not remove payment QR.");
      return;
    }
    await loadPaymentSettings();
  }

  async function resendConfirmationEmail(r: Row) {
    setResendingId(r.id);
    setError("");
    const res = await adminFetch(`/api/admin/registrations/${r.id}/resend-confirmation`, { method: "POST" });
    setResendingId(null);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(humanErrorFromResponse(data, "Could not resend confirmation email."));
      return;
    }
    setError("");
    window.alert(`Confirmation email sent to ${r.email}.`);
  }

  async function updatePaymentDecision(id: string, decision: "approve" | "disapprove") {
    setApprovingId(id);
    setError("");
    const res = await adminFetch(`/api/admin/registrations/${id}/payment-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setApprovingId(null);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError(humanErrorFromResponse(data, "Could not update payment status."));
      return;
    }
    if (decision === "approve") {
      const emailNote =
        data.emailSent === false
          ? ` Payment marked received. Email was not sent${data.emailError ? `: ${data.emailError}` : ""} — use Resend email.`
          : " Payment marked received. Confirmation email sent.";
      setError("");
      window.alert(emailNote.trim());
    }
    void load();
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
    setPlayerPhotoFile(null);
    setPlayerPhotoError("");
    setCreateOpen(false);
    setSubmissionId(null);
  }

  function openCreate() {
    setCreateOpen(true);
    setEditing(null);
    resetFormState();
  }

  const statusSummary = useMemo(() => {
    const summary = { paid: 0, pending: 0, disapproved: 0, manual: 0 };
    for (const row of rows ?? []) {
      if (row.paymentStatus === "paid") summary.paid += 1;
      else if (row.paymentStatus === "refunded") summary.disapproved += 1;
      else if (row.paymentStatus === "pending_payment" || row.paymentStatus === "pending") summary.pending += 1;
      else summary.manual += 1;
    }
    return summary;
  }, [rows]);

  function paymentBadge(status: string | null) {
    if (status === "paid") return { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (status === "refunded") return { label: "disapproved", className: "bg-slate-100 text-slate-700 border-slate-200" };
    if (status === "pending" || status === "pending_payment") {
      return { label: "pending", className: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: status ?? "manual", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
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
              onClick={openCreate}
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

      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" open>
        <summary className="cursor-pointer list-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Public payment settings</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Switch Razorpay checkout or QR upload on{" "}
                <Link href="/register" target="_blank" className="font-bold text-orange-700 underline">
                  /register
                </Link>
                . View full history in{" "}
                <Link href="/admin/payments" className="font-bold text-[#1B365D] underline">
                  Payment logs
                </Link>
                .
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                paymentMode === "razorpay" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-800"
              }`}
            >
              {paymentMode === "razorpay" ? "Razorpay live" : "QR upload live"}
            </span>
          </div>
        </summary>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={modeSaving || paymentMode === "razorpay"}
              onClick={() => void switchPaymentMode("razorpay")}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                paymentMode === "razorpay"
                  ? "bg-[#1B365D] text-white"
                  : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              } disabled:opacity-60`}
            >
              Razorpay online
            </button>
            <button
              type="button"
              disabled={modeSaving || paymentMode === "qr_upload"}
              onClick={() => void switchPaymentMode("qr_upload")}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                paymentMode === "qr_upload"
                  ? "bg-[#1B365D] text-white"
                  : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              } disabled:opacity-60`}
            >
              QR + screenshot
            </button>
            {modeSaving ? <span className="self-center text-xs font-medium text-slate-500">Saving…</span> : null}
          </div>

          {!razorpayConfigured && paymentMode === "razorpay" ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Razorpay API keys are missing in server .env. Add keys or switch to QR mode.
            </p>
          ) : null}

          {paymentMode === "qr_upload" ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">
                  Upload the QR players scan, then they submit payment screenshot for your approval.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input
                    ref={qrFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void uploadPaymentQr(e.target.files?.[0] ?? null)}
                    className="hidden"
                    disabled={qrUploading}
                  />
                  <button
                    type="button"
                    onClick={() => qrFileRef.current?.click()}
                    disabled={qrUploading}
                    className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-60"
                  >
                    {qrUploading ? "Uploading..." : qrImageUrl ? "Replace QR" : "Upload QR"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void clearPaymentQr()}
                    disabled={!qrImageUrl || qrUploading}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    Remove QR
                  </button>
                </div>
              </div>
              {qrImageUrl ? (
                <Image
                  src={qrImageUrl}
                  alt="Current payment QR"
                  width={112}
                  height={112}
                  unoptimized
                  className="h-auto w-28 rounded border border-slate-200 bg-white object-contain"
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-600">
              Players pay via Razorpay on submit. Successful payments are marked <strong>Paid</strong> automatically and
              logged under Payment logs.
            </p>
          )}
        </div>
      </details>

      <form onSubmit={applyFilters} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <option value="pending_payment">Pending verification</option>
            <option value="paid">Approved</option>
            <option value="refunded">Disapproved</option>
            <option value="manual">Manual</option>
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
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Apply
          </button>
          <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Clear
          </button>
        </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Paid: {statusSummary.paid}
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            Pending: {statusSummary.pending}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
            Disapproved: {statusSummary.disapproved}
          </span>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
            Manual: {statusSummary.manual}
          </span>
        </div>
      </form>

      {error && <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900">{error}</p>}

      {rows === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading…</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 p-3 sm:p-4">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">{r.playerName}</p>
                    <p className="text-xs font-medium text-slate-600">{r.academyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${paymentBadge(r.paymentStatus).className}`}
                    >
                      {paymentBadge(r.paymentStatus).label}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                  <p><span className="font-semibold text-slate-900">Email:</span> {r.email}</p>
                  <p><span className="font-semibold text-slate-900">Phone:</span> {r.phone}</p>
                  {r.trialZone?.zone ? <p><span className="font-semibold text-slate-900">Zone:</span> {r.trialZone.zone}</p> : null}
                  {r.transactionRef ? <p><span className="font-semibold text-slate-900">Transaction:</span> {r.transactionRef}</p> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionId(r.id)}
                    className="rounded-md border border-[#1B365D]/30 bg-[#1B365D]/5 px-3 py-1.5 text-xs font-bold text-[#1B365D] hover:bg-[#1B365D]/10"
                  >
                    View form
                  </button>
                  <button type="button" onClick={() => startEdit(r)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      r.paymentProofPath &&
                      setPaymentProofPreview({
                        registrationId: r.id,
                        playerName: r.playerName,
                      })
                    }
                    disabled={!r.paymentProofPath}
                    className="rounded-md border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Payment proof
                  </button>
                  <button
                    type="button"
                    onClick={() => void updatePaymentDecision(r.id, "approve")}
                    disabled={approvingId === r.id || r.paymentStatus === "paid"}
                    className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {approvingId === r.id ? "Saving…" : r.paymentStatus === "paid" ? "Paid" : "Mark paid"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void updatePaymentDecision(r.id, "disapprove")}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Disapprove
                  </button>
                  <button
                    type="button"
                    onClick={() => void resendConfirmationEmail(r)}
                    disabled={resendingId === r.id}
                    className="rounded-md border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:opacity-50"
                  >
                    {resendingId === r.id ? "Sending…" : "Resend email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintAutoStart(false);
                      setPrintId(r.id);
                    }}
                    className="rounded-md border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                  >
                    Print
                  </button>
                  <button type="button" onClick={() => void removeRow(r)} className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {rows.length === 0 && <p className="px-4 py-8 text-center text-sm font-semibold text-slate-600">No rows match these filters.</p>}
          <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        </div>
      )}

      <AdminRegistrationSubmissionModal
        registrationId={submissionId}
        onClose={() => setSubmissionId(null)}
        onPrintReceipt={(id) => {
          setSubmissionId(null);
          setPrintAutoStart(true);
          setPrintId(id);
        }}
      />

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
          <AdminRegistrationFormFields
            form={form}
            setForm={setForm}
            trialZones={trialZones}
            disabled={saving}
            requirePlayerPhoto
            onPlayerPhotoChange={(file) => {
              setPlayerPhotoFile(file);
              if (file) setPlayerPhotoError("");
            }}
            playerPhotoError={playerPhotoError}
          />
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
          <AdminRegistrationFormFields
            form={form}
            setForm={setForm}
            trialZones={trialZones}
            disabled={saving}
            requirePlayerPhoto={!editing?.playerPhotoPath?.trim()}
            hasExistingPlayerPhoto={Boolean(editing?.playerPhotoPath?.trim())}
            onPlayerPhotoChange={(file) => {
              setPlayerPhotoFile(file);
              if (file) setPlayerPhotoError("");
            }}
            playerPhotoError={playerPhotoError}
          />
        </form>
      </AdminModal>

      <AdminRegistrationPrintModal
        registrationId={printId}
        autoPrint={printAutoStart}
        onClose={() => {
          setPrintId(null);
          setPrintAutoStart(false);
        }}
      />

      <AdminModal
        open={Boolean(paymentProofPreview)}
        title={paymentProofPreview ? `Payment proof · ${paymentProofPreview.playerName}` : "Payment proof"}
        onClose={() => setPaymentProofPreview(null)}
        size="wide"
      >
        {paymentProofPreview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={adminRegistrationProofUrl(paymentProofPreview.registrationId, "payment")}
              alt={`Payment proof uploaded by ${paymentProofPreview.playerName}`}
              className="mx-auto max-h-[70vh] w-auto max-w-full rounded border border-slate-200 bg-white object-contain"
            />
            <a
              href={adminRegistrationProofUrl(paymentProofPreview.registrationId, "payment")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open full size in new tab
            </a>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
