import {
  registrationPaymentReminderSubject,
  renderRegistrationPaymentReminderEmail,
} from "@/lib/email/templates/registration-payment-reminder";
import {
  emailThrottleMessage,
  peekEmailUserThrottle,
  recordEmailUserThrottle,
} from "@/lib/email-user-throttle";
import { isSmtpConfigured } from "@/lib/email/smtp-config";
import { sendHtmlEmail } from "@/lib/email/smtp-send";
import { logEmailEvent } from "@/lib/email-log";
import type { SendRegistrationEmailResult } from "@/lib/send-registration-email";
import { PAYMENT_INVITE_TTL_MS } from "@/lib/registration-payment-invite";

const TEMPLATE_KEY = "registration_payment_reminder";

export async function sendRegistrationPaymentReminderEmail(params: {
  email: string;
  playerName: string;
  registrationId: string;
  paymentLink: string;
  registrationCode?: string | null;
  trialPlace?: string | null;
  trialZone?: string | null;
  skipUserEmailThrottle?: boolean;
}): Promise<SendRegistrationEmailResult & { paymentLink: string }> {
  const {
    email,
    playerName,
    registrationId,
    paymentLink,
    registrationCode,
    trialPlace,
    trialZone,
    skipUserEmailThrottle,
  } = params;

  const expiresDays = Math.round(PAYMENT_INVITE_TTL_MS / (24 * 60 * 60 * 1000));

  if (!skipUserEmailThrottle) {
    const throttle = await peekEmailUserThrottle("registration_payment_reminder", email);
    if (!throttle.allowed) {
      const error = emailThrottleMessage(throttle.retryAfterSec);
      await logEmailEvent({
        templateKey: TEMPLATE_KEY,
        toEmail: email,
        registrationId,
        success: false,
        error: `Throttled (${throttle.retryAfterSec}s)`,
        provider: "smtp",
      });
      return { sent: false, error, retryAfterSec: throttle.retryAfterSec, throttled: true, paymentLink };
    }
  }

  if (!isSmtpConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY,
      toEmail: email,
      registrationId,
      success: false,
      error: "SMTP not configured — copy the link from admin instead",
      provider: "smtp",
    });
    return { sent: false, error: "Email service not configured", paymentLink };
  }

  const { html, text } = renderRegistrationPaymentReminderEmail({
    playerName,
    paymentLink,
    registrationCode,
    trialPlace,
    trialZone,
    expiresDays,
  });

  const result = await sendHtmlEmail({
    toEmail: email,
    toName: playerName,
    subject: registrationPaymentReminderSubject(playerName),
    html,
    text,
    templateKey: TEMPLATE_KEY,
    registrationId,
  });

  if (!result.ok) {
    return { sent: false, error: result.error, paymentLink };
  }
  if (!skipUserEmailThrottle) {
    await recordEmailUserThrottle("registration_payment_reminder", email);
  }
  return { sent: true, paymentLink };
}
