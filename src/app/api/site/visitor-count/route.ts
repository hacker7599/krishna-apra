import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withDbRetry } from "@/lib/db-resilience";
import { VISITOR_COUNT_BASELINE } from "@/lib/league";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VISITOR_BUCKET = "site:visitor";
const VISITOR_COOKIE = "fs_visitor_seen";
const TEN_YEARS_SEC = 60 * 60 * 24 * 365 * 10;

export async function POST(req: NextRequest) {
  const seen = req.cookies.get(VISITOR_COOKIE)?.value === "1";

  if (!seen) {
    await withDbRetry(() =>
      prisma.rateLimitEvent.create({
        data: { bucket: VISITOR_BUCKET },
      }),
    );
  }

  const tracked = await withDbRetry(() =>
    prisma.rateLimitEvent.count({
      where: { bucket: VISITOR_BUCKET },
    }),
  );
  const count = VISITOR_COUNT_BASELINE + tracked;

  const res = NextResponse.json({ count });
  if (!seen) {
    res.cookies.set(VISITOR_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TEN_YEARS_SEC,
    });
  }
  return res;
}
