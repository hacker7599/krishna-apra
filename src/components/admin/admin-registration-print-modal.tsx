"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { RegistrationSuccessDocument } from "@/components/registration-success-document";
import type { RegistrationConfirmation } from "@/lib/registration-confirmation";
import { printRegistrationReceipt } from "@/lib/print-receipt";

type Props = {
  registrationId: string | null;
  onClose: () => void;
};

export function AdminRegistrationPrintModal({ registrationId, onClose }: Props) {
  const [data, setData] = useState<RegistrationConfirmation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!registrationId) {
      setData(null);
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    void adminFetch(`/api/admin/registrations/${encodeURIComponent(registrationId)}/confirmation`, {
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof body.error === "string" ? body.error : "Could not load receipt.");
        }
        return body as RegistrationConfirmation;
      })
      .then((row) => {
        if (!cancelled) setData(row);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load receipt.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [registrationId]);

  return (
    <AdminModal
      open={Boolean(registrationId)}
      title="Registration receipt"
      onClose={onClose}
      size="print"
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
            disabled={!data}
            onClick={printRegistrationReceipt}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            Print / save PDF
          </button>
        </>
      }
    >
      {loading && <p className="text-sm font-medium text-slate-600">Loading…</p>}
      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
      {data && (
        <div className="print-document-scope">
          <RegistrationSuccessDocument data={data} />
        </div>
      )}
    </AdminModal>
  );
}
