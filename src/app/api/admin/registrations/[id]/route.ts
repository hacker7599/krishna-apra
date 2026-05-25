import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { toAdminRegistrationDetail } from "@/lib/admin-registration-detail";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const row = await prisma.registration.findUnique({
    where: { id },
    include: { trialZone: { select: { trialPlace: true, zone: true } } },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(toAdminRegistrationDetail(row));
}
