import { loadProjectEnv } from "@/lib/load-env";

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

let envLoaded = false;

function ensureEnvLoaded(): void {
  if (envLoaded) return;
  loadProjectEnv();
  envLoaded = true;
}

export function getDatabaseConfig(): DatabaseConfig {
  ensureEnvLoaded();
  const portRaw = process.env.DB_PORT?.trim() || "3306";
  const port = Number.parseInt(portRaw, 10);

  return {
    host: process.env.DB_HOST?.trim() || "127.0.0.1",
    port: Number.isFinite(port) && port > 0 ? port : 3306,
    user: process.env.DB_USER?.trim() || "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME?.trim() || "future_star_u15",
  };
}

/** Builds a Prisma-compatible MySQL connection URL from DB_* env vars. */
export function buildDatabaseUrl(config?: DatabaseConfig): string {
  const { host, port, user, password, database } = config ?? getDatabaseConfig();
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  const auth = password.length > 0 ? `${encUser}:${encPass}` : encUser;
  return `mysql://${auth}@${host}:${port}/${database}`;
}

/** Sets `process.env.DATABASE_URL` (used by Prisma CLI and diagnostics). */
export function applyDatabaseUrlToEnv(): string {
  const url = buildDatabaseUrl();
  process.env.DATABASE_URL = url;
  return url;
}

export function getDatabaseUrl(): string {
  ensureEnvLoaded();
  return buildDatabaseUrl();
}
