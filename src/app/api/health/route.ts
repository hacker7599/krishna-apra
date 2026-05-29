import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDbReady } from "@/lib/db-resilience";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDbReady();
    await prisma.registration.count();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
