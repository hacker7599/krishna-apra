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
  const { limit, offset } = parseAdminPagination(searchParams, 50);
  const orderId = searchParams.get("orderId")?.trim();
  const registrationId = searchParams.get("registrationId")?.trim();

  const where: { razorpayOrderId?: string; registrationId?: string } = {};
  if (orderId) where.razorpayOrderId = orderId;
  if (registrationId) where.registrationId = registrationId;
  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const [items, total] = await Promise.all([
    prisma.paymentLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.paymentLog.count({ where: whereClause }),
  ]);

  return NextResponse.json({ items, ...paginationMeta(total, limit, offset) });
}
