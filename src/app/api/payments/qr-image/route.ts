import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPaymentQrPath } from "@/lib/payment-qr-config";

export const runtime = "nodejs";

function contentTypeFor(file: string) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET() {
  const relRaw = await getPaymentQrPath();
  if (!relRaw) return new NextResponse("Not found", { status: 404 });

  const rel = relRaw.replace(/\\/g, "/");
  if (!rel.startsWith("payment-qr/") || rel.includes("..")) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const full = path.join(process.cwd(), "uploads", rel);
  try {
    const buf = await readFile(full);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentTypeFor(rel),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
