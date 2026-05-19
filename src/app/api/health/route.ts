import { NextResponse } from "next/server";
import { getAdminAuthStatus } from "@/lib/admin-auth-config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminAuthStatus();
  let database = "unknown";
  try {
    await prisma.registration.count();
    database = "ok";
  } catch (e) {
    database = e instanceof Error ? e.message : "error";
  }

  return NextResponse.json({
    ok: database === "ok",
    database,
    admin,
    nodeEnv: process.env.NODE_ENV ?? "development",
  });
}
