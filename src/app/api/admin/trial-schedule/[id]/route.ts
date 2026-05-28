import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { trialSchedulePatchSchema } from "@/lib/admin-entity-schemas";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { revalidatePublicTrialSchedulePages } from "@/lib/revalidate-public-trial-schedule";
import { trialScheduleNotReadyResponse } from "@/lib/trial-schedule-db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const notReady = trialScheduleNotReadyResponse();
  if (notReady) return notReady;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = trialSchedulePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data;
  if (raw.trialZoneId) {
    const zone = await prisma.trialZone.findUnique({ where: { id: raw.trialZoneId } });
    if (!zone) return NextResponse.json({ error: "Trial zone not found." }, { status: 400 });
  }

  const data: Prisma.TrialScheduleUpdateInput = {};
  if (raw.title !== undefined) data.title = raw.title.trim();
  if (raw.scheduledAt !== undefined) data.scheduledAt = new Date(raw.scheduledAt);
  if (raw.endAt !== undefined) data.endAt = raw.endAt ? new Date(raw.endAt) : null;
  if (raw.notes !== undefined) data.notes = raw.notes;
  if (raw.trialZoneId !== undefined) {
    data.trialZone = raw.trialZoneId ? { connect: { id: raw.trialZoneId } } : { disconnect: true };
  }
  if (raw.sortOrder !== undefined) data.sortOrder = raw.sortOrder;
  if (raw.published !== undefined) data.published = raw.published;

  try {
    await prisma.trialSchedule.update({ where: { id }, data });
    revalidatePublicTrialSchedulePages();
    const row = await prisma.trialSchedule.findUniqueOrThrow({
      where: { id },
      include: { trialZone: { select: { id: true, trialPlace: true, zone: true, address: true } } },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const notReady = trialScheduleNotReadyResponse();
  if (notReady) return notReady;

  const { id } = await ctx.params;

  try {
    await prisma.trialSchedule.delete({ where: { id } });
    revalidatePublicTrialSchedulePages();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
