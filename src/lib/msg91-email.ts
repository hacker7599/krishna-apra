import { logEmailEvent } from "@/lib/email-log";
import { getMsg91Config, isMsg91EmailConfigured } from "@/lib/msg91-config";

export type Msg91SendResult = { ok: true; messageId?: string } | { ok: false; error: string };

type SendTemplateEmailParams = {
  toEmail: string;
  toName?: string;
  templateId: string;
  templateKey: string;
  variables: Record<string, string>;
  registrationId?: string;
};

export async function sendMsg91TemplateEmail(params: SendTemplateEmailParams): Promise<Msg91SendResult> {
  const { toEmail, toName, templateId, templateKey, variables, registrationId } = params;

  if (!isMsg91EmailConfigured()) {
    const error = "MSG91 email is not configured.";
    await logEmailEvent({ templateKey, toEmail, registrationId, success: false, error });
    return { ok: false, error };
  }

  if (!templateId) {
    const error = `MSG91 template ID missing for ${templateKey}.`;
    await logEmailEvent({ templateKey, toEmail, registrationId, success: false, error });
    return { ok: false, error };
  }

  const cfg = getMsg91Config();

  const body = {
    recipients: [
      {
        to: [{ email: toEmail, name: toName || toEmail }],
        variables,
      },
    ],
    from: { email: cfg.fromEmail, name: cfg.fromName },
    domain: cfg.domain,
    template_id: templateId,
  };

  try {
    const res = await fetch(cfg.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: cfg.authKey,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let parsed: { message?: string; type?: string; data?: { message_id?: string } } = {};
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      parsed = { message: text.slice(0, 500) };
    }

    if (!res.ok) {
      const error = parsed.message || `MSG91 HTTP ${res.status}`;
      await logEmailEvent({
        templateKey,
        toEmail,
        registrationId,
        success: false,
        error,
        metadata: { status: res.status, body: text.slice(0, 1000) },
      });
      return { ok: false, error };
    }

    const messageId = parsed.data?.message_id || parsed.message;
    await logEmailEvent({
      templateKey,
      toEmail,
      registrationId,
      success: true,
      providerMsgId: typeof messageId === "string" ? messageId : undefined,
      metadata: { type: parsed.type },
    });
    return { ok: true, messageId: typeof messageId === "string" ? messageId : undefined };
  } catch (e) {
    const error = e instanceof Error ? e.message : "MSG91 request failed";
    await logEmailEvent({ templateKey, toEmail, registrationId, success: false, error });
    return { ok: false, error };
  }
}
