import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { logAdminAudit } from "@/lib/admin-audit";
import { teamPatchSchema } from "@/lib/admin-entity-schemas";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { revalidatePublicTeamPages } from "@/lib/revalidate-public-teams";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

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

  const parsed = teamPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data;
  if (Object.keys(raw).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const data: Prisma.TeamUpdateInput = {};
  if (raw.name !== undefined) data.name = raw.name;
  if (raw.city !== undefined) data.city = raw.city;
  if (raw.logoPath !== undefined) data.logoPath = raw.logoPath;
  if (raw.description !== undefined) data.description = raw.description;
  if (raw.sortOrder !== undefined) data.sortOrder = raw.sortOrder;
  if (raw.published !== undefined) data.published = raw.published;

  try {
    const team = await prisma.team.update({
      where: { id },
      data,
    });

    await logAdminAudit({
      action: "update",
      entityType: "team",
      entityId: team.id,
      summary: `Updated team ${team.name}`,
      clientIp: getClientIp(req),
    });

    revalidatePublicTeamPages();
    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  try {
    const existing = await prisma.team.findUnique({ where: { id }, select: { name: true } });
    await prisma.team.delete({ where: { id } });

    await logAdminAudit({
      action: "delete",
      entityType: "team",
      entityId: id,
      summary: `Deleted team ${existing?.name ?? id}`,
      clientIp: getClientIp(req),
    });

    revalidatePublicTeamPages();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
