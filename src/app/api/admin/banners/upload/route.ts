import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminMutation } from "@/lib/require-admin";
import { saveBannerImage } from "@/lib/save-upload";

export const runtime = "nodejs";

/** Returns a public imageUrl path for hero banners. */
export async function POST(req: NextRequest) {
  const auth = await requireAdminMutation(req);
  if (!auth.ok) return NextResponse.json({ error: auth.status === 403 ? "Forbidden" : "Unauthorized" }, { status: auth.status });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("image");
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file (JPG, PNG, or WebP, max 5 MB)." }, { status: 400 });
  }

  try {
    const rel = await saveBannerImage(file as File);
    const imageUrl = `/api/banners/media/${rel.replace(/^banners\//, "")}`;
    return NextResponse.json({ ok: true, imageUrl, rel });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });
    }
    if (code === "FILE_TYPE") {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Upload failed. Check that uploads/ is writable on the server." }, { status: 500 });
  }
}
