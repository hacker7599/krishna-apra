import type { Registration } from "@prisma/client";
import { assignPaymentCodeOnPaid, ensureRegistrationCode } from "@/lib/registration-codes";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";
import { REGISTRATION_PAYMENT_PAID } from "@/lib/registration-payment-status";

export async function resendRegistrationConfirmationEmail(
  registration: Pick<Registration, "id" | "email" | "playerName" | "paymentStatus">,
): Promise<{ sent: boolean; error?: string }> {
  const registrationCode = await ensureRegistrationCode(registration.id);
  const paymentCode =
    registration.paymentStatus === REGISTRATION_PAYMENT_PAID
      ? await assignPaymentCodeOnPaid(registration.id)
      : null;

  const token = await signRegistrationConfirmationToken(registration.id);
  return sendRegistrationConfirmationEmail({
    registrationId: registration.id,
    email: registration.email,
    playerName: registration.playerName,
    confirmationToken: token,
    registrationCode,
    paymentCode,
  });
}
