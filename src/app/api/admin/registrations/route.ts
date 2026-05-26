import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  assertEligibleDateOfBirth,
  buildRegistrationCreateData,
  findDuplicateRegistrationExcluding,
} from "@/lib/admin-registration-mutation";
import { parseAdminRegistrationCreateMultipart } from "@/lib/admin-registration-form-data";
import { listRegistrationsForAdmin } from "@/lib/admin-registrations-query";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const from = searchParams.get("from")?.trim() || undefined;
  const to = searchParams.get("to")?.trim() || undefined;
  const paymentStatus = searchParams.get("paymentStatus")?.trim() || undefined;
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const result = await listRegistrationsForAdmin({ q, from, to, paymentStatus, limit, offset });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Desk registration requires a player photo upload. Submit the form with photo attached." },
      { status: 400 },
    );
  }

  const parsed = await parseAdminRegistrationCreateMultipart(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { data, paths } = parsed;
  if (!paths.playerPhotoPath) {
    return NextResponse.json({ error: "Player photo is required." }, { status: 400 });
  }

  const dobError = assertEligibleDateOfBirth(data.dateOfBirth);
  if (dobError) {
    return NextResponse.json({ error: dobError }, { status: 400 });
  }

  const dup = await findDuplicateRegistrationExcluding(data.email, data.phone);
  if (dup) {
    const msg =
      dup.matched === "email"
        ? "Another registration already uses this email."
        : "Another registration already uses this mobile number.";
    return NextResponse.json({ error: msg, duplicate: true }, { status: 409 });
  }

  try {
    const registration = await prisma.registration.create({
      data: buildRegistrationCreateData(data, {
        playerPhotoPath: paths.playerPhotoPath,
        idProofPath: paths.idProofPath,
      }),
    });
    await logAdminAudit({
      action: "create",
      entityType: "registration",
      entityId: registration.id,
      summary: `Created registration for ${registration.playerName}`,
      clientIp: getClientIp(req),
    });
    return NextResponse.json(registration, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create registration." }, { status: 500 });
  }
}
