import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { parseAdminPagination, paginationMeta } from "@/lib/admin-pagination";
import { logAdminAudit } from "@/lib/admin-audit";
import { blogPostCreateSchema } from "@/lib/admin-entity-schemas";
import { blogCreateData, normalizeBlogContentForStorage } from "@/lib/blog-mutation";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { limit, offset } = parseAdminPagination(searchParams, 20);
  const published = searchParams.get("published");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.BlogPostWhereInput = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (q) {
    where.OR = [{ title: { contains: q } }, { slug: { contains: q } }, { excerpt: { contains: q } }];
  }

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({ items, ...paginationMeta(total, limit, offset) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blogPostCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let base = data.slug || slugify(data.title);
  if (!base) base = "post";
  let slug = base;
  for (let i = 0; i < 30; i++) {
    const exists = await prisma.blogPost.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${i + 2}`;
  }

  const published = data.published ?? false;
  const publishedAt = published ? new Date() : null;

  const post = await prisma.blogPost.create({
    data: blogCreateData(
      {
        title: data.title,
        slug,
        excerpt: data.excerpt ?? "",
        content: normalizeBlogContentForStorage(data.content),
        coverImageUrl: data.coverImageUrl,
        authorName: data.authorName ?? "",
        published,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogImageUrl: data.ogImageUrl,
        canonicalUrl: data.canonicalUrl,
        robotsNoindex: data.robotsNoindex ?? false,
      },
      publishedAt,
    ),
  });

  await logAdminAudit({
    action: "create",
    entityType: "blog_post",
    entityId: post.id,
    summary: `Created blog post ${post.title}`,
    clientIp: getClientIp(req),
  });

  return NextResponse.json(post, { status: 201 });
}
