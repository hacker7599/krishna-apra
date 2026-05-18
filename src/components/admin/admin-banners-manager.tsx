"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  published: boolean;
};

type BannerForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  published: boolean;
};

const empty: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  published: true,
};

export function AdminBannersManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [rows, setRows] = useState<Banner[] | null>(null);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<Banner | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<BannerForm>(empty);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [published, appliedQ]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/banners${qs()}`, { credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load banners.");
      return;
    }
    setErr("");
    setRows((await res.json()) as Banner[]);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  function toPayload() {
    return {
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      imageUrl: form.imageUrl.trim(),
      ctaLabel: form.ctaLabel.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      published: form.published,
    };
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/banners/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(toPayload()),
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
    setForm(empty);
    void load();
  }

  async function createBanner(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
    setCreateOpen(false);
    setForm(empty);
    void load();
  }

  async function togglePublished(b: Banner) {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ published: !b.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  async function removeBanner(b: Banner) {
    if (!window.confirm("Delete this banner slide?")) return;
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  function startEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title ?? "",
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      ctaLabel: b.ctaLabel ?? "",
      ctaHref: b.ctaHref ?? "",
      published: b.published,
    });
    setCreateOpen(false);
  }

  const formFields = (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Image URL</span>
        <input
          required
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
          placeholder="https://… or /branding/logo.png"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Subtitle</span>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Button label</span>
          <input
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            placeholder="Register"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Button link</span>
          <input
            value={form.ctaHref}
            onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            placeholder="/register or https://…"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
        Published on homepage carousel
      </label>
    </>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Hero banners</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Slides at the top of the homepage. Image URL: <code className="rounded bg-slate-100 px-1">https://…</code> or a path like{" "}
            <code className="rounded bg-slate-100 px-1">/branding/logo.png</code>. Button link: same-site path (starts with /, not //) or{" "}
            <code className="rounded bg-slate-100 px-1">https://…</code> only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setEditing(null);
            setForm(empty);
          }}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
        >
          Add banner
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            placeholder="Title, URL…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-700">Published</span>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value as "all" | "true" | "false")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
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
        <form onSubmit={createBanner} className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
          <p className="text-sm font-bold text-slate-900">New banner</p>
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
          <p className="text-sm font-bold text-slate-900">Edit banner</p>
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
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((b) => (
            <li key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[2/1] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1 p-3">
                <p className="font-bold text-slate-900">{b.title || "—"}</p>
                <p className="text-xs font-medium text-slate-600 line-clamp-2">{b.subtitle || "—"}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">{b.imageUrl}</p>
                <p className="text-xs font-semibold text-slate-700">
                  Order {b.sortOrder} · {b.published ? "Live" : "Hidden"}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <button type="button" onClick={() => startEdit(b)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold">
                    Edit
                  </button>
                  <button type="button" onClick={() => void togglePublished(b)} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold">
                    Toggle
                  </button>
                  <button type="button" onClick={() => void removeBanner(b)} className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
