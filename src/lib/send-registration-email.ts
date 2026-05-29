import { registrationReceiptUrl, registrationStatusUrl } from "@/lib/app-url";
import {
  registrationConfirmationSubject,
  renderRegistrationConfirmationEmail,
} from "@/lib/email/templates/registration-confirmation";
import { registrationOtpSubject, renderRegistrationOtpEmail } from "@/lib/email/templates/registration-otp";
import {
  emailThrottleMessage,
  peekEmailUserThrottle,
  recordEmailUserThrottle,
} from "@/lib/email-user-throttle";
import { isSmtpConfigured } from "@/lib/email/smtp-config";
import { sendHtmlEmail } from "@/lib/email/smtp-send";
import { logEmailEvent } from "@/lib/email-log";

const TEMPLATE_KEY_CONFIRMATION = "registration_confirmation";
const TEMPLATE_KEY_OTP = "registration_otp";
const OTP_EXPIRES_MINUTES = 10;

export type SendRegistrationEmailResult = {
  sent: boolean;
  error?: string;
  retryAfterSec?: number;
  throttled?: boolean;
};

export async function sendRegistrationConfirmationEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  confirmationToken: string;
  registrationCode?: string;
  paymentCode?: string | null;
  /** Admin desk can bypass the per-user 60s throttle when true. */
  skipUserEmailThrottle?: boolean;
}): Promise<SendRegistrationEmailResult> {
  const { registrationId, email, playerName, confirmationToken, registrationCode, paymentCode, skipUserEmailThrottle } =
    params;
  const printLink = registrationReceiptUrl(confirmationToken);
  const statusLink = registrationStatusUrl();

  if (!skipUserEmailThrottle) {
    const throttle = await peekEmailUserThrottle("registration_confirmation", email);
    if (!throttle.allowed) {
      const error = emailThrottleMessage(throttle.retryAfterSec);
      await logEmailEvent({
        templateKey: TEMPLATE_KEY_CONFIRMATION,
        toEmail: email,
        registrationId,
        success: false,
        error: `Throttled (${throttle.retryAfterSec}s)`,
        provider: "smtp",
      });
      return { sent: false, error, retryAfterSec: throttle.retryAfterSec, throttled: true };
    }
  }

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
  if (!skipUserEmailThrottle) {
    await recordEmailUserThrottle("registration_confirmation", email);
  }
  return { sent: true };
}

export async function sendRegistrationOtpEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  otp: string;
}): Promise<SendRegistrationEmailResult> {
  const { registrationId, email, playerName, otp } = params;

  const throttle = await peekEmailUserThrottle("registration_otp", email);
  if (!throttle.allowed) {
    const error = emailThrottleMessage(throttle.retryAfterSec);
    await logEmailEvent({
      templateKey: TEMPLATE_KEY_OTP,
      toEmail: email,
      registrationId,
      success: false,
      error: `Throttled (${throttle.retryAfterSec}s)`,
      provider: "smtp",
    });
    return { sent: false, error, retryAfterSec: throttle.retryAfterSec, throttled: true };
  }

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
  await recordEmailUserThrottle("registration_otp", email);
  return { sent: true };
}
