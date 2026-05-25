"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogRichTextEditor } from "@/components/admin/blog-rich-text-editor";
import { BlogPostContent } from "@/components/blog-post-content";
import { adminFetch } from "@/components/admin/admin-session-provider";
import { isEmptyEditorHtml } from "@/lib/blog-content-utils";
import { AdminModal } from "@/components/admin/admin-modal";
import { ImageUploadSizeHint } from "@/components/image-upload-size-hint";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { IMAGE_UPLOAD_SPECS } from "@/lib/image-upload-specs";
import { sampleBlogPost } from "@/lib/blog-sample-post";
import { slugify } from "@/lib/slug";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  authorName: string;
  published: boolean;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsNoindex: boolean;
  updatedAt: string;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robotsNoindex: boolean;
};

type ModalMode = null | "create" | "edit";
type EditorTab = "write" | "seo" | "preview";

const empty: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  authorName: "Future Star League Desk",
  published: false,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImageUrl: "",
  canonicalUrl: "",
  robotsNoindex: false,
};

const btnSecondary =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-[#1B365D] hover:bg-slate-50 hover:text-[#1B365D]";
const btnPrimary = "rounded-lg bg-[#1B365D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152a4a] disabled:opacity-60";
const btnDanger = "rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-100";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15";

const tabClass = (active: boolean) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    active ? "bg-[#1B365D] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
  }`;

function CharHint({ value, max }: { value: string; max: number }) {
  const n = value.length;
  const over = n > max;
  return (
    <p className={`mt-1 text-right text-[11px] font-medium ${over ? "text-rose-600" : n > max * 0.85 ? "text-amber-700" : "text-slate-400"}`}>
      {n} / {max} characters
    </p>
  );
}

function postToForm(p: BlogPost): BlogForm {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImageUrl: p.coverImageUrl ?? "",
    authorName: p.authorName,
    published: p.published,
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    metaKeywords: p.metaKeywords ?? "",
    ogImageUrl: p.ogImageUrl ?? "",
    canonicalUrl: p.canonicalUrl ?? "",
    robotsNoindex: p.robotsNoindex,
  };
}

function sampleToForm(): BlogForm {
  return {
    title: sampleBlogPost.title,
    slug: sampleBlogPost.slug,
    excerpt: sampleBlogPost.excerpt,
    content: sampleBlogPost.content,
    coverImageUrl: sampleBlogPost.coverImageUrl,
    authorName: sampleBlogPost.authorName,
    published: false,
    metaTitle: sampleBlogPost.metaTitle,
    metaDescription: sampleBlogPost.metaDescription,
    metaKeywords: sampleBlogPost.metaKeywords,
    ogImageUrl: "",
    canonicalUrl: "",
    robotsNoindex: false,
  };
}

function toPayload(form: BlogForm) {
  const trimOrNull = (s: string) => {
    const t = s.trim();
    return t === "" ? null : t;
  };
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    coverImageUrl: trimOrNull(form.coverImageUrl),
    authorName: form.authorName.trim(),
    published: form.published,
    metaTitle: trimOrNull(form.metaTitle),
    metaDescription: trimOrNull(form.metaDescription),
    metaKeywords: trimOrNull(form.metaKeywords),
    ogImageUrl: trimOrNull(form.ogImageUrl),
    canonicalUrl: trimOrNull(form.canonicalUrl),
    robotsNoindex: form.robotsNoindex,
  };
}

function fieldErrorMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const flat = (details as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  if (!flat) return null;
  for (const msgs of Object.values(flat)) {
    if (msgs?.[0]) return msgs[0];
  }
  return null;
}

export function AdminBlogManager() {
  const router = useRouter();
  const routerRef = useRef(router);
  const slugTouchedRef = useRef(false);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const PAGE_SIZE = 12;
  const [rows, setRows] = useState<BlogPost[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [published, setPublished] = useState<"all" | "true" | "false">("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [err, setErr] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>("write");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"cover" | "og">("cover");
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
    const res = await adminFetch(`/api/admin/blog-posts${qs()}`);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setErr("Could not load articles. Refresh the page or sign in again.");
      return;
    }
    setErr("");
    const data = (await res.json()) as { items: BlogPost[]; total: number };
    setRows(data.items);
    setTotal(data.total);
  }, [qs]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  function closeModal() {
    setModalMode(null);
    setEditing(null);
    setForm(empty);
    setEditorTab("write");
    slugTouchedRef.current = false;
    setSaving(false);
    setUploading(false);
    setUploadErr("");
  }

  function openCreate() {
    setEditing(null);
    setForm(empty);
    slugTouchedRef.current = false;
    setEditorTab("write");
    setModalMode("create");
  }

  function openEdit(p: BlogPost) {
    setEditing(p);
    setForm(postToForm(p));
    slugTouchedRef.current = true;
    setEditorTab("write");
    setModalMode("edit");
  }

  function onTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouchedRef.current ? f.slug : slugify(title),
    }));
  }

  function fillFromSample() {
    setForm(sampleToForm());
    slugTouchedRef.current = true;
    setEditorTab("write");
    setErr("");
  }

  function fillSeoFromArticle() {
    setForm((f) => ({
      ...f,
      metaTitle: f.metaTitle.trim() || f.title.trim().slice(0, 70),
      metaDescription: f.metaDescription.trim() || f.excerpt.trim().slice(0, 320),
    }));
    setEditorTab("seo");
  }

  async function uploadImage(file: File, target: "cover" | "og") {
    setUploading(true);
    setUploadTarget(target);
    setUploadErr("");
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await adminFetch("/api/admin/blog-posts/upload", { method: "POST", body: fd });
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
        setForm((f) =>
          target === "cover" ? { ...f, coverImageUrl: data.imageUrl } : { ...f, ogImageUrl: data.imageUrl },
        );
      }
    } catch {
      setUploadErr("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!form.title.trim() || isEmptyEditorHtml(form.content)) {
      setErr("Please add a title and article body.");
      setEditorTab("write");
      return;
    }
    setSaving(true);
    setErr("");
    const res = await adminFetch(`/api/admin/blog-posts/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(fieldErrorMessage(d.details) ?? (typeof d.error === "string" ? d.error : "Could not save changes."));
      return;
    }
    closeModal();
    void load();
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || isEmptyEditorHtml(form.content)) {
      setErr("Please add a title and article body.");
      setEditorTab("write");
      return;
    }
    setSaving(true);
    setErr("");
    const res = await adminFetch("/api/admin/blog-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    setSaving(false);
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(fieldErrorMessage(d.details) ?? (typeof d.error === "string" ? d.error : "Could not create article."));
      return;
    }
    closeModal();
    void load();
  }

  async function togglePublished(p: BlogPost) {
    const res = await adminFetch(`/api/admin/blog-posts/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  async function removePost(p: BlogPost) {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    const res = await adminFetch(`/api/admin/blog-posts/${p.id}`, { method: "DELETE" });
    if (res.status === 401) {
      routerRef.current.replace("/admin/login");
      return;
    }
    if (res.ok) void load();
  }

  const publicPath = form.slug.trim() ? `/blog/${form.slug.trim()}` : "/blog/…";

  const imageUploadBlock = (
    target: "cover" | "og",
    label: string,
    hint: string,
    specKey: "blogCover" | "blogOg",
    value: string,
    onUrl: (v: string) => void,
  ) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <span className="mb-1 block text-sm font-semibold text-slate-800">{label}</span>
      <p className="mb-3 text-xs text-slate-500">{hint}</p>
      {value.trim() ? (
        <div className="relative mb-3 aspect-[2/1] overflow-hidden rounded-lg border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.trim()} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-4 transition hover:border-[#1B365D] hover:bg-orange-50/30">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file, target);
            e.target.value = "";
          }}
        />
        <span className="text-sm font-semibold text-[#1B365D]">
          {uploading && uploadTarget === target ? "Uploading…" : "Choose image from computer"}
        </span>
        <ImageUploadSizeHint specKey={specKey} className="mt-2 text-center text-xs font-medium leading-relaxed text-slate-500" />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Or paste image link</span>
        <input value={value} onChange={(e) => onUrl(e.target.value)} className={inputClass} placeholder="https://…" />
      </label>
      <p className="text-[10px] text-slate-400">
        Target: {IMAGE_UPLOAD_SPECS[specKey].width}×{IMAGE_UPLOAD_SPECS[specKey].height}px
      </p>
    </div>
  );

  const writeTab = (
    <div className="space-y-4">
      {modalMode === "create" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-orange-200 bg-orange-50/60 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">New here? Load our sample article and edit it.</p>
          <button type="button" onClick={fillFromSample} className={btnSecondary}>
            Load sample content
          </button>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Headline</span>
        <input
          required
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClass}
          placeholder="e.g. Season 1 trials are open"
        />
      </label>

      <label className="block">
        <span className="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
          Web address (slug)
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-normal text-slate-600">{publicPath}</span>
        </span>
        <input
          value={form.slug}
          onChange={(e) => {
            slugTouchedRef.current = true;
            setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }));
          }}
          className={inputClass}
          placeholder="auto-generated-from-headline"
        />
        <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens only. Leave blank to auto-create from headline.</p>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Short summary</span>
        <textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={inputClass}
          placeholder="Shown on the blog listing and in Google if you skip the SEO description."
          maxLength={500}
        />
        <CharHint value={form.excerpt} max={500} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Author name</span>
        <input
          value={form.authorName}
          onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          className={inputClass}
          placeholder="e.g. Future Star League Desk"
        />
      </label>

      {imageUploadBlock(
        "cover",
        "Cover photo",
        "Appears at the top of the article and on the blog listing card.",
        "blogCover",
        form.coverImageUrl,
        (v) => setForm((f) => ({ ...f, coverImageUrl: v })),
      )}

      <div className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Article body</span>
        <p className="mb-2 text-xs text-slate-500">Type normally and use the toolbar for bold, headings, lists, and links — no special codes needed.</p>
        <BlogRichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
      </div>
    </div>
  );

  const seoTab = (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">Optional — Google & social previews</p>
        <p className="mt-1 text-xs text-slate-500">If you leave these empty, we use the headline and short summary automatically.</p>
        <button type="button" onClick={fillSeoFromArticle} className={`${btnSecondary} mt-3`}>
          Copy headline & summary into SEO fields
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Google title</span>
        <input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} className={inputClass} maxLength={70} />
        <CharHint value={form.metaTitle} max={70} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Google description</span>
        <textarea
          rows={3}
          value={form.metaDescription}
          onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
          className={inputClass}
          maxLength={320}
        />
        <CharHint value={form.metaDescription} max={320} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Keywords</span>
        <input
          value={form.metaKeywords}
          onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
          className={inputClass}
          placeholder="cricket, trials, Delhi NCR — comma separated"
        />
      </label>

      {imageUploadBlock(
        "og",
        "Social share image",
        "Used when the link is shared on WhatsApp, Facebook, etc. Defaults to cover photo if empty.",
        "blogOg",
        form.ogImageUrl,
        (v) => setForm((f) => ({ ...f, ogImageUrl: v })),
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-800">Canonical link (advanced)</span>
        <input
          value={form.canonicalUrl}
          onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
          className={inputClass}
          placeholder="Usually leave blank — we use /blog/your-slug"
        />
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-slate-800">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1B365D]"
          checked={form.robotsNoindex}
          onChange={(e) => setForm((f) => ({ ...f, robotsNoindex: e.target.checked }))}
        />
        <span>
          <span className="font-semibold">Hide from Google</span>
          <span className="mt-0.5 block text-xs text-slate-600">Turn on only for internal or duplicate pages.</span>
        </span>
      </label>
    </div>
  );

  const previewTab = (
    <div className="space-y-4">
      {!form.title.trim() && isEmptyEditorHtml(form.content) ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          Add a headline and body on the <strong>Write</strong> tab to see a preview.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {form.coverImageUrl.trim() ? (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverImageUrl.trim()} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <h3 className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-slate-900">{form.title || "Untitled"}</h3>
          {form.excerpt ? <p className="prose-league mt-2 text-base font-medium text-slate-600">{form.excerpt}</p> : null}
          {form.authorName ? <p className="mt-2 text-xs font-semibold text-slate-500">By {form.authorName}</p> : null}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <BlogPostContent content={form.content || "*Nothing to preview yet.*"} />
          </div>
        </div>
      )}
    </div>
  );

  const modalOpen = modalMode !== null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold italic tracking-tight text-slate-900">Blog</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Write news for the public site — no code needed.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" target="_blank" className={btnSecondary}>
            Open public blog ↗
          </Link>
          <button type="button" onClick={openCreate} className={btnPrimary}>
            + New article
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">Quick guide</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-slate-700">
          <li>Click <strong>New article</strong> and write on the Write tab (or load sample content).</li>
          <li>Check <strong>Preview</strong> to see how it will look on the website.</li>
          <li>Tick <strong>Publish on website</strong>, then Save — your post appears at /blog.</li>
        </ol>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Search articles</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} placeholder="Search by title…" />
        </label>
        <label className="block w-full sm:w-44">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Show</span>
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value as "all" | "true" | "false");
              setOffset(0);
            }}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="true">Live on site</option>
            <option value="false">Drafts only</option>
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

      {err && !modalOpen ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{err}</p> : null}

      <AdminModal
        open={modalOpen}
        size="wide"
        title={modalMode === "create" ? "New article" : `Edit: ${editing?.title ?? "Article"}`}
        onClose={closeModal}
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#1B365D]"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Publish on website (/blog)
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button type="submit" form="blog-form" disabled={saving || uploading} className={btnPrimary}>
                {saving ? "Saving…" : form.published ? "Save & publish" : "Save draft"}
              </button>
            </div>
          </div>
        }
      >
        <form id="blog-form" onSubmit={modalMode === "create" ? createPost : saveEdit}>
          {err && modalOpen ? (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{err}</p>
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2" role="tablist">
            <button type="button" className={tabClass(editorTab === "write")} onClick={() => setEditorTab("write")}>
              1. Write
            </button>
            <button type="button" className={tabClass(editorTab === "seo")} onClick={() => setEditorTab("seo")}>
              2. SEO (optional)
            </button>
            <button type="button" className={tabClass(editorTab === "preview")} onClick={() => setEditorTab("preview")}>
              3. Preview
            </button>
          </div>

          {editorTab === "write" ? writeTab : null}
          {editorTab === "seo" ? seoTab : null}
          {editorTab === "preview" ? previewTab : null}
          {uploadErr ? <p className="mt-4 text-sm font-medium text-rose-700">{uploadErr}</p> : null}
        </form>
      </AdminModal>

      {rows === null ? (
        <p className="text-sm font-semibold text-slate-600">Loading articles…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">No articles yet.</p>
          <button type="button" onClick={openCreate} className={`${btnPrimary} mt-4`}>
            Create your first article
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row">
                {p.coverImageUrl ? (
                  <div className="relative h-32 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-40">
                    <Image
                      src={p.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={p.coverImageUrl.startsWith("/api/")}
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-full shrink-0 items-center justify-center bg-gradient-to-br from-[#1B365D] to-slate-700 sm:h-auto sm:w-32">
                    <span className="font-[family-name:var(--font-bebas)] text-lg text-white/90">Blog</span>
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          p.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                      {p.robotsNoindex ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">Hidden from Google</span>
                      ) : null}
                    </div>
                    <h2 className="mt-1 font-semibold text-slate-900">{p.title}</h2>
                    <p className="text-xs text-slate-500">
                      Public link:{" "}
                      <span className="font-mono text-[#1B365D]">/blog/{p.slug}</span>
                    </p>
                    {p.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.excerpt}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.published ? (
                      <Link href={`/blog/${p.slug}`} target="_blank" className={btnSecondary}>
                        View live ↗
                      </Link>
                    ) : null}
                    <button type="button" onClick={() => openEdit(p)} className={btnSecondary}>
                      Edit
                    </button>
                    <button type="button" onClick={() => void togglePublished(p)} className={btnSecondary}>
                      {p.published ? "Move to draft" : "Publish now"}
                    </button>
                    <button type="button" onClick={() => void removePost(p)} className={btnDanger}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length > 0 ? <AdminPagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} /> : null}
    </div>
  );
}
