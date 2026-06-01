import { prisma } from "@/lib/prisma";

/** Minimum gap between transactional emails to the same address (per email type). */
export const EMAIL_USER_THROTTLE_MS = 60_000;

export type EmailUserThrottleKind =
  | "registration_confirmation"
  | "registration_otp"
  | "registration_completion_invite"
  | "registration_payment_reminder";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function bucketFor(kind: EmailUserThrottleKind, email: string): string {
  return `email:user:${kind}:${normalizeEmail(email)}`;
}

/** Check without consuming a slot (call before send). */
export async function peekEmailUserThrottle(
  kind: EmailUserThrottleKind,
  email: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterSec: number }> {
  const bucket = bucketFor(kind, email);
  const since = new Date(Date.now() - EMAIL_USER_THROTTLE_MS);
  const count = await prisma.rateLimitEvent.count({
    where: { bucket, createdAt: { gte: since } },
  });

  if (count < 1) {
    return { allowed: true };
  }

  const oldest = await prisma.rateLimitEvent.findFirst({
    where: { bucket, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const retryAfterSec = oldest
    ? Math.max(1, Math.ceil((EMAIL_USER_THROTTLE_MS - (Date.now() - oldest.createdAt.getTime())) / 1000))
    : Math.ceil(EMAIL_USER_THROTTLE_MS / 1000);

  return { allowed: false, retryAfterSec };
}

/** Record a successful send (call only after SMTP accepts the message). */
export async function recordEmailUserThrottle(kind: EmailUserThrottleKind, email: string): Promise<void> {
  const bucket = bucketFor(kind, email);
  try {
    await prisma.rateLimitEvent.create({ data: { bucket } });
  } catch {
    /* non-fatal */
  }
}

export function emailThrottleMessage(retryAfterSec: number): string {
  return `Please wait ${retryAfterSec} second${retryAfterSec === 1 ? "" : "s"} before requesting another email of this type.`;
}
