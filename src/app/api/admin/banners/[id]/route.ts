import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bannerPatchSchema } from "@/lib/admin-entity-schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bannerPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data;
  if (Object.keys(raw).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const norm = (s: string | null | undefined) => {
    if (s === undefined) return undefined;
    if (s === null) return null;
    const t = String(s).trim();
    return t.length ? t : null;
  };

  const data: Prisma.HeroBannerUpdateInput = {};
  if (raw.title !== undefined) data.title = norm(raw.title);
  if (raw.subtitle !== undefined) data.subtitle = norm(raw.subtitle);
  if (raw.ctaLabel !== undefined) data.ctaLabel = norm(raw.ctaLabel);
  if (raw.ctaHref !== undefined) data.ctaHref = norm(raw.ctaHref);
  if (raw.imageUrl !== undefined) data.imageUrl = raw.imageUrl.trim();
  if (raw.sortOrder !== undefined) data.sortOrder = raw.sortOrder;
  if (raw.published !== undefined) data.published = raw.published;

  try {
    const banner = await prisma.heroBanner.update({ where: { id }, data });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  try {
    await prisma.heroBanner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
