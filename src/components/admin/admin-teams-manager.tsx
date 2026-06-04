"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { teamLogoPublicUrl } from "@/lib/team-logo-url";

type Team = {
  id: string;
  slug: string;
  name: string;
  city: string;
  logoPath: string | null;
  description: string;
  sortOrder: number;
  published: boolean;
};

type TeamForm = {
  name: string;
  city: string;
  logoPath: string | null;
  description: string;
  published: boolean;
  sortOrder: string;
};

type ListResponse = {
  items: Team[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_SIZE = 100;
const emptyForm: TeamForm = {
  name: "",
  city: "",
  logoPath: null,
  description: "",
  published: true,
  sortOrder: "",
};

async function readAdminError(res: Response, fallback: string): Promise<string> {
  const d = (await res.json().catch(() => ({}))) as {
    error?: string;
    details?: { fieldErrors?: Record<string, string[]> };
  };
  if (typeof d.error === "string" && d.error) return d.error;
  const fields = d.details?.fieldErrors;
  if (fields) {
    for (const messages of Object.values(fields)) {
      const msg = messages?.[0];
      if (typeof msg === "string" && msg) return msg;
    }
  }
  return fallback;
}

function formToPayload(form: TeamForm, includeSortOrder: boolean) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    city: form.city.trim(),
    logoPath: form.logoPath,
    description: form.description.trim(),
    published: form.published,
  };
  if (includeSortOrder && form.sortOrder.trim() !== "") {
    const n = Number(form.sortOrder);
    if (Number.isFinite(n)) payload.sortOrder = Math.trunc(n);
  }
  return payload;
}

function sortTeamsForDisplay(items: Team[]): Team[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AdminTeamsManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [formErr, setFormErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Team | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return `?${p.toString()}`;
  }, [published, appliedQ, offset]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch(`/api/admin/teams${qs()}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load teams.");
      setLoading(false);
      return;
    }
    setErr("");
    const data = (await res.json()) as ListResponse;
    setTeams(data.items);
    setTotal(data.total);
    setLoading(false);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  const sortedTeams = sortTeamsForDisplay(teams);
  const formLogoUrl = teamLogoPublicUrl(form.logoPath);

  async function uploadLogo(file: File | null) {
    if (!file) return;
    setLogoUploading(true);
    setFormErr("");
    const fd = new FormData();
    fd.set("logo", file);
    const res = await adminFetch("/api/admin/teams/upload", { method: "POST", body: fd });
    setLogoUploading(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { logoPath?: string; error?: string };
    if (!res.ok) {
      setFormErr(typeof data.error === "string" ? data.error : "Logo upload failed.");
      return;
    }
    if (data.logoPath) {
      setForm((f) => ({ ...f, logoPath: data.logoPath! }));
    }
    if (logoFileRef.current) logoFileRef.current.value = "";
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormErr("");
    const res = await adminFetch(`/api/admin/teams/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form, true)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setFormErr(await readAdminError(res, "Save failed. Check the fields and try again."));
      return;
    }
    setEditing(null);
    void load();
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    const res = await adminFetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form, true)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setFormErr(await readAdminError(res, "Create failed. Check the fields and try again."));
      return;
    }
    setCreateOpen(false);
    setForm(emptyForm);
    void load();
  }

  async function togglePublished(t: Team) {
    setErr("");
    const res = await adminFetch(`/api/admin/teams/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !t.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr(await readAdminError(res, "Could not update publish status."));
      return;
    }
    void load();
  }

  async function moveTeam(t: Team, direction: "up" | "down") {
    const sorted = sortTeamsForDisplay(teams);
    const index = sorted.findIndex((row) => row.id === t.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;

    const other = sorted[swapIndex];
    setErr("");
    const [resA, resB] = await Promise.all([
      adminFetch(`/api/admin/teams/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      adminFetch(`/api/admin/teams/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: t.sortOrder }),
      }),
    ]);
    if (!resA.ok || !resB.ok) {
      setErr("Could not reorder teams. Try again.");
      return;
    }
    void load();
  }

  async function removeTeam(t: Team) {
    if (!window.confirm(`Delete team “${t.name}”? This cannot be undone.`)) return;
    setErr("");
    const res = await adminFetch(`/api/admin/teams/${t.id}`, { method: "DELETE" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr(await readAdminError(res, "Delete failed."));
      return;
    }
    if (editing?.id === t.id) setEditing(null);
    void load();
  }

  function startEdit(t: Team) {
    setEditing(t);
    setForm({
      name: t.name,
      city: t.city,
      logoPath: t.logoPath,
      description: t.description,
      published: t.published,
      sortOrder: String(t.sortOrder),
    });
    setFormErr("");
    setCreateOpen(false);
  }

  const logoField = (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <span className="mb-2 block text-xs font-bold uppercase text-slate-600">Team logo</span>
      <div className="flex flex-wrap items-start gap-4">
        {formLogoUrl ? (
          <Image
            src={formLogoUrl}
            alt="Team logo preview"
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-lg font-bold text-[#1B365D]">
            {form.name.trim() ? teamInitials(form.name) : "—"}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={logoFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={logoUploading}
            onChange={(e) => void uploadLogo(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => logoFileRef.current?.click()}
              disabled={logoUploading}
              className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {logoUploading ? "Uploading…" : formLogoUrl ? "Replace logo" : "Upload logo"}
            </button>
            {form.logoPath ? (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, logoPath: null }))}
                disabled={logoUploading}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-white disabled:opacity-50"
              >
                Remove logo
              </button>
            ) : null}
          </div>
          <p className="text-[11px] font-medium text-slate-500">JPG, PNG, or WebP · max 5 MB · square logos work best</p>
        </div>
      </div>
    </div>
  );

  const teamForm = (
    <div className="space-y-4">
      {editing ? (
        <p className="text-xs font-medium text-slate-500">
          URL slug: <span className="font-mono text-slate-700">{editing.slug}</span> (set when created)
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Team name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">City</span>
          <input
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      {logoField}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Display order</span>
          <input
            type="number"
            min={0}
            step={1}
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            placeholder={createOpen ? "Auto (next)" : "0"}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-[11px] font-medium text-slate-500">Lower numbers appear first on /teams.</span>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={3}
          placeholder="Short blurb shown on the public teams page"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
        Published on website
      </label>
      {formErr ? <p className="text-sm font-semibold text-rose-700">{formErr}</p> : null}
    </div>
  );

  return (
    <div className="admin-panel mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Teams"
        description="Add, edit, reorder, and publish franchise teams. Upload a logo for each team — changes appear on /teams after save."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/teams"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View public page
            </Link>
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setEditing(null);
                setForm(emptyForm);
                setFormErr("");
              }}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
            >
              Add team
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAppliedQ(q.trim());
                setOffset(0);
              }
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name, city, slug…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Status</span>
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value as "all" | "true" | "false");
              setOffset(0);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
          className="rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-bold text-white hover:bg-[#152a4a]"
        >
          Search
        </button>
      </div>

      {err ? <p className="text-sm font-semibold text-rose-700">{err}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-600">Loading teams…</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--stack w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Site</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.length === 0 ? (
                    <tr className="admin-table__empty-row">
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500" data-label="">
                        No teams found. Use <span className="font-semibold">Add team</span> or run{" "}
                        <code className="rounded bg-slate-100 px-1 text-xs">npm run db:seed</code> for defaults.
                      </td>
                    </tr>
                  ) : (
                    sortedTeams.map((t, index) => {
                      const logoUrl = teamLogoPublicUrl(t.logoPath);
                      return (
                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                          <td data-label="Order" className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="w-6 font-mono text-xs text-slate-500">{t.sortOrder}</span>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => void moveTeam(t, "up")}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold disabled:opacity-30"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={index === sortedTeams.length - 1}
                                onClick={() => void moveTeam(t, "down")}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold disabled:opacity-30"
                                title="Move down"
                              >
                                ↓
                              </button>
                            </div>
                          </td>
                          <td data-label="Logo" className="px-4 py-3">
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt=""
                                width={40}
                                height={40}
                                unoptimized
                                className="h-10 w-10 rounded-md border border-slate-200 bg-white object-contain p-0.5"
                              />
                            ) : (
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold text-[#1B365D]">
                                {teamInitials(t.name)}
                              </span>
                            )}
                          </td>
                          <td data-label="Name" className="px-4 py-3 font-semibold text-slate-900">{t.name}</td>
                          <td data-label="City" className="px-4 py-3">{t.city}</td>
                          <td data-label="Site" className="px-4 py-3">
                            {t.published ? (
                              <span className="text-xs font-bold text-emerald-700">Live</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Hidden</span>
                            )}
                          </td>
                          <td data-label="Actions" className="admin-table__cell-actions px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <button type="button" onClick={() => startEdit(t)} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                                Edit
                              </button>
                              <button type="button" onClick={() => void togglePublished(t)} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                                {t.published ? "Hide" : "Publish"}
                              </button>
                              <button type="button" onClick={() => void removeTeam(t)} className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
          </>
        )}
      </div>

      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add team">
        <form onSubmit={createTeam} className="space-y-4">
          {teamForm}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Creating…" : "Create team"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}` : "Edit team"}>
        <form onSubmit={saveEdit} className="space-y-4">
          {teamForm}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
