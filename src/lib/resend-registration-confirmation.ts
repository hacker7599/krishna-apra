import type { Registration } from "@prisma/client";
import { tryEnsureRegistrationCodes } from "@/lib/registration-codes";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail, type SendRegistrationEmailResult } from "@/lib/send-registration-email";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";

export async function resendRegistrationConfirmationEmail(
  registration: Pick<Registration, "id" | "email" | "playerName" | "paymentStatus">,
): Promise<SendRegistrationEmailResult> {
  const codes = await tryEnsureRegistrationCodes(registration.id, {
    assignPaymentIfPaid: registration.paymentStatus === REGISTRATION_PAYMENT_PAID,
    paymentStatus: registration.paymentStatus,
  });

  const token = await signRegistrationConfirmationToken(registration.id);
  return sendRegistrationConfirmationEmail({
    registrationId: registration.id,
    email: registration.email,
    playerName: registration.playerName,
    confirmationToken: token,
    registrationCode: codes.registrationCode ?? undefined,
    paymentCode: codes.paymentCode,
    skipUserEmailThrottle: true,
  });
}
