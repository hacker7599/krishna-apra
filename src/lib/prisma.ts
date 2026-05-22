import { PrismaClient } from "@prisma/client";

const g = globalThis as typeof globalThis & { prisma?: PrismaClient };

function clientHasCurrentDelegates(client: PrismaClient): boolean {
  const c = client as unknown as Record<string, Record<string, unknown> | undefined>;
  return (
    typeof c.team?.findMany === "function" &&
    typeof c.heroBanner?.findMany === "function" &&
    typeof c.trialZone?.findMany === "function" &&
    typeof c.paymentOrder?.create === "function" &&
    typeof c.paymentLog?.findMany === "function" &&
    typeof c.adminAuditLog?.findMany === "function"
  );
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient();
  if (!clientHasCurrentDelegates(client)) {
    throw new Error(
      "Prisma client is missing PaymentLog or AdminAuditLog models. Run: npx prisma generate && npx prisma db push — then restart the dev server.",
    );
  }
  return client;
}

export function getPrisma(): PrismaClient {
  const cached = g.prisma;
  if (cached && clientHasCurrentDelegates(cached)) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    g.prisma = undefined;
  }
  const client = createPrismaClient();
  g.prisma = client;
  return client;
}

/** Lazy proxy so HMR never keeps a stale client reference. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
