import { prisma } from "@/lib/prisma";

export async function logAdminAudit(input: {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  clientIp?: string | null;
}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        clientIp: input.clientIp ?? null,
      },
    });
  } catch (e) {
    console.error("[admin-audit]", e);
  }
}
