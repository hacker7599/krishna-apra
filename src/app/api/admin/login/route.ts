import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, signAdminSessionToken } from "@/lib/admin-token";
import { getAdminPasswordHashFromEnv, verifyAdminPassword } from "@/lib/admin-password";
import { getClientIp } from "@/lib/get-client-ip";
import { checkLoginRate, recordLoginFailure, resetLoginFailures } from "@/lib/login-rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = checkLoginRate(ip);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later.", retryAfterSec: limited.retryAfterSec }, { status: 429 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = process.env.ADMIN_USERNAME || "admin";
  const hash = getAdminPasswordHashFromEnv();

  if (!hash) {
    return NextResponse.json(
      { error: "Admin password not configured. Set ADMIN_PASSWORD_HASH_B64 in .env (see .env.example)." },
      { status: 503 },
    );
  }

  if (!hash.startsWith("$2")) {
    return NextResponse.json({ error: "Server misconfiguration for admin password hash." }, { status: 503 });
  }

  const okUser = typeof body.username === "string" && body.username === username;
  const okPass = typeof body.password === "string" && verifyAdminPassword(body.password, hash);

  if (!okUser || !okPass) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  resetLoginFailures(ip);
  const token = await signAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
