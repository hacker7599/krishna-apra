import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { blogPostPatchSchema } from "@/lib/admin-entity-schemas";
import { logAdminAudit } from "@/lib/admin-audit";
import { emptyToNull, normalizeBlogContentForStorage, resolvePublishedAt } from "@/lib/blog-mutation";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blogPostPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;

  if (data.slug && data.slug !== existing.slug) {
    const clash = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const nextPublished = data.published ?? existing.published;
  const publishedAt = resolvePublishedAt(existing.published, nextPublished, existing.publishedAt);

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.excerpt !== undefined) update.excerpt = data.excerpt;
  if (data.content !== undefined) update.content = normalizeBlogContentForStorage(data.content);
  if (data.coverImageUrl !== undefined) update.coverImageUrl = emptyToNull(data.coverImageUrl);
  if (data.authorName !== undefined) update.authorName = data.authorName;
  if (data.published !== undefined) {
    update.published = data.published;
    update.publishedAt = publishedAt;
  }
  if (data.metaTitle !== undefined) update.metaTitle = emptyToNull(data.metaTitle);
  if (data.metaDescription !== undefined) update.metaDescription = emptyToNull(data.metaDescription);
  if (data.metaKeywords !== undefined) update.metaKeywords = emptyToNull(data.metaKeywords);
  if (data.ogImageUrl !== undefined) update.ogImageUrl = emptyToNull(data.ogImageUrl);
  if (data.canonicalUrl !== undefined) update.canonicalUrl = emptyToNull(data.canonicalUrl);
  if (data.robotsNoindex !== undefined) update.robotsNoindex = data.robotsNoindex;

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: update,
    });

    await logAdminAudit({
      action: "update",
      entityType: "blog_post",
      entityId: post.id,
      summary: `Updated blog post ${post.title}`,
      clientIp: getClientIp(req),
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.blogPost.delete({ where: { id } });
    await logAdminAudit({
      action: "delete",
      entityType: "blog_post",
      entityId: id,
      summary: `Deleted blog post ${existing.title}`,
      clientIp: getClientIp(req),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
