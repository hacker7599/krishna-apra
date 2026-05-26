import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { parseAdminRegistrationCreateMultipart } from "@/lib/admin-registration-form-data";
import {
  createRegistrationFromOrphanPayment,
  linkExistingRegistrationToOrphanPayment,
} from "@/lib/complete-orphan-payment-registration";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const linkBodySchema = z.object({ registrationId: z.string().trim().min(1) });

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const order = await prisma.paymentOrder.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Payment order not found." }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  const ip = getClientIp(req);

  if (contentType.includes("multipart/form-data")) {
    const parsed = await parseAdminRegistrationCreateMultipart(req);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    if (!parsed.paths.playerPhotoPath) {
      return NextResponse.json({ error: "Player photo is required." }, { status: 400 });
    }

    const result = await createRegistrationFromOrphanPayment(order, parsed.data, {
      playerPhotoPath: parsed.paths.playerPhotoPath,
      idProofPath: parsed.paths.idProofPath,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logAdminAudit({
      action: "complete_orphan_payment",
      entityType: "registration",
      entityId: result.registration.id,
      summary: `Registered ${result.registration.playerName} from orphan payment ${order.razorpayOrderId}`,
      metadata: { paymentOrderId: order.id, emailSent: result.emailSent },
      clientIp: ip,
    });

    return NextResponse.json({
      ok: true,
      mode: "created",
      registration: result.registration,
      emailSent: result.emailSent,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const linkParsed = linkBodySchema.safeParse(body);
  if (linkParsed.success) {
    const result = await linkExistingRegistrationToOrphanPayment(order, linkParsed.data.registrationId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await logAdminAudit({
      action: "link_orphan_payment",
      entityType: "registration",
      entityId: result.registration.id,
      summary: `Linked orphan payment ${order.razorpayOrderId} to registration ${result.registration.playerName}`,
      metadata: { paymentOrderId: order.id },
      clientIp: ip,
    });
    return NextResponse.json({
      ok: true,
      mode: "linked",
      registration: result.registration,
    });
  }

  if (body && typeof body === "object" && "registration" in body) {
    return NextResponse.json(
      {
        error:
          "Creating a registration from a paid order requires a player photo. Use the form with photo upload.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Invalid data. Link an existing registration or submit the full form with photo." }, { status: 400 });
}
