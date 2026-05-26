import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseAdminPagination, paginationMeta } from "@/lib/admin-pagination";
import {
  attachRegistrationPaymentStatus,
  paidOrphanPaymentOrderFilter,
} from "@/lib/payment-order-registration-lookup";
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
  const orphanOnly = searchParams.get("orphan") === "true" || searchParams.get("orphan") === "1";

  let where: Prisma.PaymentOrderWhereInput = {};
  if (status && ["created", "paid", "failed", "refunded"].includes(status)) {
    where.status = status;
  }
  if (orphanOnly) {
    where = await paidOrphanPaymentOrderFilter();
  }

  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const orders = await prisma.paymentOrder.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  let mapped = await attachRegistrationPaymentStatus(orders);

  if (q) {
    mapped = mapped.filter(
      (o) =>
        o.razorpayOrderId.toLowerCase().includes(q) ||
        (o.razorpayPaymentId?.toLowerCase().includes(q) ?? false) ||
        (o.email?.toLowerCase().includes(q) ?? false) ||
        (o.phone?.includes(q) ?? false) ||
        (o.playerName?.toLowerCase().includes(q) ?? false) ||
        (o.receipt?.toLowerCase().includes(q) ?? false),
    );
  }

  const total = mapped.length;
  const items = mapped.slice(offset, offset + limit);

  const orphanWhere = await paidOrphanPaymentOrderFilter();

  const [paidCount, orphanPaid, totalRevenuePaise] = await Promise.all([
    prisma.paymentOrder.count({ where: { status: "paid" } }),
    prisma.paymentOrder.count({ where: orphanWhere }),
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
