import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-token";
import { adminCookieSecure } from "@/lib/request-is-https";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: adminCookieSecure(req),
    path: "/",
    maxAge: 0,
  });
  return res;
}
