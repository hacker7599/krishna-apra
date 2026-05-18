import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bannerCreateSchema } from "@/lib/admin-entity-schemas";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.HeroBannerWhereInput = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { subtitle: { contains: q } },
      { imageUrl: { contains: q } },
    ];
  }

  const rows = await prisma.heroBanner.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bannerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const max = await prisma.heroBanner.aggregate({ _max: { sortOrder: true } });
  const sortOrder = data.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

  const norm = (s: string | null | undefined) => {
    if (s == null) return null;
    const t = String(s).trim();
    return t.length ? t : null;
  };

  const banner = await prisma.heroBanner.create({
    data: {
      title: norm(data.title),
      subtitle: norm(data.subtitle),
      imageUrl: data.imageUrl.trim(),
      ctaLabel: norm(data.ctaLabel),
      ctaHref: norm(data.ctaHref),
      sortOrder,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(banner);
}
