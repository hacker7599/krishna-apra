import { prisma } from "@/lib/prisma";
import { logPaymentEvent } from "@/lib/payment-log";
import { isPendingPaymentStatus, REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";
import { getRazorpayPublicKeyId, TRIAL_FEE_PAISE } from "@/lib/razorpay-config";
import { getRazorpay } from "@/lib/razorpay";
import { LEAGUE_NAME } from "@/lib/league";
import { withDbRetry } from "@/lib/db-resilience";
import { loadValidPaymentInvite } from "@/lib/registration-payment-invite";

export async function preparePaymentForRegistrationInvite(
  plainToken: string,
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
  | { ok: false; error: string; status: number }
> {
  const loaded = await loadValidPaymentInvite(plainToken);
  if (!loaded.ok) {
    return { ok: false, error: loaded.error, status: loaded.status };
  }

  const { registration } = loaded.ctx;
  if (registration.paymentStatus === REGISTRATION_PAYMENT_PAID) {
    return { ok: false, error: "Payment is already complete.", status: 410 };
  }
  if (!isPendingPaymentStatus(registration.paymentStatus)) {
    return { ok: false, error: "This registration is not awaiting payment.", status: 400 };
  }
  if (!registration.playerPhotoPath?.trim()) {
    return {
      ok: false,
      error: "Your registration is missing a player photo. Please complete the full form at /register.",
      status: 400,
    };
  }

  const receipt = `fsu15_pay_${Date.now().toString(36)}`;
  const rzp = getRazorpay();
  let razorpayOrder;
  try {
    razorpayOrder = await rzp.orders.create({
      amount: TRIAL_FEE_PAISE,
      currency: "INR",
      receipt,
      notes: {
        playerName: registration.playerName,
        email: registration.email,
        phone: registration.phone,
        registrationId: registration.id,
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
      error: "Payment could not be started. Please try again in a moment.",
      status: 502,
    };
  }

  try {
    await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        await tx.paymentOrder.deleteMany({
          where: { registrationId: registration.id, status: { not: "paid" } },
        });
        await tx.registration.update({
          where: { id: registration.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });
        await tx.paymentOrder.create({
          data: {
            razorpayOrderId: razorpayOrder.id,
            amountPaise: TRIAL_FEE_PAISE,
            currency: "INR",
            email: registration.email,
            phone: registration.phone,
            playerName: registration.playerName,
            receipt,
            registrationId: registration.id,
          },
        });
      }),
    );
  } catch {
    return {
      ok: false,
      error: "Payment could not be started. Please try again in a moment.",
      status: 503,
    };
  }

  await logPaymentEvent({
    source: "prepare_registration",
    eventType: "registration.payment_prepared",
    razorpayOrderId: razorpayOrder.id,
    amountPaise: TRIAL_FEE_PAISE,
    currency: "INR",
    status: "created",
    email: registration.email,
    phone: registration.phone,
    playerName: registration.playerName,
    registrationId: registration.id,
    clientIp,
    success: true,
    metadata: { receipt, invite: true },
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
