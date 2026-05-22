import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseAdminPagination, paginationMeta } from "@/lib/admin-pagination";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const { limit, offset } = parseAdminPagination(searchParams, 25);
  const status = searchParams.get("status")?.trim();
  const q = searchParams.get("q")?.trim().toLowerCase();

  const where = status && ["created", "paid", "failed", "refunded"].includes(status) ? { status } : undefined;

  let orders = await prisma.paymentOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (q) {
    orders = orders.filter(
      (o) =>
        o.razorpayOrderId.toLowerCase().includes(q) ||
        (o.razorpayPaymentId?.toLowerCase().includes(q) ?? false) ||
        (o.email?.toLowerCase().includes(q) ?? false) ||
        (o.phone?.includes(q) ?? false) ||
        (o.playerName?.toLowerCase().includes(q) ?? false) ||
        (o.receipt?.toLowerCase().includes(q) ?? false),
    );
  }

  const total = orders.length;
  const items = orders.slice(offset, offset + limit);

  const [paidCount, orphanPaid, totalRevenuePaise] = await Promise.all([
    prisma.paymentOrder.count({ where: { status: "paid" } }),
    prisma.paymentOrder.count({ where: { status: "paid", registrationId: null } }),
    prisma.paymentOrder.aggregate({
      where: { status: "paid" },
      _sum: { amountPaise: true },
    }),
  ]);

  return NextResponse.json({
    items,
    ...paginationMeta(total, limit, offset),
    summary: {
      paidCount,
      orphanPaid,
      totalRevenuePaise: totalRevenuePaise._sum.amountPaise ?? 0,
    },
  });
}
