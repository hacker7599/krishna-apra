import { Prisma, type PrismaClient } from "@prisma/client";

const BUSY_CODES = new Set(["P2034"]);
const BUSY_SNIPPETS = [
  "SQLITE_BUSY",
  "SQLITE_LOCKED",
  "database is locked",
  "database is busy",
  "DEADLOCK",
  "LOCK WAIT TIMEOUT",
  "ER_LOCK_DEADLOCK",
  "ER_LOCK_WAIT_TIMEOUT",
];

export const DB_BUSY_USER_MESSAGE =
  "The system is busy saving your information. Please wait a moment and try again.";
export const DB_UNAVAILABLE_USER_MESSAGE =
  "Registration services are temporarily unavailable. Please try again in a few minutes.";

let dbReady: Promise<void> = Promise.resolve();

export function isSqliteDatabaseUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("file:") || trimmed.includes("sqlite");
}

export function isMysqlDatabaseUrl(url = process.env.DATABASE_URL ?? ""): boolean {
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("mysql://") || trimmed.startsWith("mysql:");
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** True for lock/timeout/connection errors where a short retry is safe. */
export function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (BUSY_CODES.has(error.code)) return true;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientRustPanicError) return true;

  const msg = errorMessage(error).toUpperCase();
  return BUSY_SNIPPETS.some((snippet) => msg.includes(snippet));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function applySqlitePragmas(client: PrismaClient, url: string): Promise<void> {
  if (!isSqliteDatabaseUrl(url)) return;

  await client.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
  await client.$queryRawUnsafe("PRAGMA busy_timeout = 5000;");
  await client.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
  await client.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
}

export function bindDbReady(promise: Promise<void>): void {
  dbReady = promise;
}

export function ensureDbReady(): Promise<void> {
  return dbReady;
}

export type DbRetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

/**
 * Retries transient DB errors (SQLite locks, MySQL deadlocks, brief connection blips).
 * Callers must keep work idempotent (e.g. same transaction upsert / already-paid checks).
 */
export async function withDbRetry<T>(fn: () => Promise<T>, options: DbRetryOptions = {}): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const baseDelayMs = options.baseDelayMs ?? 40;
  const maxDelayMs = options.maxDelayMs ?? 400;

  await ensureDbReady();

  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === attempts - 1) {
        throw error;
      }
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 25);
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}
