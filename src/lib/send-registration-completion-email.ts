import { logEmailEvent } from "@/lib/email-log";
import { getMsg91Config, isMsg91EmailConfigured } from "@/lib/msg91-config";
import { sendMsg91TemplateEmail } from "@/lib/msg91-email";

const TEMPLATE_KEY = "registration_completion_invite";

export async function sendRegistrationCompletionInviteEmail(params: {
  email: string;
  playerName: string;
  completionUrl: string;
  registrationId?: string | null;
  paymentOrderId: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { email, playerName, completionUrl, registrationId, paymentOrderId } = params;

  if (!isMsg91EmailConfigured()) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY,
      toEmail: email,
      registrationId: registrationId ?? undefined,
      success: false,
      error: "MSG91 not configured — copy the link from admin instead",
      metadata: { paymentOrderId },
    });
    return { sent: false, error: "Email service not configured" };
  }

  const cfg = getMsg91Config();
  const templateId =
    process.env.MSG91_TEMPLATE_REGISTRATION_COMPLETION?.trim() ||
    cfg.templateRegistration;

  if (!templateId) {
    await logEmailEvent({
      templateKey: TEMPLATE_KEY,
      toEmail: email,
      registrationId: registrationId ?? undefined,
      success: false,
      error: "No MSG91 template for completion link",
    });
    return { sent: false, error: "Email template not configured" };
  }

  const result = await sendMsg91TemplateEmail({
    toEmail: email,
    toName: playerName,
    templateId,
    templateKey: TEMPLATE_KEY,
    registrationId: registrationId ?? undefined,
    variables: {
      player_name: playerName,
      completion_link: completionUrl,
      COMPLETION_LINK: completionUrl,
      print_link: completionUrl,
      PRINT_LINK: completionUrl,
    },
  });

  if (!result.ok) {
    return { sent: false, error: result.error };
  }
  return { sent: true };
}
