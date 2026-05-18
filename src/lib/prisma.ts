import { PrismaClient } from "@prisma/client";

const g = globalThis as typeof globalThis & { prisma?: PrismaClient };

function clientHasCmsDelegates(client: PrismaClient): boolean {
  return (
    typeof (client as unknown as { team?: { findMany?: unknown } }).team?.findMany === "function" &&
    typeof (client as unknown as { heroBanner?: { findMany?: unknown } }).heroBanner?.findMany === "function" &&
    typeof (client as unknown as { trialZone?: { findMany?: unknown } }).trialZone?.findMany === "function"
  );
}

/**
 * One process-wide client. In dev, HMR can reload modules; without `globalThis` you leak
 * native connections until the machine swaps/thrashes (especially noticeable on 8GB RAM).
 * If the cached client predates current models (`Team`, `HeroBanner`, `TrialZone`, …), it is replaced.
 */
export const prisma: PrismaClient = (() => {
  let cached = g.prisma;
  if (cached && !clientHasCmsDelegates(cached)) {
    void cached.$disconnect().catch(() => undefined);
    g.prisma = undefined;
    cached = undefined;
  }
  if (cached) {
    return cached;
  }
  const next = new PrismaClient();
  if (clientHasCmsDelegates(next)) {
    g.prisma = next;
  } else {
    console.warn(
      "[prisma] Prisma client is out of date. Run `npm run db:generate` and restart the dev server."
    );
  }
  return next;
})();
