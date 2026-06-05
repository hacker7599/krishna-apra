import { logAdminAudit } from "@/lib/admin-audit";
import { renderAdminBulkTrialInfoEmail } from "@/lib/email/templates/admin-bulk-trial-info";
import { sendHtmlEmail } from "@/lib/email/smtp-send";
import { prisma } from "@/lib/prisma";
import { emailBodyTextLength } from "@/lib/sanitize-email-body-html";

export const ADMIN_BULK_EMAIL_TEMPLATE_KEY = "admin_bulk_trial_info";
export const ADMIN_BULK_EMAIL_MAX_RECIPIENTS = 5_000;
const SEND_DELAY_MS = 200;

export type BulkEmailValidation =
  | { ok: true; trialZoneId: string; subject: string; body: string }
  | { ok: false; error: string };

export function validateBulkEmailInput(input: {
  trialZoneId?: string;
  subject?: string;
  body?: string;
}): BulkEmailValidation {
  const trialZoneId = input.trialZoneId?.trim() ?? "";
  const subject = input.subject?.trim() ?? "";
  const body = input.body?.trim() ?? "";

  if (!trialZoneId) return { ok: false, error: "Select a trial zone." };
  if (subject.length < 3) return { ok: false, error: "Subject must be at least 3 characters." };
  if (subject.length > 200) return { ok: false, error: "Subject must be 200 characters or fewer." };
  const bodyTextLen = emailBodyTextLength(body);
  if (bodyTextLen < 10) return { ok: false, error: "Message body must be at least 10 characters." };
  if (body.length > 25_000) return { ok: false, error: "Message body is too long (max 25,000 characters of HTML)." };

  return { ok: true, trialZoneId, subject, body };
}

export async function countBulkEmailRecipients(trialZoneId: string) {
  return prisma.registration.count({ where: { trialZoneId } });
}

export async function listBulkEmailRecipients(trialZoneId: string) {
  return prisma.registration.findMany({
    where: { trialZoneId },
    select: {
      id: true,
      email: true,
      playerName: true,
      registrationCode: true,
    },
    orderBy: { playerName: "asc" },
  });
}

export type BulkEmailSendResult = {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendBulkTrialZoneEmails(params: {
  trialZoneId: string;
  subject: string;
  body: string;
  clientIp?: string | null;
}): Promise<BulkEmailSendResult | { error: string }> {
  const zone = await prisma.trialZone.findUnique({
    where: { id: params.trialZoneId },
    select: {
      id: true,
      trialPlace: true,
      zone: true,
      address: true,
      navigationUrl: true,
      contactDetails: true,
    },
  });

  if (!zone) {
    return { error: "Trial zone not found." };
  }

  const recipients = await listBulkEmailRecipients(params.trialZoneId);

  if (recipients.length === 0) {
    return { error: "No registrations found for this trial zone." };
  }

  if (recipients.length > ADMIN_BULK_EMAIL_MAX_RECIPIENTS) {
    return {
      error: `Too many recipients (${recipients.length}). Maximum is ${ADMIN_BULK_EMAIL_MAX_RECIPIENTS}.`,
    };
  }

  const result: BulkEmailSendResult = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < recipients.length; i++) {
    const row = recipients[i]!;
    const { html, text } = renderAdminBulkTrialInfoEmail({
      playerName: row.playerName,
      registrationCode: row.registrationCode,
      subject: params.subject,
      bodyHtml: params.body,
      trialZone: zone,
    });

    const send = await sendHtmlEmail({
      toEmail: row.email,
      toName: row.playerName,
      subject: params.subject,
      html,
      text,
      templateKey: ADMIN_BULK_EMAIL_TEMPLATE_KEY,
      registrationId: row.id,
    });

    if (send.ok) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (result.errors.length < 20) {
        result.errors.push({ email: row.email, error: send.error });
      }
    }

    if (i < recipients.length - 1) {
      await sleep(SEND_DELAY_MS);
    }
  }

  await logAdminAudit({
    action: "bulk_email_send",
    entityType: "trial_zone",
    entityId: zone.id,
    summary: `Bulk trial email: ${result.sent}/${result.total} sent for ${zone.trialPlace}`,
    metadata: {
      subject: params.subject,
      trialPlace: zone.trialPlace,
      zone: zone.zone,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    },
    clientIp: params.clientIp ?? null,
  });

  return result;
}
