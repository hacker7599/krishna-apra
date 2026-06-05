"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { useAdminAlert } from "@/components/admin/ui/admin-alert-provider";
import { BlogRichTextEditor } from "@/components/admin/blog-rich-text-editor";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { humanErrorFromResponse } from "@/lib/human-errors";
import { emailBodyTextLength } from "@/lib/sanitize-email-body-html";
import type { TrialZoneOption } from "@/lib/trial-zone-options";
import { trialZoneSelectLabel } from "@/lib/trial-zone-options";

type ZonePreview = {
  id: string;
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl: string | null;
  contactDetails: string | null;
};

type RecipientPreview = {
  zone: ZonePreview;
  total: number;
  sample: Array<{ playerName: string; email: string; registrationCode: string | null }>;
};

type SendResult = {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
};

type PanelProps = {
  trialZones: TrialZoneOption[];
};

const DEFAULT_BODY_HTML = `<p>We look forward to seeing you at your trial.</p>
<p>Please arrive at least <strong>30 minutes before</strong> reporting time and bring the following documents:</p>
<ul>
<li>Player photo ID / Aadhaar or school ID</li>
<li>Age proof (birth certificate or school record)</li>
<li>Cricket kit and non-marking shoes</li>
<li>Water bottle and personal medical essentials if needed</li>
</ul>
<p>Academy coaches or parents may accompany the player. Follow venue instructions on the day.</p>`;

export function AdminBulkEmailPanel({ trialZones }: PanelProps) {
  const router = useRouter();
  const { showAlert } = useAdminAlert();

  const [trialZoneId, setTrialZoneId] = useState("");
  const [subject, setSubject] = useState("Future Star U-15 — your trial zone & documents to bring");
  const [body, setBody] = useState(DEFAULT_BODY_HTML);
  const [preview, setPreview] = useState<RecipientPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | null>(null);

  const loadPreview = useCallback(async (zoneId: string) => {
    if (!zoneId) {
      setPreview(null);
      setPreviewError("");
      return;
    }
    setPreviewLoading(true);
    setPreviewError("");
    const res = await adminFetch(`/api/admin/bulk-email/recipients?trialZoneId=${encodeURIComponent(zoneId)}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setPreview(null);
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      setPreviewError(humanErrorFromResponse(errBody, "Could not load recipients."));
      setPreviewLoading(false);
      return;
    }
    setPreview((await res.json()) as RecipientPreview);
    setPreviewLoading(false);
  }, [router]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadPreview(trialZoneId), 0);
    return () => window.clearTimeout(id);
  }, [trialZoneId, loadPreview]);

  async function handleSend() {
    if (!trialZoneId) {
      showAlert({ variant: "error", title: "Select a zone", message: "Choose a trial zone before sending." });
      return;
    }
    if (!preview || preview.total === 0) {
      showAlert({ variant: "error", title: "No recipients", message: "There are no registrations in this trial zone." });
      return;
    }

    const zoneLabel = trialZones.find((z) => z.id === trialZoneId);
    const confirmed = window.confirm(
      `Send this email to ${preview.total} registered player${preview.total === 1 ? "" : "s"} in ${
        zoneLabel ? trialZoneSelectLabel(zoneLabel) : "the selected zone"
      }?\n\nSubject: ${subject}`,
    );
    if (!confirmed) return;

    setSending(true);
    setLastResult(null);
    const res = await adminFetch("/api/admin/bulk-email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trialZoneId, subject, body }),
    });

    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }

    if (!res.ok) {
      setSending(false);
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      showAlert({
        variant: "error",
        title: "Send failed",
        message: humanErrorFromResponse(errBody, "Bulk email could not be sent."),
      });
      return;
    }

    const result = (await res.json()) as SendResult;
    setLastResult(result);
    setSending(false);

    showAlert({
      variant: result.failed === 0 ? "success" : "info",
      title: result.failed === 0 ? "Emails sent" : "Completed with errors",
      message:
        result.failed === 0
          ? `Successfully sent ${result.sent} email${result.sent === 1 ? "" : "s"}.`
          : `Sent ${result.sent} of ${result.total}. ${result.failed} failed — check Email log for details.`,
    });
  }

  return (
    <div className="admin-panel space-y-6">
      <AdminPageHeader
        description="Email all registered players in a trial zone. Each message includes your custom text plus venue, address, and map details for that zone."
      />

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Compose bulk email</h2>
        </div>
        <div className="admin-card__body space-y-5">
          <label className="block">
            <span className="admin-label">Trial zone</span>
            <select
              value={trialZoneId}
              onChange={(e) => setTrialZoneId(e.target.value)}
              className="admin-select mt-1 w-full max-w-xl"
            >
              <option value="">Select trial zone…</option>
              {trialZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {trialZoneSelectLabel(z)}
                </option>
              ))}
            </select>
          </label>

          {previewLoading ? (
            <p className="text-sm font-medium text-slate-600">Loading recipients…</p>
          ) : previewError ? (
            <p className="admin-alert admin-alert--error">{previewError}</p>
          ) : preview ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-bold text-slate-900">
                {preview.total} registered player{preview.total === 1 ? "" : "s"} in this zone
              </p>
              {preview.sample.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {preview.sample.map((r) => (
                    <li key={r.email}>
                      {r.playerName} · {r.email}
                      {r.registrationCode ? ` · ${r.registrationCode}` : ""}
                    </li>
                  ))}
                  {preview.total > preview.sample.length ? (
                    <li className="font-semibold text-slate-500">…and {preview.total - preview.sample.length} more</li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          ) : null}

          {preview?.zone ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50/60 px-4 py-3 text-sm text-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-800">Auto-included in every email</p>
              <p className="mt-1 font-semibold text-slate-900">
                {preview.zone.trialPlace} · {preview.zone.zone}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{preview.zone.address}</p>
              {preview.zone.contactDetails ? (
                <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">Contact: {preview.zone.contactDetails}</p>
              ) : null}
            </div>
          ) : null}

          <label className="block">
            <span className="admin-label">Subject line</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              className="admin-input mt-1 w-full"
              placeholder="Email subject"
            />
          </label>

          <div className="block">
            <span className="admin-label">Message body</span>
            <p className="mb-2 text-xs font-medium text-slate-500">
              Rich text — bold, lists, headings, and links. Each email opens with <strong>Dear [player name],</strong> automatically — write
              your message only. Trial zone details and the sign-off are added below.
            </p>
            <BlogRichTextEditor
              value={body}
              onChange={setBody}
              minHeight={280}
              proseClassName="admin-editor-prose"
              placeholder="Instructions about reporting time, documents to bring, dress code…"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {emailBodyTextLength(body)} characters · {body.length} HTML
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={sending || !trialZoneId || !preview?.total}
              onClick={() => void handleSend()}
              className="admin-btn admin-btn--primary"
            >
              {sending ? "Sending…" : `Send to ${preview?.total ?? 0} player${preview?.total === 1 ? "" : "s"}`}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => setBody(DEFAULT_BODY_HTML)}
              className="admin-btn admin-btn--secondary"
            >
              Reset sample message
            </button>
          </div>
        </div>
      </div>

      {lastResult ? (
        <div className={`admin-alert ${lastResult.failed ? "admin-alert--warning" : "admin-alert--success"}`}>
          <p className="font-bold">
            Last run: {lastResult.sent} sent, {lastResult.failed} failed (of {lastResult.total})
          </p>
          {lastResult.errors.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs">
              {lastResult.errors.map((e) => (
                <li key={e.email}>
                  {e.email}: {e.error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
