import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";
import { applyRegistrationPaymentDecision } from "@/lib/registration-payment-decision";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  decision: z.enum(["approve", "disapprove"]),
});

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip = getClientIp(req);
  const result = await applyRegistrationPaymentDecision(registration, parsed.data.decision, ip);

  await logAdminAudit({
    action: parsed.data.decision === "approve" ? "approve_payment" : "disapprove_payment",
    entityType: "registration",
    entityId: registration.id,
    summary: `${parsed.data.decision === "approve" ? "Approved" : "Disapproved"} payment for ${registration.playerName}`,
    clientIp: ip,
    metadata: { emailSent: result.emailSent },
  });

  return NextResponse.json({
    ok: true,
    registration: result.registration,
    emailSent: result.emailSent,
    emailError: result.emailError,
  });
}
