import { prisma } from "@/lib/prisma";

export type EmailLogInput = {
  templateKey: string;
  toEmail: string;
  registrationId?: string;
  success: boolean;
  provider?: string;
  providerMsgId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
};

export async function logEmailEvent(input: EmailLogInput): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        templateKey: input.templateKey,
        toEmail: input.toEmail.toLowerCase(),
        registrationId: input.registrationId,
        success: input.success,
        provider: input.provider ?? "smtp",
        providerMsgId: input.providerMsgId,
        error: input.error,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (e) {
    console.error("[email-log]", e);
  }
}
