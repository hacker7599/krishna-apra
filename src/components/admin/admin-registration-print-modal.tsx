"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { RegistrationSuccessDocument } from "@/components/registration-success-document";
import { humanErrorFromResponse, humanErrorFromThrown } from "@/lib/human-errors";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";
import { printRegistrationReceipt } from "@/lib/print-receipt";

type Props = {
  registrationId: string | null;
  onClose: () => void;
  /** After load, open the browser print dialog automatically (e.g. from View form → Print receipt). */
  autoPrint?: boolean;
};

type LoadedProps = {
  registrationId: string;
  onClose: () => void;
  autoPrint: boolean;
};

function AdminRegistrationPrintModalLoaded({ registrationId, onClose, autoPrint }: LoadedProps) {
  const [data, setData] = useState<RegistrationConfirmation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const autoPrintedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    autoPrintedRef.current = false;
    const startId = window.setTimeout(() => {
      setLoading(true);
      setError("");
    }, 0);

    void adminFetch(`/api/admin/registrations/${encodeURIComponent(registrationId)}/confirmation`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Your session has expired. Please sign in again.");
          }
          throw new Error(
            humanErrorFromResponse(body, "We could not prepare the printable receipt. Please try again."),
          );
        }
        return body as RegistrationConfirmation;
      })
      .then((row) => {
        if (!cancelled) setData(row);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            humanErrorFromThrown(e, "We could not prepare the printable receipt. Check your connection and try again."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
    };
  }, [registrationId]);

  useEffect(() => {
    if (!autoPrint || !data || loading || autoPrintedRef.current) return;
    autoPrintedRef.current = true;
    const timer = window.setTimeout(() => {
      setPrinting(true);
      try {
        printRegistrationReceipt();
      } finally {
        window.setTimeout(() => setPrinting(false), 500);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [autoPrint, data, loading]);

  function handlePrintClick() {
    if (!data) return;
    setPrinting(true);
    try {
      printRegistrationReceipt();
    } finally {
      window.setTimeout(() => setPrinting(false), 500);
    }
  }

  return (
    <AdminModal
      open
      title="Registration receipt"
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
            disabled={!data || loading || printing}
            onClick={handlePrintClick}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {printing ? "Opening print…" : "Print / save PDF"}
          </button>
        </>
      }
    >
      {loading && (
        <p className="text-sm font-medium text-slate-600">
          {autoPrint ? "Preparing your receipt for printing…" : "Loading receipt…"}
        </p>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-relaxed text-rose-900" role="alert">
          {error}
        </div>
      )}
      {data && (
        <div className="print-document-scope">
          <RegistrationSuccessDocument data={data} />
        </div>
      )}
      {autoPrint && data && !error && (
        <p className="mt-3 text-xs font-medium text-slate-600">
          If the print window did not open, allow pop-ups for this site or click &ldquo;Print / save PDF&rdquo; above.
        </p>
      )}
    </AdminModal>
  );
}

export function AdminRegistrationPrintModal({ registrationId, onClose, autoPrint = false }: Props) {
  if (!registrationId) return null;
  return (
    <AdminRegistrationPrintModalLoaded
      key={registrationId}
      registrationId={registrationId}
      onClose={onClose}
      autoPrint={autoPrint}
    />
  );
}
