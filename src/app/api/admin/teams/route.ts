import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { teamCreateSchema } from "@/lib/admin-entity-schemas";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.TeamWhereInput = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { city: { contains: q } },
      { slug: { contains: q } },
    ];
  }

  const rows = await prisma.team.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
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

  const parsed = teamCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let base = data.slug || slugify(data.name);
  if (!base) base = "team";
  let slug = base;
  for (let i = 0; i < 30; i++) {
    const exists = await prisma.team.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${i + 2}`;
  }

  const max = await prisma.team.aggregate({ _max: { sortOrder: true } });
  const sortOrder = data.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

  const team = await prisma.team.create({
    data: {
      slug,
      name: data.name,
      city: data.city,
      accentColor: data.accentColor,
      description: data.description ?? "",
      sortOrder,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(team);
}
