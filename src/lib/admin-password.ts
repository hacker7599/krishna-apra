import bcrypt from "bcryptjs";

export function verifyAdminPassword(plain: string, hash: string): boolean {
  if (!plain || !hash) return false;
  if (!hash.startsWith("$2")) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}
