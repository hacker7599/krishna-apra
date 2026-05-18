import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { trialZonePatchSchema } from "@/lib/admin-entity-schemas";

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

  const parsed = trialZonePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data;
  if (Object.keys(raw).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Prisma.TrialZoneUpdateInput = {};
  if (raw.trialPlace !== undefined) data.trialPlace = raw.trialPlace.trim();
  if (raw.zone !== undefined) data.zone = raw.zone.trim();
  if (raw.address !== undefined) data.address = raw.address.trim();
  if (raw.contactDetails !== undefined) data.contactDetails = raw.contactDetails.trim();
  if (raw.navigationUrl !== undefined) {
    data.navigationUrl = raw.navigationUrl.trim();
  }
  if (raw.sortOrder !== undefined) data.sortOrder = raw.sortOrder;
  if (raw.published !== undefined) data.published = raw.published;

  try {
    const row = await prisma.trialZone.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  try {
    await prisma.trialZone.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
