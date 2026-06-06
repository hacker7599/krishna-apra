import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { parseAdminPagination, paginationMeta } from "@/lib/admin-pagination";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";
import { trialZoneCreateSchema } from "@/lib/admin-entity-schemas";
import { revalidatePublicTrialZonePages } from "@/lib/revalidate-public-trial-zones";
import { renumberTrialZoneSortOrders } from "@/lib/trial-zone-sort";
import { attachTrialZoneRegistrationOpen } from "@/lib/trial-zone-registration-open";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const { limit, offset } = parseAdminPagination(searchParams, 20);
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

  const [items, total] = await Promise.all([
    prisma.trialZone.findMany({
      where,
      orderBy: [{ published: "desc" }, { sortOrder: "asc" }, { trialPlace: "asc" }],
      take: limit,
      skip: offset,
    }),
    prisma.trialZone.count({ where }),
  ]);
  const enriched = await attachTrialZoneRegistrationOpen(items);
  return NextResponse.json({ items: enriched, ...paginationMeta(total, limit, offset) });
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
      navigationUrl: data.navigationUrl,
      contactDetails: data.contactDetails,
      sortOrder,
      published: data.published ?? true,
      registrationOpen: data.registrationOpen ?? true,
    },
  });

  await renumberTrialZoneSortOrders(prisma);
  revalidatePublicTrialZonePages();
  const refreshed = await prisma.trialZone.findUniqueOrThrow({ where: { id: row.id } });
  return NextResponse.json(refreshed);
}
