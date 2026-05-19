import { decodeHashB64, hasAdminCredentialsFile, readAdminCredentialsFile } from "@/lib/admin-credentials-store";

/** Reads bcrypt hash from data/admin-credentials.json first, then ADMIN_PASSWORD_HASH_B64 / ADMIN_PASSWORD_HASH. */
export async function getAdminPasswordHash(): Promise<string | undefined> {
  const file = await readAdminCredentialsFile();
  if (file) {
    const fromFile = decodeHashB64(file.passwordHashB64);
    if (fromFile) return fromFile;
  }

  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    const fromB64 = decodeHashB64(b64);
    if (fromB64) return fromB64;
  }

  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (raw?.startsWith("$2")) return raw;
  return undefined;
}

export async function getAdminUsername(): Promise<string> {
  const file = await readAdminCredentialsFile();
  if (file?.username) return file.username;
  return process.env.ADMIN_USERNAME?.trim() || "admin";
}

export async function isAdminPasswordConfigured(): Promise<boolean> {
  const hash = await getAdminPasswordHash();
  return hash != null && hash.startsWith("$2");
}

export function isAdminSetupAllowed(): boolean {
  if (process.env.ADMIN_SETUP_DISABLED === "true") return false;
  const secret = process.env.ADMIN_SETUP_SECRET?.trim();
  return Boolean(secret && secret.length >= 16);
}

export function verifySetupSecret(provided: string): boolean {
  const secret = process.env.ADMIN_SETUP_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  return provided === secret;
}

export async function getAdminAuthStatus() {
  const configured = await isAdminPasswordConfigured();
  const setupAllowed = isAdminSetupAllowed();
  const fromFile = await hasAdminCredentialsFile();
  const jwtOk = Boolean(process.env.ADMIN_JWT_SECRET && process.env.ADMIN_JWT_SECRET.length >= 32);
  return { configured, setupAllowed, fromFile, jwtOk };
}
