import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mapDbError } from "@/lib/db-http-error";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/get-client-ip";
import { parseRegistrationFormFields, saveRegistrationUploads } from "@/lib/parse-registration-form-data";
import { checkRegisterPostRate } from "@/lib/register-rate-limit";
import { allocateRegistrationCode, ensureRegistrationCode } from "@/lib/registration-codes";
import {
  enrolledDuplicateMessage,
  resolveContactForRegistration,
} from "@/lib/registration-contact-resolve";
import { attachRegistrationReceiptCookie } from "@/lib/registration-receipt-cookie";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { logPaymentEvent } from "@/lib/payment-log";
import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { findPublishedTrialZone } from "@/lib/validate-trial-zone";
import { withDbRetry } from "@/lib/db-resilience";

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

  try {
    const form = await req.formData();
    const parsedResult = parseRegistrationFormFields(form);
    if (!parsedResult.ok) {
      return NextResponse.json({ error: parsedResult.error, details: parsedResult.details }, { status: 400 });
    }

    const { data, emailNorm, phoneNorm, rolesJson } = parsedResult.parsed;

    const contact = await resolveContactForRegistration(emailNorm, phoneNorm);
    if (contact.kind === "enrolled") {
      return NextResponse.json(
        { error: enrolledDuplicateMessage(contact.hit), duplicate: true },
        { status: 409 },
      );
    }
    if (contact.kind === "conflict") {
      return NextResponse.json({ error: contact.message, duplicate: true }, { status: 409 });
    }
    const pendingId = contact.kind === "pending" ? contact.id : null;

    const trialZone = await findPublishedTrialZone(data.trialZoneId);
    if (!trialZone) {
      return NextResponse.json({ error: "Please select a valid trial zone." }, { status: 400 });
    }

    const uploads = await saveRegistrationUploads(form, {
      requirePlayerPhoto: true,
      requireIdProof: true,
      allowPaymentProof: true,
      requirePaymentProof: true,
    });
    if (!uploads.ok) {
      return NextResponse.json({ error: uploads.error }, { status: 400 });
    }

    const dob = new Date(`${data.dateOfBirth}T00:00:00.000Z`);

    const registrationPayload = {
      academyName: data.academyName,
      playerName: data.playerName,
      dateOfBirth: dob,
      roles: rolesJson,
      email: emailNorm,
      phone: phoneNorm,
      fatherName: data.fatherName,
      address: data.address,
      jerseySize: data.jerseySize,
      shoeSize: data.shoeSize,
      idDocumentType: data.idDocumentType,
      idProofPath: uploads.paths.idProofPath,
      playerPhotoPath: uploads.paths.playerPhotoPath,
      paymentProofPath: uploads.paths.paymentProofPath,
      transactionRef: data.transactionRef || null,
      achievementsAndAwards: data.achievementsAndAwards?.trim() || null,
      trialZoneId: trialZone.id,
      paymentStatus: REGISTRATION_PAYMENT_PENDING,
    };

    const saved = await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        if (pendingId) {
          const row = await tx.registration.update({
            where: { id: pendingId },
            data: registrationPayload,
          });
          if (!row.registrationCode) {
            await tx.registration.update({
              where: { id: pendingId },
              data: { registrationCode: await allocateRegistrationCode(tx) },
            });
          }
          return tx.registration.findUniqueOrThrow({ where: { id: pendingId } });
        }
        return tx.registration.create({
          data: {
            ...registrationPayload,
            registrationCode: await allocateRegistrationCode(tx),
          },
        });
      }),
    );

    await logPaymentEvent({
      source: "register",
      eventType: "qr_registration_submitted",
      amountPaise: TRIAL_FEE_PAISE,
      currency: "INR",
      status: REGISTRATION_PAYMENT_PENDING,
      email: emailNorm,
      phone: phoneNorm,
      playerName: data.playerName,
      registrationId: saved.id,
      clientIp: ip,
      success: true,
      message: "QR registration submitted — awaiting admin verification",
      metadata: { transactionRef: data.transactionRef || null },
    });

    let confirmationToken: string;
    try {
      confirmationToken = await signRegistrationConfirmationToken(saved.id);
    } catch {
      return NextResponse.json(
        { error: "Registration saved but confirmation could not be issued. Contact the league desk." },
        { status: 503 },
      );
    }

    const registrationCode = await ensureRegistrationCode(saved.id);
    const emailResult = await sendRegistrationConfirmationEmail({
      registrationId: saved.id,
      email: emailNorm,
      playerName: data.playerName,
      confirmationToken,
      registrationCode,
      paymentCode: null,
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
    const mapped = mapDbError(e);
    const message =
      mapped.status === 500
        ? "Could not save registration. Please try again or contact the league desk."
        : mapped.message;
    return NextResponse.json(
      {
        error: message,
        retryable: mapped.retryable,
        ...(mapped.status === 409 ? { duplicate: true } : {}),
      },
      {
        status: mapped.status,
        headers: mapped.retryable ? { "Retry-After": "3" } : undefined,
      },
    );
  }
}
