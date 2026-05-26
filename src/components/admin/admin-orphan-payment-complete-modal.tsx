"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import {
  AdminRegistrationFormFields,
  emptyAdminRegistrationForm,
  type AdminRegistrationFormState,
} from "@/components/admin/admin-registration-form-fields";
import {
  adminRegistrationFormToFormData,
  adminRegistrationFormToPayload,
  paymentOrderToAdminFormPrefill,
} from "@/lib/admin-registration-payload";
import { humanErrorFromResponse } from "@/lib/human-errors";
import type { TrialZoneOption } from "@/lib/trial-zone-options";

export type OrphanPaymentRow = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  email: string | null;
  phone: string | null;
  playerName: string | null;
  paidAt: string | null;
};

type Props = {
  order: OrphanPaymentRow | null;
  trialZones: TrialZoneOption[];
  onClose: () => void;
  onCompleted: () => void;
};

function initialFormFromOrder(order: OrphanPaymentRow): AdminRegistrationFormState {
  return {
    ...emptyAdminRegistrationForm,
    ...paymentOrderToAdminFormPrefill({
      playerName: order.playerName,
      email: order.email,
      phone: order.phone,
      razorpayPaymentId: order.razorpayPaymentId,
      paidAt: order.paidAt ? new Date(order.paidAt) : null,
    }),
  };
}

function OrphanCompleteModal({
  order,
  trialZones,
  onClose,
  onCompleted,
}: {
  order: OrphanPaymentRow;
  trialZones: TrialZoneOption[];
  onClose: () => void;
  onCompleted: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialFormFromOrder(order));
  const [mode, setMode] = useState<"create" | "link">("create");
  const [linkRegistrationId, setLinkRegistrationId] = useState("");
  const [playerPhotoFile, setPlayerPhotoFile] = useState<File | null>(null);
  const [playerPhotoError, setPlayerPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (mode === "create" && form.roles.length === 0) {
      setError("Please select at least one playing role.");
      setSaving(false);
      return;
    }

    if (mode === "link" && !linkRegistrationId.trim()) {
      setError("Enter the registration ID to link (from Registrations list).");
      setSaving(false);
      return;
    }

    if (mode === "create" && (!playerPhotoFile || playerPhotoFile.size === 0)) {
      setPlayerPhotoError("Player photo is required.");
      setSaving(false);
      return;
    }
    setPlayerPhotoError("");

    const res = await adminFetch(`/api/admin/payments/${encodeURIComponent(order.id)}/complete-registration`, {
      method: "POST",
      ...(mode === "link"
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: linkRegistrationId.trim() }),
          }
        : {
            body: adminRegistrationFormToFormData(adminRegistrationFormToPayload(form), {
              playerPhoto: playerPhotoFile,
            }),
          }),
    });

    setSaving(false);

    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        humanErrorFromResponse(data, "Could not complete this registration. Check the form and try again."),
      );
      return;
    }

    const name = typeof data.registration?.playerName === "string" ? data.registration.playerName : "Player";
    if (data.mode === "linked") {
      setSuccess(`Linked payment to existing registration for ${name}. They now appear in Registrations.`);
    } else {
      const emailNote = data.emailSent ? " Confirmation email sent." : " Confirmation email was not sent (check MSG91).";
      setSuccess(`Registered ${name} successfully.${emailNote}`);
    }

    window.setTimeout(() => {
      onCompleted();
      onClose();
    }, 1200);
  }

  const amountInr = (order.amountPaise / 100).toLocaleString("en-IN");

  return (
    <AdminModal
      open
      title={`Complete registration · ${order.playerName ?? "Paid player"}`}
      onClose={onClose}
      size="wide"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="orphan-complete-form"
            disabled={saving || Boolean(success)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "link" ? "Link registration" : "Create registration"}
          </button>
        </>
      }
    >
      <form id="orphan-complete-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <p className="font-semibold">Paid online — registration not saved</p>
          <p className="mt-1 text-amber-900/90">
            Razorpay received ₹{amountInr} from this checkout. Fill in the trial form details below (same email and phone as
            payment) to add them to <strong>Registrations</strong>.
          </p>
          <dl className="mt-3 grid gap-1 text-xs font-medium text-amber-900/80 sm:grid-cols-2">
            <div>
              <dt className="uppercase tracking-wide opacity-70">Email</dt>
              <dd>{order.email}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide opacity-70">Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="uppercase tracking-wide opacity-70">Razorpay payment</dt>
              <dd className="font-mono">{order.razorpayPaymentId}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
              mode === "create" ? "bg-[#1B365D] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            New registration
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
              mode === "link" ? "bg-[#1B365D] text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Link existing
          </button>
        </div>

        {mode === "link" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Registration ID</span>
            <input
              value={linkRegistrationId}
              onChange={(e) => setLinkRegistrationId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder="Paste ID from Registrations table"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Use only if you already created this player manually. Email and phone must match the payment.
            </p>
          </label>
        ) : (
          <AdminRegistrationFormFields
            form={form}
            setForm={setForm}
            trialZones={trialZones}
            disabled={saving}
            readOnlyFields={["email", "phone"]}
            requirePlayerPhoto
            onPlayerPhotoChange={(file) => {
              setPlayerPhotoFile(file);
              if (file) setPlayerPhotoError("");
            }}
            playerPhotoError={playerPhotoError}
          />
        )}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900" role="status">
            {success}
          </p>
        ) : null}
      </form>
    </AdminModal>
  );
}

export function AdminOrphanPaymentCompleteModal({ order, trialZones, onClose, onCompleted }: Props) {
  if (!order) {
    return null;
  }

  return (
    <OrphanCompleteModal
      key={order.id}
      order={order}
      trialZones={trialZones}
      onClose={onClose}
      onCompleted={onCompleted}
    />
  );
}
