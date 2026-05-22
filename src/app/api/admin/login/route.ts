import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminPasswordHash, getAdminUsername } from "@/lib/admin-auth-config";
import { COOKIE_NAME, signAdminSessionToken } from "@/lib/admin-token";
import { verifyAdminPassword } from "@/lib/admin-password";
import { getClientIp } from "@/lib/get-client-ip";
import { checkLoginRate, recordLoginFailure, resetLoginFailures } from "@/lib/login-rate-limit";
import { adminCookieSecure } from "@/lib/request-is-https";

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

  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json(
      { error: "ADMIN_JWT_SECRET is missing or too short (need 32+ characters). Set it in .env on the server." },
      { status: 503 },
    );
  }

  const expectedUsername = await getAdminUsername();
  const hash = await getAdminPasswordHash();

  if (!hash) {
    return NextResponse.json(
      { error: "Admin sign-in is not configured on this server. Contact the site administrator." },
      { status: 503 },
    );
  }

  const okUser = typeof body.username === "string" && body.username.trim() === expectedUsername;
  const okPass = typeof body.password === "string" && verifyAdminPassword(body.password, hash);

  if (!okUser || !okPass) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  resetLoginFailures(ip);
  let token: string;
  let csrf: string;
  try {
    const session = await signAdminSessionToken();
    token = session.token;
    csrf = session.csrf;
  } catch {
    return NextResponse.json({ error: "Session signing failed. Check ADMIN_JWT_SECRET on the server." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true, csrfToken: csrf, username: expectedUsername });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: adminCookieSecure(req),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
