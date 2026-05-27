import { PrismaClient } from "@prisma/client";
import { applySqlitePragmas, bindSqlitePragmaReady, isSqliteDatabaseUrl } from "@/lib/sqlite-resilience";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient();

  if (isSqliteDatabaseUrl()) {
    bindSqlitePragmaReady(
      applySqlitePragmas(client).catch((error) => {
        console.warn("[sqlite-pragmas] Could not apply WAL/busy_timeout:", error);
      }),
    );
  } else {
    bindSqlitePragmaReady(Promise.resolve());
  }

  return client;
}

export function getPrisma(): PrismaClient {
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
