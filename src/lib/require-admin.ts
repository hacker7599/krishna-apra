import { cookies } from "next/headers";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-token";

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; status: number }> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, status: 401 };
  const valid = await verifyAdminSessionToken(token);
  if (!valid) return { ok: false, status: 401 };
  return { ok: true };
}
