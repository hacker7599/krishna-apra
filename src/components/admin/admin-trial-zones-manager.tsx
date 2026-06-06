"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";

type TrialZone = {
  id: string;
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl: string | null;
  contactDetails: string | null;
  sortOrder: number;
  published: boolean;
  registrationOpen: boolean;
};

type TrialZoneForm = {
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl: string;
  contactDetails: string;
  published: boolean;
  registrationOpen: boolean;
};

type ModalMode = null | "create" | "edit";

const PAGE_SIZE = 20;
const FORM_ID = "trial-zone-form";

const emptyForm: TrialZoneForm = {
  trialPlace: "",
  zone: "",
  address: "",
  navigationUrl: "",
  contactDetails: "",
  published: true,
  registrationOpen: true,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15";

const btnSecondary =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[#1B365D] hover:bg-slate-50 hover:text-[#1B365D]";

const btnPrimary = "rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152a4a] disabled:opacity-60";

const btnDanger = "rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-100";

function rowToForm(z: TrialZone): TrialZoneForm {
  return {
    trialPlace: z.trialPlace,
    zone: z.zone,
    address: z.address,
    navigationUrl: z.navigationUrl ?? "",
    contactDetails: z.contactDetails ?? "",
    published: z.published,
    registrationOpen: z.registrationOpen !== false,
  };
}

export function AdminTrialZonesManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const [rows, setRows] = useState<TrialZone[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<TrialZone | null>(null);
  const [form, setForm] = useState<TrialZoneForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return `?${p.toString()}`;
  }, [published, appliedQ, offset]);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/admin/trial-zones${qs()}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load trial zones.");
      return;
    }
    setErr("");
    const data = (await res.json()) as { items: TrialZone[]; total: number };
    setRows(data.items);
    setTotal(data.total);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setForm(emptyForm);
    setFormErr("");
    setSaving(false);
  }

  async function resyncOfficialCatalog() {
    if (
      !window.confirm(
        "Resync official trial venues from the league catalog? This updates addresses/maps for known venues and hides zones not in the catalog.",
      )
    ) {
      return;
    }
    setSyncing(true);
    setErr("");
    const res = await adminFetch("/api/admin/trial-zones/sync", { method: "POST" });
    setSyncing(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(typeof d.error === "string" ? d.error : "Could not resync trial zones.");
      return;
    }
    void load();
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErr("");
    setModalMode("create");
  }

  function openEdit(z: TrialZone) {
    setEditing(z);
    setForm(rowToForm(z));
    setFormErr("");
    setModalMode("edit");
  }

  function toPayload() {
    return {
      trialPlace: form.trialPlace.trim(),
      zone: form.zone.trim(),
      address: form.address.trim(),
      navigationUrl: form.navigationUrl.trim() || null,
      contactDetails: form.contactDetails.trim() || null,
      published: form.published,
      registrationOpen: form.registrationOpen,
    };
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormErr("");
    const res = await adminFetch(`/api/admin/trial-zones/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload()),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFormErr(typeof d.error === "string" ? d.error : "Save failed. Check all fields.");
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function createZone(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    const res = await adminFetch("/api/admin/trial-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload()),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFormErr(typeof d.error === "string" ? d.error : "Create failed. Check all fields.");
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function toggleRegistrationOpen(z: TrialZone) {
    const currentlyOpen = z.registrationOpen !== false;
    const res = await adminFetch(`/api/admin/trial-zones/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: !currentlyOpen }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(typeof d.error === "string" ? d.error : "Could not update registration status.");
      return;
    }
    void load();
  }

  async function togglePublished(z: TrialZone) {
    const res = await adminFetch(`/api/admin/trial-zones/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !z.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  async function removeZone(z: TrialZone) {
    if (!window.confirm(`Delete trial zone “${z.trialPlace}”? Registrations linked to this zone will lose the association.`)) return;
    const res = await adminFetch(`/api/admin/trial-zones/${z.id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(typeof d.error === "string" ? d.error : "Could not delete trial zone.");
      return;
    }
    if (editing?.id === z.id) closeModal();
    void load();
  }

  const mapsPreview = form.navigationUrl.trim();
  const mapsLooksValid = mapsPreview.startsWith("https://") || mapsPreview.startsWith("http://");

  const formFields = (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Shown on the public site</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          <strong>Live</strong> zones show on{" "}
          <Link href="/trials" target="_blank" className="font-bold text-[#1B365D] underline hover:text-orange-700">
            /trials
          </Link>
          . <strong>Registration open</strong> controls whether players can pick the zone on{" "}
          <Link href="/register" target="_blank" className="font-bold text-[#1B365D] underline hover:text-orange-700">
            online registration
          </Link>{" "}
          and the{" "}
          <Link href="/register/offline" target="_blank" className="font-bold text-[#1B365D] underline hover:text-orange-700">
            offline form
          </Link>
          . You can keep a zone live on the site but close new sign-ups. Hidden zones stay in admin only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Trial place / venue name</span>
          <input
            required
            value={form.trialPlace}
            onChange={(e) => setForm((f) => ({ ...f, trialPlace: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Krishna Apra Academy Ground"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Zone / area</span>
          <input
            required
            value={form.zone}
            onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Outer Delhi"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Visibility</span>
          <div className="flex min-h-[42px] flex-col justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    published: e.target.checked,
                    registrationOpen: e.target.checked ? f.registrationOpen : false,
                  }))
                }
              />
              Published (live on /trials)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                checked={form.registrationOpen}
                disabled={!form.published}
                onChange={(e) => setForm((f) => ({ ...f, registrationOpen: e.target.checked }))}
              />
              Registration open (selectable on register form)
            </label>
          </div>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Full address</span>
        <textarea
          required
          rows={3}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={inputClass}
          placeholder="Street, landmark, gate instructions…"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Google Maps link <span className="font-normal normal-case text-slate-500">(optional)</span>
        </span>
        <input
          value={form.navigationUrl}
          onChange={(e) => setForm((f) => ({ ...f, navigationUrl: e.target.value }))}
          className={`${inputClass} font-mono text-xs`}
          placeholder="https://maps.app.goo.gl/… or https://www.google.com/maps/…"
        />
        <p className="mt-1 text-xs text-slate-500">Used for the “Open in Maps” button on the public trials page.</p>
      </label>

      {mapsLooksValid ? (
        <a
          href={mapsPreview}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-xs font-bold text-[#1B365D] underline hover:text-orange-700"
        >
          Test maps link in new tab →
        </a>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Contact details <span className="font-normal normal-case text-slate-500">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={form.contactDetails}
          onChange={(e) => setForm((f) => ({ ...f, contactDetails: e.target.value }))}
          className={inputClass}
          placeholder="Coordinator name, phone, WhatsApp, email…"
        />
      </label>

      {formErr ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{formErr}</p>
      ) : null}
    </div>
  );

  const modalOpen = modalMode !== null;
  const modalTitle = modalMode === "create" ? "Add trial zone" : editing ? `Edit — ${editing.trialPlace}` : "Edit trial zone";

  return (
    <div className="admin-panel mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Trial zones"
        description={
          <>
            Manage trial venues for Delhi NCR. Published zones appear on{" "}
            <Link href="/trials" target="_blank" className="font-semibold text-[#1B365D] underline hover:text-orange-700">
              /trials
            </Link>{" "}
            and in online registration.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void resyncOfficialCatalog()}
              disabled={syncing}
              className={btnSecondary}
            >
              {syncing ? "Resyncing…" : "Resync official venues"}
            </button>
            <button type="button" onClick={openCreate} className={btnPrimary}>
              Add trial zone
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAppliedQ(q.trim());
                setOffset(0);
              }
            }}
            className={inputClass}
            placeholder="Place, zone, address, contact…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span>
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value as "all" | "true" | "false");
              setOffset(0);
            }}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="true">Published</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setAppliedQ(q.trim());
            setOffset(0);
          }}
          className={btnPrimary}
        >
          Search
        </button>
      </div>

      {err ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{err}</p>
      ) : null}

      <AdminModal
        open={modalOpen}
        title={modalTitle}
        onClose={closeModal}
        size="wide"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="submit" form={FORM_ID} disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : modalMode === "create" ? "Create trial zone" : "Save changes"}
            </button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={modalMode === "create" ? createZone : saveEdit} className="space-y-4">
          {formFields}
        </form>
      </AdminModal>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows === null ? (
          <p className="p-8 text-sm font-medium text-slate-600">Loading trial zones…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm font-medium text-slate-600">
            No trial zones match these filters.{" "}
            <button type="button" onClick={openCreate} className="font-bold text-[#1B365D] underline hover:text-orange-700">
              Add your first zone
            </button>
            .
          </p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--stack w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Venue</th>
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((z, index) => (
                    <tr key={z.id} className="border-b border-slate-100 align-top hover:bg-slate-50/80">
                      <td data-label="#" className="px-4 py-3 tabular-nums font-semibold text-slate-900">{offset + index + 1}</td>
                      <td data-label="Venue" className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{z.trialPlace}</p>
                        {z.navigationUrl ? (
                          <a
                            href={z.navigationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-0.5 inline-block max-w-[200px] truncate text-[11px] font-medium text-[#1B365D] underline hover:text-orange-700"
                            title={z.navigationUrl}
                          >
                            Maps link
                          </a>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-slate-400">No maps link</p>
                        )}
                      </td>
                      <td data-label="Zone" className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-800 ring-1 ring-orange-200">
                          {z.zone}
                        </span>
                      </td>
                      <td data-label="Address" className="max-w-none px-4 py-3 text-slate-700 sm:max-w-[220px]">
                        <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed">{z.address}</p>
                      </td>
                      <td data-label="Contact" className="max-w-none px-4 py-3 text-slate-700 sm:max-w-[180px]">
                        {z.contactDetails ? (
                          <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed">{z.contactDetails}</p>
                        ) : (
                          <p className="text-xs text-slate-400">—</p>
                        )}
                      </td>
                      <td data-label="Status" className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {z.published ? (
                            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                              Hidden
                            </span>
                          )}
                          {z.published && z.registrationOpen !== false ? (
                            <span className="inline-flex w-fit rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800 ring-1 ring-sky-200">
                              Reg. open
                            </span>
                          ) : z.published ? (
                            <span className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
                              Reg. closed
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td data-label="Actions" className="admin-table__cell-actions px-4 py-3">
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
                          <button type="button" onClick={() => openEdit(z)} className={btnSecondary}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void togglePublished(z)}
                            className={
                              z.published
                                ? "rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100"
                                : "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm hover:bg-emerald-100"
                            }
                          >
                            {z.published ? "Hide" : "Publish"}
                          </button>
                          {z.published ? (
                            <button
                              type="button"
                              onClick={() => void toggleRegistrationOpen(z)}
                              className={
                                z.registrationOpen !== false
                                  ? "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                                  : "rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 shadow-sm hover:bg-sky-100"
                              }
                            >
                              {z.registrationOpen !== false ? "Close registration" : "Open registration"}
                            </button>
                          ) : null}
                          <button type="button" onClick={() => void removeZone(z)} className={btnDanger}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>
    </div>
  );
}
