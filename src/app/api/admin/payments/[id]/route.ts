import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deletePaymentOrderForAdmin } from "@/lib/admin-payment-delete";
import { logAdminAudit } from "@/lib/admin-audit";
import { getClientIp } from "@/lib/get-client-ip";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.paymentOrder.findUnique({
    where: { id },
    select: { playerName: true, email: true, razorpayOrderId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Payment order not found." }, { status: 404 });
  }

  const result = await deletePaymentOrderForAdmin(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const label = existing.playerName?.trim() || existing.email?.trim() || existing.razorpayOrderId;
  await logAdminAudit({
    action: "delete",
    entityType: "payment_order",
    entityId: id,
    summary: `Deleted payment order for ${label}`,
    metadata: { deletedRegistration: result.deletedRegistration },
    clientIp: getClientIp(req),
  });

  return NextResponse.json({ ok: true, deletedRegistration: result.deletedRegistration });
}
