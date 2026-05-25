"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminRegistrationSubmissionView } from "@/components/admin/admin-registration-submission-view";
import type { AdminRegistrationDetail } from "@/lib/admin-registration-detail";
import { humanErrorFromResponse, humanErrorFromThrown } from "@/lib/human-errors";

type Props = {
  registrationId: string | null;
  onClose: () => void;
  onPrintReceipt?: (id: string) => void;
};

type LoadedProps = {
  registrationId: string;
  onClose: () => void;
  onPrintReceipt?: (id: string) => void;
};

function AdminRegistrationSubmissionModalLoaded({ registrationId, onClose, onPrintReceipt }: LoadedProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminRegistrationDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const startId = window.setTimeout(() => {
      setLoading(true);
      setError("");
    }, 0);

    void adminFetch(`/api/admin/registrations/${encodeURIComponent(registrationId)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/admin/login");
            return undefined;
          }
          throw new Error(
            humanErrorFromResponse(body, "We could not open this registration. Refresh the page and try again."),
          );
        }
        return body as AdminRegistrationDetail;
      })
      .then((row) => {
        if (!cancelled && row) setDetail(row);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            humanErrorFromThrown(e, "We could not open this registration. Check your connection and try again."),
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
  }, [registrationId, router]);

  function handlePrintReceipt() {
    onPrintReceipt?.(registrationId);
  }

  return (
    <AdminModal
      open
      title={detail ? `Submitted form · ${detail.playerName}` : "Submitted form"}
      onClose={onClose}
      size="xlarge"
      footer={
        <div className="flex flex-wrap gap-2">
          {onPrintReceipt ? (
            <button
              type="button"
              onClick={handlePrintReceipt}
              disabled={loading || Boolean(error)}
              className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-bold text-orange-800 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Print receipt
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      }
    >
      {loading && <p className="text-sm font-medium text-slate-600">Loading this player&apos;s registration…</p>}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-relaxed text-rose-900" role="alert">
          {error}
        </div>
      )}
      {detail && !error && <AdminRegistrationSubmissionView detail={detail} />}
    </AdminModal>
  );
}

export function AdminRegistrationSubmissionModal({ registrationId, onClose, onPrintReceipt }: Props) {
  if (!registrationId) return null;
  return (
    <AdminRegistrationSubmissionModalLoaded
      key={registrationId}
      registrationId={registrationId}
      onClose={onClose}
      onPrintReceipt={onPrintReceipt}
    />
  );
}
