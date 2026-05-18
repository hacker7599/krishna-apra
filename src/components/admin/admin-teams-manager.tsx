"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

const emptyForm = { name: "", city: "", accentColor: "#ea580c", description: "", published: true };

export function AdminTeamsManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<Team | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [published, appliedQ]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/teams${qs()}`, { credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load teams.");
      return;
    }
    setErr("");
    setTeams((await res.json()) as Team[]);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/teams/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: form.name,
        city: form.city,
        accentColor: form.accentColor,
        description: form.description,
        published: form.published,
      }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Save failed.");
      return;
    }
    setEditing(null);
    setForm(emptyForm);
    void load();
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
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
    setCreateOpen(false);
    setForm(emptyForm);
    void load();
  }

  async function togglePublished(t: Team) {
    const res = await fetch(`/api/admin/teams/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ published: !t.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  async function removeTeam(t: Team) {
    if (!window.confirm(`Delete team “${t.name}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/teams/${t.id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Teams</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Only published teams appear on the public /teams page.</p>
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
          Add team
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900"
            placeholder="Name, city, slug…"
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
            <option value="true">Published</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setAppliedQ(q.trim())}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900"
        >
          Apply filters
        </button>
      </div>

      {err && <p className="text-sm font-semibold text-rose-700">{err}</p>}

      {createOpen && (
        <form onSubmit={createTeam} className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
          <p className="text-sm font-bold text-slate-900">New team</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <input
              required
              placeholder="#RRGGBB"
              value={form.accentColor}
              onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
              Published on website
            </label>
          </div>
          <textarea
            placeholder="Short description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            rows={2}
          />
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
          <p className="text-sm font-bold text-slate-900">Edit “{editing.name}”</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <input
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <input
              required
              value={form.accentColor}
              onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
              Published
            </label>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            rows={2}
          />
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

      {teams === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Colour</th>
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="font-medium text-slate-800">
              {teams.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-600">{t.sortOrder}</td>
                  <td className="px-3 py-2 font-bold">{t.name}</td>
                  <td className="px-3 py-2">{t.city}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-5 w-5 rounded border border-slate-200" style={{ backgroundColor: t.accentColor }} />
                      <span className="text-xs text-slate-600">{t.accentColor}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2">{t.published ? <span className="text-emerald-700">Live</span> : <span className="text-slate-500">Hidden</span>}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" onClick={() => startEdit(t)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                        Edit
                      </button>
                      <button type="button" onClick={() => void togglePublished(t)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold hover:bg-slate-200">
                        Toggle
                      </button>
                      <button type="button" onClick={() => void removeTeam(t)} className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
