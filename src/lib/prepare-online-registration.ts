import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import type { ParsedRegistrationForm, SavedUploadPaths } from "@/lib/parse-registration-form-data";
import {
  duplicateRegistrationMessage,
  findExistingRegistration,
  findRegistrationByContact,
} from "@/lib/registration-duplicate";
import { REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { getRazorpayPublicKeyId, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { getRazorpay } from "@/lib/razorpay";
import { LEAGUE_NAME } from "@/lib/league";
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

  const enrolled = await findExistingRegistration(emailNorm, phoneNorm);
  if (enrolled) {
    return {
      ok: false,
      error: duplicateRegistrationMessage(enrolled),
      status: 409,
      duplicate: true,
    };
  }

  const trialZone = await findPublishedTrialZone(data.trialZoneId);
  if (!trialZone) {
    return { ok: false, error: "Please select a valid trial zone.", status: 400 };
  }

  const dob = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
  const existingContact = await findRegistrationByContact(emailNorm, phoneNorm);

  const rzp = getRazorpay();
  const receipt = `fsu15_${Date.now().toString(36)}`;

  const razorpayOrder = await rzp.orders.create({
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
    razorpayOrderId: razorpayOrder.id,
    razorpayPaymentId: null as string | null,
  };

  const registration = await prisma.$transaction(async (tx) => {
    let row;
    if (existingContact?.paymentStatus === REGISTRATION_PAYMENT_PENDING) {
      row = await tx.registration.update({
        where: { id: existingContact.id },
        data: registrationData,
      });
      await tx.paymentOrder.deleteMany({
        where: {
          registrationId: existingContact.id,
          status: { not: "paid" },
        },
      });
    } else if (existingContact) {
      throw new Error("CONTACT_CONFLICT");
    } else {
      row = await tx.registration.create({ data: registrationData });
    }

    await tx.paymentOrder.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amountPaise: TRIAL_FEE_PAISE,
        currency: "INR",
        email: emailNorm,
        phone: phoneNorm,
        playerName: data.playerName,
        receipt,
        registrationId: row.id,
      },
    });

    return row;
  }).catch((e) => {
    if (e instanceof Error && e.message === "CONTACT_CONFLICT") {
      return null;
    }
    throw e;
  });

  if (!registration) {
    return {
      ok: false,
      error: "This email or mobile is already in use. Contact the league desk if you need help.",
      status: 409,
      duplicate: true,
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
    registrationId: registration.id,
    clientIp,
    success: true,
    metadata: { receipt },
  });

  return {
    ok: true,
    registrationId: registration.id,
    orderId: razorpayOrder.id,
    amount: Number(razorpayOrder.amount),
    currency: razorpayOrder.currency ?? "INR",
    keyId: getRazorpayPublicKeyId(),
    name: LEAGUE_NAME,
  };
}
