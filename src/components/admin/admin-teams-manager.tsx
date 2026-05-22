"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminColorPicker } from "@/components/admin/ui/admin-color-picker";

type Team = {
  id: string;
  slug: string;
  name: string;
  city: string;
  accentColor: string;
  description: string;
  sortOrder: number;
  published: boolean;
};

type ListResponse = {
  items: Team[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_SIZE = 20;
const emptyForm = { name: "", city: "", accentColor: "#ea580c", description: "", published: true };

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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Team | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    setOffset(0);
  }, [published, appliedQ]);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const res = await adminFetch(`/api/admin/teams/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Save failed.");
      return;
    }
    setEditing(null);
    void load();
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await adminFetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(typeof d.error === "string" ? d.error : "Create failed.");
      return;
    }
    setCreateOpen(false);
    setForm(emptyForm);
    void load();
  }

  async function togglePublished(t: Team) {
    const res = await adminFetch(`/api/admin/teams/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !t.published }),
    });
    if (res.ok) void load();
  }

  async function removeTeam(t: Team) {
    if (!window.confirm(`Delete team “${t.name}”? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/teams/${t.id}`, { method: "DELETE" });
    if (res.ok) void load();
  }

  function startEdit(t: Team) {
    setEditing(t);
    setForm({
      name: t.name,
      city: t.city,
      accentColor: t.accentColor,
      description: t.description,
      published: t.published,
    });
    setCreateOpen(false);
  }

  const teamForm = (
    <div className="space-y-4">
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
      <AdminColorPicker label="Accent colour" value={form.accentColor} onChange={(accentColor) => setForm((f) => ({ ...f, accentColor }))} />
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={3}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
        Published on website
      </label>
    </div>
  );

  return (
    <div className="admin-panel mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Teams"
        description="Manage franchise teams shown on the public site. Only published teams appear on /teams."
        actions={
          <button
            type="button"
            onClick={() => {
              setCreateOpen(true);
              setEditing(null);
              setForm(emptyForm);
            }}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
          >
            Add team
          </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAppliedQ(q.trim())}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name, city, slug…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-600">Status</span>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value as "all" | "true" | "false")}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="true">Published</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setAppliedQ(q.trim())}
          className="rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-bold text-white hover:bg-[#152a4a]"
        >
          Search
        </button>
      </div>

      {err && <p className="text-sm font-semibold text-rose-700">{err}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-600">Loading teams…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Colour</th>
                    <th className="px-4 py-3">Site</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        No teams found.
                      </td>
                    </tr>
                  ) : (
                    teams.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-slate-500">{t.sortOrder}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{t.name}</td>
                        <td className="px-4 py-3">{t.city}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-6 w-6 rounded-md border border-slate-200 shadow-inner" style={{ backgroundColor: t.accentColor }} />
                            <span className="font-mono text-xs text-slate-500">{t.accentColor}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {t.published ? (
                            <span className="text-xs font-bold text-emerald-700">Live</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Hidden</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
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
                    ))
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
