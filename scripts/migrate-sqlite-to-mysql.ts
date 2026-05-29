/**
 * One-time migration: copy all rows from prisma/dev.db (SQLite) into MySQL.
 * Preserves IDs so uploads paths and admin links stay valid.
 *
 * Usage: npm run db:migrate-from-sqlite
 * Optional: SQLITE_PATH=./prisma/dev.db
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { applyDatabaseUrlToEnv } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";

loadProjectEnv();
applyDatabaseUrlToEnv();

const SQLITE_PATH = resolve(process.cwd(), process.env.SQLITE_PATH?.trim() || "prisma/dev.db");

const TRUNCATE_ORDER = [
  "RegistrationCompletionInvite",
  "RegistrationAccessOtp",
  "PaymentLog",
  "PaymentOrder",
  "Registration",
  "TrialSchedule",
  "EmailLog",
  "AdminAuditLog",
  "RateLimitEvent",
  "TrialZone",
  "Team",
  "HeroBanner",
  "BlogPost",
  "AppConfig",
] as const;

const IMPORT_ORDER = [...TRUNCATE_ORDER].reverse();

type TableName = (typeof TRUNCATE_ORDER)[number];

const BOOL_FIELDS: Partial<Record<TableName, string[]>> = {
  PaymentLog: ["success"],
  EmailLog: ["success"],
  Team: ["published"],
  HeroBanner: ["published"],
  BlogPost: ["published", "robotsNoindex"],
  TrialZone: ["published"],
  TrialSchedule: ["published"],
};

const DATE_FIELDS: Partial<Record<TableName, string[]>> = {
  PaymentOrder: ["createdAt", "updatedAt", "paidAt"],
  PaymentLog: ["createdAt"],
  AdminAuditLog: ["createdAt"],
  EmailLog: ["createdAt"],
  RegistrationCompletionInvite: ["createdAt", "expiresAt", "usedAt"],
  RegistrationAccessOtp: ["createdAt", "expiresAt", "usedAt"],
  Registration: ["createdAt", "dateOfBirth"],
  Team: ["createdAt", "updatedAt"],
  HeroBanner: ["createdAt", "updatedAt"],
  TrialZone: ["createdAt", "updatedAt"],
  TrialSchedule: ["createdAt", "updatedAt", "scheduledAt", "endAt"],
  BlogPost: ["createdAt", "updatedAt", "publishedAt"],
  AppConfig: ["createdAt", "updatedAt"],
  RateLimitEvent: ["createdAt"],
};

function sqliteJson<T extends Record<string, unknown>>(sql: string): T[] {
  const escaped = sql.replace(/"/g, '""');
  const out = execSync(`sqlite3 -json "${SQLITE_PATH}" "${escaped}"`, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  }).trim();
  if (!out) return [];
  return JSON.parse(out) as T[];
}

function parseSqliteDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value);
  }
  const s = String(value).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return new Date(n < 1e12 ? n * 1000 : n);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeRow<T extends Record<string, unknown>>(table: TableName, row: T): T {
  const r = { ...row };
  for (const key of BOOL_FIELDS[table] ?? []) {
    if (key in r) r[key] = r[key] === 1 || r[key] === true;
  }
  for (const key of DATE_FIELDS[table] ?? []) {
    if (!(key in r)) continue;
    const parsed = parseSqliteDate(r[key]);
    r[key] = parsed;
  }
  return r;
}

async function truncateAll(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of TRUNCATE_ORDER) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
}

async function importTable(prisma: PrismaClient, table: TableName): Promise<number> {
  const rows = sqliteJson<Record<string, unknown>>(`SELECT * FROM "${table}"`);
  if (rows.length === 0) return 0;

  const data = rows.map((row) => normalizeRow(table, row));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
  if (!model?.createMany) {
    throw new Error(`Prisma model not found for table ${table}`);
  }

  await model.createMany({ data, skipDuplicates: false });
  return rows.length;
}

async function main(): Promise<void> {
  if (!existsSync(SQLITE_PATH)) {
    console.error(`SQLite file not found: ${SQLITE_PATH}`);
    process.exit(1);
  }

  try {
    execSync("sqlite3 -version", { stdio: "pipe" });
  } catch {
    console.error("sqlite3 CLI is required (macOS: built-in; XAMPP: add to PATH).");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Source: ${SQLITE_PATH}`);
    console.log(`Target: MySQL (${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@")})`);
    console.log("\nClearing MySQL tables…");
    await truncateAll(prisma);

    console.log("Importing SQLite data…\n");
    const summary: { table: string; rows: number }[] = [];
    for (const table of IMPORT_ORDER) {
      const rows = await importTable(prisma, table);
      summary.push({ table, rows });
      console.log(`  ${table}: ${rows}`);
    }

    const total = summary.reduce((n, s) => n + s.rows, 0);
    console.log(`\nDone. ${total} rows migrated. Restart npm run dev.`);
    console.log("Tip: run `sudo /Applications/XAMPP/xamppfiles/bin/mysql_upgrade -u root --force` so future `db:push` works.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
