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
  const email = searchParams.get("email")?.trim().toLowerCase();
  const templateKey = searchParams.get("template")?.trim();

  const where = {
    ...(email ? { toEmail: { contains: email } } : {}),
    ...(templateKey ? { templateKey } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.emailLog.count({ where }),
  ]);

  return NextResponse.json({ items, ...paginationMeta(total, limit, offset) });
}
