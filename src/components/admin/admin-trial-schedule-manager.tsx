"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import {
  combineDateAndTimeIst,
  formatTrialScheduleDateRange,
  formatTrialScheduleRange,
  splitDateTimeIst,
} from "@/lib/trial-schedule-datetime";
import { trialVenueDisplayLabel } from "@/lib/trial-zone-catalog";

type TrialZoneOption = { id: string; trialPlace: string; zone: string };

type TrialScheduleRow = {
  id: string;
  title: string;
  scheduledAt: string;
  endAt: string | null;
  notes: string | null;
  sortOrder: number;
  published: boolean;
  trialZoneId: string | null;
  trialZone: TrialZoneOption | null;
};

type ScheduleForm = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  trialZoneId: string;
  notes: string;
  published: boolean;
};

const PAGE_SIZE = 20;
const FORM_ID = "trial-schedule-form";
const emptyForm: ScheduleForm = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "",
  trialZoneId: "",
  notes: "",
  published: true,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15";

function rowToForm(row: TrialScheduleRow): ScheduleForm {
  const { date, time } = splitDateTimeIst(row.scheduledAt);
  const end = row.endAt ? splitDateTimeIst(row.endAt).time : "";
  return {
    title: row.title,
    date,
    startTime: time,
    endTime: end,
    trialZoneId: row.trialZoneId ?? "",
    notes: row.notes ?? "",
    published: row.published,
  };
}

export function AdminTrialScheduleManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const [rows, setRows] = useState<TrialScheduleRow[] | null>(null);
  const [zones, setZones] = useState<TrialZoneOption[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const [modalMode, setModalMode] = useState<null | "create" | "edit">(null);
  const [editing, setEditing] = useState<TrialScheduleRow | null>(null);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return `?${p.toString()}`;
  }, [published, appliedQ, offset]);

  const loadZones = useCallback(async () => {
    const res = await adminFetch("/api/admin/trial-zones?published=all&limit=100&offset=0");
    if (!res.ok) return;
    const data = (await res.json()) as { items: TrialZoneOption[] };
    setZones(data.items);
  }, []);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/admin/trial-schedule${qs()}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load trial schedule.");
      return;
    }
    setErr("");
    const data = (await res.json()) as { items: TrialScheduleRow[]; total: number };
    setRows(data.items);
    setTotal(data.total);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadZones();
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load, loadZones]);

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setForm(emptyForm);
    setFormErr("");
    setSaving(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, date: "2026-06-06" });
    setFormErr("");
    setModalMode("create");
  }

  function openEdit(row: TrialScheduleRow) {
    setEditing(row);
    setForm(rowToForm(row));
    setFormErr("");
    setModalMode("edit");
  }

  function toPayload() {
    const scheduledAt = combineDateAndTimeIst(form.date, form.startTime);
    const endAt = form.endTime.trim() ? combineDateAndTimeIst(form.date, form.endTime) : null;
    return {
      title: form.title.trim(),
      scheduledAt,
      endAt,
      notes: form.notes.trim() || null,
      trialZoneId: form.trialZoneId.trim() || null,
      published: form.published,
    };
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormErr("");
    const res = await adminFetch(`/api/admin/trial-schedule/${editing.id}`, {
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
      setFormErr(typeof d.error === "string" ? d.error : "Save failed.");
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    const res = await adminFetch("/api/admin/trial-schedule", {
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
      setFormErr(typeof d.error === "string" ? d.error : "Create failed.");
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function togglePublished(row: TrialScheduleRow) {
    const res = await adminFetch(`/api/admin/trial-schedule/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  async function removeRow(row: TrialScheduleRow) {
    if (!window.confirm(`Delete schedule “${row.title}”?`)) return;
    const res = await adminFetch(`/api/admin/trial-schedule/${row.id}`, { method: "DELETE" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not delete this schedule entry.");
      return;
    }
    if (editing?.id === row.id) closeModal();
    void load();
  }

  const formFields = (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Public trial schedule</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          Live entries appear on{" "}
          <Link href="/schedule" target="_blank" className="font-bold text-[#1B365D] underline">
            /schedule
          </Link>
          . Times use India (IST).
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">Title</span>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={inputClass}
          placeholder="e.g. U-15 open trials"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">Date</span>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">Start time</span>
          <input
            required
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">End time (optional)</span>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">Trial zone (optional)</span>
        <select
          value={form.trialZoneId}
          onChange={(e) => setForm((f) => ({ ...f, trialZoneId: e.target.value }))}
          className={inputClass}
        >
          <option value="">No linked zone</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {trialVenueDisplayLabel(z)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-600">Notes (optional)</span>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className={inputClass}
          placeholder="Reporting time, what to bring, gate instructions…"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={form.published}
          onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
        />
        Published (visible on public schedule page)
      </label>
    </div>
  );

  return (
    <div className="admin-panel mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Trial schedule"
        description="Manage trial dates, times, and venues shown on the public schedule page."
        actions={
          <button type="button" onClick={openCreate} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
            Add schedule entry
          </button>
        }
      />

      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
          setAppliedQ(q.trim());
        }}
      >
        <label className="min-w-[200px] flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} placeholder="Title, notes, venue…" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Status</span>
          <select value={published} onChange={(e) => setPublished(e.target.value as typeof published)} className={inputClass}>
            <option value="all">All</option>
            <option value="true">Published</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
          Apply
        </button>
      </form>

      {err ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900">{err}</p> : null}

      {rows === null ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-medium text-slate-600">
          No schedule entries yet. Add your first trial date.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{row.title}</p>
                  <p className="mt-1 text-sm font-semibold text-orange-700">
                    {formatTrialScheduleDateRange(row.scheduledAt, row.endAt)}
                  </p>
                  <p className="text-sm text-slate-600">{formatTrialScheduleRange(row.scheduledAt, row.endAt)}</p>
                  {row.trialZone ? (
                    <p className="mt-1 text-xs text-slate-600">{trialVenueDisplayLabel(row.trialZone)}</p>
                  ) : null}
                  {row.notes ? <p className="mt-2 text-xs text-slate-500">{row.notes}</p> : null}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    row.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {row.published ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(row)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                  Edit
                </button>
                <button type="button" onClick={() => void togglePublished(row)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                  {row.published ? "Hide" : "Publish"}
                </button>
                <button type="button" onClick={() => void removeRow(row)} className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
          <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        </div>
      )}

      <AdminModal
        open={modalMode !== null}
        title={modalMode === "edit" ? `Edit · ${editing?.title ?? ""}` : "Add schedule entry"}
        onClose={closeModal}
        size="wide"
        footer={
          <>
            <button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              form={FORM_ID}
              disabled={saving}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : modalMode === "edit" ? "Save changes" : "Create"}
            </button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={modalMode === "edit" ? saveEdit : createSlot}>
          {formErr ? <p className="mb-3 text-sm font-semibold text-rose-700">{formErr}</p> : null}
          {formFields}
        </form>
      </AdminModal>
    </div>
  );
}
