import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/get-client-ip";
import { registrationSchema } from "@/lib/registration-schema";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { saveIdProof, savePaymentProof, savePlayerPhoto } from "@/lib/save-upload";
import { confirmRazorpayPayment, linkPaymentOrderToRegistration } from "@/lib/confirm-razorpay-payment";
import { isRazorpayConfigured } from "@/lib/razorpay-config";
import { duplicateRegistrationMessage, findExistingRegistration } from "@/lib/registration-duplicate";
import { normalizePhone } from "@/lib/normalize-phone";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { findPublishedTrialZone } from "@/lib/validate-trial-zone";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = await checkRegisterPostRate(ip);
  if (!limited.allowed) {
    const res = NextResponse.json(
      { error: "Too many registration attempts from this network. Please try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(limited.retryAfterSec));
    return res;
  }

  const razorpayEnabled = isRazorpayConfigured();

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
      trialZoneId: String(form.get("trialZoneId") ?? ""),
    };

    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldFlat = Object.values(flat.fieldErrors).flat().filter(Boolean) as string[];
      const msg = flat.fieldErrors.dateOfBirth?.[0] ?? fieldFlat[0] ?? "Invalid form data. Please check all required fields.";
      return NextResponse.json({ error: msg, details: flat }, { status: 400 });
    }

    const emailNorm = parsed.data.email.toLowerCase();
    const phoneNorm = normalizePhone(parsed.data.phone);

    const existing = await findExistingRegistration(emailNorm, phoneNorm);
    if (existing) {
      return NextResponse.json({ error: duplicateRegistrationMessage(existing), duplicate: true }, { status: 409 });
    }

    const trialZone = await findPublishedTrialZone(parsed.data.trialZoneId);
    if (!trialZone) {
      return NextResponse.json({ error: "Please select a valid trial zone." }, { status: 400 });
    }

    const razorpayOrderId = String(form.get("razorpayOrderId") ?? "").trim();
    const razorpayPaymentId = String(form.get("razorpayPaymentId") ?? "").trim();
    const razorpaySignature = String(form.get("razorpaySignature") ?? "").trim();

    let paymentStatus: string;
    let storedOrderId: string | null = null;
    let storedPaymentId: string | null = null;

    if (razorpayEnabled) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Trial fee payment is required. Please pay via Razorpay before submitting." }, { status: 400 });
      }
      const confirmed = await confirmRazorpayPayment(
        { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        { email: emailNorm, phone: phoneNorm, playerName: parsed.data.playerName },
        ip,
      );
      if (!confirmed.ok) {
        return NextResponse.json({ error: confirmed.error }, { status: 400 });
      }
      paymentStatus = "paid";
      storedOrderId = razorpayOrderId;
      storedPaymentId = razorpayPaymentId;
    } else {
      paymentStatus = "manual";
    }

    const photoFile = form.get("playerPhoto");
    let playerPhotoPath: string | null = null;
    if (photoFile && typeof photoFile !== "string" && photoFile.size > 0) {
      try {
        playerPhotoPath = await savePlayerPhoto(photoFile as File);
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "FILE_TOO_LARGE") {
          return NextResponse.json({ error: "Player photo must be under 4 MB." }, { status: 400 });
        }
        if (code === "FILE_TYPE") {
          return NextResponse.json({ error: "Player photo must be JPG, PNG, or WebP." }, { status: 400 });
        }
        throw e;
      }
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
    if (!razorpayEnabled && payFile && typeof payFile !== "string" && payFile.size > 0) {
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

    const registration = await prisma.$transaction(async (tx) => {
      const dup = await findExistingRegistration(emailNorm, phoneNorm, tx);
      if (dup) {
        return { duplicate: dup } as const;
      }
      const row = await tx.registration.create({
        data: {
          academyName: parsed.data.academyName,
          playerName: parsed.data.playerName,
          dateOfBirth: dob,
          roles: JSON.stringify(parsed.data.roles),
          email: emailNorm,
          phone: phoneNorm,
          fatherName: parsed.data.fatherName,
          address: parsed.data.address,
          jerseySize: parsed.data.jerseySize,
          shoeSize: parsed.data.shoeSize,
          idDocumentType: parsed.data.idDocumentType,
          idProofPath,
          playerPhotoPath,
          paymentProofPath,
          transactionRef: razorpayEnabled ? storedPaymentId : parsed.data.transactionRef || null,
          achievementsAndAwards: parsed.data.achievementsAndAwards?.trim() || null,
          trialZoneId: trialZone.id,
          paymentStatus,
          razorpayOrderId: storedOrderId,
          razorpayPaymentId: storedPaymentId,
        },
      });
      return { row } as const;
    });

    if ("duplicate" in registration && registration.duplicate) {
      return NextResponse.json(
        { error: duplicateRegistrationMessage(registration.duplicate), duplicate: true },
        { status: 409 },
      );
    }

    const saved = registration.row;

    if (storedOrderId && storedPaymentId) {
      await linkPaymentOrderToRegistration(storedOrderId, storedPaymentId, saved.id);
    }

    let confirmationToken: string;
    try {
      confirmationToken = await signRegistrationConfirmationToken(saved.id);
    } catch {
      return NextResponse.json(
        { error: "Registration saved but confirmation could not be issued. Contact the league desk with your payment reference." },
        { status: 503 },
      );
    }

    const emailResult = await sendRegistrationConfirmationEmail({
      registrationId: saved.id,
      email: emailNorm,
      playerName: parsed.data.playerName,
      confirmationToken,
    });

    const res = NextResponse.json({
      ok: true,
      emailSent: emailResult.sent,
      emailError: emailResult.sent ? undefined : emailResult.error,
    });
    attachRegistrationReceiptCookie(res, confirmationToken, req);
    return res;
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "This email or mobile number is already registered.", duplicate: true },
        { status: 409 },
      );
    }
    if (msg.includes("no such table") || msg.includes("SQLITE") || msg.includes("Prisma")) {
      return NextResponse.json(
        {
          error:
            "Database is not ready on the server. Run: npx prisma db push — and ensure DATABASE_URL points to a writable SQLite file.",
        },
        { status: 503 },
      );
    }
    if (msg.includes("Unique constraint")) {
      if (msg.includes("razorpayOrderId")) {
        return NextResponse.json({ error: "This payment has already been used for a registration." }, { status: 400 });
      }
      return NextResponse.json(
        { error: "This email or mobile number is already registered.", duplicate: true },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not save registration. Please try again or contact the league desk." }, { status: 500 });
  }
}
