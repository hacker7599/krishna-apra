import { logEmailEvent } from "@/lib/email-log";
import { getSmtpConfig, isSmtpConfigured } from "@/lib/email/smtp-config";
import { getSmtpTransporter } from "@/lib/email/smtp-transport";

export type SmtpSendResult = { ok: true; messageId?: string } | { ok: false; error: string };

export type SendHtmlEmailParams = {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  templateKey: string;
  registrationId?: string;
};

export async function sendHtmlEmail(params: SendHtmlEmailParams): Promise<SmtpSendResult> {
  const { toEmail, toName, subject, html, text, templateKey, registrationId } = params;

  if (!isSmtpConfigured()) {
    const error = "SMTP is not configured.";
    await logEmailEvent({ templateKey, toEmail, registrationId, success: false, error, provider: "smtp" });
    return { ok: false, error };
  }

  const cfg = getSmtpConfig();

  try {
    const transport = getSmtpTransporter();
    const info = await transport.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      replyTo: cfg.replyTo,
      subject,
      html,
      text,
    });

    await logEmailEvent({
      templateKey,
      toEmail,
      registrationId,
      success: true,
      provider: "smtp",
      providerMsgId: info.messageId,
    });

    return { ok: true, messageId: info.messageId };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "SMTP send failed";
    const error = redactSecrets(raw, cfg.password);
    await logEmailEvent({
      templateKey,
      toEmail,
      registrationId,
      success: false,
      error,
      provider: "smtp",
    });
    return { ok: false, error };
  }
}

function redactSecrets(message: string, password: string): string {
  if (!password) return message;
  return message.split(password).join("***");
}
