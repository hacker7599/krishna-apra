import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyAdminSessionToken, type AdminSession } from "@/lib/admin-token";

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function requireAdmin(): Promise<{ ok: true; session: AdminSession } | { ok: false; status: number }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, status: 401 };
  return { ok: true, session };
}

/** CSRF protection for state-changing admin requests. */
export async function requireAdminMutation(
  req: NextRequest,
): Promise<{ ok: true; session: AdminSession } | { ok: false; status: number }> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const header = req.headers.get("x-admin-csrf")?.trim();
  if (!header || header !== auth.session.csrf) {
    return { ok: false, status: 403 };
  }
  return auth;
}
