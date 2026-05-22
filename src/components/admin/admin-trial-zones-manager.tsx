"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";

type TrialZone = {
  id: string;
  trialPlace: string;
  zone: string;
  address: string;
  navigationUrl: string;
  contactDetails: string;
  sortOrder: number;
  published: boolean;
};

const emptyForm = {
  trialPlace: "",
  zone: "",
  address: "",
  navigationUrl: "",
  contactDetails: "",
  published: true,
};

export function AdminTrialZonesManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const PAGE_SIZE = 20;
  const [rows, setRows] = useState<TrialZone[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<TrialZone | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    setOffset(0);
  }, [published, appliedQ]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  function toPayload() {
    return {
      trialPlace: form.trialPlace.trim(),
      zone: form.zone.trim(),
      address: form.address.trim(),
      navigationUrl: form.navigationUrl.trim(),
      contactDetails: form.contactDetails.trim(),
      published: form.published,
    };
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
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
      setErr(typeof d.error === "string" ? d.error : "Save failed.");
      return;
    }
    setErr("");
    setEditing(null);
    setForm(emptyForm);
    void load();
  }

  async function createZone(e: React.FormEvent) {
    e.preventDefault();
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
      setErr(typeof d.error === "string" ? d.error : "Create failed.");
      return;
    }
    setErr("");
    setCreateOpen(false);
    setForm(emptyForm);
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
    if (!window.confirm(`Delete trial zone “${z.trialPlace}”? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/trial-zones/${z.id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  function startEdit(z: TrialZone) {
    setEditing(z);
    setForm({
      trialPlace: z.trialPlace,
      zone: z.zone,
      address: z.address,
      navigationUrl: z.navigationUrl,
      contactDetails: z.contactDetails,
      published: z.published,
    });
    setCreateOpen(false);
  }

  const formFields = (
    <div className="grid gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Trial place</span>
        <input
          required
          value={form.trialPlace}
          onChange={(e) => setForm((f) => ({ ...f, trialPlace: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          placeholder="e.g. Krishna Apra Academy Ground"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Zone</span>
        <input
          required
          value={form.zone}
          onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          placeholder="e.g. Outer Delhi"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Address</span>
        <textarea
          required
          rows={3}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          placeholder="Full address or gate instructions"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Google Maps URL</span>
        <input
          required
          value={form.navigationUrl}
          onChange={(e) => setForm((f) => ({ ...f, navigationUrl: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs font-medium text-slate-900"
          placeholder="https://maps.app.goo.gl/… or https://www.google.com/maps/…"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Contact details</span>
        <textarea
          required
          rows={2}
          value={form.contactDetails}
          onChange={(e) => setForm((f) => ({ ...f, contactDetails: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
          placeholder="Phone, WhatsApp, email for this zone"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
        Published on public /trials page
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Trial zones</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Places, zones, addresses, Google Maps links, and contacts shown on the public{" "}
            <a href="/trials" className="font-bold text-orange-700 underline hover:text-orange-800">
              /trials
            </a>{" "}
            page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setEditing(null);
            setForm(emptyForm);
          }}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
        >
          Add trial zone
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
            placeholder="Place, zone, address…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Published</span>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value as "all" | "true" | "false")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
          >
            <option value="all">All</option>
            <option value="true">Live</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button type="button" onClick={() => setAppliedQ(q.trim())} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white">
          Apply
        </button>
      </div>

      {err && <p className="text-sm font-semibold text-rose-700">{err}</p>}

      {createOpen && (
        <form onSubmit={createZone} className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
          <p className="text-sm font-bold text-slate-900">New trial zone</p>
          {formFields}
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white">
              Create
            </button>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editing && (
        <form onSubmit={saveEdit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Edit “{editing.trialPlace}”</p>
          {formFields}
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {rows === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm font-semibold text-slate-600">No trial zones match these filters.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((z) => (
            <li key={z.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase text-orange-700">{z.zone}</p>
              <p className="mt-1 font-[family-name:var(--font-barlow)] text-xl font-bold italic text-slate-900">{z.trialPlace}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-700">{z.address}</p>
              <p className="mt-2 truncate font-mono text-[11px] text-slate-500" title={z.navigationUrl}>
                {z.navigationUrl}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-800">{z.contactDetails}</p>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Order {z.sortOrder} · {z.published ? "Live on /trials" : "Hidden"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <button type="button" onClick={() => startEdit(z)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                  Edit
                </button>
                <button type="button" onClick={() => void togglePublished(z)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                  Toggle
                </button>
                <button type="button" onClick={() => void removeZone(z)} className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length > 0 ? (
        <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
      ) : null}
    </div>
  );
}
