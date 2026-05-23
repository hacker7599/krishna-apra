import { prisma } from "@/lib/prisma";

const PRUNE_OLDER_THAN_MS = 24 * 60 * 60 * 1000;
let eventsSincePrune = 0;

async function maybePrune() {
  eventsSincePrune += 1;
  if (eventsSincePrune < 50) return;
  eventsSincePrune = 0;
  const cutoff = new Date(Date.now() - PRUNE_OLDER_THAN_MS);
  try {
    await prisma.rateLimitEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
  } catch {
    /* non-fatal */
  }
}

export async function checkRateLimit(
  bucket: string,
  max: number,
  windowMs: number,
): Promise<{ allowed: true } | { allowed: false; retryAfterSec: number }> {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.rateLimitEvent.count({
    where: { bucket, createdAt: { gte: since } },
  });

  if (count >= max) {
    const oldest = await prisma.rateLimitEvent.findFirst({
      where: { bucket, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterSec = oldest
      ? Math.max(1, Math.ceil((windowMs - (Date.now() - oldest.createdAt.getTime())) / 1000))
      : Math.ceil(windowMs / 1000);
    return { allowed: false, retryAfterSec };
  }

  try {
    await prisma.rateLimitEvent.create({ data: { bucket } });
    void maybePrune();
  } catch {
    /* allow request if rate-limit store fails — do not block registrations */
  }

  return { allowed: true };
}
