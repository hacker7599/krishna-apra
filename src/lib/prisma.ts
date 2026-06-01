import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv, getDatabaseUrl } from "@/lib/database-url";
import { applySqlitePragmas, bindDbReady, isSqliteDatabaseUrl } from "@/lib/db-resilience";

applyDatabaseUrlToEnv();

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaRecreating?: boolean;
};

function modelDelegateReady(
  client: PrismaClient,
  model: "trialSchedule" | "registrationPaymentInvite",
  method: "findMany" | "deleteMany",
): boolean {
  const delegate = (client as unknown as Record<string, Record<string, unknown> | undefined>)[model];
  return typeof delegate?.[method] === "function";
}

/** True when the generated client includes the TrialSchedule model delegate. */
export function trialScheduleDelegateReady(client: PrismaClient): boolean {
  return modelDelegateReady(client, "trialSchedule", "findMany");
}

/** True when the generated client includes RegistrationPaymentInvite (payment link emails). */
export function registrationPaymentInviteDelegateReady(client: PrismaClient): boolean {
  return modelDelegateReady(client, "registrationPaymentInvite", "deleteMany");
}

function prismaClientDelegatesReady(client: PrismaClient): boolean {
  return trialScheduleDelegateReady(client) && registrationPaymentInviteDelegateReady(client);
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  const client = new PrismaClient({
    datasources: { db: { url } },
  });

  if (isSqliteDatabaseUrl(url)) {
    bindDbReady(
      applySqlitePragmas(client, url).catch((error) => {
        console.warn("[sqlite-pragmas] Could not apply WAL/busy_timeout:", error);
      }),
    );
  } else {
    bindDbReady(Promise.resolve());
  }

  return client;
}

function recreatePrismaClient(): void {
  const existing = globalForPrisma.prisma;
  if (!existing || globalForPrisma.prismaRecreating) return;
  globalForPrisma.prismaRecreating = true;
  void existing.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaRecreating = false;
}

export function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // Dev/HMR can keep a PrismaClient from before `prisma generate` added new models.
  if (existing && !prismaClientDelegatesReady(existing)) {
    recreatePrismaClient();
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Lazy proxy so HMR does not keep a stale client reference on the prisma object itself. */
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
