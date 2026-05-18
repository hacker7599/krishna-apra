import bcrypt from "bcryptjs";

/**
 * Prefer `ADMIN_PASSWORD_HASH_B64` (base64 of the bcrypt string) — Next.js expands `$`
 * inside `ADMIN_PASSWORD_HASH`, which corrupts bcrypt hashes unless every `$` is escaped.
 */
export function getAdminPasswordHashFromEnv(): string | undefined {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      if (decoded.startsWith("$2")) return decoded;
    } catch {
      /* ignore */
    }
  }

  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (raw?.startsWith("$2")) return raw;
  return undefined;
}

export function verifyAdminPassword(plain: string, hash: string): boolean {
  if (!plain || !hash) return false;
  if (!hash.startsWith("$2")) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}
