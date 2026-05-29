/**
 * Applies schema when `prisma db push` fails on XAMPP MariaDB (mysql.proc upgrade error).
 * Uses `migrate diff` + mysql CLI — does not introspect mysql.proc.
 */
import { spawnSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getDatabaseConfig } from "../src/lib/database-url";
import { loadProjectEnv } from "../src/lib/load-env";

loadProjectEnv();

const XAMPP_MYSQL = "/Applications/XAMPP/xamppfiles/bin/mysql";
const sqlPath = resolve(process.cwd(), "prisma/mysql-bootstrap.sql");

const diff = spawnSync(
  "npx",
  [
    "tsx",
    "scripts/run-prisma.ts",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  { encoding: "utf8", env: process.env },
);

if (diff.status !== 0 || !diff.stdout?.trim()) {
  console.error("Could not generate SQL from Prisma schema.");
  process.exit(1);
}

writeFileSync(sqlPath, diff.stdout, "utf8");
console.log(`Wrote ${sqlPath}`);

const { host, port, user, password, database } = getDatabaseConfig();
const mysqlBin = existsSync(XAMPP_MYSQL) ? XAMPP_MYSQL : "mysql";

const baseArgs = password
  ? ["-h", host, "-P", String(port), "-u", user, `-p${password}`]
  : ["-h", host, "-P", String(port), "-u", user];

const createDb = spawnSync(mysqlBin, [
  ...baseArgs,
  "-e",
  `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
], { stdio: "inherit" });

if (createDb.status !== 0) {
  process.exit(1);
}

const existingTables = spawnSync(
  mysqlBin,
  [...baseArgs, database, "-N", "-e", "SHOW TABLES LIKE 'PaymentOrder';"],
  { encoding: "utf8" },
);
if (existingTables.stdout?.trim()) {
  console.error("\nMySQL already has app tables (e.g. PaymentOrder).");
  console.error("db:bootstrap is only for an empty database.");
  console.error("Use instead:  npm run db:push");
  console.error("Then import:  npm run db:migrate-from-sqlite");
  process.exit(1);
}

const apply = spawnSync(mysqlBin, [...baseArgs, database], {
  input: diff.stdout,
  stdio: ["pipe", "inherit", "inherit"],
});

if (apply.status !== 0) {
  console.error("\nIf you see ERROR 1050 (table already exists), the schema is already there — use npm run db:push.");
  console.error("If mysql is not in PATH, start MySQL or install the mysql client.");
  console.error("On XAMPP/macOS only, db:push may need: sudo .../mysql_upgrade -u root --force");
  process.exit(1);
}

console.log("\nMySQL schema applied. Next: npm run db:seed");
