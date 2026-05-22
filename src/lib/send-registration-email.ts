import { registrationReceiptUrl, registrationStatusUrl } from "@/lib/app-url";
import { getMsg91Config, isMsg91EmailConfigured } from "@/lib/msg91-config";
import { sendMsg91TemplateEmail } from "@/lib/msg91-email";
import { logEmailEvent } from "@/lib/email-log";

const TEMPLATE_KEY_CONFIRMATION = "registration_confirmation";

export async function sendRegistrationConfirmationEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  confirmationToken: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { registrationId, email, playerName, confirmationToken } = params;
  const printLink = registrationReceiptUrl(confirmationToken);
  const statusLink = registrationStatusUrl();

  if (!isMsg91EmailConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY_CONFIRMATION,
      toEmail: email,
      registrationId,
      success: false,
      error: "MSG91 not configured — email skipped",
    });
    return { sent: false, error: "Email service not configured" };
  }

  const cfg = getMsg91Config();
  const result = await sendMsg91TemplateEmail({
    toEmail: email,
    toName: playerName,
    templateId: cfg.templateRegistration,
    templateKey: TEMPLATE_KEY_CONFIRMATION,
    registrationId,
    variables: {
      player_name: playerName,
      print_link: printLink,
      status_link: statusLink,
      PRINT_LINK: printLink,
      STATUS_LINK: statusLink,
    },
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}

const TEMPLATE_KEY_OTP = "registration_otp";

export async function sendRegistrationOtpEmail(params: {
  registrationId: string;
  email: string;
  playerName: string;
  otp: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { registrationId, email, playerName, otp } = params;

  if (!isMsg91EmailConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY_OTP,
      toEmail: email,
      registrationId,
      success: false,
      error: "MSG91 not configured",
    });
    return { sent: false, error: "Email service not configured" };
  }

  const cfg = getMsg91Config();
  const result = await sendMsg91TemplateEmail({
    toEmail: email,
    toName: playerName,
    templateId: cfg.templateOtp,
    templateKey: TEMPLATE_KEY_OTP,
    registrationId,
    variables: {
      player_name: playerName,
      otp,
      OTP: otp,
    },
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}
