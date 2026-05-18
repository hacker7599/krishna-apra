import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { trialZoneCreateSchema } from "@/lib/admin-entity-schemas";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.TrialZoneWhereInput = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (q) {
    where.OR = [
      { trialPlace: { contains: q } },
      { zone: { contains: q } },
      { address: { contains: q } },
      { contactDetails: { contains: q } },
    ];
  }

  const rows = await prisma.trialZone.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { trialPlace: "asc" }],
  });
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

  const parsed = trialZoneCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const max = await prisma.trialZone.aggregate({ _max: { sortOrder: true } });
  const sortOrder = data.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

  const row = await prisma.trialZone.create({
    data: {
      trialPlace: data.trialPlace.trim(),
      zone: data.zone.trim(),
      address: data.address.trim(),
      navigationUrl: data.navigationUrl.trim(),
      contactDetails: data.contactDetails.trim(),
      sortOrder,
      published: data.published ?? true,
    },
  });

  return NextResponse.json(row);
}
