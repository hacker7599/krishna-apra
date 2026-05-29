import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import type { ParsedRegistrationForm, SavedUploadPaths } from "@/lib/parse-registration-form-data";
import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { getRazorpayPublicKeyId, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { getRazorpay } from "@/lib/razorpay";
import { LEAGUE_NAME } from "@/lib/league";
import { withDbRetry } from "@/lib/db-resilience";
import { allocateRegistrationCode } from "@/lib/registration-codes";
import { resolveContactForRegistration, enrolledDuplicateMessage } from "@/lib/registration-contact-resolve";
import { findPublishedTrialZone } from "@/lib/validate-trial-zone";

export async function prepareOnlineRegistration(
  parsed: ParsedRegistrationForm,
  paths: SavedUploadPaths,
  clientIp?: string,
): Promise<
  | {
      ok: true;
      registrationId: string;
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      name: string;
    }
  | { ok: false; error: string; status: number; duplicate?: boolean }
> {
  const { data, emailNorm, phoneNorm, rolesJson } = parsed;

  const contact = await resolveContactForRegistration(emailNorm, phoneNorm);
  if (contact.kind === "enrolled") {
    return {
      ok: false,
      error: enrolledDuplicateMessage(contact.hit),
      status: 409,
      duplicate: true,
    };
  }
  if (contact.kind === "conflict") {
    return { ok: false, error: contact.message, status: 409, duplicate: true };
  }

  const trialZone = await findPublishedTrialZone(data.trialZoneId);
  if (!trialZone) {
    return { ok: false, error: "Please select a valid trial zone.", status: 400 };
  }

  const dob = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
  const pendingId = contact.kind === "pending" ? contact.id : null;
  const receipt = `fsu15_${Date.now().toString(36)}`;

  const registrationData = {
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
    idProofPath: paths.idProofPath,
    playerPhotoPath: paths.playerPhotoPath,
    paymentProofPath: null as string | null,
    transactionRef: null as string | null,
    achievementsAndAwards: data.achievementsAndAwards?.trim() || null,
    trialZoneId: trialZone.id,
    paymentStatus: REGISTRATION_PAYMENT_PENDING,
    razorpayOrderId: null as string | null,
    razorpayPaymentId: null as string | null,
  };

  const draft = await withDbRetry(() =>
    prisma.$transaction(async (tx) => {
      if (pendingId) {
        const row = await tx.registration.update({
          where: { id: pendingId },
          data: registrationData,
        });
        if (!row.registrationCode) {
          await tx.registration.update({
            where: { id: pendingId },
            data: { registrationCode: await allocateRegistrationCode(tx) },
          });
        }
        await tx.paymentOrder.deleteMany({
          where: { registrationId: pendingId, status: { not: "paid" } },
        });
        return tx.registration.findUniqueOrThrow({ where: { id: pendingId } });
      }

      return tx.registration.create({
        data: {
          ...registrationData,
          registrationCode: await allocateRegistrationCode(tx),
        },
      });
    }),
  );

  const rzp = getRazorpay();
  let razorpayOrder;
  try {
    razorpayOrder = await rzp.orders.create({
      amount: TRIAL_FEE_PAISE,
      currency: "INR",
      receipt,
      notes: {
        playerName: data.playerName,
        email: emailNorm,
        phone: phoneNorm,
      },
      payment: {
        capture: "automatic",
        capture_options: {
          automatic_expiry_period: 720,
          manual_expiry_period: 720,
          refund_speed: "normal",
        },
      },
    });
  } catch {
    return {
      ok: false,
      error: "Payment could not be started. Your details are saved — please try Pay again in a moment.",
      status: 502,
    };
  }

  try {
    await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        await tx.registration.update({
          where: { id: draft.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });
        await tx.paymentOrder.create({
          data: {
            razorpayOrderId: razorpayOrder.id,
            amountPaise: TRIAL_FEE_PAISE,
            currency: "INR",
            email: emailNorm,
            phone: phoneNorm,
            playerName: data.playerName,
            receipt,
            registrationId: draft.id,
          },
        });
      }),
    );
  } catch {
    return {
      ok: false,
      error: "Payment could not be started. Your details are saved — please try Pay again in a moment.",
      status: 503,
    };
  }

  await logPaymentEvent({
    source: "prepare_registration",
    eventType: "registration.prepared",
    razorpayOrderId: razorpayOrder.id,
    amountPaise: TRIAL_FEE_PAISE,
    currency: "INR",
    status: "created",
    email: emailNorm,
    phone: phoneNorm,
    playerName: data.playerName,
    registrationId: draft.id,
    clientIp,
    success: true,
    metadata: { receipt },
  });

  return {
    ok: true,
    registrationId: draft.id,
    orderId: razorpayOrder.id,
    amount: Number(razorpayOrder.amount),
    currency: razorpayOrder.currency ?? "INR",
    keyId: getRazorpayPublicKeyId(),
    name: LEAGUE_NAME,
  };
}
