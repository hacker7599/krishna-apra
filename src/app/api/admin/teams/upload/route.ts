import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminMutation } from "@/lib/require-admin";
import { saveTeamLogo } from "@/lib/save-upload";
import { teamLogoPublicUrl } from "@/lib/team-logo-url";

export const runtime = "nodejs";

/** Returns logoPath + logoUrl for team franchise logos. */
export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("logo");
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "Choose a logo image (JPG, PNG, or WebP, max 5 MB)." }, { status: 400 });
  }

  try {
    const logoPath = await saveTeamLogo(file as File);
    const logoUrl = teamLogoPublicUrl(logoPath);
    return NextResponse.json({ ok: true, logoPath, logoUrl });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Logo must be under 5 MB." }, { status: 400 });
    }
    if (code === "FILE_TYPE") {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Upload failed. Check that uploads/ is writable on the server." }, { status: 500 });
  }
}
