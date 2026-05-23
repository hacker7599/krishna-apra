"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";

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

type ModalMode = null | "create" | "edit";

const empty: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  published: true,
};

const btnSecondary =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[#1B365D] hover:bg-slate-50 hover:text-[#1B365D]";
const btnPrimary = "rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152a4a] disabled:opacity-60";
const btnDanger = "rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-100";

export function AdminBannersManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const PAGE_SIZE = 15;
  const [rows, setRows] = useState<Banner[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (published !== "all") p.set("published", published);
    if (appliedQ) p.set("q", appliedQ);
    p.set("limit", String(PAGE_SIZE));
    p.set("offset", String(offset));
    return `?${p.toString()}`;
  }, [published, appliedQ, offset]);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/admin/banners${qs()}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load banners.");
      return;
    }
    setErr("");
    const data = (await res.json()) as { items: Banner[]; total: number };
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

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setForm(empty);
    setSaving(false);
    setUploading(false);
    setUploadErr("");
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadErr("");
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await adminFetch("/api/admin/banners/upload", { method: "POST",  body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        routerRef.current.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setUploadErr(typeof data.error === "string" ? data.error : "Upload failed.");
        return;
      }
      if (typeof data.imageUrl === "string") {
        setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
      }
    } catch {
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModalMode("create");
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title ?? "",
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      ctaLabel: b.ctaLabel ?? "",
      ctaHref: b.ctaHref ?? "",
      published: b.published,
    });
    setModalMode("edit");
  }

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
    if (!form.imageUrl.trim()) {
      setErr("Upload an image or paste an image URL.");
      return;
    }
    setSaving(true);
    const res = await adminFetch(`/api/admin/banners/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload()),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Save failed.");
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function createBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      setErr("Upload an image or paste an image URL.");
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/admin/banners", {
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
      setSaving(false);
      return;
    }
    closeModal();
    void load();
  }

  async function togglePublished(b: Banner) {
    const res = await adminFetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
    const res = await adminFetch(`/api/admin/banners/${b.id}`, { method: "DELETE", credentials: "include" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  const formFields = (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Banner image</span>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-6 transition hover:border-[#1B365D] hover:bg-slate-50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = "";
            }}
          />
          <span className="text-sm font-semibold text-[#1B365D]">{uploading ? "Uploading…" : "Click to upload image"}</span>
          <ImageUploadSizeHint specKey="heroBanner" className="mt-2 text-center text-xs font-medium leading-relaxed text-slate-500" />
        </label>
        {uploadErr ? <p className="mt-2 text-sm font-medium text-rose-700">{uploadErr}</p> : null}
        {form.imageUrl ? (
          <p className="mt-2 truncate font-mono text-[10px] text-slate-500" title={form.imageUrl}>
            {form.imageUrl}
          </p>
        ) : null}
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Or paste image URL</span>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
          placeholder="https://… or /branding/logo.png"
        />
        <ImageUploadSizeHint specKey="heroBanner" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Title</span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Subtitle</span>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Button label</span>
          <input
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
            placeholder="Register"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Button link</span>
          <input
            value={form.ctaHref}
            onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
            placeholder="/register or https://…"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
          checked={form.published}
          onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
        />
        Published on homepage carousel
      </label>
      {form.imageUrl.trim() ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <p className="border-b border-slate-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Preview</p>
          <div className="relative aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl.trim()} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      ) : null}
    </div>
  );

  const modalOpen = modalMode !== null;
  const modalTitle = modalMode === "create" ? "Add hero banner" : "Edit hero banner";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Hero banners</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Slides at the top of the homepage. Upload an image or use an external URL.
          </p>
        </div>
        <button type="button" onClick={openCreate} className={btnPrimary}>
          Add banner
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            placeholder="Title, URL…"
          />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Published</span>
          <select
            value={published}
            onChange={(e) => setPublished(e.target.value as "all" | "true" | "false")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
          >
            <option value="all">All</option>
            <option value="true">Live</option>
            <option value="false">Hidden</option>
          </select>
        </label>
        <button type="button" onClick={() => setAppliedQ(q.trim())} className={btnPrimary}>
          Apply
        </button>
      </div>

      {err && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{err}</p>}

      <AdminModal
        open={modalOpen}
        title={modalTitle}
        onClose={closeModal}
        footer={
          <>
            <button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              form="banner-form"
              disabled={saving || uploading}
              className={btnPrimary}
            >
              {saving ? "Saving…" : modalMode === "create" ? "Create banner" : "Save changes"}
            </button>
          </>
        }
      >
        <form
          id="banner-form"
          onSubmit={modalMode === "create" ? createBanner : saveEdit}
          className="space-y-4"
        >
          {formFields}
        </form>
      </AdminModal>

      {rows === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-medium text-slate-600">
          No banners yet. Click <strong className="text-[#1B365D]">Add banner</strong> to create one.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((b) => (
            <li key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[2/1] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                <span
                  className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    b.published ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"
                  }`}
                >
                  {b.published ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="space-y-1 p-4">
                <p className="font-semibold text-slate-900">{b.title || "—"}</p>
                <p className="line-clamp-2 text-xs text-slate-600">{b.subtitle || "—"}</p>
                <p className="truncate font-mono text-[10px] text-slate-500">{b.imageUrl}</p>
                <p className="text-xs font-medium text-slate-500">Display order {b.sortOrder}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={() => openEdit(b)} className={btnSecondary}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePublished(b)}
                    className={
                      b.published
                        ? "rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100"
                        : "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm hover:bg-emerald-100"
                    }
                  >
                    {b.published ? "Hide" : "Publish"}
                  </button>
                  <button type="button" onClick={() => void removeBanner(b)} className={btnDanger}>
                    Delete
                  </button>
                </div>
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
