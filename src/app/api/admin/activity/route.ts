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
  const { limit, offset } = parseAdminPagination(searchParams, 30);

  const [items, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.adminAuditLog.count(),
  ]);

  return NextResponse.json({ items, ...paginationMeta(total, limit, offset) });
}
