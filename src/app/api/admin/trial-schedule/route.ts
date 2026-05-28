import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { parseAdminPagination, paginationMeta } from "@/lib/admin-pagination";
import { trialScheduleCreateSchema } from "@/lib/admin-entity-schemas";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";
import { revalidatePublicTrialSchedulePages } from "@/lib/revalidate-public-trial-schedule";
import { trialScheduleNotReadyResponse } from "@/lib/trial-schedule-db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notReady = trialScheduleNotReadyResponse();
  if (notReady) return notReady;

  const { searchParams } = new URL(req.url);
  const { limit, offset } = parseAdminPagination(searchParams, 20);
  const published = searchParams.get("published");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.TrialScheduleWhereInput = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { notes: { contains: q } },
      { trialZone: { is: { trialPlace: { contains: q } } } },
      { trialZone: { is: { zone: { contains: q } } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.trialSchedule.findMany({
      where,
      orderBy: [{ scheduledAt: "asc" }, { sortOrder: "asc" }],
      take: limit,
      skip: offset,
      include: {
        trialZone: { select: { id: true, trialPlace: true, zone: true, address: true } },
      },
    }),
    prisma.trialSchedule.count({ where }),
  ]);

  return NextResponse.json({ items, ...paginationMeta(total, limit, offset) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const notReady = trialScheduleNotReadyResponse();
  if (notReady) return notReady;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = trialScheduleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  if (data.trialZoneId) {
    const zone = await prisma.trialZone.findUnique({ where: { id: data.trialZoneId } });
    if (!zone) return NextResponse.json({ error: "Trial zone not found." }, { status: 400 });
  }

  const max = await prisma.trialSchedule.aggregate({ _max: { sortOrder: true } });
  const sortOrder = data.sortOrder ?? (max._max.sortOrder ?? -1) + 1;

  const row = await prisma.trialSchedule.create({
    data: {
      title: data.title.trim(),
      scheduledAt: new Date(data.scheduledAt),
      endAt: data.endAt ? new Date(data.endAt) : null,
      notes: data.notes,
      trialZoneId: data.trialZoneId,
      sortOrder,
      published: data.published ?? true,
    },
    include: {
      trialZone: { select: { id: true, trialPlace: true, zone: true, address: true } },
    },
  });

  revalidatePublicTrialSchedulePages();
  return NextResponse.json(row);
}
