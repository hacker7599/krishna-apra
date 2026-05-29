import {
  registrationCompletionSubject,
  renderRegistrationCompletionEmail,
} from "@/lib/email/templates/registration-completion";
import { isSmtpConfigured } from "@/lib/email/smtp-config";
import { sendHtmlEmail } from "@/lib/email/smtp-send";
import { logEmailEvent } from "@/lib/email-log";

const TEMPLATE_KEY = "registration_completion_invite";

export async function sendRegistrationCompletionInviteEmail(params: {
  email: string;
  playerName: string;
  completionUrl: string;
  registrationId?: string | null;
  paymentOrderId: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { email, playerName, completionUrl, registrationId, paymentOrderId } = params;

  if (!isSmtpConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY,
      toEmail: email,
      registrationId: registrationId ?? undefined,
      success: false,
      error: "SMTP not configured — copy the link from admin instead",
      provider: "smtp",
      metadata: { paymentOrderId },
    });
    return { sent: false, error: "Email service not configured" };
  }

  const { html, text } = renderRegistrationCompletionEmail({
    playerName,
    completionLink: completionUrl,
  });

  const result = await sendHtmlEmail({
    toEmail: email,
    toName: playerName,
    subject: registrationCompletionSubject(playerName),
    html,
    text,
    templateKey: TEMPLATE_KEY,
    registrationId: registrationId ?? undefined,
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}
