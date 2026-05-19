import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminAuthStatus, isAdminSetupAllowed, verifySetupSecret } from "@/lib/admin-auth-config";
import { writeAdminCredentials } from "@/lib/admin-credentials-store";
import { getClientIp } from "@/lib/get-client-ip";
import { checkLoginRate, recordLoginFailure, resetLoginFailures } from "@/lib/login-rate-limit";

export const runtime = "nodejs";

export async function GET() {
  const status = await getAdminAuthStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (!isAdminSetupAllowed()) {
    return NextResponse.json(
      {
        error:
          "Setup is disabled. Set ADMIN_SETUP_SECRET (16+ characters) in server .env, then restart the app. Set ADMIN_SETUP_DISABLED=true after you finish.",
      },
      { status: 403 },
    );
  }

  const limited = checkLoginRate(ip);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later.", retryAfterSec: limited.retryAfterSec }, { status: 429 });
  }

  let body: { setupSecret?: string; username?: string; password?: string; confirmPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const setupSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";
  if (!verifySetupSecret(setupSecret)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirm = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (username.length < 2 || username.length > 64) {
    return NextResponse.json({ error: "Username must be 2–64 characters." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json(
      { error: "Set ADMIN_JWT_SECRET (32+ characters) in .env before creating an admin password." },
      { status: 503 },
    );
  }

  try {
    await writeAdminCredentials(username, password);
    resetLoginFailures(ip);
    return NextResponse.json({
      ok: true,
      message: "Admin password saved. Sign in at /admin/login. Consider setting ADMIN_SETUP_DISABLED=true in .env.",
      username,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not write credentials. Ensure the app can write to the data/ folder on the server." },
      { status: 500 },
    );
  }
}
