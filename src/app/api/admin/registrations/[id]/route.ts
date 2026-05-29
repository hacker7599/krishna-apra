import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loadAdminRegistrationDetail } from "@/lib/admin-registration-detail";
import { parseAdminRegistrationPatchMultipart } from "@/lib/admin-registration-form-data";
import {
  assertEligibleDateOfBirth,
  applyRegistrationFilePathsToPatch,
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
  const row = await prisma.registration.findUnique({
    where: { id },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(await loadAdminRegistrationDetail(row));
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.registration.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Use the form with photo upload to save changes." },
      { status: 400 },
    );
  }

  const hasExistingPhoto = Boolean(existing.playerPhotoPath?.trim());
  const parsed = await parseAdminRegistrationPatchMultipart(req, {
    requirePlayerPhotoUnlessExisting: !hasExistingPhoto,
  });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { data, paths } = parsed;

  if (!hasExistingPhoto && !paths.playerPhotoPath) {
    return NextResponse.json({ error: "Player photo is required." }, { status: 400 });
  }

  if (data.dateOfBirth) {
    const dobError = assertEligibleDateOfBirth(data.dateOfBirth);
    if (dobError) {
      return NextResponse.json({ error: dobError }, { status: 400 });
    }
  }

  const email = data.email ?? existing.email;
  const phone = data.phone ?? existing.phone;
  const dup = await findDuplicateRegistrationExcluding(email, phone, id);
  if (dup) {
    const msg =
      dup.matched === "email"
        ? "Another registration already uses this email."
        : "Another registration already uses this mobile number.";
    return NextResponse.json({ error: msg, duplicate: true }, { status: 409 });
  }

  try {
    const updateData = applyRegistrationFilePathsToPatch(buildRegistrationPatchData(data), {
      playerPhotoPath: paths.playerPhotoPath,
      idProofPath: paths.idProofPath,
    });

    const registration = await prisma.registration.update({
      where: { id },
      data: updateData,
    });

    await logAdminAudit({
      action: "update",
      entityType: "registration",
      entityId: registration.id,
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
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.registration.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.registration.delete({ where: { id } });

  await logAdminAudit({
    action: "delete",
    entityType: "registration",
    entityId: id,
    summary: `Deleted registration for ${existing.playerName}`,
    clientIp: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
