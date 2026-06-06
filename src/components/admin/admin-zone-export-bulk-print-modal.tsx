"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { RegistrationSuccessDocument } from "@/components/registration-success-document";
import { humanErrorFromResponse, humanErrorFromThrown } from "@/lib/human-errors";
import { printRegistrationReceiptBatch } from "@/lib/print-receipt";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";

const BATCH_CONTAINER_ID = "zone-export-print-batch";
const FETCH_CONCURRENCY = 6;

type Filters = {
  trialZoneId: string;
  q: string;
};

type Props = {
  open: boolean;
  filters: Filters;
  zoneLabel: string;
  onClose: () => void;
};

async function fetchConfirmation(id: string): Promise<RegistrationConfirmation> {
  const res = await adminFetch(`/api/admin/registrations/${encodeURIComponent(id)}/confirmation`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(humanErrorFromResponse(body, "Could not load a registration form."));
  }
  return body as RegistrationConfirmation;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export function AdminZoneExportBulkPrintModal({ open, filters, zoneLabel, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [forms, setForms] = useState<RegistrationConfirmation[]>([]);
  const [meta, setMeta] = useState<{ total: number; printCount: number; truncated: boolean } | null>(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError("");
    setForms([]);
    setMeta(null);
    setProgress("Finding paid players…");

    try {
      const p = new URLSearchParams();
      if (filters.trialZoneId) p.set("trialZoneId", filters.trialZoneId);
      if (filters.q) p.set("q", filters.q);

      const listRes = await adminFetch(`/api/admin/zone-registrations/print-batch?${p.toString()}`);
      const listBody = await listRes.json().catch(() => ({}));
      if (!listRes.ok) {
        throw new Error(humanErrorFromResponse(listBody, "Could not prepare the print list."));
      }

      const { ids, total, printCount, truncated } = listBody as {
        ids: string[];
        total: number;
        printCount: number;
        truncated: boolean;
      };

      if (!ids.length) {
        setError("No paid players match the current filters.");
        setLoading(false);
        return;
      }

      setMeta({ total, printCount, truncated });
      let done = 0;
      const rows = await mapPool(ids, FETCH_CONCURRENCY, async (id) => {
        const row = await fetchConfirmation(id);
        done += 1;
        setProgress(`Loading forms ${done} of ${ids.length}…`);
        return row;
      });

      setForms(rows);
      setProgress("");
    } catch (e) {
      setError(humanErrorFromThrown(e, "Could not load registration forms."));
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.trialZoneId]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => void loadForms(), 0);
    return () => window.clearTimeout(id);
  }, [open, loadForms]);

  function handlePrint() {
    if (!forms.length) return;
    setPrinting(true);
    try {
      printRegistrationReceiptBatch(BATCH_CONTAINER_ID);
    } finally {
      window.setTimeout(() => setPrinting(false), 800);
    }
  }

  return (
    <AdminModal
      open={open}
      title="Print all registration forms"
      onClose={onClose}
      size="print"
      layer="top"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!forms.length || loading || printing}
            onClick={handlePrint}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {printing ? "Opening print…" : `Print ${forms.length} form${forms.length === 1 ? "" : "s"}`}
          </button>
        </>
      }
    >
      <p className="text-sm font-medium text-slate-700">
        Filters: <span className="font-semibold text-slate-900">{zoneLabel}</span>
        {filters.q ? (
          <>
            {" "}
            · search &ldquo;<span className="font-semibold">{filters.q}</span>&rdquo;
          </>
        ) : null}
      </p>

      {loading ? <p className="mt-3 text-sm font-medium text-slate-600">{progress || "Loading…"}</p> : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900" role="alert">
          {error}
        </p>
      ) : null}

      {meta?.truncated ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          {meta.total} players match — printing the first {meta.printCount}. Narrow your trial zone or search to print
          fewer forms per run.
        </p>
      ) : null}

      {forms.length > 0 && !loading ? (
        <p className="mt-3 text-xs font-medium text-slate-600">
          Each paid player gets one A4 page with full details and player photo (when uploaded). Use Print / Save as PDF in
          your browser.
        </p>
      ) : null}

      {forms.length > 0 ? (
        <div id={BATCH_CONTAINER_ID} className="print-document-scope mt-4 space-y-8">
          {forms.map((form) => (
            <RegistrationSuccessDocument key={form.registrationId} data={form} printTargetId="" />
          ))}
        </div>
      ) : null}
    </AdminModal>
  );
}
