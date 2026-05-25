import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

function contentTypeFor(file: string) {
  if (file.endsWith(".pdf")) return "application/pdf";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind = kindParam === "id" ? "id" : kindParam === "photo" ? "photo" : "payment";

  const reg = await prisma.registration.findUnique({ where: { id } });
  if (!reg) {
    return new NextResponse("Not found", { status: 404 });
  }

  const relRaw =
    kind === "id" ? reg.idProofPath : kind === "photo" ? reg.playerPhotoPath : reg.paymentProofPath;
  if (!relRaw) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rel = relRaw.replace(/\\/g, "/");
  const allowedPrefix =
    kind === "id" ? "id-proofs/" : kind === "photo" ? "player-photos/" : "payment-proofs/";
  if (rel.includes("..") || !rel.startsWith(allowedPrefix)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const full = path.join(process.cwd(), "uploads", rel);
  try {
    const buf = await readFile(full);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentTypeFor(rel),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
