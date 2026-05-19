import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/get-client-ip";
import { registrationSchema } from "@/lib/registration-schema";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { saveIdProof, savePaymentProof } from "@/lib/save-upload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = checkRegisterPostRate(ip);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many registration attempts from this network. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  try {
    const form = await req.formData();
    let roles: unknown;
    try {
      roles = JSON.parse(String(form.get("roles") ?? "null"));
    } catch {
      return NextResponse.json({ error: "Invalid roles payload." }, { status: 400 });
    }
    const payload = {
      academyName: String(form.get("academyName") ?? ""),
      playerName: String(form.get("playerName") ?? ""),
      dateOfBirth: String(form.get("dateOfBirth") ?? ""),
      roles,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      fatherName: String(form.get("fatherName") ?? ""),
      address: String(form.get("address") ?? ""),
      jerseySize: String(form.get("jerseySize") ?? ""),
      shoeSize: String(form.get("shoeSize") ?? ""),
      idDocumentType: String(form.get("idDocumentType") ?? ""),
      transactionRef: form.get("transactionRef") ? String(form.get("transactionRef")) : undefined,
      achievementsAndAwards: form.get("achievementsAndAwards") ? String(form.get("achievementsAndAwards")) : undefined,
    };

    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldFlat = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
      const msg = flat.fieldErrors.dateOfBirth?.[0] ?? fieldFlat[0] ?? "Invalid form data. Please check all required fields.";
      return NextResponse.json({ error: msg, details: flat }, { status: 400 });
    }

    const idFile = form.get("idProof");
    if (!idFile || typeof idFile === "string" || idFile.size === 0) {
      return NextResponse.json({ error: "Government ID proof upload is required (Aadhaar, passport, or birth certificate)." }, { status: 400 });
    }

    let idProofPath: string;
    try {
      idProofPath = await saveIdProof(idFile as File);
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      if (code === "FILE_TOO_LARGE") {
        return NextResponse.json({ error: "ID proof must be under 4 MB." }, { status: 400 });
      }
      if (code === "FILE_TYPE") {
        return NextResponse.json({ error: "ID proof must be JPG, PNG, WebP, or PDF." }, { status: 400 });
      }
      throw e;
    }

    const payFile = form.get("paymentProof");
    let paymentProofPath: string | null = null;
    if (payFile && typeof payFile !== "string" && payFile.size > 0) {
      try {
        paymentProofPath = await savePaymentProof(payFile as File);
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "FILE_TOO_LARGE") {
          return NextResponse.json({ error: "Payment proof must be under 4 MB." }, { status: 400 });
        }
        if (code === "FILE_TYPE") {
          return NextResponse.json({ error: "Payment proof must be JPG, PNG, or WebP." }, { status: 400 });
        }
        throw e;
      }
    }

    const dob = new Date(`${parsed.data.dateOfBirth}T00:00:00.000Z`);

    await prisma.registration.create({
      data: {
        academyName: parsed.data.academyName,
        playerName: parsed.data.playerName,
        dateOfBirth: dob,
        roles: JSON.stringify(parsed.data.roles),
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone.replace(/\s+/g, ""),
        fatherName: parsed.data.fatherName,
        address: parsed.data.address,
        jerseySize: parsed.data.jerseySize,
        shoeSize: parsed.data.shoeSize,
        idDocumentType: parsed.data.idDocumentType,
        idProofPath,
        paymentProofPath,
        transactionRef: parsed.data.transactionRef || null,
        achievementsAndAwards: parsed.data.achievementsAndAwards?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("no such table") || msg.includes("SQLITE") || msg.includes("Prisma")) {
      return NextResponse.json(
        {
          error:
            "Database is not ready on the server. Run: npx prisma db push — and ensure DATABASE_URL points to a writable SQLite file.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Could not save registration. Please try again or contact the league desk." }, { status: 500 });
  }
}
