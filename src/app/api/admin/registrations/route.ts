import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  const where: Prisma.RegistrationWhereInput = {};

  if (q) {
    where.OR = [
      { playerName: { contains: q } },
      { academyName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { transactionRef: { contains: q } },
      { fatherName: { contains: q } },
      { address: { contains: q } },
      { coachName: { contains: q } },
      { achievementsAndAwards: { contains: q } },
    ];
  }

  const created: Prisma.DateTimeFilter = {};
  if (from) {
    const d = new Date(from + "T00:00:00.000Z");
    if (!Number.isNaN(d.getTime())) created.gte = d;
  }
  if (to) {
    const d = new Date(to + "T23:59:59.999Z");
    if (!Number.isNaN(d.getTime())) created.lte = d;
  }
  if (Object.keys(created).length > 0) {
    where.createdAt = created;
  }

  const rows = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rows);
}
