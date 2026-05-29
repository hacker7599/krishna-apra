import { registrationReceiptUrl, registrationStatusUrl } from "@/lib/app-url";
import {
  registrationConfirmationSubject,
  renderRegistrationConfirmationEmail,
} from "@/lib/email/templates/registration-confirmation";
import { registrationOtpSubject, renderRegistrationOtpEmail } from "@/lib/email/templates/registration-otp";
import { isSmtpConfigured } from "@/lib/email/smtp-config";
import { sendHtmlEmail } from "@/lib/email/smtp-send";
import { logEmailEvent } from "@/lib/email-log";

const TEMPLATE_KEY_CONFIRMATION = "registration_confirmation";
const TEMPLATE_KEY_OTP = "registration_otp";
const OTP_EXPIRES_MINUTES = 10;

export async function sendRegistrationConfirmationEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  confirmationToken: string;
  registrationCode?: string;
  paymentCode?: string | null;
}): Promise<{ sent: boolean; error?: string }> {
  const { registrationId, email, playerName, confirmationToken, registrationCode, paymentCode } = params;
  const printLink = registrationReceiptUrl(confirmationToken);
  const statusLink = registrationStatusUrl();

  if (!isSmtpConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY_CONFIRMATION,
      toEmail: email,
      registrationId,
      success: false,
      error: "SMTP not configured — email skipped",
      provider: "smtp",
    });
    return { sent: false, error: "Email service not configured" };
  }

  const { html, text } = renderRegistrationConfirmationEmail({
    playerName,
    printLink,
    statusLink,
    registrationCode,
    paymentCode,
  });

  const result = await sendHtmlEmail({
    toEmail: email,
    toName: playerName,
    subject: registrationConfirmationSubject(playerName),
    html,
    text,
    templateKey: TEMPLATE_KEY_CONFIRMATION,
    registrationId,
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}

export async function sendRegistrationOtpEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  otp: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { registrationId, email, playerName, otp } = params;

  if (!isSmtpConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY_OTP,
      toEmail: email,
      registrationId,
      success: false,
      error: "SMTP not configured",
      provider: "smtp",
    });
    return { sent: false, error: "Email service not configured" };
  }

  const { html, text } = renderRegistrationOtpEmail({
    playerName,
    otp,
    expiresMinutes: OTP_EXPIRES_MINUTES,
  });

  const result = await sendHtmlEmail({
    toEmail: email,
    toName: playerName,
    subject: registrationOtpSubject(),
    html,
    text,
    templateKey: TEMPLATE_KEY_OTP,
    registrationId,
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}
