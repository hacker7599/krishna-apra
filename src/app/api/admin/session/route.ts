import { NextResponse } from "next/server";
import { getAdminUsername } from "@/lib/admin-auth-config";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const username = await getAdminUsername();
  return NextResponse.json({
    username,
    csrfToken: auth.session.csrf,
  });
}
