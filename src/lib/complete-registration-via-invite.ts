import type { Registration } from "@prisma/client";
import {
  assertEligibleDateOfBirth,
  buildRegistrationCreateData,
} from "@/lib/admin-registration-mutation";
import { loadValidCompletionInvite, markCompletionInviteUsed, type CompletionInviteContext } from "@/lib/registration-completion-invite";
import { finalizeRegistrationFromCapturedPayment } from "@/lib/finalize-registration-payment";
import {
  type ParsedRegistrationForm,
  parseRegistrationFormFields,
  saveRegistrationUploads,
} from "@/lib/parse-registration-form-data";
import { normalizePhone } from "@/lib/normalize-phone";
import { prisma } from "@/lib/prisma";
import { findExistingRegistration } from "@/lib/registration-duplicate";
import { REGISTRATION_PAYMENT_PAID, REGISTRATION_PAYMENT_PENDING } from "@/lib/registration-payment-status";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { withDbRetry } from "@/lib/db-resilience";
import { findRegistrationTrialZone } from "@/lib/validate-trial-zone";

function registrationToPrefill(reg: Registration) {
  let roles: string[] = [];
  try {
    roles = JSON.parse(reg.roles) as string[];
  } catch {
    roles = [];
  }
  return {
    academyName: reg.academyName,
    playerName: reg.playerName,
    dateOfBirth: reg.dateOfBirth.toISOString().slice(0, 10),
    roles,
    trialZoneId: reg.trialZoneId ?? "",
    email: reg.email,
    phone: reg.phone,
    fatherName: reg.fatherName ?? "",
    address: reg.address ?? "",
    jerseySize: reg.jerseySize ?? "",
    shoeSize: reg.shoeSize ?? "",
    idDocumentType: reg.idDocumentType ?? "",
    achievementsAndAwards: reg.achievementsAndAwards ?? "",
    hasPlayerPhoto: Boolean(reg.playerPhotoPath),
    hasIdProof: Boolean(reg.idProofPath),
  };
}

export async function getCompletionInvitePayload(
  plainToken: string,
): Promise<
  | {
      ok: true;
      playerName: string;
      email: string | null;
      phone: string | null;
      amountInr: number;
      paidAt: string | null;
      prefill: ReturnType<typeof registrationToPrefill> | object;
      lockedFields: { email: boolean; phone: boolean };
    }
  | { ok: false; error: string; status: number }
> {
  const loaded = await loadValidCompletionInvite(plainToken);
  if (!loaded.ok) return loaded;

  const { order, registration } = loaded.ctx;
  const prefill = registration
    ? registrationToPrefill(registration)
    : {
        academyName: "",
        playerName: order.playerName ?? "",
        dateOfBirth: "",
        roles: [] as string[],
        trialZoneId: "",
        email: order.email ?? "",
        phone: order.phone ?? "",
        fatherName: "",
        address: "",
        jerseySize: "",
        shoeSize: "",
        idDocumentType: "",
        achievementsAndAwards: "",
        hasPlayerPhoto: false,
        hasIdProof: false,
      };

  return {
    ok: true as const,
    playerName: prefill.playerName || order.playerName || "Player",
    email: order.email,
    phone: order.phone,
    amountInr: order.amountPaise / 100,
    paidAt: order.paidAt?.toISOString() ?? null,
    prefill,
    lockedFields: { email: true, phone: true },
  };
}

function assertContactMatchesOrder(
  ctx: CompletionInviteContext,
  emailNorm: string,
  phoneNorm: string,
): string | null {
  const orderEmail = ctx.order.email?.toLowerCase().trim();
  const orderPhone = normalizePhone(ctx.order.phone ?? "");
  if (orderEmail && orderEmail !== emailNorm) {
    return "Email must match the address used for your payment.";
  }
  if (orderPhone && orderPhone !== phoneNorm) {
    return "Mobile number must match the number used for your payment.";
  }
  return null;
}

async function persistRegistrationDraft(
  ctx: CompletionInviteContext,
  registrationPayload: {
    academyName: string;
    playerName: string;
    dateOfBirth: Date;
    roles: string;
    email: string;
    phone: string;
    fatherName: string;
    address: string;
    jerseySize: string;
    shoeSize: string;
    idDocumentType: string;
    idProofPath: string;
    playerPhotoPath: string;
    achievementsAndAwards: string | null;
    trialZoneId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  },
  data: ParsedRegistrationForm["data"],
  trialZoneId: string,
): Promise<string> {
  const { order } = ctx;

  return withDbRetry(() =>
    prisma.$transaction(async (tx) => {
    if (ctx.registration) {
      await tx.registration.update({
        where: { id: ctx.registration.id },
        data: registrationPayload,
      });
      return ctx.registration.id;
    }

    const created = await tx.registration.create({
      data: {
        ...buildRegistrationCreateData(
          {
            academyName: data.academyName,
            playerName: data.playerName,
            dateOfBirth: data.dateOfBirth,
            roles: data.roles,
            trialZoneId,
            email: data.email,
            phone: data.phone,
            fatherName: data.fatherName,
            address: data.address,
            jerseySize: data.jerseySize,
            shoeSize: data.shoeSize,
            idDocumentType: data.idDocumentType,
            achievementsAndAwards: data.achievementsAndAwards ?? null,
            paymentStatus: "manual",
          },
          {
            playerPhotoPath: registrationPayload.playerPhotoPath,
            idProofPath: registrationPayload.idProofPath,
          },
        ),
        paymentStatus: REGISTRATION_PAYMENT_PENDING,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        transactionRef: order.razorpayPaymentId,
      },
    });

    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { registrationId: created.id },
    });

    return created.id;
  }),
  );
}

export async function submitRegistrationViaCompletionInvite(
  plainToken: string,
  form: FormData,
): Promise<
  | { ok: true; registrationId: string; emailSent: boolean }
  | { ok: false; error: string; status: number }
> {
  const loaded = await loadValidCompletionInvite(plainToken);
  if (!loaded.ok) {
    return { ok: false, error: loaded.error, status: loaded.status };
  }

  const { ctx } = loaded;
  const { order, invite } = ctx;

  if (!order.razorpayPaymentId || !order.razorpayOrderId) {
    return { ok: false, error: "Payment is not complete on this order.", status: 400 };
  }

  const parsedResult = parseRegistrationFormFields(form);
  if (!parsedResult.ok) {
    return { ok: false, error: parsedResult.error, status: 400 };
  }

  const { data, emailNorm, phoneNorm, rolesJson } = parsedResult.parsed;
  const contactErr = assertContactMatchesOrder(ctx, emailNorm, phoneNorm);
  if (contactErr) {
    return { ok: false, error: contactErr, status: 400 };
  }

  if (order.playerName?.trim() && data.playerName.trim() !== order.playerName.trim()) {
    return {
      ok: false,
      error: `Player name must match your payment record: “${order.playerName}”.`,
      status: 400,
    };
  }

  const dobError = assertEligibleDateOfBirth(data.dateOfBirth);
  if (dobError) {
    return { ok: false, error: dobError, status: 400 };
  }

  const trialZone = await findRegistrationTrialZone(data.trialZoneId);
  if (!trialZone) {
    return { ok: false, error: "Please select a valid trial zone.", status: 400 };
  }

  const requirePhoto = !ctx.registration?.playerPhotoPath;
  const requireIdProof = !ctx.registration?.idProofPath;

  const uploads = await saveRegistrationUploads(form, {
    requirePlayerPhoto: requirePhoto,
    requireIdProof: requireIdProof,
    allowPaymentProof: false,
  });
  if (!uploads.ok) {
    return { ok: false, error: uploads.error, status: 400 };
  }

  const enrolled = await findExistingRegistration(emailNorm, phoneNorm);
  if (enrolled && enrolled.id !== ctx.registration?.id) {
    return {
      ok: false,
      error: "This email or mobile is already registered under another player.",
      status: 409,
    };
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
    idProofPath: uploads.paths.idProofPath || ctx.registration?.idProofPath || "",
    playerPhotoPath: uploads.paths.playerPhotoPath || ctx.registration?.playerPhotoPath || "",
    paymentProofPath: null as string | null,
    transactionRef: order.razorpayPaymentId,
    achievementsAndAwards: data.achievementsAndAwards?.trim() || null,
    trialZoneId: trialZone.id,
    paymentStatus: REGISTRATION_PAYMENT_PENDING,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
  };

  if (!registrationPayload.playerPhotoPath || !registrationPayload.idProofPath) {
    return { ok: false, error: "Player photo and ID proof are required.", status: 400 };
  }

  let registrationId: string;
  try {
    registrationId = await persistRegistrationDraft(ctx, registrationPayload, data, trialZone.id);
  } catch {
    return { ok: false, error: "Could not save your registration. Please try again.", status: 500 };
  }

  const finalized = await finalizeRegistrationFromCapturedPayment(order.razorpayOrderId, order.razorpayPaymentId);
  if (!finalized.ok) {
    const reg = await prisma.registration.findUnique({ where: { id: registrationId } });
    if (reg?.paymentStatus !== REGISTRATION_PAYMENT_PAID) {
      return {
        ok: false,
        error:
          "Your details were saved but enrollment could not be confirmed yet. Please try submitting again in a few minutes or contact the league desk.",
        status: 503,
      };
    }
  }

  await markCompletionInviteUsed(invite.id, registrationId);

  let emailSent = false;
  try {
    const token = await signRegistrationConfirmationToken(registrationId);
    const emailResult = await sendRegistrationConfirmationEmail({
      registrationId,
      email: emailNorm,
      playerName: data.playerName,
      confirmationToken: token,
    });
    emailSent = emailResult.sent;
  } catch {
    emailSent = false;
  }

  return { ok: true, registrationId, emailSent };
}
