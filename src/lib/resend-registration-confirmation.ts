import type { Registration } from "@prisma/client";
import { signRegistrationConfirmationToken } from "@/lib/registration-confirm-token";
import { sendRegistrationConfirmationEmail } from "@/lib/send-registration-email";

export async function resendRegistrationConfirmationEmail(
  registration: Pick<Registration, "id" | "email" | "playerName">,
): Promise<{ sent: boolean; error?: string }> {
  const token = await signRegistrationConfirmationToken(registration.id);
  return sendRegistrationConfirmationEmail({
    registrationId: registration.id,
    email: registration.email,
    playerName: registration.playerName,
    confirmationToken: token,
  });
}
