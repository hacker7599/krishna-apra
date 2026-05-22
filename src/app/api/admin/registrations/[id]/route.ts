import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { registrationAdminPatchSchema } from "@/lib/admin-entity-schemas";
import {
  assertEligibleDateOfBirth,
  buildRegistrationPatchData,
  findDuplicateRegistrationExcluding,
} from "@/lib/admin-registration-mutation";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const row = await prisma.registration.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

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

  const parsed = registrationAdminPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.registration.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.dateOfBirth) {
    const dobError = assertEligibleDateOfBirth(parsed.data.dateOfBirth);
    if (dobError) return NextResponse.json({ error: dobError }, { status: 400 });
  }

  const nextEmail = parsed.data.email ?? existing.email;
  const nextPhone = parsed.data.phone ?? existing.phone;
  const dup = await findDuplicateRegistrationExcluding(nextEmail, nextPhone, id);
  if (dup) {
    const msg =
      dup.matched === "email"
        ? "Another registration already uses this email."
        : "Another registration already uses this mobile number.";
    return NextResponse.json({ error: msg, duplicate: true }, { status: 409 });
  }

  try {
    const registration = await prisma.registration.update({
      where: { id },
      data: buildRegistrationPatchData(parsed.data),
    });
    await logAdminAudit({
      action: "update",
      entityType: "registration",
      entityId: id,
      summary: `Updated registration for ${registration.playerName}`,
      clientIp: getClientIp(req),
    });
    return NextResponse.json(registration);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not update registration." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;
  const existing = await prisma.registration.findUnique({ where: { id }, select: { playerName: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.$transaction([
      prisma.paymentOrder.updateMany({
        where: { registrationId: id },
        data: { registrationId: null },
      }),
      prisma.registration.delete({ where: { id } }),
    ]);
    await logAdminAudit({
      action: "delete",
      entityType: "registration",
      entityId: id,
      summary: `Deleted registration for ${existing.playerName}`,
      clientIp: getClientIp(req),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
